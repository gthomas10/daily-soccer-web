// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Dynamic import after mocks are set up
async function getMiddleware() {
  const mod = await import("@/middleware");
  return mod;
}

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("redirects unauthenticated request to /archive to /auth/signin with callbackUrl", async () => {
    mockAuth.mockResolvedValue(null);
    const { middleware } = await getMiddleware();
    const request = createRequest("/archive");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/auth/signin");
    expect(location).toContain("callbackUrl=%2Farchive");
  });

  it("allows authenticated request with active subscription to proceed", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com", subscriptionStatus: "active" },
    });
    const { middleware } = await getMiddleware();
    const request = createRequest("/archive");
    const response = await middleware(request);

    // NextResponse.next() returns 200
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects authenticated request with lapsed subscription to /subscribe?lapsed=true", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com", subscriptionStatus: "canceled" },
    });
    const { middleware } = await getMiddleware();
    const request = createRequest("/archive");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/subscribe?lapsed=true");
  });

  it("does not intercept public route /", async () => {
    const { config } = await getMiddleware();
    const matcher = config.matcher;
    // Public routes should not match the middleware matcher
    expect(matcher.some((pattern: string) => new RegExp(pattern.replace(":path*", ".*")).test("/"))).toBe(false);
  });

  it("does not intercept /episodes/test", async () => {
    const { config } = await getMiddleware();
    const matcher = config.matcher;
    expect(matcher.some((pattern: string) => new RegExp(pattern.replace(":path*", ".*")).test("/episodes/test"))).toBe(false);
  });

  it("does not intercept /subscribe", async () => {
    const { config } = await getMiddleware();
    const matcher = config.matcher;
    expect(matcher.some((pattern: string) => new RegExp(pattern.replace(":path*", ".*")).test("/subscribe"))).toBe(false);
  });

  it("does not intercept /auth/signin", async () => {
    const { config } = await getMiddleware();
    const matcher = config.matcher;
    expect(matcher.some((pattern: string) => new RegExp(pattern.replace(":path*", ".*")).test("/auth/signin"))).toBe(false);
  });

  it("matches /archive in config.matcher", async () => {
    const { config } = await getMiddleware();
    const matcher = config.matcher;
    expect(matcher.some((pattern: string) => pattern.includes("archive"))).toBe(true);
  });

  it("redirects unauthenticated request with null subscriptionStatus", async () => {
    mockAuth.mockResolvedValue({
      user: { email: "test@example.com", subscriptionStatus: null },
    });
    const { middleware } = await getMiddleware();
    const request = createRequest("/archive");
    const response = await middleware(request);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/subscribe?lapsed=true");
  });
});
