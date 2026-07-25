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
    return clients.toSorted((a, b) => a.name.localeCompare(b.name, "fr"));
  },
});

/** Practice Cockpit tile values. Money and waiting counts are zero until Invoices ship. */
export const stats = operatorQuery({
  args: {},
  returns: cockpitStatsValidator,
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    return {
      openInvoiceTotal: 0,
      paidThisMonth: 0,
      clientsWaiting: 0,
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
