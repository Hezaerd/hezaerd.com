// @ts-nocheck — Marion service actions; Convex validator depth exceeds tsc budget.
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { insightsPeriodValidator } from "./lib/analytics/period";
import { assertMarionServiceSecret } from "./lib/marion/auth";
import {
  getClientBySlugForMarion,
  getInsightsForMarion,
  getLinkedSiteForMarion,
  listAllClients,
  listFilesDeskForMarion,
  listInvoicesForMarion,
  listWaitingOnClientForSlug,
  listWaitingOnClientGlobal,
  listWaitingOnOperatorForSlug,
  listWaitingOnOperatorGlobal,
  loadCockpitStats,
} from "./lib/marion/deskRead";

const serviceSecretArg = { serviceSecret: v.string() };

function authArgs(args: { serviceSecret: string }) {
  assertMarionServiceSecret(args.serviceSecret);
}

export const listClients = action({
  args: serviceSecretArg,
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.listClientsQuery, {});
  },
});

export const listClientsQuery = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => listAllClients(ctx),
});

export const getClient = action({
  args: { ...serviceSecretArg, slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.getClientQuery, { slug: args.slug });
  },
});

export const getClientQuery = internalQuery({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => getClientBySlugForMarion(ctx, args.slug),
});

export const getCockpitStats = action({
  args: serviceSecretArg,
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.cockpitStatsQuery, {});
  },
});

export const cockpitStatsQuery = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => loadCockpitStats(ctx),
});

export const listWaitingOnClient = action({
  args: { ...serviceSecretArg, slug: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    if (args.slug) {
      return ctx.runQuery(internal.marionRead.waitingOnClientBySlugQuery, { slug: args.slug });
    }
    return ctx.runQuery(internal.marionRead.waitingOnClientGlobalQuery, {});
  },
});

export const waitingOnClientGlobalQuery = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => listWaitingOnClientGlobal(ctx),
});

export const waitingOnClientBySlugQuery = internalQuery({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => listWaitingOnClientForSlug(ctx, args.slug),
});

export const listWaitingOnOperator = action({
  args: { ...serviceSecretArg, slug: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    if (args.slug) {
      return ctx.runQuery(internal.marionRead.waitingOnOperatorBySlugQuery, { slug: args.slug });
    }
    return ctx.runQuery(internal.marionRead.waitingOnOperatorGlobalQuery, {});
  },
});

export const waitingOnOperatorGlobalQuery = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => listWaitingOnOperatorGlobal(ctx),
});

export const waitingOnOperatorBySlugQuery = internalQuery({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => listWaitingOnOperatorForSlug(ctx, args.slug),
});

export const listInvoices = action({
  args: { ...serviceSecretArg, slug: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.listInvoicesQuery, { slug: args.slug });
  },
});

export const listInvoicesQuery = internalQuery({
  args: { slug: v.optional(v.string()) },
  returns: v.any(),
  handler: async (ctx, args) => listInvoicesForMarion(ctx, args.slug),
});

export const listFiles = action({
  args: { ...serviceSecretArg, slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.listFilesQuery, { slug: args.slug });
  },
});

export const listFilesQuery = internalQuery({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => listFilesDeskForMarion(ctx, args.slug),
});

export const getInsights = action({
  args: {
    ...serviceSecretArg,
    slug: v.string(),
    period: insightsPeriodValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.getInsightsQuery, {
      slug: args.slug,
      period: args.period,
    });
  },
});

export const getInsightsQuery = internalQuery({
  args: { slug: v.string(), period: insightsPeriodValidator },
  returns: v.any(),
  handler: async (ctx, args) => getInsightsForMarion(ctx, args.slug, args.period),
});

export const getLinkedSite = action({
  args: { ...serviceSecretArg, slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    return ctx.runQuery(internal.marionRead.getLinkedSiteQuery, { slug: args.slug });
  },
});

export const getLinkedSiteQuery = internalQuery({
  args: { slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => getLinkedSiteForMarion(ctx, args.slug),
});

export const checkLinkedSiteHealth = action({
  args: { ...serviceSecretArg, slug: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const site = await ctx.runQuery(internal.marionRead.getLinkedSiteQuery, { slug: args.slug });
    if (!site) {
      return null;
    }

    const start = Date.now();
    try {
      let response = await fetch(site.productionUrl, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 405 || response.status === 501) {
        response = await fetch(site.productionUrl, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(10_000),
        });
      }
      return {
        ok: response.ok,
        statusCode: response.status,
        latencyMs: Date.now() - start,
      };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  },
});

export const getDigestSnapshot = action({
  args: serviceSecretArg,
  returns: v.any(),
  handler: async (ctx, args) => {
    authArgs(args);
    const [cockpit, waitingOnClient, waitingOnOperator] = await Promise.all([
      ctx.runQuery(internal.marionRead.cockpitStatsQuery, {}),
      ctx.runQuery(internal.marionRead.waitingOnClientGlobalQuery, {}),
      ctx.runQuery(internal.marionRead.waitingOnOperatorGlobalQuery, {}),
    ]);
    return { cockpit, waitingOnClient, waitingOnOperator };
  },
});

export const registerDmChannel = mutation({
  args: {
    serviceSecret: v.string(),
    discordUserId: v.string(),
    dmChannelId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertMarionServiceSecret(args.serviceSecret);
    const existing = await ctx.db
      .query("marionOperatorState")
      .withIndex("by_key", (q) => q.eq("key", "operator"))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        discordUserId: args.discordUserId,
        dmChannelId: args.dmChannelId,
      });
    } else {
      await ctx.db.insert("marionOperatorState", {
        key: "operator",
        discordUserId: args.discordUserId,
        dmChannelId: args.dmChannelId,
        pingsToday: 0,
        pingsDayKey: "",
      });
    }
    return null;
  },
});

export const getOperatorState = query({
  args: { serviceSecret: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertMarionServiceSecret(args.serviceSecret);
    const state = await ctx.db
      .query("marionOperatorState")
      .withIndex("by_key", (q) => q.eq("key", "operator"))
      .unique();
    if (!state) {
      return null;
    }
    return {
      dmChannelId: state.dmChannelId,
      pingsToday: state.pingsToday,
      pingsDayKey: state.pingsDayKey,
      lastDigestAt: state.lastDigestAt,
    };
  },
});

export const recordProactivePing = internalMutation({
  args: { dayKey: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const MAX_PINGS = 3;
    let state = await ctx.db
      .query("marionOperatorState")
      .withIndex("by_key", (q) => q.eq("key", "operator"))
      .unique();

    if (!state) {
      const id = await ctx.db.insert("marionOperatorState", {
        key: "operator",
        pingsToday: 0,
        pingsDayKey: args.dayKey,
      });
      state = (await ctx.db.get("marionOperatorState", id))!;
    }

    const pingsToday = state.pingsDayKey === args.dayKey ? state.pingsToday : 0;
    if (pingsToday >= MAX_PINGS) {
      return { allowed: false, pingsToday };
    }

    await ctx.db.patch(state._id, {
      pingsToday: pingsToday + 1,
      pingsDayKey: args.dayKey,
    });
    return { allowed: true, pingsToday: pingsToday + 1 };
  },
});

export const recordDigestSent = internalMutation({
  args: { at: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("marionOperatorState")
      .withIndex("by_key", (q) => q.eq("key", "operator"))
      .unique();
    if (state) {
      await ctx.db.patch(state._id, { lastDigestAt: args.at });
    }
    return null;
  },
});
