export type MapStyleKey = "bing" | "google";

interface MapStyle {
    name: string;  // Human-readable name
    style: unknown;  // Can be a URL string or an object representing the style
  }

export const mapStyles: Record<MapStyleKey, MapStyle> = {
  bing: {
    name: "Bing Satellite",
    style: {
      version: 8,
      sources: {
        bing: {
          type: "raster",
          scheme: "xyz",
          tilejson: "2.2.0",
          tiles: ["sources/{z}/{x}/{y}.jpg"],
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
          id: "bing",
          type: "raster",
          source: "bing",
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
};
