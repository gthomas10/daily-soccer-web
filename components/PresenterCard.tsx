import type { PresenterProfile } from "@/types/episode";

interface PresenterCardProps {
  presenter: PresenterProfile;
}

export default function PresenterCard({ presenter }: PresenterCardProps) {
  const headingId = `presenter-${presenter.name.toLowerCase()}`;

  return (
    <article aria-labelledby={headingId} className="rounded-2xl bg-player-surface p-6 sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-emerald text-lg font-bold text-on-dark">
          {presenter.name[0]}
        </div>
        <div>
          <h2 id={headingId} className="text-xl font-bold text-on-dark">{presenter.name}</h2>
          <span className="inline-block rounded-full bg-accent-emerald/20 px-3 py-0.5 text-xs font-semibold text-accent-emerald">
            {presenter.role}
          </span>
        </div>
      </div>

      <p className="mb-6 text-sm italic text-text-secondary">
        {presenter.tagline}
      </p>

      <div className="space-y-3">
        {presenter.bio.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-on-dark/90">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Personality
        </h3>
        <div className="flex flex-wrap gap-2">
          {presenter.personalityTraits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-accent-emerald/10 px-3 py-1 text-xs text-on-dark/90"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-on-dark/80">
        {presenter.aiIdentity}
      </p>
    </article>
  );
}
