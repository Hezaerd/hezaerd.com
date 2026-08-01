import { v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { operatorMutation, operatorQuery } from "./lib/functions";
import { assertClientAccess } from "./lib/users";

const analyticsSiteForDeskValidator = v.object({
  siteKey: v.string(),
  ingestSecret: v.string(),
  productionUrl: v.string(),
});

type DbCtx = QueryCtx | MutationCtx;

async function loadAnalyticsSiteForDesk(ctx: DbCtx, clientId: Id<"clients">) {
  const site = await ctx.db
    .query("analyticsSites")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();

  if (!site) {
    return null;
  }

  return {
    siteKey: site.siteKey,
    ingestSecret: site.ingestSecret ?? "",
    productionUrl: site.productionUrl,
  };
}

/** Operator Desk Statistiques — read analytics site credentials for a client. */
export const getSiteForDesk = operatorQuery({
  args: { slug: v.string() },
  returns: v.union(v.null(), analyticsSiteForDeskValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!client.linkedSite) {
      return null;
    }
    return loadAnalyticsSiteForDesk(ctx, client._id);
  },
});

/** Ensure analyticsSites row exists when client has linkedSite (idempotent). */
export const ensureSiteForDesk = operatorMutation({
  args: { slug: v.string() },
  returns: v.union(v.null(), analyticsSiteForDeskValidator),
  handler: async (ctx, args) => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!client.linkedSite) {
      return null;
    }

    await ctx.runMutation(internal.analyticsSites.syncForClient, {
      clientId: client._id,
      linkedSite: client.linkedSite,
    });

    const site = await loadAnalyticsSiteForDesk(ctx, client._id);
    if (!site) {
      throw new Error("Impossible de créer le site analytics");
    }
    return site;
  },
});

/** Operator Desk — rotate siteKey + ingestSecret for a linked client site. */
export const rotateSiteKeys = operatorMutation({
  args: { slug: v.string() },
  returns: analyticsSiteForDeskValidator,
  handler: async (ctx, args): Promise<{
    siteKey: string;
    ingestSecret: string;
    productionUrl: string;
  }> => {
    const client = await assertClientAccess(ctx, ctx.user, args.slug);
    if (!client.linkedSite) {
      throw new Error("Aucun site lié");
    }

    const credentials: { siteKey: string; ingestSecret: string } = await ctx.runMutation(
      internal.analyticsSites.rotateSiteKey,
      {
        clientId: client._id,
      },
    );

    const site = await ctx.db
      .query("analyticsSites")
      .withIndex("by_clientId", (q) => q.eq("clientId", client._id))
      .unique();

    if (!site) {
      throw new Error("Site analytics introuvable");
    }

    return {
      siteKey: credentials.siteKey,
      ingestSecret: credentials.ingestSecret,
      productionUrl: site.productionUrl,
    };
  },
});
