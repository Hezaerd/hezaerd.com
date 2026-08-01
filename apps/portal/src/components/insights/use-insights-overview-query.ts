import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  insightsOverviewForDeskQuery,
  insightsOverviewForWorkspaceQuery,
  insightsPeriods,
  type InsightsPeriod,
} from "@/lib/convex-queries";

type InsightsOverviewScope = "desk" | "workspace";

function overviewQuery(slug: string, period: InsightsPeriod, scope: InsightsOverviewScope) {
  return scope === "desk"
    ? insightsOverviewForDeskQuery(slug, period)
    : insightsOverviewForWorkspaceQuery(slug, period);
}

export function usePrefetchInsightsOverview(slug: string, scope: InsightsOverviewScope) {
  const queryClient = useQueryClient();

  useEffect(() => {
    for (const period of insightsPeriods) {
      void queryClient.prefetchQuery(overviewQuery(slug, period, scope));
    }
  }, [queryClient, scope, slug]);
}

export function useInsightsOverviewQuery(
  slug: string,
  period: InsightsPeriod,
  scope: InsightsOverviewScope,
) {
  return useQuery({
    ...overviewQuery(slug, period, scope),
    placeholderData: keepPreviousData,
  });
}
