import { useAuth } from "@workos/authkit-tanstack-react-start/client";

import { createFileRoute, Navigate } from "@tanstack/react-router";

import { getClientWorkspaceHomeParams, isClientRole } from "@/lib/portal-role";

export const Route = createFileRoute("/")({ component: PortalHome });

function PortalHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (isClientRole()) {
    return <Navigate to="/w/$clientId" params={getClientWorkspaceHomeParams()} replace />;
  }

  return <Navigate to="/op" replace />;
}

function LoginScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <form
        className="border-border bg-muted/40 w-full max-w-sm rounded-xl border p-8"
        action="/api/auth/sign-in"
        method="get"
      >
        <p className="text-primary mb-3 font-mono text-xs font-medium tracking-[0.2em] uppercase">
          Portal
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Invite-only portal for Operators and Clients. No self-registration.
        </p>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Continue to sign in
        </button>
      </form>
    </main>
  );
}
