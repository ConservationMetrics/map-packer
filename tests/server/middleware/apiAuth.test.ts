import { describe, it, expect, vi } from "vitest";
import apiRequestValidator from "@/utils/apiRequestValidator";
import { H3Event } from "h3";

const appApiKey = "valid-key";
const middleware = apiRequestValidator(appApiKey);

describe("apiRequestValidator", () => {
  const createEvent = (url: string, apiKey: string | undefined) =>
    ({
      node: {
        req: {
          url,
          headers: {
            "x-api-key": apiKey,
          },
        },
      },
    }) as unknown as H3Event;

  it("should bypass non-API routes", () => {
    const event = createEvent("/non-api-route", "valid-key");
    expect(() => middleware(event)).not.toThrow();
  });

  it("should bypass specific API paths", () => {
    const event = createEvent("/api/map", "valid-key");
    expect(() => middleware(event)).not.toThrow();
  });

  it("should throw error for invalid API key", () => {
    const event = createEvent("/api/secure", "invalid-key");
    expect(() => middleware(event)).toThrowError("Forbidden");
  });

  it("should allow valid API key", () => {
    const event = createEvent("/api/secure", "valid-key");
    expect(() => middleware(event)).not.toThrow();
  });
});
