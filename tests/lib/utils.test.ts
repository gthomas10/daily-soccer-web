import { describe, it, expect } from "vitest";
import { formatIsoDuration } from "@/lib/utils";

describe("formatIsoDuration", () => {
  it("converts 0 to PT0S", () => {
    expect(formatIsoDuration(0)).toBe("PT0S");
  });

  it("converts seconds only", () => {
    expect(formatIsoDuration(45)).toBe("PT45S");
  });

  it("converts minutes and seconds", () => {
    expect(formatIsoDuration(2730)).toBe("PT45M30S");
  });

  it("converts exact hours", () => {
    expect(formatIsoDuration(3600)).toBe("PT1H");
  });

  it("converts hours and minutes", () => {
    expect(formatIsoDuration(5400)).toBe("PT1H30M");
  });

  it("converts hours, minutes, and seconds", () => {
    expect(formatIsoDuration(3661)).toBe("PT1H1M1S");
  });

  it("handles negative values", () => {
    expect(formatIsoDuration(-1)).toBe("PT0S");
  });
});
