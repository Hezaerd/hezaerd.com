import { v } from "convex/values";

import { authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import {
  allocateInvoiceNumber,
  assertOperatorInvoiceAccess,
  getInvoiceOrThrow,
  invoiceValidator,
} from "./lib/invoices";
import { assertClientAccess } from "./lib/users";

const enrichedInvoiceValidator = v.object({
  _id: v.id("invoices"),
  _creationTime: v.number(),
  clientId: v.id("clients"),
  number: v.number(),
  label: v.string(),
  amountCents: v.number(),
  currency: v.literal("eur"),
  status: v.union(
    v.literal("draft"),
    v.literal("open"),
    v.literal("paid"),
    v.literal("cancelled"),
  ),
  dueDate: v.optional(v.number()),
  openedAt: v.optional(v.number()),
  stripeCheckoutSessionId: v.optional(v.string()),
  checkoutUrl: v.optional(v.string()),
  checkoutExpiresAt: v.optional(v.number()),
  payment: v.optional(
    v.object({
      method: v.union(v.literal("stripe"), v.literal("bank_wire")),
      paidAt: v.number(),
      stripeSessionId: v.optional(v.string()),
      transferRef: v.optional(v.string()),
    }),
  ),
  clientSlug: v.string(),
  clientName: v.string(),
});

const needsAttentionItemValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  clientId: v.string(),
  area: v.literal("invoices"),
  kind: v.literal("invoice"),
});

const waitingItemValidator = v.object({
  id: v.string(),
  title: v.string(),
  description: v.string(),
  href: v.string(),
});

function validateAmountCents(amountCents: number): void {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Montant invalide");
  }
}

function validateLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error("Libellé requis");
  }
  return trimmed;
}

async function enrichInvoice(ctx: { db: Parameters<typeof getInvoiceOrThrow>[0]["db"] }, invoice: Awaited<ReturnType<typeof getInvoiceOrThrow>>) {
  const client = await ctx.db.get("clients", invoice.clientId);
  if (!client) {
    throw new Error("Client not found");
  }
  return { ...invoice, clientSlug: client.slug, clientName: client.name };
}

/** Invoices for one Client Desk section. */
export const listByClientSlug = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(invoiceValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();
    return invoices.sort((a, b) => b.number - a.number);
  },
});

/** Global Operator invoice ledger. */
export const listAll = operatorQuery({
  args: {},
  returns: v.array(enrichedInvoiceValidator),
  handler: async (ctx) => {
    const invoices = await ctx.db.query("invoices").collect();
    const enriched = await Promise.all(invoices.map((invoice) => enrichInvoice(ctx, invoice)));
    return enriched.sort((a, b) => b.number - a.number);
  },
});

/** Client Workspace invoice list. */
export const listForWorkspace = authedQuery({
  args: { slug: v.string() },
  returns: v.array(invoiceValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .collect();

    if (ctx.user.role === "client") {
      return invoices
        .filter((invoice) => invoice.status === "open" || invoice.status === "paid")
        .sort((a, b) => {
          const rank = (status: typeof a.status) => (status === "open" ? 0 : 1);
          const byRank = rank(a.status) - rank(b.status);
          if (byRank !== 0) {
            return byRank;
          }
          return b.number - a.number;
        });
    }

    return invoices.sort((a, b) => b.number - a.number);
  },
});

/** Needs Attention rows for Client Home. */
export const listNeedsAttention = authedQuery({
  args: { slug: v.string() },
  returns: v.array(needsAttentionItemValidator),
  handler: async (ctx, args) => {
    if (ctx.user.role !== "client") {
      return [];
    }

    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const openInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId_and_status", (q) =>
        q.eq("clientId", client._id).eq("status", "open"),
      )
      .collect();

    return openInvoices
      .sort((a, b) => b.number - a.number)
      .map((invoice) => ({
        id: invoice._id,
        title: `Facture n°${invoice.number}`,
        description: invoice.label,
        clientId: client.slug,
        area: "invoices" as const,
        kind: "invoice" as const,
      }));
  },
});

/** Waiting on Client queue for Client Desk landing. */
export const listWaitingOnClient = operatorQuery({
  args: { slug: v.string() },
  returns: v.array(waitingItemValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const openInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_clientId_and_status", (q) =>
        q.eq("clientId", client._id).eq("status", "open"),
      )
      .collect();

    return openInvoices
      .sort((a, b) => b.number - a.number)
      .map((invoice) => ({
        id: invoice._id,
        title: `Facture n°${invoice.number}`,
        description: invoice.label,
        href: `/op/clients/${client.slug}/invoices`,
      }));
  },
});

export const create = operatorMutation({
  args: {
    slug: v.string(),
    label: v.string(),
    amountCents: v.number(),
    dueDate: v.optional(v.number()),
    send: v.boolean(),
  },
  returns: invoiceValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    validateAmountCents(args.amountCents);
    const label = validateLabel(args.label);

    const number = await allocateInvoiceNumber(ctx);
    const now = Date.now();

    const invoiceId = await ctx.db.insert("invoices", {
      clientId: client._id,
      number,
      label,
      amountCents: args.amountCents,
      currency: "eur",
      status: args.send ? "open" : "draft",
      dueDate: args.dueDate,
      openedAt: args.send ? now : undefined,
    });

    const invoice = await getInvoiceOrThrow(ctx, invoiceId);
    return invoice;
  },
});

export const send = operatorMutation({
  args: { invoiceId: v.id("invoices") },
  returns: invoiceValidator,
  handler: async (ctx, args) => {
    const invoice = await getInvoiceOrThrow(ctx, args.invoiceId);
    await assertOperatorInvoiceAccess(ctx, ctx.user, invoice);

    if (invoice.status !== "draft") {
      throw new Error("Seules les factures brouillon peuvent être envoyées");
    }

    await ctx.db.patch(invoice._id, {
      status: "open",
      openedAt: Date.now(),
    });

    return await getInvoiceOrThrow(ctx, invoice._id);
  },
});

export const cancel = operatorMutation({
  args: { invoiceId: v.id("invoices") },
  returns: invoiceValidator,
  handler: async (ctx, args) => {
    const invoice = await getInvoiceOrThrow(ctx, args.invoiceId);
    await assertOperatorInvoiceAccess(ctx, ctx.user, invoice);

    if (invoice.status === "paid") {
      throw new Error("Impossible d'annuler une facture payée");
    }
    if (invoice.status === "cancelled") {
      return invoice;
    }

    await ctx.db.patch(invoice._id, {
      status: "cancelled",
      stripeCheckoutSessionId: undefined,
      checkoutUrl: undefined,
      checkoutExpiresAt: undefined,
    });

    return await getInvoiceOrThrow(ctx, invoice._id);
  },
});

export const markPaidBankWire = operatorMutation({
  args: {
    invoiceId: v.id("invoices"),
    transferRef: v.optional(v.string()),
  },
  returns: invoiceValidator,
  handler: async (ctx, args) => {
    const invoice = await getInvoiceOrThrow(ctx, args.invoiceId);
    await assertOperatorInvoiceAccess(ctx, ctx.user, invoice);

    if (invoice.status !== "open") {
      throw new Error("Seules les factures ouvertes peuvent être marquées payées");
    }

    await ctx.db.patch(invoice._id, {
      status: "paid",
      payment: {
        method: "bank_wire",
        paidAt: Date.now(),
        transferRef: args.transferRef?.trim() || undefined,
      },
      stripeCheckoutSessionId: undefined,
      checkoutUrl: undefined,
      checkoutExpiresAt: undefined,
    });

    return await getInvoiceOrThrow(ctx, invoice._id);
  },
});
