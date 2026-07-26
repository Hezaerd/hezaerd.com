import { Link, Navigate, Outlet, createFileRoute } from "@tanstack/react-router";

import { OperatorShell } from "@/components/shell/operator-shell";
import { usePortalSession } from "@/lib/portal-session";

export const Route = createFileRoute("/op")({
  component: OperatorLayout,
});

function OperatorLayout() {
  const { operatorShell } = usePortalSession();

  if (operatorShell.kind === "loading") {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
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
      <Outlet />
    </OperatorShell>
  );
}
