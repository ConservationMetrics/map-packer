import { defineEventHandler, send, H3Event } from "h3";
import { mapStyles } from "../styles/availableMapStyles";
import {
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE,
  MAPBOX_STYLE_NAME,
  PLANET_API_KEY,
  STADIA_API_KEY,
  THUNDERFOREST_API_KEY,
} from "../../config";

export default defineEventHandler((event: H3Event) => {
  const styles = Object.entries(mapStyles).map(([key, value]) => ({
    name: value.name,
    key: key,
    url: value.url || `/api/mapstyle/${key}/`,
  }));

  // filter out map styles for which the API key was not provided
  const filteredStyles = styles.filter((style) => {
    if (style.key.includes("thunderforest") && !THUNDERFOREST_API_KEY) {
      return false;
    }
    if (style.key.includes("planet") && !PLANET_API_KEY) {
      return false;
    }
    if (style.key.includes("stadia") && !STADIA_API_KEY) {
      return false;
    }
    if (style.key.includes("mapbox") && !MAPBOX_ACCESS_TOKEN) {
      return false;
    }
    return true;
  });

  // if provided, append custom mapbox style to the top of the list of available styles
  if (MAPBOX_STYLE && MAPBOX_ACCESS_TOKEN) {
    filteredStyles.unshift({
      name: MAPBOX_STYLE_NAME || "Mapbox Custom Style",
      key: "mapbox",
      url: MAPBOX_STYLE,
    });
  }

  return send(event, JSON.stringify(filteredStyles));
});
