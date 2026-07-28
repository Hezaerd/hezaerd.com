import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";

import { NeedsAttentionList } from "@/components/shell/needs-attention-list";
import { clientBySlugQuery, needsAttentionQuery } from "@/lib/convex-queries";
import { toPortalClient } from "@/lib/portal-types";

export const Route = createFileRoute("/w/$clientId/")({
  component: ClientHomePage,
});

function ClientHomePage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: needsAttention } = useSuspenseQuery(needsAttentionQuery(clientId));

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
          {needsAttention.length === 0
            ? "Tout est à jour. Votre projet avance bien."
            : "Voici ce qui demande votre attention."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-base font-semibold tracking-tight">À traiter</h2>
        <NeedsAttentionList items={needsAttention} />
      </div>
    </div>
  );
}
