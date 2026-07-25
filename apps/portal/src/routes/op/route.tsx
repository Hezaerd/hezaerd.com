import { Link, Navigate, Outlet, createFileRoute } from "@tanstack/react-router";

import { OperatorShell } from "@/components/shell/operator-shell";
import { usePortalViewer } from "@/lib/portal-role";
import { usePortalAuth } from "@/lib/use-portal-auth";

export const Route = createFileRoute("/op")({
  component: OperatorLayout,
});

function OperatorLayout() {
  const { user, loading: authLoading } = usePortalAuth();
  const viewer = usePortalViewer();

  if (authLoading || (user && viewer.convexConfigured && viewer.loading)) {
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
          Connectez-vous pour accéder à l&apos;accueil opérateur.{" "}
          <Link to="/" className="text-primary font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </main>
    );
  }

  if (viewer.convexConfigured && viewer.isClient) {
    if (viewer.isUnlinked) {
      return <Navigate to="/unlinked" replace />;
    }
    if (viewer.clientSlug) {
      return (
        <Navigate to="/w/$clientId" params={{ clientId: viewer.clientSlug }} replace />
      );
    }
  }

  return (
    <OperatorShell email={user.email}>
      <Outlet />
    </OperatorShell>
  );
}
