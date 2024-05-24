import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import {
  fetchData,
  insertDataIntoTable,
  updateDatabaseMapRequest,
  updateDatabaseWithError,
} from "./database/dbOperations";
import { publishToAzureStorageQueue } from "./messageQueue/azure";

import { checkAuthStrategy } from "./middleware";
import { getLogin, postLogin } from "./loginController";

import { sortByDate } from "./dataProcessing/filterData";
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
app.get("/data", async (_req: Request, res: Response) => {
  try {
    // Fetch data
    const { data } = await fetchData(db, DB_TABLE);

    if (data === null) {
      res.json([]);
    } else {
      // Sort offline maps in descending order by created_at field
      const sortedData = sortByDate(data, "created_at");

      const response = {
        mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
        offlineMaps: sortedData,
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
    mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
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

  // append custom mapbox style to the top of the list of available styles
  if (MAPBOX_STYLE) {
    styles.unshift({
      name: MAPBOX_STYLE_NAME || "Mapbox Custom Style",
      key: "mapbox",
      url: MAPBOX_STYLE,
    });
  }

  res.json(styles);
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

  if ((data.style = "mapbox-custom") || (data.style = "mapbox-streets")) {
    data.style = "mapbox";
  }
  try {
    // If it's a new request, insert data into the database
    if (req.body.type === "new_request") {
      console.log("Inserting data into database...");
      const new_request = { ...data };
      delete new_request.type;
      requestId = await insertDataIntoTable(db, DB_TABLE, new_request);
    }
    // If it's a resubmit request, update the data in the database
    else if (req.body.type === "resubmit_request") {
      console.log("Updating data in database...");
      const resubmit_request = { ...data };
      delete resubmit_request.type;
      delete resubmit_request.requestId;
      data.type = "new_request";
      await updateDatabaseMapRequest(db, DB_TABLE, requestId, resubmit_request);
    }
    // If it's a delete request, update the data in the database with STATUS = "PENDING DELETION"
    // Delete requests are handled further by mapgl-tile-renderer
    else if (req.body.type === "delete_request") {
      console.log("Updating data in database...");
      await updateDatabaseMapRequest(db, DB_TABLE, requestId, {
        status: "PENDING DELETION",
      });
    } else {
      throw new Error("Invalid request type");
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
