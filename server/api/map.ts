import { defineEventHandler, send, H3Event } from "h3";
import { mapStyles } from "../styles/availableMapStyles";

export default defineEventHandler((event: H3Event) => {
  const config = useRuntimeConfig();

  const styles = Object.entries(mapStyles).map(([key, value]) => ({
    name: value.name,
    key: key,
    url: value.url || `/api/mapstyle/${key}/`,
  }));

  // filter out map styles for which the API key was not provided
  const filteredStyles = styles.filter((style) => {
    if (
      style.key.includes("thunderforest") &&
      !config.public.thunderforestApiKey
    ) {
      return false;
    }
    if (style.key.includes("planet") && !config.public.planetApiKey) {
      return false;
    }
    if (style.key.includes("stadia") && !config.public.stadiaApiKey) {
      return false;
    }
    if (style.key.includes("mapbox") && !config.public.mapboxAccessToken) {
      return false;
    }
    return true;
  });

  // if provided, append custom mapbox style to the top of the list of available styles
  if (config.public.mapboxStyle && config.public.mapboxAccessToken) {
    filteredStyles.unshift({
      name: config.public.mapboxStyleName || "Mapbox Custom Style",
      key: "mapbox",
      url: config.public.mapboxStyle,
    });
  }

  return send(event, JSON.stringify(filteredStyles));
});
