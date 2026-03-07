// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("@/lib/utils", () => ({
  formatDuration: (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  },
}));

import BonusPlayer from "@/components/BonusPlayer";

afterEach(() => {
  cleanup();
});

describe("BonusPlayer", () => {
  const defaultProps = {
    bonusAudioUrl: "https://cdn.example.com/episodes/2026-03-01/bonus-audio.mp3",
    episodeId: "2026-03-01",
  };

  it("renders bonus content heading and badge", () => {
    render(<BonusPlayer {...defaultProps} />);

    expect(screen.getByText("Bonus Content")).toBeDefined();
    expect(screen.getByText("Deep Dive")).toBeDefined();
  });

  it("renders play button with correct aria-label", () => {
    render(<BonusPlayer {...defaultProps} />);

    const playButton = screen.getByRole("button", { name: "Play bonus content" });
    expect(playButton).toBeDefined();
  });

  it("renders audio element with preload none", () => {
    const { container } = render(<BonusPlayer {...defaultProps} />);

    const audio = container.querySelector("audio");
    expect(audio).not.toBeNull();
    expect(audio!.getAttribute("preload")).toBe("none");
    expect(audio!.getAttribute("src")).toBe(defaultProps.bonusAudioUrl);
  });

  it("renders progress slider with keyboard accessibility", () => {
    render(<BonusPlayer {...defaultProps} />);

    const slider = screen.getByRole("slider", { name: "Bonus audio progress" });
    expect(slider).toBeDefined();
    expect(slider.getAttribute("tabindex")).toBe("0");
  });

  it("renders region with correct aria-label", () => {
    render(<BonusPlayer {...defaultProps} />);

    const region = screen.getByRole("region", { name: "Bonus content player" });
    expect(region).toBeDefined();
  });

  it("stores episode id as data attribute", () => {
    render(<BonusPlayer {...defaultProps} />);

    const region = screen.getByRole("region", { name: "Bonus content player" });
    expect(region.getAttribute("data-episode-id")).toBe("2026-03-01");
  });
});
