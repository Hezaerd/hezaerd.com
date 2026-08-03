const TIMEZONE = "America/Montreal";
const QUIET_START_HOUR = 8;
const QUIET_END_HOUR = 20;

export function montrealParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    dayKey: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
  };
}

/** Proactive pings + digest: 8h–20h America/Montreal only (#40). */
export function isQuietHours(date = new Date()): boolean {
  const { hour } = montrealParts(date);
  return hour >= QUIET_START_HOUR && hour < QUIET_END_HOUR;
}

export function montrealDayKey(date = new Date()): string {
  return montrealParts(date).dayKey;
}

/** True when local hour is 8 (morning digest window). */
export function isMorningDigestHour(date = new Date()): boolean {
  return montrealParts(date).hour === QUIET_START_HOUR;
}
