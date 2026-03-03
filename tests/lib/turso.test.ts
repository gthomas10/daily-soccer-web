import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env before importing turso
vi.mock("@/lib/env", () => ({
  env: {
    TURSO_URL: "https://test-db.turso.io",
    TURSO_AUTH_TOKEN: "test-token",
  },
}));

// Mock @libsql/client
const mockExecute = vi.fn();
const mockBatch = vi.fn();
vi.mock("@libsql/client", () => ({
  createClient: vi.fn().mockImplementation(() => ({
    execute: mockExecute,
    batch: mockBatch,
  })),
}));

import {
  getEpisodes,
  getEpisodeBySlug,
  getSubscriberByEmail,
  upsertSubscriber,
} from "@/lib/turso";

describe("Turso Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEpisodes", () => {
    it("returns parsed episode rows ordered by date DESC", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            date: "2026-03-02",
            title: "Episode 2",
            description: "Desc 2",
            duration: 3600,
            leagues_covered: '["premier-league"]',
            chapter_data: '[{"title": "PL"}]',
            audio_url: "https://r2.example.com/audio.mp3",
            publish_status: "published",
            created_at: "2026-03-02 22:00:00",
          },
          {
            id: 1,
            date: "2026-03-01",
            title: "Episode 1",
            description: "Desc 1",
            duration: 1800,
            leagues_covered: '["la-liga"]',
            chapter_data: '[{"title": "LL"}]',
            audio_url: "https://r2.example.com/audio2.mp3",
            publish_status: "draft",
            created_at: "2026-03-01 22:00:00",
          },
        ],
      });

      const result = await getEpisodes(10);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(2);
      expect(result[0].date).toBe("2026-03-02");
      expect(result[0].leagues_covered).toEqual(["premier-league"]);
      expect(result[0].chapter_data).toEqual([{ title: "PL" }]);
      expect(result[1].id).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith({
        sql: "SELECT * FROM episodes ORDER BY date DESC LIMIT ?",
        args: [10],
      });
    });

    it("returns empty array when no episodes exist", async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] });

      const result = await getEpisodes();

      expect(result).toEqual([]);
    });
  });

  describe("getEpisodeBySlug", () => {
    it("returns episode when found by date slug", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            date: "2026-03-01",
            title: "Test Episode",
            description: "Description",
            duration: 3600,
            leagues_covered: '["premier-league", "la-liga"]',
            chapter_data: '[{"title": "PL", "start_seconds": 0}]',
            audio_url: "https://r2.example.com/audio.mp3",
            publish_status: "published",
            created_at: "2026-03-01 22:00:00",
          },
        ],
      });

      const result = await getEpisodeBySlug("2026-03-01");

      expect(result).not.toBeNull();
      expect(result!.title).toBe("Test Episode");
      expect(result!.leagues_covered).toEqual(["premier-league", "la-liga"]);
    });

    it("returns null when episode not found", async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] });

      const result = await getEpisodeBySlug("2099-01-01");

      expect(result).toBeNull();
    });
  });

  describe("getSubscriberByEmail", () => {
    it("returns subscriber when found", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            stripe_customer_id: "cus_123",
            subscription_status: "active",
            created_at: "2026-03-01 12:00:00",
            updated_at: "2026-03-01 12:00:00",
          },
        ],
      });

      const result = await getSubscriberByEmail("test@example.com");

      expect(result).not.toBeNull();
      expect(result!.email).toBe("test@example.com");
      expect(result!.stripe_customer_id).toBe("cus_123");
      expect(result!.subscription_status).toBe("active");
    });

    it("returns null when subscriber not found", async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] });

      const result = await getSubscriberByEmail("nobody@example.com");

      expect(result).toBeNull();
    });

    it("handles null stripe_customer_id", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "test@example.com",
            stripe_customer_id: null,
            subscription_status: "inactive",
            created_at: "2026-03-01 12:00:00",
            updated_at: "2026-03-01 12:00:00",
          },
        ],
      });

      const result = await getSubscriberByEmail("test@example.com");

      expect(result!.stripe_customer_id).toBeNull();
    });
  });

  describe("upsertSubscriber", () => {
    it("calls batch with write transaction mode", async () => {
      mockBatch.mockResolvedValueOnce([{}]);

      await upsertSubscriber("test@example.com", "cus_123", "active");

      expect(mockBatch).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            sql: expect.stringContaining("INSERT INTO subscribers"),
            args: ["test@example.com", "cus_123", "active"],
          }),
        ],
        "write"
      );
    });
  });
});
