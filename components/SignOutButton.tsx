"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-emerald focus:ring-offset-2"
    >
      Sign out
    </button>
  );
}
