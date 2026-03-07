import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { createClient } from "@libsql/client";
import { TursoAdapter } from "./auth-adapter";
import { env } from "./env";
import { getSubscriberByEmail } from "./turso";

let adapterClient: ReturnType<typeof createClient> | null = null;

function getAdapterClient() {
  if (!adapterClient) {
    adapterClient = createClient({
      url: env.TURSO_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    });
  }
  return adapterClient;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: TursoAdapter(getAdapterClient),
  providers: [
    Resend({
      apiKey: env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative paths only — prevent open redirect
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow same-origin URLs
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const subscriber = await getSubscriberByEmail(user.email);
        token.subscriptionStatus = subscriber?.subscription_status ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.subscriptionStatus) {
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
  },
});
