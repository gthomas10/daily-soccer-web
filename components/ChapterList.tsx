"use client";

import { useCallback } from "react";
import type { Chapter } from "@/types/episode";
import { formatDuration } from "@/lib/utils";

interface ChapterListProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

function getCurrentChapterIndex(chapters: Chapter[], currentTime: number): number {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].start_seconds) return i;
  }
  return -1;
}

function formatLeagueName(leagueId: string): string {
  return leagueId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ChapterList({ chapters, currentTime, onSeek }: ChapterListProps) {
  const handleChapterKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const list = e.currentTarget.closest("ul");
      if (!list) return;
      const buttons = list.querySelectorAll("button");

      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        const next = buttons[Math.min(index + 1, buttons.length - 1)] as HTMLElement;
        next?.focus();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        const prev = buttons[Math.max(index - 1, 0)] as HTMLElement;
        prev?.focus();
      }
    },
    []
  );

  if (chapters.length === 0) return null;

  const currentIndex = getCurrentChapterIndex(chapters, currentTime);

  return (
    <nav aria-labelledby="chapters-heading" className="space-y-1">
      <h2
        id="chapters-heading"
        className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-secondary"
      >
        Chapters
      </h2>
      <ul className="space-y-1">
        {chapters.map((chapter, i) => {
          const isCurrent = i === currentIndex;
          const chapterDuration = chapter.end_seconds - chapter.start_seconds;

          return (
            <li key={chapter.start_seconds}>
              <button
                onClick={() => onSeek(chapter.start_seconds)}
                onKeyDown={(e) => handleChapterKeyDown(e, i)}
                aria-current={isCurrent ? "true" : undefined}
                className={`w-full rounded-lg px-3 py-2.5 text-left motion-safe:transition-colors focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 ${
                  isCurrent
                    ? "bg-accent-emerald/10 ring-1 ring-accent-emerald/30"
                    : "hover:bg-text-primary/5"
                }`}
              >
                <div className="flex items-start gap-2">
                  {isCurrent && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent-emerald" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-medium leading-snug ${
                        isCurrent ? "text-accent-emerald" : "text-text-primary"
                      }`}
                    >
                      {chapter.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs tabular-nums text-text-secondary">
                        {formatDuration(chapterDuration)}
                      </span>
                      {chapter.leagues.map((league) => (
                        <span
                          key={league}
                          className="rounded bg-text-secondary/10 px-1.5 py-0.5 text-xs text-text-secondary"
                        >
                          {formatLeagueName(league)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
