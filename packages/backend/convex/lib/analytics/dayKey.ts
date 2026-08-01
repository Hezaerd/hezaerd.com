const MONTREAL_TZ = "America/Montreal";

/** Calendar date in America/Montreal as YYYY-MM-DD. */
export function getDayKey(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: MONTREAL_TZ });
}

export function addDaysToDayKey(dayKey: string, deltaDays: number): string {
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

/** Delete visitor-day rows with dayKey strictly before this cutoff (ADR: today − 2). */
export function getVisitorDayRetentionCutoff(now = new Date()): string {
  return addDaysToDayKey(getDayKey(now), -2);
}
