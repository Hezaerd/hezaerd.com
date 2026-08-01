import type { SourceKind } from "./constants";
import { extractHostname, normalizeHostname } from "./origin";

const SOCIAL_HOST_ALIASES: Record<string, string> = {
  "l.facebook.com": "facebook.com",
  "lm.facebook.com": "facebook.com",
  "lnkd.in": "linkedin.com",
  "t.co": "twitter.com",
};

function normalizeDetailKey(value: string): string {
  return value.trim().toLowerCase().slice(0, 128);
}

function normalizeReferrerDetail(host: string): string {
  const normalized = normalizeHostname(host);
  return SOCIAL_HOST_ALIASES[normalized] ?? normalized;
}

/** Granular source label stored alongside sourceKind rollups. */
export function resolveSourceDetail(input: {
  referrer?: string;
  search?: string;
  siteHost: string;
  sourceKind: SourceKind;
}): string | null {
  if (input.sourceKind === "direct") {
    return null;
  }

  const params = new URLSearchParams(input.search?.replace(/^\?/, "") ?? "");
  const utmSource = params.get("utm_source")?.trim();
  const utmMedium = params.get("utm_medium")?.trim();
  const utmCampaign = params.get("utm_campaign")?.trim();

  if (utmSource) {
    return normalizeDetailKey(utmSource);
  }

  const referrerHost = input.referrer ? extractHostname(input.referrer) : null;
  if (referrerHost) {
    const normalizedReferrer = normalizeReferrerDetail(referrerHost);
    if (normalizedReferrer !== input.siteHost) {
      return normalizedReferrer;
    }
  }

  if (input.sourceKind === "email" && utmMedium) {
    return normalizeDetailKey(utmMedium);
  }

  if (utmCampaign) {
    return normalizeDetailKey(utmCampaign);
  }

  return null;
}
