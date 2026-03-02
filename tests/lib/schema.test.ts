import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { validateEpisodeMetadata } from "@/lib/schema";

function loadFixture(name: string): unknown {
  const path = resolve(__dirname, "../../schemas/fixtures", name);
  return JSON.parse(readFileSync(path, "utf-8"));
}

describe("validateEpisodeMetadata", () => {
  it("accepts a valid episode fixture", () => {
    const validEpisode = loadFixture("valid-episode.json");
    const result = validateEpisodeMetadata(validEpisode);
    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects an invalid episode fixture with errors", () => {
    const invalidEpisode = loadFixture("invalid-episode.json");
    const result = validateEpisodeMetadata(invalidEpisode);
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects empty object", () => {
    const result = validateEpisodeMetadata({});
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects episode with invalid league ID", () => {
    const validEpisode = loadFixture("valid-episode.json") as Record<
      string,
      unknown
    >;
    const modified = {
      ...validEpisode,
      leagues_covered: ["premier-league", "invalid-league"],
    };
    const result = validateEpisodeMetadata(modified);
    expect(result.success).toBe(false);
  });

  it("rejects episode with duplicate presenters", () => {
    const validEpisode = loadFixture("valid-episode.json") as Record<
      string,
      unknown
    >;
    const modified = {
      ...validEpisode,
      presenters: ["expert", "expert"],
    };
    const result = validateEpisodeMetadata(modified);
    expect(result.success).toBe(false);
  });

  it("rejects episode with empty chapters", () => {
    const validEpisode = loadFixture("valid-episode.json") as Record<
      string,
      unknown
    >;
    const modified = { ...validEpisode, chapters: [] };
    const result = validateEpisodeMetadata(modified);
    expect(result.success).toBe(false);
  });

  it("accepts episode with null bonus_audio_url", () => {
    const validEpisode = loadFixture("valid-episode.json") as Record<
      string,
      unknown
    >;
    const modified = { ...validEpisode, bonus_audio_url: null };
    const result = validateEpisodeMetadata(modified);
    expect(result.success).toBe(true);
  });
});
