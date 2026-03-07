import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/r2", () => ({
  listEpisodes: vi.fn(),
}));

import { listEpisodes } from "@/lib/r2";

describe("sitemap", () => {
  let sitemap: typeof import("@/app/sitemap").default;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/sitemap");
    sitemap = mod.default;
  });

  it("includes homepage and presenters page", async () => {
    vi.mocked(listEpisodes).mockResolvedValue([]);

    const result = await sitemap();

    const urls = result.map((entry) => entry.url);
    expect(urls).toContain("https://dailysoccerreport.com");
    expect(urls).toContain("https://dailysoccerreport.com/presenters");
  });

  it("includes episode pages from listEpisodes", async () => {
    vi.mocked(listEpisodes).mockResolvedValue(["2026-03-01", "2026-02-28"]);

    const result = await sitemap();

    const urls = result.map((entry) => entry.url);
    expect(urls).toContain(
      "https://dailysoccerreport.com/episodes/2026-03-01"
    );
    expect(urls).toContain(
      "https://dailysoccerreport.com/episodes/2026-02-28"
    );
  });

  it("sets homepage priority to 1 and changeFrequency to daily", async () => {
    vi.mocked(listEpisodes).mockResolvedValue([]);

    const result = await sitemap();

    const homepage = result.find(
      (entry) => entry.url === "https://dailysoccerreport.com"
    );
    expect(homepage?.priority).toBe(1);
    expect(homepage?.changeFrequency).toBe("daily");
  });

  it("sets episode changeFrequency to never", async () => {
    vi.mocked(listEpisodes).mockResolvedValue(["2026-03-01"]);

    const result = await sitemap();

    const episode = result.find((entry) => entry.url.includes("/episodes/"));
    expect(episode?.changeFrequency).toBe("never");
  });

  it("handles empty episode list gracefully", async () => {
    vi.mocked(listEpisodes).mockResolvedValue([]);

    const result = await sitemap();

    expect(result.length).toBe(2); // homepage + presenters only
  });
});
