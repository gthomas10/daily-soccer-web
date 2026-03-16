import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock env
vi.mock("@/lib/env", () => ({
  env: {
    REVALIDATION_SECRET: "test-secret-token",
  },
}));

describe("/api/revalidate", () => {
  let POST: typeof import("@/app/api/revalidate/route").POST;
  let revalidatePath: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
    vi.doMock("@/lib/env", () => ({
      env: {
        REVALIDATION_SECRET: "test-secret-token",
      },
    }));

    const routeModule = await import("@/app/api/revalidate/route");
    POST = routeModule.POST;
    const cacheModule = await import("next/cache");
    revalidatePath = cacheModule.revalidatePath as ReturnType<typeof vi.fn>;
  });

  it("returns 401 when secret is missing", async () => {
    const request = new Request("http://localhost/api/revalidate", {
      method: "POST",
    });
    // NextRequest constructor — use the URL with no query params
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(request);

    const response = await POST(nextReq);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid token");
  });

  it("returns 401 when secret is wrong", async () => {
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(
      "http://localhost/api/revalidate?secret=wrong-token",
      { method: "POST" }
    );

    const response = await POST(nextReq);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
  });

  it("returns 500 when revalidatePath throws", async () => {
    revalidatePath.mockImplementation(() => {
      throw new Error("Revalidation failed");
    });

    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(
      "http://localhost/api/revalidate?secret=test-secret-token",
      { method: "POST" }
    );

    const response = await POST(nextReq);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Revalidation failed");
  });

  it("revalidates homepage with correct secret", async () => {
    const { NextRequest } = await import("next/server");
    const nextReq = new NextRequest(
      "http://localhost/api/revalidate?secret=test-secret-token",
      { method: "POST" }
    );

    const response = await POST(nextReq);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.revalidated).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});
