// @ts-nocheck — Marion desk reads; Convex DataModel depth exceeds tsc recursion budget.
import type { Doc, Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";

import { loadInsightsOverview } from "../analytics/insightsOverview";
import { getClientBySlug, toClientResponse } from "../clients";
import { countPendingSlots, isRequestComplete } from "../files";

export async function listAllClients(ctx: QueryCtx) {
  const clients = await ctx.db.query("clients").collect();
  return [...clients].sort((a, b) => a.name.localeCompare(b.name, "fr")).map(toClientResponse);
}

export async function getClientBySlugForMarion(ctx: QueryCtx, slug: string) {
  const client = await getClientBySlug(ctx, slug);
  return client ? toClientResponse(client) : null;
}

export async function loadCockpitStats(ctx: QueryCtx) {
  const [clients, openInvoices, paidInvoices] = await Promise.all([
    ctx.db.query("clients").collect(),
    ctx.db.query("invoices").withIndex("by_status", (q) => q.eq("status", "open")).collect(),
    ctx.db.query("invoices").withIndex("by_status", (q) => q.eq("status", "paid")).collect(),
  ]);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const paidThisMonth = paidInvoices
    .filter((invoice) => invoice.payment && invoice.payment.paidAt >= monthStart)
    .reduce((sum, invoice) => sum + invoice.amountCents, 0);

  const openInvoiceTotal = openInvoices.reduce((sum, invoice) => sum + invoice.amountCents, 0);

  const activeFileRequests = (await ctx.db.query("fileRequests").collect()).filter(
    (request) => request.status === "active",
  );

  const clientsWaitingSet = new Set(openInvoices.map((invoice) => invoice.clientId));

  for (const request of activeFileRequests) {
    const slots = await ctx.db
      .query("fileRequestSlots")
      .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
      .collect();
    if (slots.some((slot) => !slot.file)) {
      clientsWaitingSet.add(request.clientId);
    }
  }

  return {
    openInvoiceTotal: openInvoiceTotal / 100,
    paidThisMonth: paidThisMonth / 100,
    clientsWaiting: clientsWaitingSet.size,
    activeClients: clients.length,
  };
}

async function waitingOnClientForClient(ctx: QueryCtx, client: Doc<"clients">) {
  const [openInvoices, fileRequests] = await Promise.all([
    ctx.db
      .query("invoices")
      .withIndex("by_clientId_and_status", (q) =>
        q.eq("clientId", client._id).eq("status", "open"),
      )
      .collect(),
    ctx.db
      .query("fileRequests")
      .withIndex("by_clientId_and_status", (q) =>
        q.eq("clientId", client._id).eq("status", "active"),
      )
      .collect(),
  ]);

  const invoiceItems = openInvoices
    .sort((a, b) => b.number - a.number)
    .map((invoice) => ({
      id: invoice._id,
      title: `Facture n°${invoice.number}`,
      description: invoice.label,
      href: `/op/clients/${client.slug}/invoices`,
      clientSlug: client.slug,
      clientName: client.name,
    }));

  const fileItems = await Promise.all(
    fileRequests.map(async (request) => {
      const slots = await ctx.db
        .query("fileRequestSlots")
        .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
        .collect();
      const pendingCount = countPendingSlots(slots);
      if (pendingCount === 0) {
        return null;
      }
      return {
        id: request._id,
        title: request.title,
        description:
          pendingCount === 1 ? "1 fichier en attente" : `${pendingCount} fichiers en attente`,
        href: `/op/clients/${client.slug}/files/${request._id}`,
        clientSlug: client.slug,
        clientName: client.name,
      };
    }),
  );

  return [...invoiceItems, ...fileItems.filter((item): item is NonNullable<typeof item> => item !== null)];
}

export async function listWaitingOnClientGlobal(ctx: QueryCtx) {
  const clients = await ctx.db.query("clients").collect();
  const items = await Promise.all(clients.map((client) => waitingOnClientForClient(ctx, client)));
  return items.flat().sort((a, b) => a.clientName.localeCompare(b.clientName, "fr"));
}

export async function listWaitingOnClientForSlug(ctx: QueryCtx, slug: string) {
  const client = await getClientBySlug(ctx, slug);
  if (!client) {
    return [];
  }
  return waitingOnClientForClient(ctx, client);
}

/** Draft invoices and other practice-side follow-ups needing Operator action. */
export async function listWaitingOnOperatorGlobal(ctx: QueryCtx) {
  const draftInvoices = await ctx.db
    .query("invoices")
    .withIndex("by_status", (q) => q.eq("status", "draft"))
    .collect();

  const items = await Promise.all(
    draftInvoices.map(async (invoice) => {
      const client = await ctx.db.get("clients", invoice.clientId);
      if (!client) {
        return null;
      }
      return {
        id: invoice._id,
        title: `Facture brouillon n°${invoice.number}`,
        description: invoice.label,
        href: `/op/clients/${client.slug}/invoices`,
        clientSlug: client.slug,
        clientName: client.name,
      };
    }),
  );

  return items
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.clientName.localeCompare(b.clientName, "fr"));
}

