import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { SESSION_GAP_MS } from "./lib/analytics/constants";
import { getVisitorDayRetentionCutoff } from "./lib/analytics/dayKey";

/** Delete expired active sessions (lastSeenAt older than session gap). */
export const purgeStaleSessions = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const cutoff = Date.now() - SESSION_GAP_MS;
    const stale = await ctx.db
      .query("analyticsSessions")
      .withIndex("by_lastSeenAt", (q) => q.lt("lastSeenAt", cutoff))
      .collect();

    for (const row of stale) {
      await ctx.db.delete(row._id);
    }

    return { deleted: stale.length };
  },
});

/** Delete visitor-day rows older than the retention window (ADR: dayKey < today − 2). */
export const purgeOldVisitorDays = internalMutation({
  args: {},
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx) => {
    const cutoffDayKey = getVisitorDayRetentionCutoff();
    const expired = await ctx.db
      .query("analyticsVisitorDays")
      .withIndex("by_dayKey", (q) => q.lt("dayKey", cutoffDayKey))
      .collect();

    for (const row of expired) {
      await ctx.db.delete(row._id);
    }

    return { deleted: expired.length };
  },
});
