import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import fetchData from "./database/dbOperations";
import { checkAuthStrategy } from "./middleware";
import { getLogin, postLogin } from "./loginController";
import { sortByDate } from "./dataProcessing/filterData";

import {
  DATABASE,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_PORT,
  DB_SSL,
  DB_TABLE,
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_ZOOM,
  MAPBOX_LATITUDE,
  MAPBOX_LONGITUDE,
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

app.get("/data", async (_req: Request, res: Response) => {
  try {
    // Fetch data
    const { data } = await fetchData(db, DB_TABLE);

    if (data === null) {
      res.json([]);
    } else {
      // Sort offline maps in descending order by work_ended field
      const sortedData = sortByDate(data, 'workended');
      res.json(sortedData);
    }
  } catch (error: any) {
    console.error("Error fetching data on API side:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/map", async (_req: Request, res: Response) => {
  const response = {
    mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
    mapboxStyle: MAPBOX_STYLE,
    mapboxZoom: MAPBOX_ZOOM,
    mapboxLatitude: MAPBOX_LATITUDE,
    mapboxLongitude: MAPBOX_LONGITUDE,
  };
  res.json(response);
});

export default {
  path: "/api",
  handler: app,
};
