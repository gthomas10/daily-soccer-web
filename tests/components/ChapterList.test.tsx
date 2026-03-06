// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChapterList from "@/components/ChapterList";
import type { Chapter } from "@/types/episode";

const mockChapters: Chapter[] = [
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
  {
    title: "La Liga: Barcelona Extend Their Lead",
    start_seconds: 900,
    end_seconds: 1320,
    leagues: ["la-liga"],
  },
];

describe("ChapterList", () => {
  it("renders all chapters", () => {
    render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    expect(screen.getByText("Top Story: Arsenal's Title Hopes")).toBeDefined();
    expect(screen.getByText("Premier League Weekend Roundup")).toBeDefined();
    expect(screen.getByText("La Liga: Barcelona Extend Their Lead")).toBeDefined();
  });

  it("renders chapter duration badges", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const allText = container.textContent ?? "";
    // First chapter: 180s = 3:00, Second: 720s = 12:00, Third: 420s = 7:00
    expect(allText).toContain("3:00");
    expect(allText).toContain("12:00");
    expect(allText).toContain("7:00");
  });

  it("renders league names", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const allText = container.textContent ?? "";
    expect(allText).toContain("Premier League");
    expect(allText).toContain("La Liga");
  });

  it("highlights current chapter based on currentTime", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={500} onSeek={vi.fn()} />
    );

    // currentTime=500 is in chapter 2 (180-900)
    const buttons = container.querySelectorAll("button");
    expect(buttons[1].className).toContain("bg-accent-emerald/10");
    expect(buttons[0].className).not.toContain("bg-accent-emerald/10");
  });

  it("calls onSeek with chapter start_seconds on click", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={onSeek} />
    );

    // Click the third chapter button
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[2]);
    expect(onSeek).toHaveBeenCalledWith(900);
  });

  it("renders nothing when chapters is empty", () => {
    const { container } = render(
      <ChapterList chapters={[]} currentTime={0} onSeek={vi.fn()} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("handles chapters with multiple leagues", () => {
    const multiLeagueChapter: Chapter[] = [
      {
        title: "Bundesliga & Ligue 1 Digest",
        start_seconds: 0,
        end_seconds: 360,
        leagues: ["bundesliga", "ligue-1"],
      },
    ];

    const { container } = render(
      <ChapterList
        chapters={multiLeagueChapter}
        currentTime={0}
        onSeek={vi.fn()}
      />
    );

    const allText = container.textContent ?? "";
    expect(allText).toContain("Bundesliga");
    expect(allText).toContain("Ligue 1");
  });

  // --- New tests for Story 5.2 ---

  it("wraps content in a nav element", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute("aria-labelledby")).toBe("chapters-heading");
  });

  it("current chapter has aria-current=true", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={500} onSeek={vi.fn()} />
    );

    const buttons = container.querySelectorAll("button");
    // Chapter 2 (index 1) is current at 500s
    expect(buttons[1].getAttribute("aria-current")).toBe("true");
    expect(buttons[0].getAttribute("aria-current")).toBeNull();
    expect(buttons[2].getAttribute("aria-current")).toBeNull();
  });

  it("ArrowDown moves focus to next chapter button", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const buttons = container.querySelectorAll("button");
    (buttons[0] as HTMLElement).focus();

    fireEvent.keyDown(buttons[0], { key: "ArrowDown" });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it("ArrowUp moves focus to previous chapter button", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const buttons = container.querySelectorAll("button");
    (buttons[2] as HTMLElement).focus();

    fireEvent.keyDown(buttons[2], { key: "ArrowUp" });
    expect(document.activeElement).toBe(buttons[1]);
  });

  it("j/k keys navigate chapters like ArrowDown/ArrowUp", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const buttons = container.querySelectorAll("button");
    (buttons[0] as HTMLElement).focus();

    fireEvent.keyDown(buttons[0], { key: "j" });
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(buttons[1], { key: "k" });
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("chapter buttons use motion-safe:transition-colors", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const buttons = container.querySelectorAll("button");
    expect(buttons[0].className).toContain("motion-safe:transition-colors");
  });

  it("heading has id for aria-labelledby linkage", () => {
    const { container } = render(
      <ChapterList chapters={mockChapters} currentTime={0} onSeek={vi.fn()} />
    );

    const heading = container.querySelector("h2");
    expect(heading).not.toBeNull();
    expect(heading?.getAttribute("id")).toBe("chapters-heading");
    expect(heading?.textContent).toBe("Chapters");
  });
});
