import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { Link, Navigate, Outlet, createFileRoute, notFound, useRouterState } from "@tanstack/react-router";

import { ClientWorkspaceShell } from "@/components/shell/client-workspace-shell";
import { toPortalClient } from "@/lib/portal-types";
import { usePortalViewer } from "@/lib/portal-role";
import { usePortalAuth } from "@/lib/use-portal-auth";

export const Route = createFileRoute("/w/$clientId")({
  component: ClientWorkspaceLayout,
});

const DESK_SEGMENTS = ["invoices", "files", "insights", "website"] as const;
type DeskSegment = (typeof DESK_SEGMENTS)[number];

function resolveDeskSegment(pathname: string, clientId: string): DeskSegment | null {
  const prefix = `/w/${clientId}/`;
  if (!pathname.startsWith(prefix)) return null;
  const parts = pathname.slice(prefix.length).split("/");
  const segment = parts[0] ?? "";
  return (DESK_SEGMENTS as readonly string[]).includes(segment)
    ? (segment as DeskSegment)
    : null;
}

function ClientWorkspaceLayout() {
  const { clientId } = Route.useParams();
  const { user, loading: authLoading } = usePortalAuth();
  const viewer = usePortalViewer();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (authLoading || clientDoc === undefined || (viewer.convexConfigured && viewer.loading)) {
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

  if (viewer.isOperator) {
    const segment = resolveDeskSegment(pathname, clientId);
    if (segment) {
      return (
        <Navigate
          to={`/op/clients/$clientId/${segment}`}
          params={{ clientId }}
          replace
        />
      );
    }
    return <Navigate to="/op/clients/$clientId" params={{ clientId }} replace />;
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
