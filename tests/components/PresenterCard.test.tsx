// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import PresenterCard from "@/components/PresenterCard";
import type { PresenterProfile } from "@/types/episode";

afterEach(cleanup);

const mockPresenter: PresenterProfile = {
  name: "James",
  role: "Expert Analyst",
  tagline: "The authority and the wit.",
  bio: ["First paragraph about James.", "Second paragraph about James."],
  personalityTraits: ["Authoritative", "Sardonic wit"],
  aiIdentity: "James is an AI character created to cover football.",
};

describe("PresenterCard", () => {
  it("renders presenter name as h2", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe("James");
  });

  it("renders role badge", () => {
    const { container } = render(
      <PresenterCard presenter={mockPresenter} />
    );
    const article = container.querySelector("article")!;
    expect(within(article).getByText("Expert Analyst")).toBeDefined();
  });

  it("renders tagline", () => {
    const { container } = render(
      <PresenterCard presenter={mockPresenter} />
    );
    const article = container.querySelector("article")!;
    expect(
      within(article).getByText("The authority and the wit.")
    ).toBeDefined();
  });

  it("renders all bio paragraphs", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    expect(screen.getByText("First paragraph about James.")).toBeDefined();
    expect(screen.getByText("Second paragraph about James.")).toBeDefined();
  });

  it("renders personality traits", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    expect(screen.getByText("Authoritative")).toBeDefined();
    expect(screen.getByText("Sardonic wit")).toBeDefined();
  });

  it("renders AI identity statement", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    expect(
      screen.getByText(
        "James is an AI character created to cover football."
      )
    ).toBeDefined();
  });

  it("renders initials avatar", () => {
    const { container } = render(
      <PresenterCard presenter={mockPresenter} />
    );
    const avatar = container.querySelector(".rounded-full.bg-accent-emerald");
    expect(avatar).not.toBeNull();
    expect(avatar?.textContent).toBe("J");
  });

  it("wraps content in article element with aria-labelledby", () => {
    const { container } = render(
      <PresenterCard presenter={mockPresenter} />
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.getAttribute("aria-labelledby")).toBe("presenter-james");
  });

  it("sets id on presenter heading for aria-labelledby", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.id).toBe("presenter-james");
  });

  it("renders personality subsection heading as h3", () => {
    render(<PresenterCard presenter={mockPresenter} />);
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.textContent).toBe("Personality");
  });
});
