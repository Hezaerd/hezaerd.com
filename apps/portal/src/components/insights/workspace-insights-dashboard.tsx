import { useState } from "react";

import { InsightsOverviewPanels } from "@/components/insights/insights-overview";
import { InsightsOverviewSkeleton } from "@/components/insights/insights-overview-skeleton";
import { InsightsPeriodPicker } from "@/components/insights/insights-period-picker";
import {
  useInsightsOverviewQuery,
  usePrefetchInsightsOverview,
} from "@/components/insights/use-insights-overview-query";
import { DeskEmptyState } from "@/components/shell/client-desk-layout";
import type { InsightsPeriod } from "@/lib/convex-queries";

type WorkspaceInsightsDashboardProps = {
  clientId: string;
};

export function WorkspaceInsightsDashboard({ clientId }: WorkspaceInsightsDashboardProps) {
  const [period, setPeriod] = useState<InsightsPeriod>("30d");

  usePrefetchInsightsOverview(clientId, "workspace");

  const {
    data: overview,
    isPending,
    isFetching,
    isPlaceholderData,
  } = useInsightsOverviewQuery(clientId, period, "workspace");

  return (
    <div className="flex flex-col gap-8">
      <InsightsPeriodPicker value={period} onValueChange={setPeriod} />

      {isPending && !overview ? (
        <InsightsOverviewSkeleton variant="workspace" />
      ) : !overview ? (
        <DeskEmptyState title="Statistiques indisponibles pour ce site." />
      ) : (
        <InsightsOverviewPanels
          data={overview}
          period={period}
          variant="workspace"
          showEvents
          isRefreshing={isFetching && isPlaceholderData}
        />
      )}
    </div>
  );
}
