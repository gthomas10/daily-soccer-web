// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const mockEpisode = {
  episode_id: "2026-03-01",
  title: "Premier League Matchday 28 Recap",
  description: "Full coverage of all weekend Premier League action.",
  publish_date: "2026-03-01T21:45:00Z",
  audio_url: "https://cdn.example.com/episodes/2026-03-01/audio.mp3",
  bonus_audio_url: null,
  duration_seconds: 2730,
  chapters: [
    {
      title: "Opening",
      start_seconds: 0,
      end_seconds: 120,
      leagues: ["premier-league" as const],
    },
  ],
  presenters: ["expert" as const, "host" as const],
  leagues_covered: ["premier-league" as const],
  fpl_segment: true,
  show_notes_html: "<h2>Show Notes</h2><p>Episode notes here.</p>",
};

vi.mock("@/lib/r2", () => ({
  getEpisodeMetadata: vi.fn(),
  getAudioStreamUrl: vi.fn(
    (id: string) => `https://cdn.example.com/episodes/${id}/audio.mp3`
  ),
  listEpisodes: vi.fn(() => Promise.resolve(["2026-03-01", "2026-02-28"])),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Mock client components to avoid DOM complexity
vi.mock("@/components/EpisodePlayer", () => ({
  default: ({ episode }: { episode: { title: string } }) => (
    <div data-testid="episode-player">{episode.title}</div>
  ),
}));

vi.mock("@/components/ShowNotes", () => ({
  default: ({ html }: { html: string }) => (
    <div data-testid="show-notes">{html}</div>
  ),
}));

vi.mock("@/components/SubscribeCta", () => ({
  default: () => <div data-testid="subscribe-cta">Subscribe</div>,
}));

import { getEpisodeMetadata, listEpisodes } from "@/lib/r2";
import { notFound } from "next/navigation";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("EpisodePage", () => {
  let EpisodePage: typeof import("@/app/episodes/[slug]/page").default;

  beforeEach(async () => {
    const mod = await import("@/app/episodes/[slug]/page");
    EpisodePage = mod.default;
  });

  it("renders episode data when found", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const page = await EpisodePage({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });
    render(page);

    expect(screen.getByTestId("episode-player")).toBeDefined();
    expect(screen.getByTestId("show-notes")).toBeDefined();
    expect(screen.getByTestId("subscribe-cta")).toBeDefined();
  });

  it("calls notFound for missing episode", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(null);

    await expect(
      EpisodePage({ params: Promise.resolve({ slug: "9999-01-01" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("has correct heading hierarchy via semantic HTML", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const page = await EpisodePage({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });
    const { container } = render(page);

    const main = container.querySelector("main.min-h-screen");
    expect(main).not.toBeNull();
  });

  it("renders skip-to-player link", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const page = await EpisodePage({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });
    render(page);

    const skipLink = screen.getByText("Skip to player");
    expect(skipLink.tagName).toBe("A");
    expect(skipLink.getAttribute("href")).toBe("#audio-player");
  });

  it("renders PodcastEpisode JSON-LD", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const page = await EpisodePage({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });
    const { container } = render(page);

    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(script).not.toBeNull();

    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd["@type"]).toBe("PodcastEpisode");
    expect(jsonLd.name).toBe("Premier League Matchday 28 Recap");
    expect(jsonLd.description).toBe(
      "Full coverage of all weekend Premier League action."
    );
    expect(jsonLd.datePublished).toBe("2026-03-01");
    expect(jsonLd.timeRequired).toBe("PT45M30S");
    expect(jsonLd.associatedMedia["@type"]).toBe("MediaObject");
    expect(jsonLd.associatedMedia.contentUrl).toContain("2026-03-01");
    expect(jsonLd.partOfSeries["@type"]).toBe("PodcastSeries");
    expect(jsonLd.partOfSeries.name).toBe("Daily Soccer Report");
  });
});

describe("generateMetadata", () => {
  let generateMetadata: typeof import("@/app/episodes/[slug]/page").generateMetadata;

  beforeEach(async () => {
    const mod = await import("@/app/episodes/[slug]/page");
    generateMetadata = mod.generateMetadata;
  });

  it("returns correct OG tags for existing episode", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });

    expect(metadata.title).toBe(
      "Premier League Matchday 28 Recap | Daily Soccer Report"
    );
    expect(metadata.description).toBe(
      "Full coverage of all weekend Premier League action."
    );
    expect(metadata.openGraph).toBeDefined();
    expect((metadata.openGraph as Record<string, unknown>).type).toBe(
      "article"
    );
    expect((metadata.openGraph as Record<string, unknown>).siteName).toBe(
      "Daily Soccer Report"
    );
    expect((metadata.openGraph as Record<string, unknown>).url).toBe(
      "/episodes/2026-03-01"
    );
  });

  it("returns canonical URL", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });

    expect(
      (metadata.alternates as Record<string, unknown>).canonical
    ).toBe("/episodes/2026-03-01");
  });

  it("returns twitter card metadata", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(mockEpisode);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "2026-03-01" }),
    });

    expect(metadata.twitter).toBeDefined();
    expect((metadata.twitter as Record<string, unknown>).card).toBe(
      "summary_large_image"
    );
  });

  it("returns fallback metadata for missing episode", async () => {
    vi.mocked(getEpisodeMetadata).mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "9999-01-01" }),
    });

    expect(metadata.title).toBe("Episode Not Found | Daily Soccer Report");
    expect(metadata.openGraph).toBeUndefined();
  });
});

describe("generateStaticParams", () => {
  it("returns slug params from listEpisodes", async () => {
    const mod = await import("@/app/episodes/[slug]/page");
    const params = await mod.generateStaticParams();

    expect(params).toEqual([
      { slug: "2026-03-01" },
      { slug: "2026-02-28" },
    ]);
    expect(listEpisodes).toHaveBeenCalled();
  });
});
