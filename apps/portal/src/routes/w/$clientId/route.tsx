import { Suspense } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";

import {
  Link,
  Navigate,
  Outlet,
  createFileRoute,
  notFound,
  useRouterState,
} from "@tanstack/react-router";

import { ClientWorkspaceShell } from "@/components/shell/client-workspace-shell";
import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";
import { PortalSpinner } from "@/components/shell/portal-spinner";
import { clientBySlugQuery } from "@/lib/convex-queries";
import { usePortalSession } from "@/lib/portal-session";
import { toPortalClient } from "@/lib/portal-types";

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
  return (DESK_SEGMENTS as readonly string[]).includes(segment) ? (segment as DeskSegment) : null;
}

function ClientWorkspaceLayout() {
  const { clientId } = Route.useParams();
  const session = usePortalSession();
  const gate = session.workspaceGateFor(clientId);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (gate.kind === "loading") {
    return <PortalSpinner />;
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
    const segment = resolveDeskSegment(pathname, gate.slug);
    if (segment) {
      return (
        <Navigate to={`/op/clients/$clientId/${segment}`} params={{ clientId: gate.slug }} replace />
      );
    }
    return <Navigate to="/op/clients/$clientId" params={{ clientId: gate.slug }} replace />;
  }

  return (
    <Suspense fallback={<PortalSpinner />}>
      <ClientWorkspaceLoaded clientId={clientId} email={session.authUser?.email ?? ""} />
    </Suspense>
  );
}

function ClientWorkspaceLoaded({ clientId, email }: { clientId: string; email: string }) {
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

  if (clientDoc === null) {
    throw notFound();
  }

  const client = toPortalClient(clientDoc);

  return (
    <ClientWorkspaceShell client={client} email={email}>
      <Suspense fallback={<PageContentSkeleton />}>
        <Outlet />
      </Suspense>
    </ClientWorkspaceShell>
  );
}
