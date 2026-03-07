import type { Adapter, AdapterAccount } from "@auth/core/adapters";
import type { Client } from "@libsql/client";

export function TursoAdapter(getClient: () => Client): Adapter {
  return {
    async createUser(user) {
      const client = getClient();
      const result = await client.execute({
        sql: `INSERT INTO auth_users (email, "emailVerified", name, image)
              VALUES (?, ?, ?, ?)
              RETURNING id, email, "emailVerified", name, image`,
        args: [
          user.email ?? null,
          user.emailVerified?.toISOString() ?? null,
          user.name ?? null,
          user.image ?? null,
        ],
      });
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        emailVerified: row.emailVerified
          ? new Date(String(row.emailVerified))
          : null,
        name: row.name ? String(row.name) : null,
        image: row.image ? String(row.image) : null,
      };
    },

    async getUser(id) {
      const client = getClient();
      const result = await client.execute({
        sql: `SELECT id, email, "emailVerified", name, image FROM auth_users WHERE id = ?`,
        args: [id],
      });
      if (result.rows.length === 0) return null;
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        emailVerified: row.emailVerified
          ? new Date(String(row.emailVerified))
          : null,
        name: row.name ? String(row.name) : null,
        image: row.image ? String(row.image) : null,
      };
    },

    async getUserByEmail(email) {
      const client = getClient();
      const result = await client.execute({
        sql: `SELECT id, email, "emailVerified", name, image FROM auth_users WHERE email = ?`,
        args: [email],
      });
      if (result.rows.length === 0) return null;
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        emailVerified: row.emailVerified
          ? new Date(String(row.emailVerified))
          : null,
        name: row.name ? String(row.name) : null,
        image: row.image ? String(row.image) : null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const client = getClient();
      const result = await client.execute({
        sql: `SELECT u.id, u.email, u."emailVerified", u.name, u.image
              FROM auth_users u
              INNER JOIN auth_accounts a ON u.id = a."userId"
              WHERE a.provider = ? AND a."providerAccountId" = ?`,
        args: [provider, providerAccountId],
      });
      if (result.rows.length === 0) return null;
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        emailVerified: row.emailVerified
          ? new Date(String(row.emailVerified))
          : null,
        name: row.name ? String(row.name) : null,
        image: row.image ? String(row.image) : null,
      };
    },

    async updateUser(user) {
      const client = getClient();
      const result = await client.execute({
        sql: `UPDATE auth_users SET email = COALESCE(?, email), "emailVerified" = COALESCE(?, "emailVerified"), name = COALESCE(?, name), image = COALESCE(?, image)
              WHERE id = ?
              RETURNING id, email, "emailVerified", name, image`,
        args: [
          user.email ?? null,
          user.emailVerified?.toISOString() ?? null,
          user.name ?? null,
          user.image ?? null,
          user.id,
        ],
      });
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        id: String(row.id),
        email: String(row.email),
        emailVerified: row.emailVerified
          ? new Date(String(row.emailVerified))
          : null,
        name: row.name ? String(row.name) : null,
        image: row.image ? String(row.image) : null,
      };
    },

    async deleteUser(userId) {
      const client = getClient();
      await client.execute({
        sql: "DELETE FROM auth_users WHERE id = ?",
        args: [userId],
      });
    },

    async linkAccount(account) {
      const client = getClient();
      await client.execute({
        sql: `INSERT INTO auth_accounts ("userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          account.userId,
          account.type,
          account.provider,
          account.providerAccountId,
          account.refresh_token ?? null,
          account.access_token ?? null,
          account.expires_at ?? null,
          account.token_type ?? null,
          account.scope ?? null,
          account.id_token ?? null,
          (account.session_state as string) ?? null,
        ],
      });
      return account as AdapterAccount;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const client = getClient();
      await client.execute({
        sql: `DELETE FROM auth_accounts WHERE provider = ? AND "providerAccountId" = ?`,
        args: [provider, providerAccountId],
      });
    },

    async createVerificationToken(token) {
      const client = getClient();
      await client.execute({
        sql: `INSERT INTO verification_token (identifier, token, expires)
              VALUES (?, ?, ?)`,
        args: [token.identifier, token.token, token.expires.toISOString()],
      });
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      const client = getClient();
      const result = await client.execute({
        sql: `DELETE FROM verification_token WHERE identifier = ? AND token = ?
              RETURNING identifier, token, expires`,
        args: [identifier, token],
      });
      if (result.rows.length === 0) return null;
      const row = result.rows[0] as unknown as Record<string, unknown>;
      return {
        identifier: String(row.identifier),
        token: String(row.token),
        expires: new Date(String(row.expires)),
      };
    },
  };
}
