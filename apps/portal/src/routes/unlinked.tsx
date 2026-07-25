import { createFileRoute, Link } from "@tanstack/react-router";

import { usePortalAuth } from "@/lib/use-portal-auth";

export const Route = createFileRoute("/unlinked")({
  component: UnlinkedPage,
});

function UnlinkedPage() {
  const { user, loading } = usePortalAuth();

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="border-border bg-muted/40 w-full max-w-md rounded-xl border p-8">
        <p className="text-primary mb-3 font-mono text-xs font-medium tracking-[0.2em] uppercase">
          Portail
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Espace pas encore prêt
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Vous êtes connecté{user?.email ? ` en tant que ${user.email}` : ""}, mais votre espace
          client n&apos;est pas encore lié. Contactez Hezaerd pour finaliser l&apos;accès.
        </p>
        <p className="text-muted-foreground mt-4 text-sm">
          <a href="mailto:hezaerd@hezaerd.com" className="text-primary font-medium hover:underline">
            hezaerd@hezaerd.com
          </a>
        </p>
        <p className="text-muted-foreground mt-8 text-xs">
          <Link to="/signout" className="hover:text-foreground underline-offset-4 hover:underline">
            Se déconnecter
          </Link>
        </p>
      </div>
    </main>
  );
}
