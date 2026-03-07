import type { Metadata } from "next";
import { getPublishedEpisodes } from "@/lib/turso";
import { EpisodeArchiveList } from "@/components/EpisodeArchiveList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Episode Archive | Daily Soccer Report",
  description:
    "Browse past episodes of the Daily Soccer Report podcast. Every league, every result, every FPL angle.",
};

export default async function ArchivePage() {
  const episodes = await getPublishedEpisodes();

  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-text-primary">
          Episode Archive
        </h1>
        <p className="mt-2 text-text-secondary">
          Browse past episodes of the Daily Soccer Report.
        </p>

        {episodes.length === 0 ? (
          <p className="mt-8 text-text-secondary">
            No episodes available yet.
          </p>
        ) : (
          <EpisodeArchiveList episodes={episodes} />
        )}
      </div>
    </main>
  );
}
