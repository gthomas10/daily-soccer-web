import Link from "next/link";
import type { EpisodeRow } from "@/lib/turso";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function EpisodeArchiveList({ episodes }: { episodes: EpisodeRow[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {episodes.map((episode) => (
        <article
          key={episode.id}
          className="rounded-lg border border-text-secondary/20 p-4"
        >
          <Link
            href={`/episodes/${episode.date}`}
            className="block focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2 rounded-lg"
          >
            <h2 className="text-lg font-semibold text-text-primary">
              {episode.title}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-sm text-text-secondary">
              <time dateTime={episode.date}>{formatDate(episode.date)}</time>
              <span>{formatDuration(episode.duration)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {episode.leagues_covered.map((league) => (
                <span
                  key={league}
                  className="rounded-full bg-accent-emerald/10 px-2.5 py-0.5 text-xs font-medium text-accent-emerald"
                >
                  {league}
                </span>
              ))}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
