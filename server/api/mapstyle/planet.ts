import { mapStyles } from "@/server/styles/availableMapStyles";

import type { H3Event } from "h3";

export default defineEventHandler((event: H3Event) => {
  const mapStyleEntry = mapStyles["planet" as keyof typeof mapStyles];
  if (mapStyleEntry) {
    return send(event, JSON.stringify(mapStyleEntry.style));
  } else {
    return sendError(event, new Error("Map style not found"));
  }
});
