import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import { fetchData, insertDataIntoTable, updateDatabaseWithError } from "./database/dbOperations";
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

  // append custom mapbox style (or streets fallback) to the top of the list of available styles
  if (MAPBOX_STYLE) {
    styles.unshift({
      name: MAPBOX_STYLE_NAME || "Mapbox Custom Style",
      key: "mapbox-custom-map",
      url: MAPBOX_STYLE,
    });
  } else {
    styles.unshift({
      name: "Mapbox Streets",
      key: "mapbox-streets",
      url: "mapbox://styles/mapbox/streets-v12",
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

// API endpoint to POST data to the db and publish message to queue
app.post("/newmaprequest", async (req: Request, res: Response) => {
  let requestId: number | void | null = null;

  try {
    // First, let's publish the request to the db
    console.log("Inserting data into database...")
    requestId = await insertDataIntoTable(db, DB_TABLE, req.body);

    // Next, let's check if ASQ_QUEUE_NAME is set; if so, publish to message queue
    if (ASQ_QUEUE_NAME) {
      console.log(`Publishing message to queue: ${ASQ_QUEUE_NAME}`);
      await publishToAzureStorageQueue(ASQ_QUEUE_NAME, req.body, requestId);
    } else {
      // If ASQ_QUEUE_NAME is not set, update the request status and error message in the db
      console.error("ASQ_QUEUE_NAME is not set.");
      await updateDatabaseWithError(db, DB_TABLE, requestId, "ASQ_QUEUE_NAME is not set");
    }

    res.status(200).json({ message: "Request successfully published!" });
  } catch (error: any) {
    console.error("Error on API side:", error.message);
    // If error is thrown, update the request status and error message in the db
    await updateDatabaseWithError(db, DB_TABLE, requestId, error.message);
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: "/api",
  handler: app,
};
