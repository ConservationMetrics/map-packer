import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import {
  fetchData,
  handleDeleteRequest,
  insertDataIntoTable,
  updateDatabaseMapRequest,
  updateDatabaseWithError,
} from "./database/dbOperations";
import { publishToAzureStorageQueue } from "./messageQueue/azure";

import { checkAuthStrategy } from "./middleware";
import { getLogin, postLogin } from "./loginController";

import { mapStyles } from "./styles/mapStyles";

import {
  ASQ_QUEUE_NAME,
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_STYLE_NAME,
  MAP_ZOOM,
  MAP_LATITUDE,
  MAP_LONGITUDE,
  OFFLINE_MAPS_URI,
  PLANET_API_KEY,
  STADIA_API_KEY,
  THUNDERFOREST_API_KEY,
} from "./config";

const app = express();

app.use(express.json());

app.get("/login", getLogin);
app.post("/login", postLogin);

// Apply middleware to routes
app.use(checkAuthStrategy);

const db = setupDatabaseConnection(
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
);

// API endpoint to retrieve offline maps from db
app.get("/data", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 6;
  const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : null;

  try {
    // Fetch data (with pagination if requested)
    const { data } = await fetchData(db, DB_TABLE, limit, cursor);

    if (data === null) {
      res.json([]);
    } else {
      const response = {
        // Set nextCursor to the last id in the data array
        // If there are more rows in the database,
        // the last row's id will be used as the nextCursor
        // to fetch the next set of rows. If not, nextCursor will be null.
        nextCursor: data.length ? data[data.length - 1].id : null,
        offlineMaps: data,
        offlineMapsUri: OFFLINE_MAPS_URI,
      };
      res.json(response);
    }
  } catch (error: any) {
    console.error("Error fetching data on API side:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to retrieve map configuration
app.get("/map", async (_req: Request, res: Response) => {
  const response = {
    mapZoom: MAP_ZOOM,
    mapLatitude: MAP_LATITUDE,
    mapLongitude: MAP_LONGITUDE,
  };
  res.json(response);
});

// API endpoint to retrieve all available map styles
app.get("/mapstyles", (_req: Request, res: Response) => {
  const styles = Object.entries(mapStyles).map(([key, value]) => ({
    name: value.name,
    key: key,
    // if no URL is set then provide an API endpoint to retrieve the style by key
    url: value.url || `/api/mapstyle/${key}/`,
  }));

  // filter out map styles for which the API key was not provided
  const filteredStyles = styles.filter((style) => {
    if (style.key.includes("thunderforest") && !THUNDERFOREST_API_KEY) {
      return false;
    }
    if (style.key.includes( "planet") && !PLANET_API_KEY) {
      return false;
    }
    if (style.key.includes("stadia") && !STADIA_API_KEY) {
      return false;
      }
    if (style.key.includes("mapbox") && !MAPBOX_ACCESS_TOKEN) {
      return false;
    }
    return true;
  } );

  // if provided, append custom mapbox style to the top of the list of available styles
  if (MAPBOX_STYLE && MAPBOX_ACCESS_TOKEN) {
    filteredStyles.unshift({
      name: MAPBOX_STYLE_NAME || "Mapbox Custom Style",
      key: "mapbox",
      url: MAPBOX_STYLE,
    });
  }

  res.json(filteredStyles);
});

// API endpoint to retrieve a specific map style
app.get("/mapstyle/:styleKey", (req: Request, res: Response) => {
  const styleKey = req.params.styleKey;

  // Validate that styleKey is a key of mapStyles
  if (styleKey in mapStyles) {
    const mapStyleEntry = mapStyles[styleKey as keyof typeof mapStyles];
    res.json(mapStyleEntry.style);
  } else {
    res.status(404).json({ error: "Map style not found" });
  }
});

// API endpoint to retrieve Planet style with a custom date
app.get("/mapstyle/planet/:year/:month", (req: Request, res: Response) => {
  const { year, month } = req.params;
  const styleKey = "planet";

  // Validate that styleKey is a key of mapStyles
  if (styleKey in mapStyles) {
    const mapStyleEntry = mapStyles[styleKey as keyof typeof mapStyles];

    // Replace the date in the tile URL
    // Replace regex of the form YYYY-MM with the new year and month
    const newTileUrl = (
      mapStyleEntry.style as any
    ).sources.planet.tiles[0].replace(/\d{4}-\d{2}/, `${year}-${month}`);
    (mapStyleEntry.style as any).sources.planet.tiles[0] = newTileUrl;
    res.json(mapStyleEntry.style);
  } else {
    res.status(404).json({ error: "Map style not found" });
  }
});

// API endpoint to POST a request to the db and publish message to queue
app.post("/maprequest", async (req: Request, res: Response) => {
  let requestId: number | void | null = req.body.requestId;
  const data = { ...req.body };

  if (data.style === "mapbox-custom" || data.style === "mapbox-streets") {
    data.style = "mapbox";
  }

  try {
    // If it's a new request, insert data into the database
    if (req.body.type === "new_request") {
      console.log("Inserting data into database...");
      const new_request = { ...data };
      delete new_request.type;
      delete new_request.apiKey;
      requestId = await insertDataIntoTable(db, DB_TABLE, new_request);
    }
    // If it's a resubmit request, update the data in the database
    else if (req.body.type === "resubmit_request") {
      console.log("Updating data in database...");
      const resubmit_request = { ...data };
      delete resubmit_request.type;
      delete resubmit_request.apiKey;
      delete resubmit_request.requestId;
      data.type = "new_request";
      await updateDatabaseMapRequest(db, DB_TABLE, requestId, resubmit_request);
    }
    // If it's a delete request, delete the row if no files are found,
    // Else set status to PENDING_DELETION and publish message for mapgl-tile-renderer
    // to handle deletion
    else if (req.body.type === "delete_request") {
      const shouldPublish = await handleDeleteRequest(db, DB_TABLE, requestId);
      if (!shouldPublish) {
        res
          .status(200)
          .json({ message: "Row deleted without publishing to queue." });
        return;
      }
    } else {
      throw new Error("Invalid request type");
    }

    // Set the apiKey based on the style
    if (data.style && data.style.includes("mapbox")) {
      data.apiKey = data.apiKey || MAPBOX_ACCESS_TOKEN;
    } else if (data.style && data.style === "planet") {
      data.apiKey = data.apiKey || PLANET_API_KEY;
    } else if (data.style && (data.style === "stadia-stamen-terrain" || 
        data.style === "stadia-alidade-satellite")) {
      data.apiKey = data.apiKey || STADIA_API_KEY;
    } else if (data.style && data.style === "thunderforest-landscape") {
      data.apiKey = data.apiKey || THUNDERFOREST_API_KEY;
    } 

    // Publish message to Azure Storage Queue
    if (ASQ_QUEUE_NAME) {
      console.log(`Publishing message to queue: ${ASQ_QUEUE_NAME}`);
      await publishToAzureStorageQueue(ASQ_QUEUE_NAME, requestId, data);
    } else {
      console.error("ASQ_QUEUE_NAME is not set.");
      await updateDatabaseWithError(
        db,
        DB_TABLE,
        requestId,
        "InternalServerError: ASQ_QUEUE_NAME is not set",
      );
    }

    res.status(200).json({ message: "Request successfully published!" });
  } catch (error: any) {
    console.error("Error on API side:", error.message);
    await updateDatabaseWithError(
      db,
      DB_TABLE,
      requestId,
      `InternalServerError: ${error.message}`,
    );
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: "/api",
  handler: app,
};
