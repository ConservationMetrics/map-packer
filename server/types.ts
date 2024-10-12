import { Client } from "pg";

export type DatabaseConnection = typeof Client.prototype;

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

export interface MapStyle {
  name: string;
  style?: unknown;
  url?: string;
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
  thumbnail_filename: string | null;
}
