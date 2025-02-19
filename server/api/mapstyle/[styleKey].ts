import { mapStyles } from "@/server/styles/availableMapStyles";

import type { H3Event } from "h3";

export default defineEventHandler((event: H3Event) => {
  if (!event.context.params) {
    return sendError(event, new Error("Parameters not found"));
  }

  const { styleKey } = event.context.params;

  if (styleKey in mapStyles) {
    const mapStyleEntry = mapStyles[styleKey as keyof typeof mapStyles];
    return send(event, JSON.stringify(mapStyleEntry.style));
  } else {
    return sendError(event, new Error("Map style not found"));
  }
});
