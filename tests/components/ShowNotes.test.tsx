// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ShowNotes from "@/components/ShowNotes";

let seekHandler: ReturnType<typeof vi.fn> | null = null;

afterEach(() => {
  if (seekHandler) {
    document.removeEventListener("player:seek", seekHandler);
    seekHandler = null;
  }
});

function listenForSeek() {
  seekHandler = vi.fn();
  document.addEventListener("player:seek", seekHandler);
  return seekHandler;
}

describe("ShowNotes", () => {
  it("renders safe HTML content", () => {
    render(
      <ShowNotes html="<h2>Weekend Recap</h2><p>Great matches this weekend.</p>" />
    );

    expect(screen.getByText("Weekend Recap")).toBeDefined();
    expect(screen.getByText("Great matches this weekend.")).toBeDefined();
  });

  it("strips script tags (XSS prevention)", () => {
    const { container } = render(
      <ShowNotes html='<p>Safe content</p><script>alert("xss")</script>' />
    );

    expect(screen.getByText("Safe content")).toBeDefined();
    expect(container.querySelector("script")).toBeNull();
  });

  it("strips event handlers from elements (XSS prevention)", () => {
    const { container } = render(
      <ShowNotes html='<img src="x" onerror="alert(1)" /><p>Text</p>' />
    );

    const img = container.querySelector("img");
    // DOMPurify should remove the onerror attribute
    if (img) {
      expect(img.getAttribute("onerror")).toBeNull();
    }
    expect(screen.getByText("Text")).toBeDefined();
  });

  it("preserves safe HTML tags (h2, h3, p, strong, a)", () => {
    const { container } = render(
      <ShowNotes html='<h2>Title</h2><h3>Subtitle</h3><p><strong>Bold</strong> and <a href="/link">link</a></p>' />
    );

    expect(container.querySelector("h2")).not.toBeNull();
    expect(container.querySelector("h3")).not.toBeNull();
    expect(container.querySelector("strong")).not.toBeNull();
    expect(container.querySelector("a")).not.toBeNull();
  });

  it("renders Show Notes heading", () => {
    const { container } = render(<ShowNotes html="<p>Content</p>" />);

    const heading = container.querySelector("h2");
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe("Show Notes");
  });

  it("dispatches player:seek event when clicking a timestamp strong element", () => {
    const html = '<ul><li><strong>03:00</strong> — Premier League Roundup</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const handler = listenForSeek();

    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    fireEvent.click(strong!);

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.seconds).toBe(180);
  });

  it("parses MM:SS format correctly (03:00 -> 180 seconds)", () => {
    const html = '<ul><li><strong>03:00</strong> — Chapter</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const handler = listenForSeek();
    fireEvent.click(container.querySelector("strong")!);

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.seconds).toBe(180);
  });

  it("parses HH:MM:SS format correctly (01:02:30 -> 3750 seconds)", () => {
    const html = '<ul><li><strong>1:02:30</strong> — Long Episode Chapter</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const handler = listenForSeek();
    fireEvent.click(container.querySelector("strong")!);

    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.seconds).toBe(3750);
  });

  it("does NOT dispatch seek event when clicking a non-timestamp strong element", () => {
    const html = '<ul><li><strong>Premier League Roundup</strong>: Arsenal 1-1 Bournemouth</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const handler = listenForSeek();
    fireEvent.click(container.querySelector("strong")!);

    expect(handler).not.toHaveBeenCalled();
  });

  it("renders screen reader instruction text", () => {
    const html = '<ul><li><strong>00:00</strong> — Intro</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const srOnly = container.querySelector("p.sr-only");
    expect(srOnly).not.toBeNull();
    expect(srOnly?.textContent).toBe(
      "Click any timestamp to jump to that point in the episode."
    );
  });

  it("dispatches seek event on Enter keydown on timestamp element", () => {
    const html = '<ul><li><strong>05:30</strong> — Chapter</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const handler = listenForSeek();

    const strong = container.querySelector("strong")!;
    fireEvent.keyDown(strong, { key: "Enter" });

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.seconds).toBe(330);
  });

  it("adds tabIndex, role, and aria-label to timestamp strong elements", () => {
    const html = '<ul><li><strong>03:00</strong> — Chapter</li><li><strong>Premier League</strong>: results</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const strongs = container.querySelectorAll("strong");
    // Timestamp strong should have accessibility attributes
    const timestampStrong = strongs[0] as HTMLElement;
    expect(timestampStrong.tabIndex).toBe(0);
    expect(timestampStrong.getAttribute("role")).toBe("button");
    expect(timestampStrong.getAttribute("aria-label")).toBe("Jump to 03:00");

    // Non-timestamp strong should NOT have accessibility attributes
    const textStrong = strongs[1] as HTMLElement;
    expect(textStrong.getAttribute("role")).toBeNull();
    expect(textStrong.getAttribute("aria-label")).toBeNull();
  });

  it("does NOT style non-timestamp strong elements as clickable", () => {
    const html = '<ul><li><strong>Premier League Roundup</strong>: Arsenal 1-1 Bournemouth</li></ul>';
    const { container } = render(<ShowNotes html={html} />);

    const strong = container.querySelector("strong")!;
    expect(strong.classList.contains("timestamp-link")).toBe(false);
  });
});
