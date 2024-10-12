import { defineEventHandler, send, sendError, H3Event } from "h3";
import { mapStyles } from "../../styles/availableMapStyles";

export default defineEventHandler((event: H3Event) => {
  const mapStyleEntry = mapStyles["planet" as keyof typeof mapStyles];
  if (mapStyleEntry) {
    return send(event, JSON.stringify(mapStyleEntry.style));
  } else {
    return sendError(event, new Error("Map style not found"));
  }
});
