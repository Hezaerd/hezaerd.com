import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { getDayKey } from "./lib/analytics/dayKey";
import { extractHostname, isAllowedRequestOrigin } from "./lib/analytics/origin";
import { isValidEventName, splitPathAndSearch } from "./lib/analytics/paths";
import {
  incrementDailyEvent,
  incrementDailyPageViews,
  incrementDailySource,
  incrementDailySourceDetail,
  incrementDailyTotals,
  processSessionPath,
  recordUniqueVisitor,
} from "./lib/analytics/rollups";
import { classifySourceKind } from "./lib/analytics/sourceKind";
import { resolveSourceDetail } from "./lib/analytics/sourceDetail";
import { secretsEqual } from "./lib/analytics/secrets";
import { computeVisitorHash, isBotUserAgent, truncateIp } from "./lib/analytics/visitor";

const collectArgs = {
  siteKey: v.string(),
  path: v.string(),
  referrer: v.optional(v.string()),
  event: v.optional(v.string()),
  userAgent: v.string(),
  origin: v.optional(v.string()),
  refererHeader: v.optional(v.string()),
  ip: v.string(),
};

function getAnalyticsHashSecret(): string | null {
  const secret = process.env.ANALYTICS_HASH_SECRET?.trim();
  return secret || null;
}

/** Ingest one beacon hit. Invalid or rejected hits are no-ops. */
export const ingest = internalMutation({
  args: collectArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("analyticsSites")
      .withIndex("by_siteKey", (q) => q.eq("siteKey", args.siteKey))
      .unique();

    if (!site) {
      return null;
    }

    if (
      !isAllowedRequestOrigin(site.productionUrl, args.origin, args.refererHeader)
    ) {
      return null;
    }

    if (isBotUserAgent(args.userAgent)) {
      return null;
    }

    const hashSecret = getAnalyticsHashSecret();
    if (!hashSecret) {
      console.error("ANALYTICS_HASH_SECRET is not configured");
      return null;
    }

    const dayKey = getDayKey();
    const { path, search } = splitPathAndSearch(args.path);
    const truncatedIp = truncateIp(args.ip);
    const visitorHash = await computeVisitorHash(
      hashSecret,
      args.siteKey,
      dayKey,
      truncatedIp,
      args.userAgent,
    );

    if (args.event) {
      if (!isValidEventName(args.event)) {
        return null;
      }

      const client = await ctx.db.get("clients", site.clientId);
      if (!client?.features.insights) {
        return null;
      }

      await incrementDailyEvent(ctx, site.clientId, dayKey, args.event);
      return null;
    }

    const isNewVisitor = await recordUniqueVisitor(
      ctx,
      site.clientId,
      dayKey,
      visitorHash,
    );

    const { countPageview } = await processSessionPath(ctx, {
      clientId: site.clientId,
      dayKey,
      visitorHash,
      path,
      now: Date.now(),
    });

    if (!countPageview) {
      return null;
    }

    const siteHost = extractHostname(site.productionUrl) ?? "";
    const sourceKind = classifySourceKind({
      referrer: args.referrer,
      search,
      siteHost,
    });
    const sourceDetail = resolveSourceDetail({
      referrer: args.referrer,
      search,
      siteHost,
      sourceKind,
    });

    await incrementDailyTotals(ctx, site.clientId, dayKey, {
      pageviews: 1,
      visitors: isNewVisitor ? 1 : 0,
    });
    await incrementDailyPageViews(ctx, site.clientId, dayKey, path);
    await incrementDailySource(ctx, site.clientId, dayKey, sourceKind);
    if (sourceDetail) {
      await incrementDailySourceDetail(
        ctx,
        site.clientId,
        dayKey,
        sourceKind,
        sourceDetail,
      );
    }

    return null;
  },
});

const serverCollectArgs = {
  siteKey: v.string(),
  ingestSecret: v.string(),
  event: v.string(),
  path: v.optional(v.string()),
};

/** Ingest one server-side custom event. Invalid or rejected hits are no-ops. */
export const ingestServer = internalMutation({
  args: serverCollectArgs,
  returns: v.null(),
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("analyticsSites")
      .withIndex("by_siteKey", (q) => q.eq("siteKey", args.siteKey))
      .unique();

    if (!site?.ingestSecret || !secretsEqual(site.ingestSecret, args.ingestSecret)) {
      return null;
    }

    if (!isValidEventName(args.event)) {
      return null;
    }

    const client = await ctx.db.get("clients", site.clientId);
    if (!client?.features.insights) {
      return null;
    }

    const dayKey = getDayKey();
    await incrementDailyEvent(ctx, site.clientId, dayKey, args.event);
    return null;
  },
});
