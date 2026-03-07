// @vitest-environment jsdom
import { Suspense } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { SubscribeContent } from "@/app/subscribe/SubscribeContent";

describe("SubscribeContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  function makeSearchParams(params: { success?: string; canceled?: string } = {}) {
    return Promise.resolve(params);
  }

  function renderWithSuspense(params: { success?: string; canceled?: string } = {}) {
    return render(
      <Suspense fallback={<div>Loading</div>}>
        <SubscribeContent searchParams={makeSearchParams(params)} />
      </Suspense>
    );
  }

  it("renders plan details and subscribe button", async () => {
    await act(async () => {
      renderWithSuspense();
    });

    expect(screen.getByText("Go Premium")).toBeDefined();
    expect(screen.getByText("Premium Benefits")).toBeDefined();
    expect(screen.getByText("Early access to episodes before public release")).toBeDefined();
    expect(screen.getByText("Bonus content and extended analysis")).toBeDefined();
    expect(screen.getByText("Ad-free listening experience")).toBeDefined();
    expect(screen.getByText("Full episode archive access")).toBeDefined();
    expect(screen.getByRole("button", { name: "Subscribe Now" })).toBeDefined();
  });

  it("renders success state", async () => {
    await act(async () => {
      renderWithSuspense({ success: "true" });
    });

    expect(screen.getByText("Welcome to Premium!")).toBeDefined();
    expect(screen.getByText("Back to Episodes")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Subscribe Now" })).toBeNull();
  });

  it("renders canceled state message", async () => {
    await act(async () => {
      renderWithSuspense({ canceled: "true" });
    });

    expect(screen.getByText(/Checkout was canceled/)).toBeDefined();
    expect(screen.getByRole("button", { name: "Subscribe Now" })).toBeDefined();
  });

  it("calls checkout API on subscribe click", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/session" }),
    });
    global.fetch = mockFetch;

    await act(async () => {
      renderWithSuspense();
    });

    fireEvent.click(screen.getByRole("button", { name: "Subscribe Now" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/checkout", { method: "POST" });
    });
  });

  it("shows error message when checkout API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Failed to create checkout session" }),
    });

    await act(async () => {
      renderWithSuspense();
    });

    fireEvent.click(screen.getByRole("button", { name: "Subscribe Now" }));

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert.textContent).toContain("Failed to create checkout session");
    });
  });
});
