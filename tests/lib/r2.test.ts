import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock env before importing r2
vi.mock("@/lib/env", () => ({
  env: {
    R2_ENDPOINT: "https://test-account.r2.cloudflarestorage.com",
    R2_ACCESS_KEY: "test-access-key",
    R2_SECRET_KEY: "test-secret-key",
    R2_BUCKET: "test-bucket",
  },
}));

// Mock schema validation
vi.mock("@/lib/schema", () => ({
  episodeSchema: {
    safeParse: vi.fn().mockReturnValue({
      success: true,
      data: { episode_id: "2026-03-01", title: "Test Episode" },
    }),
  },
}));

// Mock @aws-sdk/client-s3 with proper class constructors
const mockSend = vi.fn();

vi.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: class MockS3Client {
      send = mockSend;
    },
    GetObjectCommand: class MockGetObjectCommand {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
    ListObjectsV2Command: class MockListObjectsV2Command {
      input: unknown;
      constructor(input: unknown) {
        this.input = input;
      }
    },
  };
});

// Must re-import after mocks to pick up fresh module each time
let getEpisodeMetadata: typeof import("@/lib/r2").getEpisodeMetadata;
let getAudioUrl: typeof import("@/lib/r2").getAudioUrl;
let getAudioStreamUrl: typeof import("@/lib/r2").getAudioStreamUrl;
let getLatestEpisode: typeof import("@/lib/r2").getLatestEpisode;
let listEpisodes: typeof import("@/lib/r2").listEpisodes;

