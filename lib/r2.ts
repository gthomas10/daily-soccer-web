import { cache } from "react";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { env } from "./env";
import { episodeSchema } from "./schema";
import type { Episode } from "@/types/episode";

let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY,
        secretAccessKey: env.R2_SECRET_KEY,
      },
    });
  }
  return r2Client;
}

export const getEpisodeMetadata = cache(async function getEpisodeMetadata(
  episodeId: string
): Promise<Episode | null> {
  try {
    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: `episodes/${episodeId}/metadata.json`,
    });
    const response = await client.send(command);
    const body = await response.Body?.transformToString();
    if (!body) return null;

    const data = JSON.parse(body);
    const result = episodeSchema.safeParse(data);
    if (!result.success) {
      console.error(
        "Episode metadata validation failed:",
        result.error.issues
      );
      return null;
    }
    return result.data as Episode;
  } catch (error) {
    console.error(`stage=web action=getEpisodeMetadata episodeId=${episodeId} error=`, error);
    return null;
  }
});

export function getAudioUrl(episodeId: string): string {
  return `${env.R2_ENDPOINT}/${env.R2_BUCKET}/episodes/${episodeId}/audio.mp3`;
}

export function getAudioStreamUrl(episodeId: string): string {
  if (!env.R2_PUBLIC_URL) {
    throw new Error("R2_PUBLIC_URL is not configured — cannot construct audio streaming URL");
  }
  return `${env.R2_PUBLIC_URL}/episodes/${episodeId}/audio.mp3`;
}

export const getLatestEpisode = cache(async function getLatestEpisode(): Promise<Episode | null> {
  // Dev fallback: load fixture when R2 is not configured
  if (!env.R2_ENDPOINT && process.env.NODE_ENV === "development") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const fixturePath = path.join(
        process.cwd(),
        "schemas/fixtures/valid-episode.json"
      );
      const data = JSON.parse(await fs.readFile(fixturePath, "utf-8"));
      const result = episodeSchema.safeParse(data);
      return result.success ? (result.data as Episode) : null;
    } catch (error) {
      console.error("stage=web action=getLatestEpisode devFallback=failed error=", error);
      return null;
    }
  }

  try {
    const episodeIds = await listEpisodes();
    if (episodeIds.length === 0) return null;

    const sorted = [...episodeIds].sort().reverse();
    return await getEpisodeMetadata(sorted[0]);
  } catch (error) {
    console.error("stage=web action=getLatestEpisode error=", error);
    return null;
  }
});

export async function listEpisodes(): Promise<string[]> {
  try {
    const client = getR2Client();
    const allIds: string[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: env.R2_BUCKET,
        Prefix: "episodes/",
        Delimiter: "/",
        ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
      });
      const response = await client.send(command);

      const ids =
        response.CommonPrefixes?.map((p) =>
          (p.Prefix ?? "").replace("episodes/", "").replace("/", "")
        ).filter(Boolean) ?? [];

      allIds.push(...ids);
      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return allIds;
  } catch (error) {
    console.error("stage=web action=listEpisodes error=", error);
    return [];
  }
}
