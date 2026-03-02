export const LEAGUE_IDS = [
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
] as const;

export type LeagueId = (typeof LEAGUE_IDS)[number];

export const PRESENTERS = ["expert", "host"] as const;
export type Presenter = (typeof PRESENTERS)[number];

export interface Chapter {
  title: string;
  start_seconds: number;
  end_seconds: number;
  leagues: LeagueId[];
}

export interface Episode {
  episode_id: string;
  title: string;
  description: string;
  publish_date: string;
  audio_url: string;
  bonus_audio_url: string | null;
  duration_seconds: number;
  chapters: Chapter[];
  presenters: Presenter[];
  leagues_covered: LeagueId[];
  fpl_segment: boolean;
  show_notes_html: string;
}
