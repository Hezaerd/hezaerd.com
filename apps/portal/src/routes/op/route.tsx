import { Suspense, useCallback } from "react";

import { type QueryClient } from "@tanstack/react-query";
import { Link, Navigate, Outlet, createFileRoute } from "@tanstack/react-router";

import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";
import { PortalSpinner } from "@/components/shell/portal-spinner";
import { OperatorShell } from "@/components/shell/operator-shell";
import { clientsListQuery, clientsStatsQuery } from "@/lib/convex-queries";
import { usePortalSession } from "@/lib/portal-session";
import { usePrefetchWhenAuthenticated } from "@/lib/use-prefetch-when-authenticated";

export const Route = createFileRoute("/op")({
  component: OperatorLayout,
});

function OperatorLayout() {
  const { operatorShell } = usePortalSession();

  const prefetchOperatorHome = useCallback((queryClient: QueryClient) => {
    void queryClient.prefetchQuery(clientsListQuery);
    void queryClient.prefetchQuery(clientsStatsQuery);
  }, []);

  usePrefetchWhenAuthenticated(prefetchOperatorHome);

  if (operatorShell.kind === "loading") {
    return <PortalSpinner />;
  }

  if (operatorShell.kind === "login") {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">
          Connectez-vous pour accéder à l&apos;accueil opérateur.{" "}
          <Link to="/" className="text-primary font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </main>
    );
  }

  if (operatorShell.kind === "unlinked") {
    return <Navigate to="/unlinked" replace />;
  }

  if (operatorShell.kind === "client-home") {
    return <Navigate to="/w/$clientId" params={{ clientId: operatorShell.slug }} replace />;
  }

  return (
    <OperatorShell email={operatorShell.email}>
      <Suspense fallback={<PageContentSkeleton />}>
        <Outlet />
      </Suspense>
    </OperatorShell>
  );
}
