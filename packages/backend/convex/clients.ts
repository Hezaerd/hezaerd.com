import { v } from "convex/values";

import { authedMutation, authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import {
  assertUniqueContactEmail,
  assertUniqueSlug,
  getClientBySlug,
  normalizeEmail,
  normalizeSlug,
  tryBindSeatByEmail,
} from "./lib/clients";
import { assertClientAccess } from "./lib/users";

const featuresValidator = v.object({
  insights: v.boolean(),
  website: v.boolean(),
});

export const clientValidator = v.object({
  _id: v.id("clients"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  contactEmail: v.string(),
  features: featuresValidator,
});

const cockpitStatsValidator = v.object({
  openInvoiceTotal: v.number(),
  paidThisMonth: v.number(),
  clientsWaiting: v.number(),
  activeClients: v.number(),
});

/** All Clients for Operator Home and directory (practice-scale). */
export const list = operatorQuery({
  args: {},
  returns: v.array(clientValidator),
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    return [...clients].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  },
});

/** Practice Cockpit tile values. */
export const stats = operatorQuery({
  args: {},
  returns: cockpitStatsValidator,
  handler: async (ctx) => {
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
    const clientsWaiting = new Set(openInvoices.map((invoice) => invoice.clientId)).size;

    return {
      openInvoiceTotal: openInvoiceTotal / 100,
      paidThisMonth: paidThisMonth / 100,
      clientsWaiting,
      activeClients: clients.length,
    };
  },
});

/** Load one Client by slug. Operators: any Client. Clients: only their bound Client. */
export const getBySlug = authedQuery({
  args: { slug: v.string() },
  returns: v.union(clientValidator, v.null()),
  handler: async (ctx, args) => {
    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      return null;
    }

    if (ctx.user.role === "operator") {
      return client;
    }

    if (ctx.user.role === "client") {
      if (ctx.user.clientId !== client._id) {
        throw new Error("Unauthorized: You don't have access to this Client");
      }
      return client;
    }

    return null;
  },
});

/** Create a Client (Operator). Features default off; seat binds on matching login email. */
export const create = operatorMutation({
  args: {
    name: v.string(),
    slug: v.string(),
    contactEmail: v.string(),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) {
      throw new Error("Le nom est requis");
    }

    const slug = normalizeSlug(args.slug);
    const contactEmail = normalizeEmail(args.contactEmail);
    if (!contactEmail.includes("@")) {
      throw new Error("E-mail de contact invalide");
    }

    await assertUniqueSlug(ctx, slug);
    await assertUniqueContactEmail(ctx, contactEmail);

    const clientId = await ctx.db.insert("clients", {
      name,
      slug,
      contactEmail,
      features: {
        insights: false,
        website: false,
      },
    });

    const client = await ctx.db.get("clients", clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    return client;
  },
});

/** Toggle a Client Feature (Operator). Does not create Needs Attention rows. */
export const setFeature = operatorMutation({
  args: {
    slug: v.string(),
    feature: v.union(v.literal("insights"), v.literal("website")),
    enabled: v.boolean(),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);

    await ctx.db.patch(client._id, {
      features: {
        ...client.features,
        [args.feature]: args.enabled,
      },
    });

    const updated = await ctx.db.get("clients", client._id);
    if (!updated) {
      throw new Error("Client not found");
    }

    return updated;
  },
});
