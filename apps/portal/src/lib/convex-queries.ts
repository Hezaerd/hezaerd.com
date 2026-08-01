import { api } from "@hezaerd/backend/api";
import { convexQuery } from "@convex-dev/react-query";
import { queryOptions } from "@tanstack/react-query";

import type { Id } from "@hezaerd/backend/dataModel";

import type { NeedsAttentionItem } from "@/lib/portal-types";

export const portalMeQuery = queryOptions({
  ...convexQuery(api.users.me, {}),
});

export const clientsListQuery = queryOptions({
  ...convexQuery(api.clients.list, {}),
});

export const clientsStatsQuery = queryOptions({
  ...convexQuery(api.clients.stats, {}),
});

export function clientBySlugQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.clients.getBySlug, { slug }),
  });
}

export const invoicesAllQuery = queryOptions({
  ...convexQuery(api.invoices.listAll, {}),
});

export function invoicesByClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listByClientSlug, { slug }),
  });
}

export function fileRequestsDeskQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.files.listForDesk, { slug }),
  });
}

export function fileRequestsWorkspaceQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.files.listForWorkspace, { slug }),
  });
}

export function fileRequestQuery(slug: string, requestId: string) {
  return queryOptions({
    ...convexQuery(api.files.getRequest, {
      slug,
      requestId: requestId as Id<"fileRequests">,
    }),
  });
}

function invoiceNeedsAttentionQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listNeedsAttention, { slug }),
  });
}

function fileNeedsAttentionQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.files.listNeedsAttention, { slug }),
  });
}

export function needsAttentionQuery(slug: string) {
  return queryOptions({
    queryKey: ["needsAttention", slug],
    queryFn: async ({ client }) => {
      const [invoiceItems, fileItems] = await Promise.all([
        client.fetchQuery(invoiceNeedsAttentionQuery(slug)),
        client.fetchQuery(fileNeedsAttentionQuery(slug)),
      ]);
      return [...invoiceItems, ...fileItems] as NeedsAttentionItem[];
    },
  });
}

function invoiceWaitingOnClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listWaitingOnClient, { slug }),
  });
}

function fileWaitingOnClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.files.listWaitingOnClient, { slug }),
  });
}

export function waitingOnClientQuery(slug: string) {
  return queryOptions({
    queryKey: ["waitingOnClient", slug],
    queryFn: async ({ client }) => {
      const [invoiceItems, fileItems] = await Promise.all([
        client.fetchQuery(invoiceWaitingOnClientQuery(slug)),
        client.fetchQuery(fileWaitingOnClientQuery(slug)),
      ]);
      return [...invoiceItems, ...fileItems];
    },
  });
}

export function invoicesForWorkspaceQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listForWorkspace, { slug }),
  });
}

export function analyticsSiteForDeskQueryKey(slug: string) {
  return ["analyticsSiteForDesk", slug] as const;
}

export const insightsPeriods = ["7d", "30d", "90d"] as const;
export type InsightsPeriod = (typeof insightsPeriods)[number];

const INSIGHTS_STALE_MS: Record<InsightsPeriod, number> = {
  "7d": 60 * 60 * 1000,
  "30d": 60 * 60 * 1000,
  "90d": 60 * 60 * 1000,
};

export function insightsStaleTime(period: InsightsPeriod) {
  return INSIGHTS_STALE_MS[period];
}

export function insightsOverviewQueryKey(slug: string, period: InsightsPeriod) {
  return ["insightsOverview", slug, period] as const;
}

export function insightsOverviewForDeskQuery(slug: string, period: InsightsPeriod) {
  return queryOptions({
    ...convexQuery(api.analytics.getInsightsOverviewForDesk, { slug, period }),
    staleTime: insightsStaleTime(period),
  });
}

export function insightsOverviewForWorkspaceQuery(slug: string, period: InsightsPeriod) {
  return queryOptions({
    ...convexQuery(api.analytics.getInsightsOverviewForWorkspace, { slug, period }),
    staleTime: insightsStaleTime(period),
  });
}
