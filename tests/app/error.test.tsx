// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Error from "@/app/error";

describe("Error", () => {
  it("renders error message", () => {
    const { container } = render(
      <Error error={new Error("test")} reset={vi.fn()} />
    );

    expect(container.textContent).toContain("Something went wrong");
    expect(container.textContent).toContain("couldn't load the latest episode");
  });

  it("renders retry button", () => {
    const { container } = render(
      <Error error={new Error("test")} reset={vi.fn()} />
    );

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe("Try again");
  });

  it("calls reset when retry button is clicked", () => {
    const reset = vi.fn();
    const { container } = render(
      <Error error={new Error("test")} reset={reset} />
    );

    const button = container.querySelector("button");
    if (button) fireEvent.click(button);
    expect(reset).toHaveBeenCalledOnce();
  });
});
