import { describe, it, expect } from "vitest";
import { calculateMaxPlanetMonthYear, estimateNumberOfTiles } from "@/utils/";

describe("calculateMaxPlanetMonthYear", () => {
  it("should return the current month if after the 15th", () => {
    const mockDate = new Date(2023, 2, 16); // March 16, 2023
    const originalDate = Date;

    // Mock Date to control the current date
    globalThis.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    const result = calculateMaxPlanetMonthYear();
    expect(result).toBe("2023-02"); // Expecting February 2023

    // Restore original Date
    globalThis.Date = originalDate;
  });

  it("should return the previous month if before the 15th", () => {
    const mockDate = new Date(2023, 2, 14); // March 14, 2023
    const originalDate = Date;

    // Mock Date to control the current date
    globalThis.Date = class extends Date {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;

    const result = calculateMaxPlanetMonthYear();
    expect(result).toBe("2023-01"); // Expecting January 2023

    // Restore original Date
    globalThis.Date = originalDate;
  });
});

describe("estimateNumberOfTiles", () => {
  it("should calculate the correct number of tiles for given bounds and max zoom", () => {
    const maxZoom = 5;
    const boundsStr = "-180,-85,180,85"; // World bounds
    const expectedTiles = 1428; // 1428 tiles for zoom 5

    const result = estimateNumberOfTiles(maxZoom, boundsStr);
    expect(result).toBe(expectedTiles);
  });
});
