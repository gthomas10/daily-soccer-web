// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import EpisodePlayer from "@/components/EpisodePlayer";
import { setupAudioMock } from "../helpers/audio-mock";
import type { Episode } from "@/types/episode";

// Mock formatEpisodeDate to avoid Date locale issues in tests
vi.mock("@/lib/utils", () => ({
  formatDuration: (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  },
  formatEpisodeDate: () => "March 1, 2026",
}));

beforeEach(() => {
  setupAudioMock();
});

const mockEpisode: Episode = {
  episode_id: "2026-03-01",
  title: "Weekend Recap: Premier League Title Race Heats Up",
  description: "Full weekend coverage across all major leagues.",
  publish_date: "2026-03-01T22:00:00Z",
  audio_url: "https://r2.example.com/episodes/2026-03-01/audio.mp3",
  bonus_audio_url: null,
  duration_seconds: 3420,
  chapters: [
    {
      title: "Top Story: Arsenal's Title Hopes",
      start_seconds: 0,
      end_seconds: 180,
      leagues: ["premier-league"],
    },
    {
      title: "Premier League Weekend Roundup",
      start_seconds: 180,
      end_seconds: 900,
      leagues: ["premier-league"],
    },
  ],
  presenters: ["expert", "host"],
  leagues_covered: ["premier-league"],
  fpl_segment: true,
  show_notes_html: "<p>Show notes</p>",
};

function dismissLoading(container: HTMLElement) {
  const audio = container.querySelector("audio");
  if (audio) {
    act(() => {
      audio.dispatchEvent(new Event("canplay"));
    });
  }
}

describe("EpisodePlayer", () => {
  it("renders AudioPlayer with episode title", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );

    expect(container.textContent).toContain("Weekend Recap: Premier League Title Race Heats Up");
  });

  it("renders ChapterList with chapters", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );

    expect(container.textContent).toContain("Top Story: Arsenal's Title Hopes");
    expect(container.textContent).toContain("Premier League Weekend Roundup");
  });

  it("renders formatted date", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );

    expect(container.textContent).toContain("March 1, 2026");
  });

  it("renders play button initially", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );
    dismissLoading(container);

    const playBtn = container.querySelector('button[aria-label="Play"]');
    expect(playBtn).not.toBeNull();
  });

  it("renders audio element with correct src", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );

    const audio = container.querySelector("audio");
    expect(audio?.getAttribute("src")).toBe("https://cdn.example.com/audio.mp3");
  });

  it("responds to player:seek custom events by seeking audio", () => {
    const { container } = render(
      <EpisodePlayer episode={mockEpisode} audioUrl="https://cdn.example.com/audio.mp3" />
    );

    const audio = container.querySelector("audio") as HTMLAudioElement;
    expect(audio).not.toBeNull();

    act(() => {
      document.dispatchEvent(
        new CustomEvent("player:seek", { detail: { seconds: 180 } })
      );
    });

    expect(audio.currentTime).toBe(180);
  });
});
