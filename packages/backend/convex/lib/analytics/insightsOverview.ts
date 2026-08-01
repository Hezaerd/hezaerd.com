import { v, type Infer } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { QueryCtx } from "../../_generated/server";
import { sourceKindValidator } from "./constants";
import { extractHostname } from "./origin";
import { enumerateDayKeys, getPeriodBounds, getPreviousPeriodBounds, insightsPeriodValidator } from "./period";
import type { InsightsPeriod } from "./period";

const trafficDayPointValidator = v.object({
  dayKey: v.string(),
  pageviews: v.number(),
  visitors: v.number(),
});

const insightsEventsValidator = v.object({
  items: v.array(
    v.object({
      eventName: v.string(),
      count: v.number(),
    }),
  ),
  otherCount: v.number(),
});

export const insightsOverviewValidator = v.object({
  period: insightsPeriodValidator,
  startDayKey: v.string(),
  endDayKey: v.string(),
  todayDayKey: v.string(),
  siteHost: v.string(),
  traffic: v.object({
    series: v.array(trafficDayPointValidator),
    totals: v.object({
      pageviews: v.number(),
      visitors: v.number(),
    }),
    visitorsToday: v.number(),
    comparison: v.object({
      previousVisitors: v.number(),
      deltaPercent: v.union(v.number(), v.null()),
    }),
  }),
  sources: v.array(
    v.object({
      sourceKind: sourceKindValidator,
      views: v.number(),
    }),
  ),
  sourceDetails: v.array(
    v.object({
      sourceKind: sourceKindValidator,
      sourceDetail: v.string(),
      views: v.number(),
    }),
  ),
  topPages: v.array(
    v.object({
      path: v.string(),
      views: v.number(),
    }),
  ),
  landings: v.array(
    v.object({
      path: v.string(),
      entries: v.number(),
    }),
  ),
  exits: v.array(
    v.object({
      path: v.string(),
      exits: v.number(),
    }),
  ),
  routes: v.array(
    v.object({
      routeKey: v.string(),
      views: v.number(),
    }),
  ),
  events: v.union(v.null(), insightsEventsValidator),
});

export type InsightsOverview = Infer<typeof insightsOverviewValidator>;

function topBy<T>(items: T[], pick: (item: T) => number, limit: number): T[] {
  return [...items].sort((a, b) => pick(b) - pick(a)).slice(0, limit);
}

function aggregateEvents(
  rows: { eventName: string; count: number }[],
): Infer<typeof insightsEventsValidator> {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.eventName, (totals.get(row.eventName) ?? 0) + row.count);
  }

  const sorted = [...totals.entries()]
    .map(([eventName, count]) => ({ eventName, count }))
    .sort((a, b) => b.count - a.count);

  const items = sorted.slice(0, 20);
  const otherCount = sorted.slice(20).reduce((sum, row) => sum + row.count, 0);
  return { items, otherCount };
}

function aggregateVisitorsForRange(
  rows: { dayKey: string; visitors: number }[],
  startDayKey: string,
  endDayKey: string,
): number {
  return rows
    .filter((row) => row.dayKey >= startDayKey && row.dayKey <= endDayKey)
    .reduce((sum, row) => sum + row.visitors, 0);
}

