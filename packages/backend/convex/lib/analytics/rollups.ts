import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { SourceKind } from "./constants";
import { buildRouteKey } from "./paths";

export async function incrementDailyTotals(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  delta: { pageviews: number; visitors: number },
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailyTotals")
    .withIndex("by_clientId_and_dayKey", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      pageviews: existing.pageviews + delta.pageviews,
      visitors: existing.visitors + delta.visitors,
    });
    return;
  }

  await ctx.db.insert("analyticsDailyTotals", {
    clientId,
    dayKey,
    pageviews: delta.pageviews,
    visitors: delta.visitors,
  });
}

export async function incrementDailyPageViews(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  path: string,
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailyPages")
    .withIndex("by_clientId_dayKey_path", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("path", path),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { views: existing.views + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailyPages", {
    clientId,
    dayKey,
    path,
    views: 1,
    entries: 0,
    exits: 0,
  });
}

export async function incrementDailyPageEntries(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  path: string,
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailyPages")
    .withIndex("by_clientId_dayKey_path", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("path", path),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { entries: existing.entries + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailyPages", {
    clientId,
    dayKey,
    path,
    views: 0,
    entries: 1,
    exits: 0,
  });
}

export async function incrementDailyPageExits(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  path: string,
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailyPages")
    .withIndex("by_clientId_dayKey_path", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("path", path),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { exits: existing.exits + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailyPages", {
    clientId,
    dayKey,
    path,
    views: 0,
    entries: 0,
    exits: 1,
  });
}

export async function incrementDailySource(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  sourceKind: SourceKind,
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailySources")
    .withIndex("by_clientId_dayKey_sourceKind", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("sourceKind", sourceKind),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { views: existing.views + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailySources", {
    clientId,
    dayKey,
    sourceKind,
    views: 1,
  });
}

export async function incrementDailyRoute(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  paths: string[],
): Promise<void> {
  const routeKey = buildRouteKey(paths);
  const existing = await ctx.db
    .query("analyticsDailyRoutes")
    .withIndex("by_clientId_dayKey_routeKey", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("routeKey", routeKey),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { views: existing.views + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailyRoutes", {
    clientId,
    dayKey,
    routeKey,
    views: 1,
  });
}

export async function incrementDailyEvent(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  eventName: string,
): Promise<void> {
  const existing = await ctx.db
    .query("analyticsDailyEvents")
    .withIndex("by_clientId_dayKey_eventName", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("eventName", eventName),
    )
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return;
  }

  await ctx.db.insert("analyticsDailyEvents", {
    clientId,
    dayKey,
    eventName,
    count: 1,
  });
}

export async function recordUniqueVisitor(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  dayKey: string,
  visitorHash: string,
): Promise<boolean> {
  const existing = await ctx.db
    .query("analyticsVisitorDays")
    .withIndex("by_clientId_dayKey_visitorHash", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("visitorHash", visitorHash),
    )
    .unique();

  if (existing) {
    return false;
  }

  await ctx.db.insert("analyticsVisitorDays", {
    clientId,
    dayKey,
    visitorHash,
  });
  return true;
}

export async function processSessionPath(
  ctx: MutationCtx,
  input: {
    clientId: Id<"clients">;
    dayKey: string;
    visitorHash: string;
    path: string;
    now: number;
  },
): Promise<void> {
  const { clientId, dayKey, visitorHash, path, now } = input;
  const existingSession = await ctx.db
    .query("analyticsSessions")
    .withIndex("by_clientId_dayKey_visitorHash", (q) =>
      q.eq("clientId", clientId).eq("dayKey", dayKey).eq("visitorHash", visitorHash),
    )
    .unique();

  const sessionGapMs = 30 * 60 * 1000;

  if (existingSession && now - existingSession.lastSeenAt <= sessionGapMs) {
    const lastPath = existingSession.paths[existingSession.paths.length - 1];
    if (lastPath === path) {
      await ctx.db.patch(existingSession._id, { lastSeenAt: now });
      return;
    }

    const newPaths = [...existingSession.paths, path];
    await ctx.db.patch(existingSession._id, {
      paths: newPaths,
      lastPath: path,
      lastSeenAt: now,
    });

    if (newPaths.length === 2 || newPaths.length === 3) {
      await incrementDailyRoute(ctx, clientId, dayKey, newPaths);
    }
    return;
  }

  if (existingSession) {
    await incrementDailyPageExits(ctx, clientId, dayKey, existingSession.lastPath);
    await ctx.db.delete(existingSession._id);
  }

  await ctx.db.insert("analyticsSessions", {
    clientId,
    dayKey,
    visitorHash,
    paths: [path],
    firstPath: path,
    lastPath: path,
    lastSeenAt: now,
  });
  await incrementDailyPageEntries(ctx, clientId, dayKey, path);
}
