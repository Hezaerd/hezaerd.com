import { api } from "@hezaerd/backend/api";
import { convexQuery } from "@convex-dev/react-query";
import { queryOptions } from "@tanstack/react-query";

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

export function waitingOnClientQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listWaitingOnClient, { slug }),
  });
}

export function needsAttentionQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listNeedsAttention, { slug }),
  });
}

export function invoicesForWorkspaceQuery(slug: string) {
  return queryOptions({
    ...convexQuery(api.invoices.listForWorkspace, { slug }),
  });
}
