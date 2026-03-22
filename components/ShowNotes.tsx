"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import DOMPurify from "dompurify";

interface ShowNotesProps {
  html: string;
}

const TIMESTAMP_RE = /^\d{1,2}:\d{2}(:\d{2})?$/;

function parseTimestamp(text: string): number | null {
  const match = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const [, hOrM, mOrS, s] = match;
  if (s !== undefined) {
    return Number(hOrM) * 3600 + Number(mOrS) * 60 + Number(s);
  }
  return Number(hOrM) * 60 + Number(mOrS);
}

function dispatchSeek(target: HTMLElement, seconds: number) {
  target.dispatchEvent(
    new CustomEvent("player:seek", {
      detail: { seconds },
      bubbles: true,
    })
  );
}

export default function ShowNotes({ html }: ShowNotesProps) {
  const cleanHtml = useMemo(
    () => (typeof window !== "undefined" ? DOMPurify.sanitize(html) : ""),
    [html]
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const strongs = container.querySelectorAll("li > strong:first-child");
    strongs.forEach((el) => {
      const text = el.textContent?.trim() ?? "";
      if (TIMESTAMP_RE.test(text)) {
        (el as HTMLElement).tabIndex = 0;
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", `Jump to ${text}`);
        el.classList.add("timestamp-link");
      }
    });
  }, [cleanHtml]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "STRONG") return;

    const seconds = parseTimestamp(target.textContent?.trim() ?? "");
    if (seconds === null) return;

    dispatchSeek(target, seconds);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;

    const target = e.target as HTMLElement;
    if (target.tagName !== "STRONG") return;

    const seconds = parseTimestamp(target.textContent?.trim() ?? "");
    if (seconds === null) return;

    e.preventDefault();
    dispatchSeek(target, seconds);
  }, []);

  return (
    <section className="mx-auto max-w-[680px]">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-secondary">
        Show Notes
      </h2>
      <p className="sr-only">
        Click any timestamp to jump to that point in the episode.
      </p>
      <div
        ref={containerRef}
        className="prose-notes space-y-4 text-text-primary [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_p]:leading-relaxed [&_p]:text-text-secondary [&_strong]:text-text-primary [&_a]:text-accent-emerald [&_a]:underline [&_.timestamp-link]:cursor-pointer [&_.timestamp-link]:text-accent-emerald [&_.timestamp-link]:hover:underline"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </section>
  );
}