function computeDeltaPercent(current: number, previous: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export async function loadInsightsOverview(
  ctx: QueryCtx,
  clientId: Id<"clients">,
  period: InsightsPeriod,
  options: { includeEvents: boolean },
): Promise<InsightsOverview> {
  const { startDayKey, endDayKey, todayDayKey } = getPeriodBounds(period);
  const previousBounds = getPreviousPeriodBounds(period);
  const dayKeys = enumerateDayKeys(startDayKey, endDayKey);

  const site = await ctx.db
    .query("analyticsSites")
    .withIndex("by_clientId", (q) => q.eq("clientId", clientId))
    .unique();
  const siteHost = site ? (extractHostname(site.productionUrl) ?? "") : "";

  const queryStartDayKey =
    previousBounds.startDayKey < startDayKey ? previousBounds.startDayKey : startDayKey;

  const [totalsRows, pagesRows, sourcesRows, sourceDetailRows, routesRows, eventsRows] =
    await Promise.all([
    ctx.db
      .query("analyticsDailyTotals")
      .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(q.gte(q.field("dayKey"), queryStartDayKey), q.lte(q.field("dayKey"), endDayKey)),
      )
      .collect(),
    ctx.db
      .query("analyticsDailyPages")
      .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(q.gte(q.field("dayKey"), startDayKey), q.lte(q.field("dayKey"), endDayKey)),
      )
      .collect(),
    ctx.db
      .query("analyticsDailySources")
      .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(q.gte(q.field("dayKey"), startDayKey), q.lte(q.field("dayKey"), endDayKey)),
      )
      .collect(),
    ctx.db
      .query("analyticsDailySourceDetails")
      .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(q.gte(q.field("dayKey"), startDayKey), q.lte(q.field("dayKey"), endDayKey)),
      )
      .collect(),
    ctx.db
      .query("analyticsDailyRoutes")
      .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
      .filter((q) =>
        q.and(q.gte(q.field("dayKey"), startDayKey), q.lte(q.field("dayKey"), endDayKey)),
      )
      .collect(),
    options.includeEvents
      ? ctx.db
          .query("analyticsDailyEvents")
          .withIndex("by_clientId_and_dayKey", (q) => q.eq("clientId", clientId))
          .filter((q) =>
            q.and(q.gte(q.field("dayKey"), startDayKey), q.lte(q.field("dayKey"), endDayKey)),
          )
          .collect()
      : Promise.resolve([]),
  ]);

  const totalsByDay = new Map(totalsRows.map((row) => [row.dayKey, row]));
  const series = dayKeys.map((dayKey) => {
    const row = totalsByDay.get(dayKey);
    return {
      dayKey,
      pageviews: row?.pageviews ?? 0,
      visitors: row?.visitors ?? 0,
    };
  });

  const totals = series.reduce(
    (acc, day) => ({
      pageviews: acc.pageviews + day.pageviews,
      visitors: acc.visitors + day.visitors,
    }),
    { pageviews: 0, visitors: 0 },
  );

  const previousVisitors = aggregateVisitorsForRange(
    totalsRows,
    previousBounds.startDayKey,
    previousBounds.endDayKey,
  );
  const deltaPercent = computeDeltaPercent(totals.visitors, previousVisitors);

  const sourcesMap = new Map<string, number>();
  for (const row of sourcesRows) {
    sourcesMap.set(row.sourceKind, (sourcesMap.get(row.sourceKind) ?? 0) + row.views);
  }
  const sources = topBy(
    [...sourcesMap.entries()]
      .filter(([, views]) => views > 0)
      .map(([sourceKind, views]) => ({
        sourceKind: sourceKind as Infer<typeof sourceKindValidator>,
        views,
      })),
    (row) => row.views,
    Number.POSITIVE_INFINITY,
  );

  const sourceDetailsMap = new Map<string, { sourceKind: string; sourceDetail: string; views: number }>();
  for (const row of sourceDetailRows) {
    const key = `${row.sourceKind}\0${row.sourceDetail}`;
    const existing = sourceDetailsMap.get(key);
    if (existing) {
      existing.views += row.views;
    } else {
      sourceDetailsMap.set(key, {
        sourceKind: row.sourceKind,
        sourceDetail: row.sourceDetail,
        views: row.views,
      });
    }
  }
  const sourceDetails = topBy(
    [...sourceDetailsMap.values()]
      .filter((row) => row.views > 0)
      .map((row) => ({
        sourceKind: row.sourceKind as Infer<typeof sourceKindValidator>,
        sourceDetail: row.sourceDetail,
        views: row.views,
      })),
    (row) => row.views,
    10,
  );

  const pagesMap = new Map<string, { views: number; entries: number; exits: number }>();
  for (const row of pagesRows) {
    const existing = pagesMap.get(row.path) ?? { views: 0, entries: 0, exits: 0 };
    pagesMap.set(row.path, {
      views: existing.views + row.views,
      entries: existing.entries + row.entries,
      exits: existing.exits + row.exits,
    });
  }

  const pageStats = [...pagesMap.entries()].map(([path, stats]) => ({ path, ...stats }));

  const routesMap = new Map<string, number>();
  for (const row of routesRows) {
    routesMap.set(row.routeKey, (routesMap.get(row.routeKey) ?? 0) + row.views);
  }

  return {
    period,
    startDayKey,
    endDayKey,
    todayDayKey,
    siteHost,
    traffic: {
      series,
      totals,
      visitorsToday: totalsByDay.get(todayDayKey)?.visitors ?? 0,
      comparison: {
        previousVisitors,
        deltaPercent,
      },
    },
    sources,
    sourceDetails,
    topPages: topBy(
      pageStats.filter(({ views }) => views > 0).map(({ path, views }) => ({ path, views })),
      (row) => row.views,
      5,
    ),
    landings: topBy(
      pageStats.filter(({ entries }) => entries > 0).map(({ path, entries }) => ({ path, entries })),
      (row) => row.entries,
      5,
    ),
    exits: topBy(
      pageStats.filter(({ exits }) => exits > 0).map(({ path, exits }) => ({ path, exits })),
      (row) => row.exits,
      5,
    ),
    routes: topBy(
      [...routesMap.entries()]
        .filter(([, views]) => views > 0)
        .map(([routeKey, views]) => ({ routeKey, views })),
      (row) => row.views,
      5,
    ),
    events: options.includeEvents ? aggregateEvents(eventsRows) : null,
  };
}
