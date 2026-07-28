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

function cmsNeedsAttentionQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.listNeedsAttention, { slug }),
  });
}

export function needsAttentionQuery(slug: string) {
  return queryOptions({
    queryKey: ["needsAttention", slug],
    queryFn: async ({ client }) => {
      const [invoiceItems, fileItems, cmsItems] = await Promise.all([
        client.fetchQuery(invoiceNeedsAttentionQuery(slug)),
        client.fetchQuery(fileNeedsAttentionQuery(slug)),
        client.fetchQuery(cmsNeedsAttentionQuery(slug)),
      ]);
      return [...invoiceItems, ...fileItems, ...cmsItems] as NeedsAttentionItem[];
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

function cmsWaitingOnClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.listWaitingOnClient, { slug }),
  });
}

export function waitingOnClientQuery(slug: string) {
  return queryOptions({
    queryKey: ["waitingOnClient", slug],
    queryFn: async ({ client }) => {
      const [invoiceItems, fileItems, cmsItems] = await Promise.all([
        client.fetchQuery(invoiceWaitingOnClientQuery(slug)),
        client.fetchQuery(fileWaitingOnClientQuery(slug)),
        client.fetchQuery(cmsWaitingOnClientQuery(slug)),
      ]);
      return [...invoiceItems, ...fileItems, ...cmsItems];
    },
  });
}

export function invoicesForWorkspaceQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listForWorkspace, { slug }),
  });
}

export function cmsDeskQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.listSchemaForDesk, { slug }),
  });
}

export function cmsDeskOverviewQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.getDeskOverview, { slug }),
  });
}

export function cmsDeployTokensQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.getDeployTokens, { slug }),
  });
}

export function cmsWorkspaceQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.cms.listFieldsForWorkspace, { slug }),
  });
}
