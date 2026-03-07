// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import PresentersPage, {
  generateMetadata,
} from "@/app/presenters/page";

afterEach(cleanup);

describe("PresentersPage", () => {
  it("renders page title as h1", () => {
    render(<PresentersPage />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Meet the Presenters");
  });

  it("renders both presenter names", () => {
    render(<PresentersPage />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    const names = headings.map((h) => h.textContent);
    expect(names).toContain("James");
    expect(names).toContain("Alex");
  });

  it("renders AI transparency intro text", () => {
    render(<PresentersPage />);
    expect(
      screen.getByText(/AI characters born from a love of the beautiful game/)
    ).toBeDefined();
  });

  it("has correct heading hierarchy: h1 > h2 > h3", () => {
    const { container } = render(<PresentersPage />);
    const h1s = container.querySelectorAll("h1");
    const h2s = container.querySelectorAll("h2");
    const h3s = container.querySelectorAll("h3");

    expect(h1s.length).toBe(1);
    expect(h2s.length).toBe(2); // one per presenter
    expect(h3s.length).toBe(2); // "Personality" per presenter
  });

  it("renders two article elements for two presenters", () => {
    const { container } = render(<PresentersPage />);
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(2);
  });

  it("applies responsive grid layout classes", () => {
    const { container } = render(<PresentersPage />);
    const grid = container.querySelector(".lg\\:grid-cols-2");
    expect(grid).not.toBeNull();
  });

  it("uses main element with min-h-screen", () => {
    const { container } = render(<PresentersPage />);
    const main = container.querySelector("main.min-h-screen");
    expect(main).not.toBeNull();
  });

  it("renders skip-to-content link", () => {
    render(<PresentersPage />);
    const skipLink = screen.getByText("Skip to content");
    expect(skipLink.tagName).toBe("A");
    expect(skipLink.getAttribute("href")).toBe("#main-content");
  });

  it("has main-content id on content wrapper", () => {
    const { container } = render(<PresentersPage />);
    const content = container.querySelector("#main-content");
    expect(content).not.toBeNull();
  });
});

describe("generateMetadata", () => {
  it("returns correct title", () => {
    const metadata = generateMetadata();
    expect(metadata.title).toBe(
      "Meet the Presenters | Daily Soccer Report"
    );
  });

  it("returns description mentioning AI voices", () => {
    const metadata = generateMetadata();
    expect(metadata.description).toContain("AI voices");
  });

  it("returns openGraph metadata", () => {
    const metadata = generateMetadata();
    expect(metadata.openGraph).toBeDefined();
  });
});
