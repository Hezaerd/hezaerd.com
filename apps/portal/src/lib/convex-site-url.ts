/**
 * Convex HTTP actions base URL (`.convex.site`), used for analytics collect endpoints.
 *
 * Default: derive from `VITE_CONVEX_URL` by swapping `.convex.cloud` → `.convex.site`.
 * Override with `VITE_CONVEX_SITE_URL` when Convex URL patterns differ.
 */
export function getConvexSiteUrl(): string {
  const explicit = import.meta.env.VITE_CONVEX_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const convexUrl = import.meta.env.VITE_CONVEX_URL?.trim();
  if (!convexUrl) {
    return "";
  }

  return convexUrl.replace(/\.convex\.cloud\b/, ".convex.site").replace(/\/$/, "");
}

export function getAnalyticsCollectUrls() {
  const base = getConvexSiteUrl();
  if (!base) {
    return { browser: "", server: "" };
  }

  return {
    browser: `${base}/analytics/collect`,
    server: `${base}/analytics/collect/server`,
  };
}
