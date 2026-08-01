import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";

import { SiteFavicon } from "@/components/insights/insights-favicon";
import { WorkspaceInsightsDashboard } from "@/components/insights/workspace-insights-dashboard";
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

  const siteHost = clientDoc.linkedSite?.productionUrl ?? "";

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          {siteHost ? (
            <SiteFavicon siteHost={siteHost} size={32} className="rounded-lg" />
          ) : null}
          <h1 className="font-display text-2xl font-semibold tracking-tight">Statistiques</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          Visiteurs, sources et pages — le signal utile sans bruit.
        </p>
      </div>

      <WorkspaceInsightsDashboard clientId={clientId} />
    </div>
  );
}
