import { mapStyles } from "@/server/styles/availableMapStyles";

import type { H3Event } from "h3";

export default defineEventHandler((event: H3Event) => {
  const {
    public: {
      mapboxStyle,
      mapboxAccessToken,
      mapboxStyleName,
      planetApiKey,
      stadiaApiKey,
      thunderforestApiKey,
    },
  } = useRuntimeConfig();

  const styles = Object.entries(mapStyles).map(([key, value]) => ({
    name: value.name,
    key: key,
    url: value.url || `/api/mapstyle/${key}/`,
  }));

  // filter out map styles for which the API key was not provided
  const filteredStyles = styles.filter((style) => {
    if (style.key.includes("thunderforest") && !thunderforestApiKey) {
      return false;
    }
    if (style.key.includes("planet") && !planetApiKey) {
      return false;
    }
    if (style.key.includes("stadia") && !stadiaApiKey) {
      return false;
    }
    if (style.key.includes("mapbox") && !mapboxAccessToken) {
      return false;
    }
    return true;
  });

  // if provided, append custom mapbox style to the top of the list of available styles
  if (mapboxStyle && mapboxAccessToken) {
    filteredStyles.unshift({
      name: mapboxStyleName || "Mapbox Custom Style",
      key: "mapbox",
      url: mapboxStyle,
    });
  }

  return send(event, JSON.stringify(filteredStyles));
});