describe("R2 Client", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the module to clear the cached r2Client singleton
    vi.resetModules();
    // Re-mock dependencies (resetModules clears them)
    vi.doMock("@/lib/env", () => ({
      env: {
        R2_ENDPOINT: "https://test-account.r2.cloudflarestorage.com",
        R2_ACCESS_KEY: "test-access-key",
        R2_SECRET_KEY: "test-secret-key",
        R2_BUCKET: "test-bucket",
        R2_PUBLIC_URL: "https://cdn.dailysoccerreport.com",
      },
    }));
    vi.doMock("@/lib/schema", () => ({
      episodeSchema: {
        safeParse: vi.fn().mockReturnValue({
          success: true,
          data: { episode_id: "2026-03-01", title: "Test Episode" },
        }),
      },
    }));
    vi.doMock("@aws-sdk/client-s3", () => {
      return {
        S3Client: class MockS3Client {
          send = mockSend;
        },
        GetObjectCommand: class MockGetObjectCommand {
          input: unknown;
          constructor(input: unknown) {
            this.input = input;
          }
        },
        ListObjectsV2Command: class MockListObjectsV2Command {
          input: unknown;
          constructor(input: unknown) {
            this.input = input;
          }
        },
      };
    });
    const r2Module = await import("@/lib/r2");
    getEpisodeMetadata = r2Module.getEpisodeMetadata;
    getAudioUrl = r2Module.getAudioUrl;
    getAudioStreamUrl = r2Module.getAudioStreamUrl;
    getLatestEpisode = r2Module.getLatestEpisode;
    listEpisodes = r2Module.listEpisodes;
  });

  describe("getEpisodeMetadata", () => {
    it("returns parsed episode when metadata exists and is valid", async () => {
      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: () =>
            Promise.resolve(
              JSON.stringify({
                episode_id: "2026-03-01",
                title: "Test Episode",
              })
            ),
        },
      });

      const result = await getEpisodeMetadata("2026-03-01");

      expect(result).toEqual({
        episode_id: "2026-03-01",
        title: "Test Episode",
      });
    });

    it("returns null when object does not exist", async () => {
      mockSend.mockRejectedValueOnce(new Error("NoSuchKey"));

      const result = await getEpisodeMetadata("nonexistent");

      expect(result).toBeNull();
    });

    it("returns null when body is empty", async () => {
      mockSend.mockResolvedValueOnce({
        Body: { transformToString: () => Promise.resolve("") },
      });

      const result = await getEpisodeMetadata("2026-03-01");

      expect(result).toBeNull();
    });

    it("returns null when schema validation fails", async () => {
      const { episodeSchema } = await import("@/lib/schema");
      (episodeSchema.safeParse as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        {
          success: false,
          error: { issues: [{ message: "invalid" }] },
        }
      );

      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: () =>
            Promise.resolve(JSON.stringify({ bad: "data" })),
        },
      });

      const result = await getEpisodeMetadata("2026-03-01");

      expect(result).toBeNull();
    });
  });

  describe("getAudioUrl", () => {
    it("constructs correct R2 audio URL", () => {
      const url = getAudioUrl("2026-03-01");

      expect(url).toBe(
        "https://test-account.r2.cloudflarestorage.com/test-bucket/episodes/2026-03-01/audio.mp3"
      );
    });
  });

  describe("listEpisodes", () => {
    it("returns episode date folders", async () => {
      mockSend.mockResolvedValueOnce({
        CommonPrefixes: [
          { Prefix: "episodes/2026-03-01/" },
          { Prefix: "episodes/2026-02-28/" },
        ],
      });

      const result = await listEpisodes();

      expect(result).toEqual(["2026-03-01", "2026-02-28"]);
    });

    it("returns empty array when no episodes exist", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await listEpisodes();

      expect(result).toEqual([]);
    });

    it("returns empty array on error", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      const result = await listEpisodes();

      expect(result).toEqual([]);
    });
  });

  describe("getAudioStreamUrl", () => {
    it("constructs correct public CDN URL", () => {
      const url = getAudioStreamUrl("2026-03-01");

      expect(url).toBe(
        "https://cdn.dailysoccerreport.com/episodes/2026-03-01/audio.mp3"
      );
    });
  });

  describe("getLatestEpisode", () => {
    it("returns the most recent episode by date", async () => {
      // First call: listEpisodes
      mockSend.mockResolvedValueOnce({
        CommonPrefixes: [
          { Prefix: "episodes/2026-02-28/" },
          { Prefix: "episodes/2026-03-01/" },
          { Prefix: "episodes/2026-02-27/" },
        ],
      });
      // Second call: getEpisodeMetadata for most recent
      mockSend.mockResolvedValueOnce({
        Body: {
          transformToString: () =>
            Promise.resolve(
              JSON.stringify({
                episode_id: "2026-03-01",
                title: "Latest Episode",
              })
            ),
        },
      });

      const result = await getLatestEpisode();

      // Schema mock always returns { episode_id: "2026-03-01", title: "Test Episode" }
      expect(result).toEqual({
        episode_id: "2026-03-01",
        title: "Test Episode",
      });
      // Verify two calls: listEpisodes + getEpisodeMetadata
      expect(mockSend).toHaveBeenCalledTimes(2);
      // Verify the most recent episode (2026-03-01) was fetched, not an older one
      const getObjectCall = mockSend.mock.calls[1][0];
      expect(getObjectCall.input).toEqual({
        Bucket: "test-bucket",
        Key: "episodes/2026-03-01/metadata.json",
      });
    });

    it("returns null when no episodes exist", async () => {
      mockSend.mockResolvedValueOnce({});

      const result = await getLatestEpisode();

      expect(result).toBeNull();
    });

    it("returns null when listEpisodes fails", async () => {
      mockSend.mockRejectedValueOnce(new Error("Network error"));

      const result = await getLatestEpisode();

      expect(result).toBeNull();
    });

    it("returns null when latest episode metadata is invalid", async () => {
      // listEpisodes succeeds
      mockSend.mockResolvedValueOnce({
        CommonPrefixes: [{ Prefix: "episodes/2026-03-01/" }],
      });
      // getEpisodeMetadata fails (NoSuchKey)
      mockSend.mockRejectedValueOnce(new Error("NoSuchKey"));

      const result = await getLatestEpisode();

      expect(result).toBeNull();
    });
  });
});
