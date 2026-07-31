import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { generateSiteKey } from "./lib/analytics/siteKey";

/** Create, update, or remove analyticsSites when linkedSite changes. */
export const syncForClient = internalMutation({
  args: {
    clientId: v.id("clients"),
    linkedSite: v.optional(
      v.object({
        productionUrl: v.string(),
        githubRepo: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("analyticsSites")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();

    if (!args.linkedSite) {
      if (existing) {
        await ctx.db.delete(existing._id);
      }
      return null;
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        productionUrl: args.linkedSite.productionUrl,
      });
      return null;
    }

    await ctx.db.insert("analyticsSites", {
      clientId: args.clientId,
      siteKey: generateSiteKey(),
      productionUrl: args.linkedSite.productionUrl,
    });
    return null;
  },
});

/** Operator-only: invalidate current siteKey and issue a new one. */
export const rotateSiteKey = internalMutation({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("analyticsSites")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();

    if (!existing) {
      throw new Error("No analytics site for client");
    }

    const siteKey = generateSiteKey();
    await ctx.db.patch(existing._id, { siteKey });
    return siteKey;
  },
});
