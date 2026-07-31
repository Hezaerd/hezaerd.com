import { v, type Infer } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { authedQuery, operatorMutation, operatorQuery } from "./lib/functions";
import { cascadeDeleteClient } from "./lib/clientCascade";
import {
  assertUniqueContactEmail,
  assertUniqueSlug,
  getClientBySlug,
  normalizeEmail,
  normalizeSlug,
  toClientResponse,
} from "./lib/clients";
import { validateClientFileSettings } from "./lib/fileSettings";
import { linkedSiteValidator, validateLinkedSiteInput } from "./lib/linkedSite";
import { assertClientAccess, isOperatorEmail } from "./lib/users";

const featuresValidator = v.object({
  insights: v.boolean(),
});

export const clientValidator = v.object({
  _id: v.id("clients"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  contactEmail: v.string(),
  features: featuresValidator,
  fileSettings: v.optional(
    v.object({
      defaultMaxFileSizeMb: v.number(),
      uploadPresignTtlHours: v.number(),
      downloadPresignTtlMinutes: v.number(),
    }),
  ),
  linkedSite: v.optional(linkedSiteValidator),
});

type ClientResponse = Infer<typeof clientValidator>;

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
    return [...clients].sort((a, b) => a.name.localeCompare(b.name, "fr")).map(toClientResponse);
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

    const clientsWaiting = clientsWaitingSet.size;

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
      return toClientResponse(client);
    }

    if (ctx.user.role === "client") {
      if (ctx.user.clientId !== client._id) {
        throw new Error("Unauthorized: You don't have access to this Client");
      }
      return toClientResponse(client);
    }

    return null;
  },
});

/** Insert a Client record (internal). Features default off. */
export const insert = internalMutation({
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
      },
    });

    const client = await ctx.db.get("clients", clientId);
    if (!client) {
      throw new Error("Client not found");
    }

    return toClientResponse(client);
  },
});

/** Roll back a Client insert when the WorkOS invite fails. */
export const remove = internalMutation({
  args: { clientId: v.id("clients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clientId);
    return null;
  },
});

/** Persist the WorkOS invitation id after a successful send. */
export const setWorkosInvitationId = internalMutation({
  args: {
    clientId: v.id("clients"),
    workosInvitationId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clientId, {
      workosInvitationId: args.workosInvitationId,
    });
    return null;
  },
});

/** Client + invite metadata for WorkOS actions. */
export const getForInviteInternal = internalQuery({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("clients"),
      slug: v.string(),
      contactEmail: v.string(),
      workosInvitationId: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const client = await getClientBySlug(ctx, args.slug);
    if (!client) {
      return null;
    }

    return {
      _id: client._id,
      slug: client.slug,
      contactEmail: client.contactEmail,
      workosInvitationId: client.workosInvitationId,
    };
  },
});

/** Bound Client seat, if any. */
export const getSeatUser = internalQuery({
  args: { clientId: v.id("clients") },
  returns: v.union(
    v.object({
      authId: v.string(),
      name: v.string(),
      email: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const seat = await ctx.db
      .query("users")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();
    if (!seat) {
      return null;
    }

    return {
      authId: seat.authId,
      name: seat.name,
      email: seat.email,
    };
  },
});

/** Remove a Client and all dependent Portal rows (invoices, bound user). */
export const cascadeDelete = internalMutation({
  args: { clientId: v.id("clients") },
  returns: v.object({ deletedAuthId: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    return await cascadeDeleteClient(ctx, args.clientId);
  },
});

/**
 * Delete a Client (Operator): revoke pending invite, cascade Portal data,
 * then delete the WorkOS user so AuthKit webhooks stay in sync.
 */
export const deleteClient = action({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const operator = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });
    if (!operator || operator.role !== "operator") {
      throw new Error("Unauthorized: Operator access required");
    }

    const client = await ctx.runQuery(internal.clients.getForInviteInternal, {
      slug: args.slug,
    });
    if (!client) {
      throw new Error("Client not found");
    }

    await ctx.runAction(internal.clientInvites.revokePendingIfNeeded, {
      email: client.contactEmail,
      workosInvitationId: client.workosInvitationId,
    });

    const { deletedAuthId } = await ctx.runMutation(internal.clients.cascadeDelete, {
      clientId: client._id,
    });

    if (deletedAuthId) {
      await ctx.runAction(internal.clientInvites.deleteWorkosUser, {
        authId: deletedAuthId,
      });
    }

    return null;
  },
});

/**
 * Create a Client (Operator) and send a WorkOS invitation to `contactEmail`
 * so they can register while signup is disabled.
 */
export const create = action({
  args: {
    name: v.string(),
    slug: v.string(),
    contactEmail: v.string(),
  },
  returns: clientValidator,
  handler: async (ctx, args): Promise<ClientResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(internal.users.getByAuthId, {
      authId: identity.subject,
    });
    if (!user || user.role !== "operator") {
      throw new Error("Unauthorized: Operator access required");
    }

    const client: ClientResponse = await ctx.runMutation(internal.clients.insert, args);

    if (!isOperatorEmail(client.contactEmail)) {
      try {
        const invitationId = await ctx.runAction(internal.clientInvites.send, {
          email: client.contactEmail,
          inviterUserId: user.authId,
        });
        await ctx.runMutation(internal.clients.setWorkosInvitationId, {
          clientId: client._id,
          workosInvitationId: invitationId,
        });
      } catch (error) {
        await ctx.runMutation(internal.clients.remove, { clientId: client._id });
        const detail = error instanceof Error ? error.message : "Erreur WorkOS";
        throw new Error(`Impossible d'envoyer l'invitation : ${detail}`);
      }
    }

    return toClientResponse(client);
  },
});

/** Toggle a Client Feature (Operator). */
export const setFeature = operatorMutation({
  args: {
    slug: v.string(),
    feature: v.literal("insights"),
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

    return toClientResponse(updated);
  },
});

/** Update linked public site (Operator). Empty URL clears the link. */
export const updateLinkedSite = operatorMutation({
  args: {
    slug: v.string(),
    productionUrl: v.string(),
    githubRepo: v.optional(v.string()),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const linkedSite = validateLinkedSiteInput({
      productionUrl: args.productionUrl,
      githubRepo: args.githubRepo,
    });

    await ctx.db.patch(client._id, { linkedSite });
    await ctx.runMutation(internal.analyticsSites.syncForClient, {
      clientId: client._id,
      linkedSite,
    });

    const updated = await ctx.db.get("clients", client._id);
    if (!updated) {
      throw new Error("Client not found");
    }
    return toClientResponse(updated);
  },
});

/** Update Client file defaults (Operator). */
export const updateFileSettings = operatorMutation({
  args: {
    slug: v.string(),
    defaultMaxFileSizeMb: v.number(),
    uploadPresignTtlHours: v.number(),
    downloadPresignTtlMinutes: v.number(),
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    const fileSettings = validateClientFileSettings({
      defaultMaxFileSizeMb: args.defaultMaxFileSizeMb,
      uploadPresignTtlHours: args.uploadPresignTtlHours,
      downloadPresignTtlMinutes: args.downloadPresignTtlMinutes,
    });

    await ctx.db.patch(client._id, { fileSettings });

    const updated = await ctx.db.get("clients", client._id);
    if (!updated) {
      throw new Error("Client not found");
    }
    return toClientResponse(updated);
  },
});
