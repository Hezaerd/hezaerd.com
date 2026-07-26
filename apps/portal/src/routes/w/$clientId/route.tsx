import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { Link, Navigate, Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { ClientWorkspaceShell } from "@/components/shell/client-workspace-shell";
import { usePortalSession } from "@/lib/portal-session";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/w/$clientId")({
  component: ClientWorkspaceLayout,
});

function ClientWorkspaceLayout() {
  const { clientId } = Route.useParams();
  const session = usePortalSession();
  const gate = session.workspaceGateFor(clientId);

  const shouldLoadClient = gate.kind === "load-client";
  const clientDoc = useQuery(api.clients.getBySlug, shouldLoadClient ? { slug: clientId } : "skip");

  if (gate.kind === "loading") {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (gate.kind === "login") {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">
          Connectez-vous pour accéder à votre espace client.{" "}
          <Link to="/" className="text-primary font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </main>
    );
  }

  if (gate.kind === "operator-desk") {
    return <Navigate to="/op/clients/$clientId" params={{ clientId: gate.slug }} replace />;
  }

  if (clientDoc === undefined) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);
  const email = session.authUser?.email ?? "";

  return (
    <ClientWorkspaceShell client={client} email={email}>
      <Outlet />
    </ClientWorkspaceShell>
  );
}
