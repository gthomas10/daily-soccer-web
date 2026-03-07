import { describe, it, expect, vi, beforeEach } from "vitest";

describe("lib/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    vi.doMock("@/lib/env", () => ({
      env: {
        TURSO_URL: "libsql://test.turso.io",
        TURSO_AUTH_TOKEN: "test-token",
        AUTH_RESEND_KEY: "re_test_key",
        AUTH_SECRET: "test-secret",
      },
    }));

    vi.doMock("@/lib/auth-adapter", () => ({
      TursoAdapter: vi.fn(() => ({})),
    }));

    vi.doMock("@/lib/turso", () => ({
      getSubscriberByEmail: vi.fn(),
      getTursoClient: vi.fn(() => ({
        execute: vi.fn(),
        batch: vi.fn(),
      })),
    }));
  });

  it("exports auth, signIn, signOut, and handlers", async () => {
    vi.doMock("next-auth", () => ({
      default: vi.fn(() => ({
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        handlers: { GET: vi.fn(), POST: vi.fn() },
      })),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    const authModule = await import("@/lib/auth");

    expect(authModule.auth).toBeDefined();
    expect(authModule.signIn).toBeDefined();
    expect(authModule.signOut).toBeDefined();
    expect(authModule.handlers).toBeDefined();
  });

  it("configures NextAuth with Resend provider and JWT strategy", async () => {
    let capturedConfig: Record<string, unknown> = {};

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    await import("@/lib/auth");

    expect(capturedConfig.session).toEqual({ strategy: "jwt" });
    expect(capturedConfig.pages).toEqual({
      signIn: "/auth/signin",
      verifyRequest: "/auth/verify",
    });
    expect(capturedConfig.providers).toHaveLength(1);
    expect(capturedConfig.adapter).toBeDefined();
    expect(capturedConfig.callbacks).toBeDefined();
  });

  it("redirect callback allows relative paths", async () => {
    let capturedConfig: Record<string, unknown> = {};

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    await import("@/lib/auth");

    const callbacks = capturedConfig.callbacks as {
      redirect: (params: { url: string; baseUrl: string }) => Promise<string>;
    };

    const result = await callbacks.redirect({
      url: "/archive",
      baseUrl: "https://dailysoccerreport.com",
    });
    expect(result).toBe("https://dailysoccerreport.com/archive");
  });

  it("redirect callback rejects external URLs", async () => {
    let capturedConfig: Record<string, unknown> = {};

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    await import("@/lib/auth");

    const callbacks = capturedConfig.callbacks as {
      redirect: (params: { url: string; baseUrl: string }) => Promise<string>;
    };

    const result = await callbacks.redirect({
      url: "https://evil.com/phishing",
      baseUrl: "https://dailysoccerreport.com",
    });
    expect(result).toBe("https://dailysoccerreport.com");
  });

  it("redirect callback allows same-origin URLs", async () => {
    let capturedConfig: Record<string, unknown> = {};

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    await import("@/lib/auth");

    const callbacks = capturedConfig.callbacks as {
      redirect: (params: { url: string; baseUrl: string }) => Promise<string>;
    };

    const result = await callbacks.redirect({
      url: "https://dailysoccerreport.com/archive/episodes",
      baseUrl: "https://dailysoccerreport.com",
    });
    expect(result).toBe("https://dailysoccerreport.com/archive/episodes");
  });

  it("jwt callback includes subscription status from Turso", async () => {
    let capturedConfig: Record<string, unknown> = {};
    const mockGetSubscriber = vi.fn().mockResolvedValue({
      subscription_status: "active",
    });

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    vi.doMock("@/lib/turso", () => ({
      getSubscriberByEmail: mockGetSubscriber,
      getTursoClient: vi.fn(() => ({
        execute: vi.fn(),
        batch: vi.fn(),
      })),
    }));

    await import("@/lib/auth");

    const callbacks = capturedConfig.callbacks as {
      jwt: (params: {
        token: Record<string, unknown>;
        user?: { email?: string };
      }) => Promise<Record<string, unknown>>;
    };

    const token = await callbacks.jwt({
      token: {},
      user: { email: "test@example.com" },
    });

    expect(token.subscriptionStatus).toBe("active");
    expect(mockGetSubscriber).toHaveBeenCalledWith("test@example.com");
  });

  it("session callback exposes subscription status", async () => {
    let capturedConfig: Record<string, unknown> = {};

    vi.doMock("next-auth", () => ({
      default: vi.fn((config: Record<string, unknown>) => {
        capturedConfig = config;
        return {
          auth: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          handlers: { GET: vi.fn(), POST: vi.fn() },
        };
      }),
    }));

    vi.doMock("next-auth/providers/resend", () => ({
      default: vi.fn(() => ({ id: "resend", type: "email" })),
    }));

    await import("@/lib/auth");

    const callbacks = capturedConfig.callbacks as {
      session: (params: {
        session: { user: Record<string, unknown> };
        token: { subscriptionStatus?: string };
      }) => Promise<{ user: Record<string, unknown> }>;
    };

    const session = await callbacks.session({
      session: { user: {} },
      token: { subscriptionStatus: "active" },
    });

    expect(session.user.subscriptionStatus).toBe("active");
  });
});