export async function listWaitingOnOperatorForSlug(ctx: QueryCtx, slug: string) {
  const client = await getClientBySlug(ctx, slug);
  if (!client) {
    return [];
  }

  const draftInvoices = await ctx.db
    .query("invoices")
    .withIndex("by_clientId_and_status", (q) =>
      q.eq("clientId", client._id).eq("status", "draft"),
    )
    .collect();

  return draftInvoices
    .sort((a, b) => b.number - a.number)
    .map((invoice) => ({
      id: invoice._id,
      title: `Facture brouillon n°${invoice.number}`,
      description: invoice.label,
      href: `/op/clients/${client.slug}/invoices`,
      clientSlug: client.slug,
      clientName: client.name,
    }));
}

export async function listInvoicesForMarion(ctx: QueryCtx, slug?: string) {
  if (slug) {
    const client = await getClientBySlug(ctx, slug);
    if (!client) {
      return [];
    }
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();
    return invoices
      .sort((a, b) => b.number - a.number)
      .map((invoice) => ({
        ...invoice,
        clientSlug: client.slug,
        clientName: client.name,
      }));
  }

  const invoices = await ctx.db.query("invoices").collect();
  const enriched = await Promise.all(
    invoices.map(async (invoice) => {
      const client = await ctx.db.get("clients", invoice.clientId);
      if (!client) {
        throw new Error("Client not found");
      }
      return { ...invoice, clientSlug: client.slug, clientName: client.name };
    }),
  );
  return enriched.sort((a, b) => b.number - a.number);
}

async function loadRequestsWithSlots(ctx: QueryCtx, clientId: Id<"clients">) {
  const requests = await ctx.db
    .query("fileRequests")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .collect();

  const sorted = [...requests].sort((a, b) => b._creationTime - a._creationTime);

  return Promise.all(
    sorted.map(async (request) => {
      const slots = await ctx.db
        .query("fileRequestSlots")
        .withIndex("by_requestId", (q) => q.eq("requestId", request._id))
        .collect();
      slots.sort((a, b) => a.sortOrder - b.sortOrder);
      return {
        request,
        slots,
        pendingCount: countPendingSlots(slots),
        isComplete: isRequestComplete(slots),
      };
    }),
  );
}

export async function listFilesDeskForMarion(ctx: QueryCtx, slug: string) {
  const client = await getClientBySlug(ctx, slug);
  if (!client) {
    return [];
  }
  return loadRequestsWithSlots(ctx, client._id);
}

export async function getInsightsForMarion(
  ctx: QueryCtx,
  slug: string,
  period: "7d" | "30d" | "90d",
) {
  const client = await getClientBySlug(ctx, slug);
  if (!client?.linkedSite) {
    return null;
  }
  return loadInsightsOverview(ctx, client._id, period, { includeEvents: true });
}

export async function getLinkedSiteForMarion(ctx: QueryCtx, slug: string) {
  const client = await getClientBySlug(ctx, slug);
  if (!client?.linkedSite) {
    return null;
  }

  const site = await ctx.db
    .query("analyticsSites")
    .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
    .unique();

  return {
    clientSlug: client.slug,
    clientName: client.name,
    productionUrl: client.linkedSite.productionUrl,
    githubRepo: client.linkedSite.githubRepo,
    siteKey: site?.siteKey,
  };
}
