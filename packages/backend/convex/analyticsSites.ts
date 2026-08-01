import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import { isAllowedRequestOrigin } from "./lib/analytics/origin";
import {
  generateAnalyticsCredential,
  generateSiteKey,
} from "./lib/analytics/siteKey";

function createAnalyticsCredentials() {
  return {
    siteKey: generateSiteKey(),
    ingestSecret: generateAnalyticsCredential(),
  };
}

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
      const patch: { productionUrl: string; ingestSecret?: string } = {
        productionUrl: args.linkedSite.productionUrl,
      };
      if (!existing.ingestSecret) {
        patch.ingestSecret = generateAnalyticsCredential();
      }
      await ctx.db.patch(existing._id, patch);
      return null;
    }

    const credentials = createAnalyticsCredentials();
    await ctx.db.insert("analyticsSites", {
      clientId: args.clientId,
      siteKey: credentials.siteKey,
      ingestSecret: credentials.ingestSecret,
      productionUrl: args.linkedSite.productionUrl,
    });
    return null;
  },
});

/** True when Origin matches any registered analytics site production URL. */
export const isKnownOrigin = internalQuery({
  args: { origin: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const sites = await ctx.db.query("analyticsSites").collect();
    for (const site of sites) {
      if (isAllowedRequestOrigin(site.productionUrl, args.origin, null)) {
        return true;
      }
    }
    return false;
  },
});

/** True when Origin matches the siteKey's linked production URL. */
export const isOriginAllowedForSiteKey = internalQuery({
  args: {
    siteKey: v.string(),
    origin: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("analyticsSites")
      .withIndex("by_siteKey", (q) => q.eq("siteKey", args.siteKey))
      .unique();

    if (!site) {
      return false;
    }

    return isAllowedRequestOrigin(site.productionUrl, args.origin, null);
  },
});

/** Rotate public siteKey and private ingestSecret (internal — use analytics.rotateSiteKeys). */
export const rotateSiteKey = internalMutation({
  args: {
    clientId: v.id("clients"),
  },
  returns: v.object({
    siteKey: v.string(),
    ingestSecret: v.string(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("analyticsSites")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .unique();

    if (!existing) {
      throw new Error("No analytics site for client");
    }

    const credentials = createAnalyticsCredentials();
    await ctx.db.patch(existing._id, credentials);
    return credentials;
  },
});
