import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { TursoAdapter } from "./auth-adapter";
import { env } from "./env";
import { getSubscriberByEmail, getTursoClient } from "./turso";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: TursoAdapter(getTursoClient),
  providers: [
    Resend({
      apiKey: env.AUTH_RESEND_KEY,
      from: env.AUTH_EMAIL_FROM,
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
      if (token.subscriptionStatus !== undefined) {
        session.user.subscriptionStatus = token.subscriptionStatus as string;
      }
      return session;
    },
  },
});
