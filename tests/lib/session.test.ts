import { describe, it, expect, vi, beforeEach } from "vitest";

describe("lib/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns session for authenticated user", async () => {
    const mockSession = {
      user: { email: "test@example.com", subscriptionStatus: "active" },
      expires: "2026-04-01T00:00:00.000Z",
    };

    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue(mockSession),
    }));

    const { getSession } = await import("@/lib/session");
    const session = await getSession();

    expect(session).toEqual(mockSession);
    expect(session?.user.email).toBe("test@example.com");
  });

  it("returns null for unauthenticated user", async () => {
    vi.doMock("@/lib/auth", () => ({
      auth: vi.fn().mockResolvedValue(null),
    }));

    const { getSession } = await import("@/lib/session");
    const session = await getSession();

    expect(session).toBeNull();
  });
});
