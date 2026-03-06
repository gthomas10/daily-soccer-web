// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Loading from "@/app/loading";

describe("Loading", () => {
  it("renders skeleton loading state", () => {
    const { container } = render(<Loading />);

    // Player skeleton block
    const playerSkeleton = container.querySelector(".bg-player-surface");
    expect(playerSkeleton).not.toBeNull();

    // Has pulse animation
    const animatedElements = container.querySelectorAll(".animate-pulse");
    expect(animatedElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders content skeleton blocks", () => {
    const { container } = render(<Loading />);

    // Content skeleton lines
    const skeletonLines = container.querySelectorAll(".bg-text-secondary\\/10");
    expect(skeletonLines.length).toBeGreaterThanOrEqual(3);
  });
});
