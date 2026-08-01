import { PieChart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { createFileRoute, redirect } from "@tanstack/react-router";

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

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={PieChart01Icon} size={16} className="text-muted-foreground" />
          </div>
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
