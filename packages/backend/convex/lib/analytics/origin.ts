export function extractHostname(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    return normalizeHostname(parsed.hostname);
  } catch {
    return null;
  }
}

export function normalizeHostname(hostname: string): string {
  return hostname.replace(/^www\./i, "").toLowerCase();
}

/** True when Origin or Referer host matches the linked production URL host. */
export function isAllowedRequestOrigin(
  productionUrl: string,
  origin: string | null | undefined,
  referer: string | null | undefined,
): boolean {
  const siteHost = extractHostname(productionUrl);
  if (!siteHost) {
    return false;
  }

  const originHost = origin ? extractHostname(origin) : null;
  if (originHost && originHost === siteHost) {
    return true;
  }

  const refererHost = referer ? extractHostname(referer) : null;
  if (refererHost && refererHost === siteHost) {
    return true;
  }

  return false;
}
