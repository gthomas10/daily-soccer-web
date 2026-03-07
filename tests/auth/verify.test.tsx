// @vitest-environment jsdom
import { Suspense } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import VerifyPage from "@/app/auth/verify/page";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("VerifyPage", () => {
  afterEach(() => {
    cleanup();
  });

  function renderPage(params: { error?: string } = {}) {
    return render(
      <Suspense fallback={<div>Loading</div>}>
        <VerifyPage searchParams={Promise.resolve(params)} />
      </Suspense>
    );
  }

  it("renders check-email message by default", async () => {
    await act(async () => {
      renderPage();
    });

    expect(screen.getByText("Check your email")).toBeDefined();
    expect(
      screen.getByText(/We've sent a magic link/)
    ).toBeDefined();
  });

  it("shows request new link button", async () => {
    await act(async () => {
      renderPage();
    });

    expect(screen.getByText("Request new link")).toBeDefined();
    const link = screen.getByText("Request new link");
    expect(link.getAttribute("href")).toBe("/auth/signin");
  });

  it("shows error state for expired/invalid link", async () => {
    await act(async () => {
      renderPage({ error: "Verification" });
    });

    expect(screen.getByText("Link Expired")).toBeDefined();
    expect(
      screen.getByText(/This magic link has expired or is invalid/)
    ).toBeDefined();
    expect(screen.getByText("Request new link")).toBeDefined();
  });
});
