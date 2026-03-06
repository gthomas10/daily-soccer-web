// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { createRef } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { setupAudioMock } from "../helpers/audio-mock";
import type { Chapter } from "@/types/episode";

beforeEach(() => {
  setupAudioMock();
});

const mockChapters: Chapter[] = [
  { title: "Intro", start_seconds: 0, end_seconds: 120, leagues: ["premier-league"] },
  { title: "PL Roundup", start_seconds: 120, end_seconds: 600, leagues: ["premier-league"] },
  { title: "La Liga", start_seconds: 600, end_seconds: 1200, leagues: ["la-liga"] },
];

function makeProps(overrides = {}) {
  return {
    title: "Weekend Recap: Premier League Title Race",
    date: "March 1, 2026",
    audioUrl: "https://cdn.example.com/episodes/2026-03-01/audio.mp3",
    duration: 3420,
    currentTime: 0,
    isPlaying: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onSeek: vi.fn(),
    audioRef: createRef<HTMLAudioElement>(),
    ...overrides,
  };
}

function dismissLoading(container: HTMLElement) {
  const audio = container.querySelector("audio");
  if (audio) {
    act(() => {
      audio.dispatchEvent(new Event("canplay"));
    });
  }
}

describe("AudioPlayer", () => {
  it("renders episode title and date", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    expect(container.textContent).toContain("Weekend Recap: Premier League Title Race");
    expect(container.textContent).toContain("March 1, 2026");
  });

  it("renders play button when not playing", () => {
    const { container } = render(<AudioPlayer {...makeProps({ isPlaying: false })} />);
    dismissLoading(container);

    const btn = container.querySelector('button[aria-label="Play"]');
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(false);
  });

  it("renders pause button when playing", () => {
    const { container } = render(<AudioPlayer {...makeProps({ isPlaying: true })} />);
    dismissLoading(container);

    const btn = container.querySelector('button[aria-label="Pause"]');
    expect(btn).not.toBeNull();
  });

  it("calls onPlay when play button is clicked", () => {
    const onPlay = vi.fn();
    const { container } = render(<AudioPlayer {...makeProps({ onPlay })} />);
    dismissLoading(container);

    const btn = container.querySelector('button[aria-label="Play"]');
    if (btn) fireEvent.click(btn);
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it("calls onPause when pause button is clicked", () => {
    const onPause = vi.fn();
    const { container } = render(<AudioPlayer {...makeProps({ isPlaying: true, onPause })} />);
    dismissLoading(container);

    const btn = container.querySelector('button[aria-label="Pause"]');
    if (btn) fireEvent.click(btn);
    expect(onPause).toHaveBeenCalledOnce();
  });

  it("displays elapsed and total duration", () => {
    const { container } = render(<AudioPlayer {...makeProps({ currentTime: 120, duration: 3420 })} />);

    expect(container.textContent).toContain("2:00");
    expect(container.textContent).toContain("57:00");
  });

  it("renders audio element with correct src", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const audio = container.querySelector("audio");
    expect(audio).not.toBeNull();
    expect(audio?.getAttribute("src")).toBe(
      "https://cdn.example.com/episodes/2026-03-01/audio.mp3"
    );
  });

  it("shows error state with retry button", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const audio = container.querySelector("audio");
    if (audio) {
      act(() => {
        audio.dispatchEvent(new Event("error"));
      });
    }

    const retryBtn = container.querySelector('button[aria-label="Retry loading audio"]');
    expect(retryBtn).not.toBeNull();
    expect(container.textContent).toContain("Unable to load audio");
  });

  it("has volume control", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const slider = container.querySelector('input[aria-label="Volume"]');
    expect(slider).not.toBeNull();
  });

  // --- New tests for Story 5.2 ---

  it("cycles playback speed on button click and updates aria-label", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const speedBtn = container.querySelector('button[aria-label*="Playback speed"]');
    expect(speedBtn).not.toBeNull();
    expect(speedBtn?.textContent).toBe("1x");

    fireEvent.click(speedBtn!);
    expect(speedBtn?.textContent).toBe("1.25x");
    expect(speedBtn?.getAttribute("aria-label")).toBe("Playback speed, currently 1.25 times");

    fireEvent.click(speedBtn!);
    expect(speedBtn?.textContent).toBe("1.5x");

    fireEvent.click(speedBtn!);
    expect(speedBtn?.textContent).toBe("0.75x");

    fireEvent.click(speedBtn!);
    expect(speedBtn?.textContent).toBe("1x");
  });

  it("play/pause button is 64px (h-16 w-16)", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);
    dismissLoading(container);

    const btn = container.querySelector('button[aria-label="Play"]');
    expect(btn?.className).toContain("h-16");
    expect(btn?.className).toContain("w-16");
  });

  it("retry button is 64px (h-16 w-16)", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const audio = container.querySelector("audio");
    if (audio) {
      act(() => {
        audio.dispatchEvent(new Event("error"));
      });
    }

    const retryBtn = container.querySelector('button[aria-label="Retry loading audio"]');
    expect(retryBtn?.className).toContain("h-16");
    expect(retryBtn?.className).toContain("w-16");
  });

  it("renders chapter boundary markers on progress bar", () => {
    const { container } = render(
      <AudioPlayer {...makeProps({ chapters: mockChapters, duration: 1200 })} />
    );

    const progressBar = container.querySelector('[role="slider"]');
    // Should have 2 markers (skip first chapter at 0s)
    const markers = progressBar?.querySelectorAll(".pointer-events-none");
    expect(markers?.length).toBe(2);

    // Check positions: chapter 2 at 120/1200=10%, chapter 3 at 600/1200=50%
    const marker1 = markers?.[0] as HTMLElement;
    const marker2 = markers?.[1] as HTMLElement;
    expect(marker1?.style.left).toBe("10%");
    expect(marker2?.style.left).toBe("50%");
  });

  it("Space key toggles play/pause", () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const { container } = render(
      <AudioPlayer {...makeProps({ onPlay, onPause, isPlaying: false })} />
    );

    const player = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(player, { key: " " });
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it("ArrowRight seeks forward +5s, Shift+ArrowRight seeks +15s", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <AudioPlayer {...makeProps({ onSeek, currentTime: 100, duration: 3420 })} />
    );

    const player = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(player, { key: "ArrowRight" });
    expect(onSeek).toHaveBeenCalledWith(105);

    fireEvent.keyDown(player, { key: "ArrowRight", shiftKey: true });
    expect(onSeek).toHaveBeenCalledWith(115);
  });

  it("ArrowLeft seeks backward -5s, Shift+ArrowLeft seeks -15s", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <AudioPlayer {...makeProps({ onSeek, currentTime: 100, duration: 3420 })} />
    );

    const player = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(player, { key: "ArrowLeft" });
    expect(onSeek).toHaveBeenCalledWith(95);

    fireEvent.keyDown(player, { key: "ArrowLeft", shiftKey: true });
    expect(onSeek).toHaveBeenCalledWith(85);
  });

  it("M key toggles mute", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const player = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(player, { key: "m" });
    // Muted icon should now be visible (path includes the muted SVG)
    const audio = container.querySelector("audio") as HTMLAudioElement;
    expect(audio.muted).toBe(true);
  });

  it("seek clamps to bounds (does not go below 0)", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <AudioPlayer {...makeProps({ onSeek, currentTime: 2, duration: 3420 })} />
    );

    const player = container.querySelector('[role="region"]')!;
    fireEvent.keyDown(player, { key: "ArrowLeft" });
    expect(onSeek).toHaveBeenCalledWith(0);
  });

  it("has role=region and aria-label on player container", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    const player = container.querySelector('[role="region"]');
    expect(player).not.toBeNull();
    expect(player?.getAttribute("aria-label")).toBe("Audio player");
  });

  it("progress bar has role=slider with correct aria attributes", () => {
    const { container } = render(
      <AudioPlayer {...makeProps({ currentTime: 60, duration: 3420 })} />
    );

    const slider = container.querySelector('[role="slider"]');
    expect(slider).not.toBeNull();
    expect(slider?.getAttribute("aria-label")).toBe("Playback progress");
    expect(slider?.getAttribute("aria-valuenow")).toBe("60");
    expect(slider?.getAttribute("aria-valuemin")).toBe("0");
    expect(slider?.getAttribute("aria-valuemax")).toBe("3420");
    expect(slider?.getAttribute("aria-valuetext")).toBe("1:00 of 57:00");
  });

  it("loading spinner uses motion-safe:animate-spin", () => {
    const { container } = render(<AudioPlayer {...makeProps()} />);

    // While loading, spinner should be rendered inside play button
    const spinnerInButton = container.querySelector('button[aria-label="Play"] svg');
    expect(spinnerInButton?.className.baseVal || spinnerInButton?.getAttribute("class")).toContain(
      "motion-safe:animate-spin"
    );
  });
});
