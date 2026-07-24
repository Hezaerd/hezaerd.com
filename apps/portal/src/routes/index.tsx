import { api } from "@hezaerd/backend/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { useConvexAuth, useQuery } from "convex/react";

import { site } from "@/lib/site";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const { user, loading } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const hasConvexUrl = Boolean(import.meta.env.VITE_CONVEX_URL);
  const me = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");

  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-24">
      <p className="font-mono text-primary mb-4 text-sm font-medium tracking-[0.2em] uppercase">
        Portal
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Hezaerd Portal
      </h1>
      <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed">
        {loading
          ? "Checking session…"
          : user
            ? `Signed in as ${user.email}`
            : "Sign in with WorkOS to use the portal."}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {user ? (
          <Link
            to="/signout"
            className="border-border hover:bg-accent rounded-md border px-5 py-3 text-sm font-medium"
          >
            Sign out
          </Link>
        ) : (
          <a
            href="/api/auth/sign-in"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-3 text-sm font-medium"
          >
            Sign in
          </a>
        )}
      </div>

      <p className="text-muted-foreground mt-8 font-mono text-xs">
        Convex: {hasConvexUrl ? <ConvexStatus /> : "missing VITE_CONVEX_URL"}
        {isAuthenticated ? (
          <>
            {" · "}
            auth: {me === undefined ? "loading…" : me ? me.email : "no synced user yet"}
          </>
        ) : null}
      </p>
      <p className="text-muted-foreground mt-4 font-mono text-xs">
        Public sites:{" "}
        <a href={site.brandUrl} className="text-primary hover:underline">
          Brand
        </a>
        {" · "}
        <a href={site.portfolioUrl} className="text-primary hover:underline">
          Portfolio
        </a>
      </p>
    </main>
  );
}

function ConvexStatus() {
  const ping = useQuery(api.health.ping);
  if (ping === undefined) return "connecting…";
  return ping.ok ? "ok" : "error";
}
