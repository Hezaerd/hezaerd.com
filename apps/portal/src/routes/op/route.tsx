import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { OperatorShell } from "@/components/shell/operator-shell";
import { getClientWorkspaceHomeParams, isClientRole } from "@/lib/portal-role";
import { usePortalAuth } from "@/lib/use-portal-auth";

export const Route = createFileRoute("/op")({
  beforeLoad: () => {
    if (isClientRole()) {
      throw redirect({
        to: "/w/$clientId",
        params: getClientWorkspaceHomeParams(),
      });
    }
  },
  component: OperatorLayout,
});

function OperatorLayout() {
  const { user, loading } = usePortalAuth();

  if (loading) {
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

  return (
    <OperatorShell email={user.email}>
      <Outlet />
    </OperatorShell>
  );
}
