import { v, type Infer } from "convex/values";

import { getDayKey } from "./dayKey";

export const insightsPeriodValidator = v.union(
  v.literal("7d"),
  v.literal("30d"),
  v.literal("90d"),
);

export type InsightsPeriod = Infer<typeof insightsPeriodValidator>;

const PERIOD_DAY_COUNT: Record<InsightsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** Inclusive calendar bounds for an Insights period in America/Montreal. */
export function getPeriodBounds(
  period: InsightsPeriod,
  now = new Date(),
): { startDayKey: string; endDayKey: string; todayDayKey: string } {
  const todayDayKey = getDayKey(now);
  const dayCount = PERIOD_DAY_COUNT[period];
  const startDayKey = addDaysToDayKey(todayDayKey, -(dayCount - 1));
  return { startDayKey, endDayKey: todayDayKey, todayDayKey };
}

/** Bounds for the period immediately before the current one (same length). */
export function getPreviousPeriodBounds(
  period: InsightsPeriod,
  now = new Date(),
): { startDayKey: string; endDayKey: string } {
  const { startDayKey } = getPeriodBounds(period, now);
  const dayCount = PERIOD_DAY_COUNT[period];
  const endDayKey = addDaysToDayKey(startDayKey, -1);
  const previousStartDayKey = addDaysToDayKey(endDayKey, -(dayCount - 1));
  return { startDayKey: previousStartDayKey, endDayKey };
}

/** Every calendar dayKey from start through end (inclusive), ascending. */
export function enumerateDayKeys(startDayKey: string, endDayKey: string): string[] {
  const keys: string[] = [];
  let current = startDayKey;
  while (current <= endDayKey) {
    keys.push(current);
    current = addDaysToDayKey(current, 1);
  }
  return keys;
}

function addDaysToDayKey(dayKey: string, deltaDays: number): string {
  const parts = dayKey.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid dayKey: ${dayKey}`);
  }
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays, 12, 0, 0));
  return getDayKey(utc);
}
