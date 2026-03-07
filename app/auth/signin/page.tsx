import { SignInForm } from "./SignInForm";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-content-surface">
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-text-primary">Sign In</h1>
        <p className="mt-2 text-text-secondary">
          Enter your email to receive a magic link.
        </p>

        {params.error && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {params.error === "Verification"
              ? "The magic link has expired or is invalid. Please request a new one."
              : "An error occurred. Please try again."}
          </p>
        )}

        <SignInForm callbackUrl={params.callbackUrl} />
      </div>
    </main>
  );
}
