// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import BonusLocked from "@/components/BonusLocked";

afterEach(() => {
  cleanup();
});

describe("BonusLocked", () => {
  it("renders locked message", () => {
    render(<BonusLocked />);

    expect(screen.getByText("Bonus Content")).toBeDefined();
    expect(
      screen.getByText("Bonus content is available for subscribers")
    ).toBeDefined();
  });

  it("renders subscribe link pointing to /subscribe", () => {
    render(<BonusLocked />);

    const link = screen.getByRole("link", { name: "Subscribe for Access" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/subscribe");
  });

  it("renders lock icon", () => {
    render(<BonusLocked />);

    const lockIcon = screen.getByRole("img", { name: "Locked" });
    expect(lockIcon).toBeDefined();
  });
});
