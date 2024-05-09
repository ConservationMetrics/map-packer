import { calculatePlanetMonthYear } from "../../src/utils";

export type MapStyleKey = "bing" | "google" | "esri" | "mapbox-satellite" | "planet" ;

interface MapStyle {
  name: string;
  style?: unknown;
  url?: string;
}

export const mapStyles: Record<MapStyleKey, MapStyle> = {
  bing: {
    name: "Bing Satellite",
    style: {
      version: 8,
      sources: {
        bing: {
          type: "raster",
          tiles: [
            "https://ecn.t0.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
            "https://ecn.t1.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
            "https://ecn.t2.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
            "https://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=587&mkt=en-gb&n=z",
          ],
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#f9f9f9",
          },
        },
        {
          id: "bing",
          type: "raster",
          source: "bing",
          paint: {},
        },
      ],
    },
  },
  esri: {
    name: "ESRI Satellite",
    style: {
      version: 8,
      sources: {
        esri: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#f9f9f9",
          },
        },
        {
          id: "esri",
          type: "raster",
          source: "esri",
          paint: {},
        },
      ],
    },
  },
  google: {
    name: "Google Satellite",
    style: {
      version: 8,
      sources: {
        google: {
          type: "raster",
          tiles: ["https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#f9f9f9",
          },
        },
        {
          id: "google",
          type: "raster",
          source: "google",
          paint: {},
        },
      ],
    },
  },
  'mapbox-satellite': {
    name: "Mapbox Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
  },
  planet: {
    name: `Planet Monthly Visual Basemap`,
    style: {
      version: 8,
      sources: {
        planet: {
          type: "raster",
          tiles: [
            `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_${calculatePlanetMonthYear()}_mosaic/gmap/{z}/{x}/{y}?api_key=` + (process.env.VUE_APP_PLANET_API_KEY || '').replace(/"/g, ''),
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": "#f9f9f9",
          },
        },
        {
          id: "planet",
          type: "raster",
          source: "planet",
          paint: {},
        },
      ],
    },
  },
};
