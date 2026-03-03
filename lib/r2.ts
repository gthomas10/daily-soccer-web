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

export async function getEpisodeMetadata(
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
  } catch {
    return null;
  }
}

export function getAudioUrl(episodeId: string): string {
  return `${env.R2_ENDPOINT}/${env.R2_BUCKET}/episodes/${episodeId}/audio.mp3`;
}

export async function listEpisodes(): Promise<string[]> {
  try {
    const client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET,
      Prefix: "episodes/",
      Delimiter: "/",
    });
    const response = await client.send(command);
    return (
      response.CommonPrefixes?.map((p) =>
        (p.Prefix ?? "").replace("episodes/", "").replace("/", "")
      ).filter(Boolean) ?? []
    );
  } catch {
    return [];
  }
}
