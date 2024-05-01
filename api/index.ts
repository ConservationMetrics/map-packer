import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import { fetchData, insertDataIntoTable } from "./database/dbOperations";
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
  MAP_STYLE,
  MAP_ZOOM,
  MAP_LATITUDE,
  MAP_LONGITUDE,
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
      res.json(sortedData);
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
    mapStyle: MAP_STYLE,
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
  try {
    // Check if ASQ_QUEUE_NAME is set; if so, publish to message queue
    if (ASQ_QUEUE_NAME) {
      console.log(`Publishing message to queue: ${ASQ_QUEUE_NAME}`);
      await publishToAzureStorageQueue(ASQ_QUEUE_NAME, JSON.stringify(req.body));
      console.log("Message succesfully published to message queue.");
    } else {
      throw new Error("Error publishing to message queue.");
    }

    console.log("Inserting data into database...")
    await insertDataIntoTable(db, DB_TABLE, req.body);

    res.status(200).json({ message: "Request successfully published!" });
  } catch (error: any) {
    console.error("Error inserting data on API side:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default {
  path: "/api",
  handler: app,
};
