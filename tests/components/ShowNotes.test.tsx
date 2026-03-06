// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ShowNotes from "@/components/ShowNotes";

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
});
