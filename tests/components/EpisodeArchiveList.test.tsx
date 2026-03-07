// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EpisodeArchiveList } from "@/components/EpisodeArchiveList";
import type { EpisodeRow } from "@/lib/turso";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockEpisodes: EpisodeRow[] = [
  {
    id: 1,
    date: "2026-03-07",
    title: "Premier League Matchday 30 Recap",
    description: "Full recap",
    duration: 1234,
    leagues_covered: ["premier-league", "la-liga"],
    chapter_data: [],
    audio_url: "https://example.com/audio.mp3",
    publish_status: "published",
    created_at: "2026-03-07T00:00:00Z",
  },
  {
    id: 2,
    date: "2026-03-06",
    title: "Champions League Quarter-Finals Preview",
    description: "Preview",
    duration: 65,
    leagues_covered: ["champions-league"],
    chapter_data: [],
    audio_url: "https://example.com/audio2.mp3",
    publish_status: "published",
    created_at: "2026-03-06T00:00:00Z",
  },
];

describe("EpisodeArchiveList", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders episode titles", () => {
    render(<EpisodeArchiveList episodes={mockEpisodes} />);

    expect(screen.getByText("Premier League Matchday 30 Recap")).toBeDefined();
    expect(screen.getByText("Champions League Quarter-Finals Preview")).toBeDefined();
  });

  it("renders formatted dates", () => {
    render(<EpisodeArchiveList episodes={mockEpisodes} />);

    // Dates should be formatted (not raw YYYY-MM-DD)
    const listItems = screen.getAllByRole("article");
    expect(listItems).toHaveLength(2);
  });

  it("renders league badges", () => {
    render(<EpisodeArchiveList episodes={mockEpisodes} />);

    expect(screen.getByText("premier-league")).toBeDefined();
    expect(screen.getByText("la-liga")).toBeDefined();
    expect(screen.getByText("champions-league")).toBeDefined();
  });

  it("renders formatted duration", () => {
    render(<EpisodeArchiveList episodes={mockEpisodes} />);

    // 1234 seconds = 20:34
    expect(screen.getByText("20:34")).toBeDefined();
    // 65 seconds = 1:05
    expect(screen.getByText("1:05")).toBeDefined();
  });

  it("links episodes to /episodes/{date} slug", () => {
    render(<EpisodeArchiveList episodes={mockEpisodes} />);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/episodes/2026-03-07");
    expect(hrefs).toContain("/episodes/2026-03-06");
  });
});
