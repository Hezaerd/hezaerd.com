import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { Link, Outlet, createFileRoute, notFound } from "@tanstack/react-router";

import { ClientWorkspaceShell } from "@/components/shell/client-workspace-shell";
import { toPortalClient } from "@/lib/portal-types";
import { usePortalAuth } from "@/lib/use-portal-auth";

export const Route = createFileRoute("/w/$clientId")({
  component: ClientWorkspaceLayout,
});

function ClientWorkspaceLayout() {
  const { clientId } = Route.useParams();
  const { user, loading: authLoading } = usePortalAuth();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });

  if (authLoading || clientDoc === undefined) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (!user) {
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

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  return (
    <ClientWorkspaceShell client={client} email={user.email}>
      <Outlet />
    </ClientWorkspaceShell>
  );
}
