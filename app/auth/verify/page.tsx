import Link from "next/link";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "Verification";
  const email = params.email;

  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        {hasError ? (
          <>
            <h1 className="text-2xl font-bold text-text-primary">
              Link Expired
            </h1>
            <p className="mt-4 text-text-secondary">
              This magic link has expired or is invalid. Please request a new
              one.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block rounded-lg bg-accent-emerald px-6 py-3 text-sm font-bold text-text-on-dark transition-colors hover:bg-accent-emerald/90 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
            >
              Request new link
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-primary">
              Check your email
            </h1>
            <p className="mt-4 text-text-secondary">
              We&apos;ve sent a magic link to{" "}
              {email ? (
                <span className="font-medium text-text-primary">{email}</span>
              ) : (
                "your email address"
              )}
              . Click the link to sign in.
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              The link will expire in 24 hours. If you don&apos;t see the email,
              check your spam folder.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-block rounded-lg border border-text-secondary/20 px-6 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-content-surface/80 focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
            >
              Request new link
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
