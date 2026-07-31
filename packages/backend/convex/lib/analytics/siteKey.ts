/** URL-safe random key for analytics credentials. */
export function generateAnalyticsCredential(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** @deprecated Use generateAnalyticsCredential */
export const generateSiteKey = generateAnalyticsCredential;
