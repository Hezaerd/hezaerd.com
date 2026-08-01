import { api } from "@hezaerd/backend/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { useState } from "react";

import { InsightsClientAccessBanner } from "@/components/insights/insights-client-access-banner";
import { InsightsOverviewPanels } from "@/components/insights/insights-overview";
import { InsightsOverviewSkeleton } from "@/components/insights/insights-overview-skeleton";
import { InsightsPeriodPicker } from "@/components/insights/insights-period-picker";
import { DeskInsightsSetupPanel } from "@/components/insights/desk-insights-setup-panel";
import {
  useInsightsOverviewQuery,
  usePrefetchInsightsOverview,
} from "@/components/insights/use-insights-overview-query";
import { DeskEmptyState } from "@/components/shell/client-desk-layout";
import {
  analyticsSiteForDeskQueryKey,
  type InsightsPeriod,
} from "@/lib/convex-queries";

type DeskInsightsDashboardProps = {
  clientId: string;
  insightsEnabled: boolean;
};

export function DeskInsightsDashboard({ clientId, insightsEnabled }: DeskInsightsDashboardProps) {
  const convex = useConvex();
  const [period, setPeriod] = useState<InsightsPeriod>("30d");

  usePrefetchInsightsOverview(clientId, "desk");

  const { data: site } = useSuspenseQuery({
    queryKey: analyticsSiteForDeskQueryKey(clientId),
    queryFn: async () => {
      const existing = await convex.query(api.analytics.getSiteForDesk, { slug: clientId });
      if (existing) {
        return existing;
      }
      return await convex.mutation(api.analytics.ensureSiteForDesk, { slug: clientId });
    },
  });

  const {
    data: overview,
    isPending,
    isFetching,
    isPlaceholderData,
  } = useInsightsOverviewQuery(clientId, period, "desk");

  if (!site) {
    return <DeskEmptyState title="Site analytics introuvable." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <InsightsClientAccessBanner insightsEnabled={insightsEnabled} />
      <DeskInsightsSetupPanel clientId={clientId} site={site} />

      <div className="flex flex-col gap-6">
        <InsightsPeriodPicker value={period} onValueChange={setPeriod} />

        {isPending && !overview ? (
          <InsightsOverviewSkeleton variant="desk" />
        ) : !overview ? (
          <DeskEmptyState title="Statistiques indisponibles." />
        ) : (
          <InsightsOverviewPanels
            data={overview}
            period={period}
            variant="desk"
            showEvents
            isRefreshing={isFetching && isPlaceholderData}
          />
        )}
      </div>
    </div>
  );
}
