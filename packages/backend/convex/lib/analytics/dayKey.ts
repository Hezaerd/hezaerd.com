const MONTREAL_TZ = "America/Montreal";

/** Calendar date in America/Montreal as YYYY-MM-DD. */
export function getDayKey(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: MONTREAL_TZ });
}
