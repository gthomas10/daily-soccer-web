function getEnvVar(name: string, required = false): string {
  const value = process.env[name] ?? "";
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // Storage (Story 1.4)
  R2_ENDPOINT: getEnvVar("R2_ENDPOINT"),
  R2_ACCESS_KEY: getEnvVar("R2_ACCESS_KEY"),
  R2_SECRET_KEY: getEnvVar("R2_SECRET_KEY"),
  R2_BUCKET: getEnvVar("R2_BUCKET"),

  // Database (Story 1.4)
  TURSO_URL: getEnvVar("TURSO_URL"),
  TURSO_AUTH_TOKEN: getEnvVar("TURSO_AUTH_TOKEN"),

  // Auth (Epic 6)
  AUTH_SECRET: getEnvVar("AUTH_SECRET"),

  // Payments (Epic 6)
  STRIPE_SECRET_KEY: getEnvVar("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnvVar("STRIPE_WEBHOOK_SECRET"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getEnvVar(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  ),

  // Public CDN (Story 5.1)
  R2_PUBLIC_URL: getEnvVar("R2_PUBLIC_URL"),

  // Revalidation (Epic 4)
  REVALIDATION_SECRET: getEnvVar("REVALIDATION_SECRET"),
} as const;
