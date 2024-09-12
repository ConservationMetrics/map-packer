import { describe, it, expect, vi } from "vitest";
import { IncomingMessage, ServerResponse } from "http";
import { validateApiKey } from "@/server/middleware/validateApiKey";
import { createEvent, createError, eventHandler } from "h3";

vi.mock("#app", () => ({
  useRuntimeConfig: vi.fn(() => ({
    appApiKey: "correct-key",
  })),
}));

vi.mock("h3", () => ({
  createEvent: vi.fn((req, res) => ({
    node: {
      req,
      res,
    },
  })),
  createError: vi.fn(({ status, message }) => ({
    status,
    message,
  })),
  eventHandler: vi.fn((handler) => handler),
}));

describe("validateApiKey middleware", () => {
  const appApiKey = "correct-key";

  it("should throw a 403 error for /api/data with incorrect API key", () => {
    const req = {
      url: "/api/data",
      headers: {
        "x-api-key": "wrong-key",
      },
    } as unknown as IncomingMessage;

    const res = {
      statusCode: 200,
      end: vi.fn(),
    } as unknown as ServerResponse;

    const event = createEvent(req, res);

    try {
      validateApiKey(event, appApiKey);
    } catch (error: any) {
      expect(error.status).toBe(403);
      expect(error.message).toBe("Forbidden");
    }
  });

  it("should not throw an error for /api/data with correct API key", () => {
    const req = {
      url: "/api/secure-data",
      headers: {
        "x-api-key": "correct-key",
      },
    } as unknown as IncomingMessage;

    const res = {
      statusCode: 200,
      end: vi.fn(),
    } as unknown as ServerResponse;

    const event = createEvent(req, res);

    expect(() => validateApiKey(event, appApiKey)).not.toThrow();
  });

  it("should bypass middleware for /api/map", () => {
    const req = {
      url: "/api/map",
    } as IncomingMessage;

    const res = {
      statusCode: 200,
      end: vi.fn(),
    } as unknown as ServerResponse;

    const event = createEvent(req, res);

    expect(() => validateApiKey(event, appApiKey)).not.toThrow();
  });
});
