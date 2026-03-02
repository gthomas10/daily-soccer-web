export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold text-text-primary">
          Episode: {slug}
        </h1>
        <p className="mt-2 text-text-secondary">
          Episode detail page — coming soon.
        </p>
      </div>
    </main>
  );
}
