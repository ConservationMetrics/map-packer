export type MapStyleKey = "bing" | "google" | "esri" | "planet";

interface MapStyle {
  name: string;
  style: unknown;
}

const calculatePlanetMonthYear = () => {
    // Let's calculate a format like this: YYYY-MM but for two months earlier than this month
    // So if it's ANY day in February, 2024, we want to get 2023-12
    const date = new Date();
    date.setMonth(date.getMonth() - 2);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed, add 1 to normalize  
    const year = date.getFullYear();
    const monthYear = `${year}-${month < 10 ? `0${month}` : month}`;
    return monthYear;
};

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
  planet: {
    name: `Planet Monthly Visual Basemap (${calculatePlanetMonthYear()})`,
    style: {
      version: 8,
      sources: {
        planet: {
          type: "raster",
          tiles: [
            `https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_${calculatePlanetMonthYear()}_mosaic/gmap/{z}/{x}/{y}?api_key=${process.env.VUE_APP_PLANET_API_KEY}`,
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