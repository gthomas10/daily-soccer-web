import { describe, it, expect, vi, beforeEach } from "vitest";
import { TursoAdapter } from "@/lib/auth-adapter";
import type { Client } from "@libsql/client";

function createMockClient(): Client {
  return {
    execute: vi.fn(),
    batch: vi.fn(),
    close: vi.fn(),
    closed: false,
    protocol: "http",
  } as unknown as Client;
}

describe("TursoAdapter", () => {
  let mockClient: Client;
  let adapter: ReturnType<typeof TursoAdapter>;

  beforeEach(() => {
    mockClient = createMockClient();
    adapter = TursoAdapter(() => mockClient);
  });

  describe("createUser", () => {
    it("inserts a user and returns it", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            emailVerified: null,
            name: null,
            image: null,
          },
        ],
      });

      const user = await adapter.createUser!({
        email: "test@example.com",
        emailVerified: null,
        id: "",
      });

      expect(user.email).toBe("test@example.com");
      expect(user.id).toBe("1");
      expect(mockClient.execute).toHaveBeenCalled();
    });
  });

  describe("getUserByEmail", () => {
    it("returns user when found", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            emailVerified: "2026-01-01T00:00:00.000Z",
            name: null,
            image: null,
          },
        ],
      });

      const user = await adapter.getUserByEmail!("test@example.com");

      expect(user).not.toBeNull();
      expect(user!.email).toBe("test@example.com");
      expect(user!.emailVerified).toBeInstanceOf(Date);
    });

    it("returns null when user not found", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [],
      });

      const user = await adapter.getUserByEmail!("nobody@example.com");
      expect(user).toBeNull();
    });
  });

  describe("createVerificationToken", () => {
    it("inserts token and returns it", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [],
      });

      const expires = new Date("2026-01-02T00:00:00.000Z");
      const token = await adapter.createVerificationToken!({
        identifier: "test@example.com",
        token: "abc123",
        expires,
      });

      expect(token.identifier).toBe("test@example.com");
      expect(token.token).toBe("abc123");
      expect(token.expires).toEqual(expires);
      expect(mockClient.execute).toHaveBeenCalled();
    });
  });

  describe("useVerificationToken", () => {
    it("deletes and returns the token", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [
          {
            identifier: "test@example.com",
            token: "abc123",
            expires: "2026-01-02T00:00:00.000Z",
          },
        ],
      });

      const token = await adapter.useVerificationToken!({
        identifier: "test@example.com",
        token: "abc123",
      });

      expect(token).not.toBeNull();
      expect(token!.identifier).toBe("test@example.com");
      expect(token!.expires).toBeInstanceOf(Date);
    });

    it("returns null when token not found", async () => {
      (mockClient.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [],
      });

      const token = await adapter.useVerificationToken!({
        identifier: "test@example.com",
        token: "invalid",
      });

      expect(token).toBeNull();
    });
  });
});
