import express, { Request, Response } from "express";

import setupDatabaseConnection from "./database/dbConnection";
import fetchData from "./database/dbOperations";
import { checkAuthStrategy } from "./middleware";
import { getLogin, postLogin } from "./loginController";
import { sortByDate } from "./dataProcessing/filterData";
import { mapStyles } from "./styles/mapStyles";

import {
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
    url: `/api/mapstyle/${key}/`, // Use the key to generate the URL
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

// API endpoint to retrieve a specific map style with a custom date
app.get("/mapstyle/planet/:year/:month", (req: Request, res: Response) => {
  const { year, month } = req.params;
  const styleKey = "planet";
  console.log(year, month);

  // Validate that styleKey is a key of mapStyles
  if (styleKey in mapStyles) {
    const mapStyleEntry = mapStyles[styleKey as keyof typeof mapStyles];

    // Replace the date in the tile URL
    // Replace regex of the form YYYY-MM with the new year and month
    const newTileUrl = (
      mapStyleEntry.style as any
    ).sources.planet.tiles[0].replace(/\d{4}-\d{2}/, `${year}-${month}`);
    (mapStyleEntry.style as any).sources.planet.tiles[0] = newTileUrl;

    console.log(newTileUrl);

    res.json(mapStyleEntry.style);
  } else {
    res.status(404).json({ error: "Map style not found" });
  }
});

export default {
  path: "/api",
  handler: app,
};
