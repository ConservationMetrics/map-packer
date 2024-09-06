import { defineEventHandler, H3Event } from "h3";
import { API_KEY } from "../../config";

export default defineEventHandler((event: H3Event) => {
  // Only apply middleware to API routes
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  // Bypass middleware for specific paths
  if (
    event.node.req.url?.startsWith("/api/mapstyle/") ||
    event.node.req.url?.startsWith("/api/auth/auth0")
  ) {
    return;
  }

  const apiKey = event.node.req.headers["x-api-key"];
  if (apiKey !== API_KEY) {
    event.node.res.statusCode = 403;
    event.node.res.end("Forbidden");
    return;
  }
});
