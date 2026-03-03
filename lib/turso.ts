import { createClient, type Client } from "@libsql/client";
import { env } from "./env";

let tursoClient: Client | null = null;

function getTursoClient(): Client {
  if (!tursoClient) {
    tursoClient = createClient({
      url: env.TURSO_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
  }
  return tursoClient;
}

export interface EpisodeRow {
  id: number;
  date: string;
  title: string;
  description: string;
  duration: number;
  leagues_covered: string[];
  chapter_data: unknown[];
  audio_url: string;
  publish_status: string;
  created_at: string;
}

export interface SubscriberRow {
  id: number;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

function parseEpisodeRow(row: Record<string, unknown>): EpisodeRow {
  return {
    id: Number(row.id),
    date: String(row.date),
    title: String(row.title),
    description: String(row.description),
    duration: Number(row.duration),
    leagues_covered: JSON.parse(String(row.leagues_covered)),
    chapter_data: JSON.parse(String(row.chapter_data)),
    audio_url: String(row.audio_url),
    publish_status: String(row.publish_status),
    created_at: String(row.created_at),
  };
}

export async function getEpisodes(limit = 20): Promise<EpisodeRow[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT * FROM episodes ORDER BY date DESC LIMIT ?",
    args: [limit],
  });
  return result.rows.map((row) =>
    parseEpisodeRow(row as unknown as Record<string, unknown>)
  );
}

export async function getEpisodeBySlug(
  slug: string
): Promise<EpisodeRow | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT * FROM episodes WHERE date = ?",
    args: [slug],
  });
  if (result.rows.length === 0) return null;
  return parseEpisodeRow(
    result.rows[0] as unknown as Record<string, unknown>
  );
}

export async function getSubscriberByEmail(
  email: string
): Promise<SubscriberRow | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: "SELECT * FROM subscribers WHERE email = ?",
    args: [email],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as unknown as Record<string, unknown>;
  return {
    id: Number(row.id),
    email: String(row.email),
    stripe_customer_id: row.stripe_customer_id
      ? String(row.stripe_customer_id)
      : null,
    subscription_status: String(row.subscription_status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function upsertSubscriber(
  email: string,
  stripeCustomerId: string,
  status: string
): Promise<void> {
  const client = getTursoClient();
  await client.batch(
    [
      {
        sql: `INSERT INTO subscribers (email, stripe_customer_id, subscription_status, updated_at)
              VALUES (?, ?, ?, datetime('now'))
              ON CONFLICT(email) DO UPDATE SET
                stripe_customer_id = excluded.stripe_customer_id,
                subscription_status = excluded.subscription_status,
                updated_at = datetime('now')`,
        args: [email, stripeCustomerId, status],
      },
    ],
    "write"
  );
}
