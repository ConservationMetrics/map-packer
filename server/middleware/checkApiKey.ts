import { defineEventHandler, H3Event } from "h3";
const {
  public: { apiKey },
} = useRuntimeConfig();

export default defineEventHandler((event: H3Event) => {
  // Only apply middleware to API routes
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  // Bypass middleware for specific paths
  if (
    event.node.req.url?.startsWith("/api/mapstyle/") ||
    event.node.req.url?.startsWith("/auth/auth0") ||
    event.node.req.url?.startsWith("/api/_auth/")
  ) {
    return;
  }

  const headerApiKey = event.node.req.headers["x-api-key"];
  if (headerApiKey !== apiKey) {
    throw createError({
      status: 403,
      message: "Forbidden",
    });
  }
});
