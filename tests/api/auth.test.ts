import { describe, it, expect, vi, beforeEach } from "vitest";

describe("/api/auth/[...nextauth]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("exports GET and POST handlers from Auth.js", async () => {
    const mockGET = vi.fn();
    const mockPOST = vi.fn();

    vi.doMock("@/lib/auth", () => ({
      handlers: { GET: mockGET, POST: mockPOST },
    }));

    const routeModule = await import(
      "@/app/api/auth/[...nextauth]/route"
    );

    expect(routeModule.GET).toBe(mockGET);
    expect(routeModule.POST).toBe(mockPOST);
  });
});
