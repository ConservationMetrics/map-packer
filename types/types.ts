export type AvailableMapStyle = {
  name: string;
  key: string;
  url: string;
};

export type MapStyleWithValue = {
  name: string;
  key: string;
  value: string;
};

export type AvailableMapStyles = AvailableMapStyle[];

export interface FormData {
  title: string;
  description: string | null;
  selectedStyle: string;
  selectedStyleKey: string | null;
  overlay: string | null;
  openstreetmap: boolean;
  mapboxStyle: string | null;
  planetMonthYear: string | null | undefined;
  selectedBounds: string;
  maxZoom: number;
  estimatedTiles: number | null;
  format: string | null;
  mapboxAccessToken: string | null;
  type: string | null;
}

export interface MapRequest {
  id: number;
  created_at: Date;
  title: string;
  description: string | null;
  style: string;
  overlay: string | null;
  openstreetmap: boolean;
  mapbox_style: string | null;
  planet_monthly_visual: string | null;
  api_key: string | null;
  bounds: string;
  min_zoom: number;
  max_zoom: number;
  ratio: number | null;
  tile_type: string | null;
  number_of_tiles: number | null;
  filename: string | null;
  file_location: string | null;
  file_size: string | null;
  status: string;
  error_message: string | null;
  work_begun: Date | null;
  work_ended: Date | null;
  format: string | null;
  thumbnail_filename: string | null;
}

export interface MapResponse {
  nextCursor: number | undefined;
  offlineMaps: MapRequest[];
}
export interface MapStyle {
  name: string;
  style?: unknown;
  url?: string;
}

export type MapStyleKey =
  | "bing"
  | "google"
  | "esri"
  | "mapbox-custom"
  | "mapbox-satellite"
  | "mapbox-streets"
  | "planet"
  | "stadia-stamen-terrain"
  | "stadia-alidade-satellite"
  | "thunderforest-landscape";

export interface DrawEvent {
  features: Feature[];
}

interface Feature {
  geometry: Geometry;
}

interface Geometry {
  coordinates: [number, number][][];
}

export interface Coordinate {
  lat: number;
  lng: number;
}

export type LonLat = [number, number];

type MapParam =
  | "OsmEnabled"
  | "AccessToken"
  | "Bounds"
  | "Latitude"
  | "Longitude"
  | "Style"
  | "Zoom";

export interface UpdateMapParams {
  param: MapParam;
  value: number | string | boolean | Coordinate[];
}
