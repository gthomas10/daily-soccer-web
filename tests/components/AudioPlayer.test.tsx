// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { createRef } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import { setupAudioMock } from "../helpers/audio-mock";

beforeEach(() => {
  setupAudioMock();
});

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
});
