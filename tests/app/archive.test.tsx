// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockGetPublishedEpisodes = vi.fn();

vi.mock("@/lib/turso", () => ({
  getPublishedEpisodes: (...args: unknown[]) => mockGetPublishedEpisodes(...args),
}));

describe("/archive page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders episode list for authenticated subscriber", async () => {
    mockGetPublishedEpisodes.mockResolvedValue([
      {
        id: 1,
        date: "2026-03-07",
        title: "Matchday 30 Recap",
        description: "Recap",
        duration: 1200,
        leagues_covered: ["premier-league"],
        chapter_data: [],
        audio_url: "https://example.com/audio.mp3",
        publish_status: "published",
        created_at: "2026-03-07T00:00:00Z",
      },
    ]);

    const { default: ArchivePage } = await import("@/app/archive/page");
    const page = await ArchivePage();
    render(page);

    expect(screen.getByText("Episode Archive")).toBeDefined();
    expect(screen.getByText("Matchday 30 Recap")).toBeDefined();
  });

  it("renders empty state when no episodes", async () => {
    mockGetPublishedEpisodes.mockResolvedValue([]);

    const { default: ArchivePage } = await import("@/app/archive/page");
    const page = await ArchivePage();
    render(page);

    expect(screen.getByText("Episode Archive")).toBeDefined();
    expect(screen.getByText("No episodes available yet.")).toBeDefined();
  });
});
