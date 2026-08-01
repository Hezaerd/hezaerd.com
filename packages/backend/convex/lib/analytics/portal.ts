import { extractHostname, normalizeHostname } from "./origin";

const PORTAL_REFERRER_HOSTS = new Set([
  "portal.hezaerd.com",
  "dev.portal.hezaerd.com",
]);

/** True when the browser referrer is the Portal desk (iframe preview, operator visits). */
export function isPortalReferrer(referrer: string | null | undefined): boolean {
  if (!referrer?.trim()) {
    return false;
  }

  const host = extractHostname(referrer);
  if (!host) {
    return false;
  }

  return PORTAL_REFERRER_HOSTS.has(normalizeHostname(host));
}
