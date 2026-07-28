import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { clientBySlugQuery } from "@/lib/convex-queries";

export const Route = createFileRoute("/w/$clientId/insights")({
  component: ClientInsightsPage,
});

function ClientInsightsPage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));

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
