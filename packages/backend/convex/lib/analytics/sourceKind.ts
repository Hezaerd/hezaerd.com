import type { SourceKind } from "./constants";
import { extractHostname, normalizeHostname } from "./origin";

const SEARCH_HOSTS = new Set([
  "bing.com",
  "duckduckgo.com",
  "search.yahoo.com",
  "ecosia.org",
  "qwant.com",
  "yahoo.com",
]);

const SOCIAL_HOSTS = new Set([
  "facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "t.co",
  "tiktok.com",
  "linkedin.com",
  "lnkd.in",
  "pinterest.com",
  "youtube.com",
  "reddit.com",
]);

function containsAny(value: string, needles: string[]): boolean {
  const lower = value.toLowerCase();
  return needles.some((needle) => lower.includes(needle));
}

function isGoogleHost(host: string): boolean {
  return host === "google.com" || host.endsWith(".google.com") || host.includes("googlequicksearchbox");
}

function isSearchHost(host: string): boolean {
  return isGoogleHost(host) || SEARCH_HOSTS.has(host);
}

function isSocialHost(host: string): boolean {
  return SOCIAL_HOSTS.has(host);
}

function classifyUtmMedium(medium: string): SourceKind | null {
  if (containsAny(medium, ["email", "newsletter", "mail"])) {
    return "email";
  }
  if (containsAny(medium, ["social", "social-media"])) {
    return "social";
  }
  if (containsAny(medium, ["cpc", "ppc", "paid", "paidsearch"])) {
    return null;
  }
  return null;
}

function classifyUtmSource(source: string): SourceKind | null {
  if (containsAny(source, ["google", "gmb", "google_my_business"])) {
    return "google";
  }
  if (
    containsAny(source, [
      "facebook",
      "fb",
      "instagram",
      "ig",
      "twitter",
      "x",
      "tiktok",
      "linkedin",
      "pinterest",
      "youtube",
    ])
  ) {
    return "social";
  }
  if (containsAny(source, ["newsletter", "mailchimp", "sendgrid"])) {
    return "email";
  }
  if (source.trim()) {
    return "referral";
  }
  return null;
}

function classifyReferrerHost(host: string): SourceKind {
  if (isSearchHost(host)) {
    return "google";
  }
  if (isSocialHost(host)) {
    return "social";
  }
  return "referral";
}

/** Server-side source bucket for a pageview (ADR-0005 + research note). */
export function classifySourceKind(input: {
  referrer?: string;
  search?: string;
  siteHost: string;
}): SourceKind {
  const params = new URLSearchParams(input.search?.replace(/^\?/, "") ?? "");
  const utmMedium = params.get("utm_medium") ?? "";
  const utmSource = params.get("utm_source") ?? "";

  const mediumKind = utmMedium ? classifyUtmMedium(utmMedium) : null;
  if (mediumKind) {
    return mediumKind;
  }

  const sourceKind = utmSource ? classifyUtmSource(utmSource) : null;
  if (sourceKind) {
    return sourceKind;
  }

  const referrerHost = input.referrer ? extractHostname(input.referrer) : null;
  if (!referrerHost) {
    return "direct";
  }

  const normalizedReferrer = normalizeHostname(referrerHost);
  if (normalizedReferrer === input.siteHost) {
    return "direct";
  }

  return classifyReferrerHost(normalizedReferrer);
}
