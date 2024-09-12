import { defineEventHandler, H3Event } from "h3";
export default defineEventHandler((event: H3Event) => {
  const {
    public: { appApiKey },
  } = useRuntimeConfig();

  // Only apply middleware to API routes
  if (!event.node.req.url?.startsWith("/api/")) {
    return;
  }

  // Bypass middleware for specific paths
  if (
    event.node.req.url?.startsWith("/api/map") ||
    event.node.req.url?.startsWith("/auth/auth0") ||
    event.node.req.url?.startsWith("/api/_auth/")
  ) {
    return;
  }

  const headerApiKey = event.node.req.headers["x-api-key"];
  if (headerApiKey !== appApiKey) {
    throw createError({
      status: 403,
      message: "Forbidden",
    });
  }
});
