import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { createFileRoute } from "@tanstack/react-router";

import { NeedsAttentionList } from "@/components/shell/needs-attention-list";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/w/$clientId/")({
  component: ClientHomePage,
});

function ClientHomePage() {
  const { clientId } = Route.useParams();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });

  if (clientDoc === undefined) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (clientDoc === null) {
    return null;
  }

  const client = toPortalClient(clientDoc);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
          {dateStr}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Bon retour, {client.name.split(" ")[0]}.
        </h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Tout est à jour. Votre projet avance bien.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">À traiter</h2>
        <NeedsAttentionList items={[]} />
      </div>
    </div>
  );
}
