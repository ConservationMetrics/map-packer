import { defineEventHandler, send, sendError, H3Event } from "h3";

import { mapStyles } from "@/server/styles/availableMapStyles";

export default defineEventHandler((event: H3Event) => {
  if (!event.context.params) {
    return sendError(event, new Error("Parameters not found"));
  }

  const { year, month } = event.context.params;
  const styleKey = "planet";

  if (styleKey in mapStyles) {
    const mapStyleEntry = mapStyles[styleKey as keyof typeof mapStyles];
    const newTileUrl = (
      mapStyleEntry.style as { sources: { planet: { tiles: string[] } } }
    ).sources.planet.tiles[0].replace(/\d{4}-\d{2}/, `${year}-${month}`);
    (
      mapStyleEntry.style as { sources: { planet: { tiles: string[] } } }
    ).sources.planet.tiles[0] = newTileUrl;
    return send(event, JSON.stringify(mapStyleEntry.style));
  } else {
    return sendError(event, new Error("Map style not found"));
  }
});
