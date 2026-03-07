import type { Metadata } from "next";
import { getPresenterProfiles } from "@/lib/presenters";
import PresenterCard from "@/components/PresenterCard";

export function generateMetadata(): Metadata {
  return {
    title: "Meet the Presenters | Daily Soccer Report",
    description:
      "Meet James and Alex — the AI voices behind your daily soccer briefing. Born from a love of the beautiful game.",
    openGraph: {
      title: "Meet the Presenters | Daily Soccer Report",
      description:
        "Meet James and Alex — the AI voices behind your daily soccer briefing. Born from a love of the beautiful game.",
      type: "website",
      siteName: "Daily Soccer Report",
    },
  };
}

export default function PresentersPage() {
  const presenters = getPresenterProfiles();

  return (
    <main className="min-h-screen bg-content-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent-emerald focus:px-4 focus:py-2 focus:text-text-on-dark"
      >
        Skip to content
      </a>
      <div id="main-content" className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Meet the Presenters
        </h1>
        <p className="mt-3 max-w-[680px] text-text-secondary">
          James and Alex are AI characters born from a love of the beautiful
          game. They exist because someone wanted a daily show that covers
          football with the depth it deserves — and AI makes that possible.
          They&apos;re not hiding behind a curtain. This is who they are.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {presenters.map((presenter) => (
            <PresenterCard key={presenter.name} presenter={presenter} />
          ))}
        </div>
      </div>
    </main>
  );
}
