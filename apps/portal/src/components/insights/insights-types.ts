import type { InsightsPeriod } from "@/lib/convex-queries";

export type InsightsOverviewData = {
  period: InsightsPeriod;
  siteHost: string;
  traffic: {
    series: Array<{ dayKey: string; pageviews: number; visitors: number }>;
    totals: { pageviews: number; visitors: number };
    visitorsToday: number;
    comparison: {
      previousVisitors: number;
      deltaPercent: number | null;
    };
  };
  sources: Array<{ sourceKind: string; views: number }>;
  sourceDetails: Array<{ sourceKind: string; sourceDetail: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
  landings: Array<{ path: string; entries: number }>;
  exits: Array<{ path: string; exits: number }>;
  routes: Array<{ routeKey: string; views: number }>;
  events: {
    items: Array<{ eventName: string; count: number }>;
    otherCount: number;
  } | null;
};

export type InsightsShellVariant = "desk" | "workspace";
