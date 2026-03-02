import { z } from "zod";

const leagueIdSchema = z.enum([
  "premier-league",
  "la-liga",
  "serie-a",
  "bundesliga",
  "ligue-1",
  "mls",
  "liga-mx",
  "eredivisie",
  "primeira-liga",
  "champions-league",
  "europa-league",
  "concacaf-champions-cup",
  "copa-libertadores",
  "international",
]);

const presenterSchema = z.enum(["expert", "host"]);

const chapterSchema = z
  .object({
    title: z.string().min(1),
    start_seconds: z.number().int().min(0),
    end_seconds: z.number().int().min(1),
    leagues: z
      .array(leagueIdSchema)
      .min(1)
      .refine((arr) => new Set(arr).size === arr.length, {
        message: "leagues must contain unique items",
      }),
  })
  .strict();

export const episodeSchema = z
  .object({
    episode_id: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    title: z.string().min(1),
    description: z.string().min(1),
    publish_date: z.string().min(1),
    audio_url: z.string().url(),
    bonus_audio_url: z.string().url().nullable(),
    duration_seconds: z.number().int().min(1),
    chapters: z.array(chapterSchema).min(1),
    presenters: z
      .array(presenterSchema)
      .min(1)
      .refine((arr) => new Set(arr).size === arr.length, {
        message: "presenters must contain unique items",
      }),
    leagues_covered: z
      .array(leagueIdSchema)
      .min(1)
      .refine((arr) => new Set(arr).size === arr.length, {
        message: "leagues_covered must contain unique items",
      }),
    fpl_segment: z.boolean(),
    show_notes_html: z.string().min(1),
  })
  .strict();

export function validateEpisodeMetadata(data: unknown): {
  success: boolean;
  errors: string[];
} {
  const result = episodeSchema.safeParse(data);
  if (result.success) {
    return { success: true, errors: [] };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    ),
  };
}
