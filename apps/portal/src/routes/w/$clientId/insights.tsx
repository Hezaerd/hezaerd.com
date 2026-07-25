import { api } from "@hezaerd/backend/api";
import { useQuery } from "convex/react";

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/w/$clientId/insights")({
  component: ClientInsightsPage,
});

function ClientInsightsPage() {
  const { clientId } = Route.useParams();
  const clientDoc = useQuery(api.clients.getBySlug, { slug: clientId });

  if (clientDoc === undefined) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground font-mono text-sm">Chargement…</p>
      </main>
    );
  }

  if (clientDoc === null || !clientDoc.features.insights) {
    throw redirect({
      to: "/w/$clientId",
      params: { clientId },
    });
  }

  return <InsightsContent />;
}

function InsightsContent() {
  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Trois enseignements clairs sur votre site — sans bruit, juste le signal.
        </p>
      </div>
    </div>
  );
}
