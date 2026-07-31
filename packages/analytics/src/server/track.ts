import {
  DEFAULT_SERVER_ENDPOINT,
  SERVER_DEFAULT_PATH,
} from "../constants.js";
import { isValidEventName } from "../validate.js";

export type ServerTrackOptions = {
  path?: string;
  endpoint?: string;
  siteKey?: string;
  ingestSecret?: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function resolveServerCredentials(options: ServerTrackOptions): {
  siteKey: string;
  ingestSecret: string;
  endpoint: string;
} | null {
  const siteKey = options.siteKey ?? readEnv("HEZAERD_SITE_KEY");
  const ingestSecret = options.ingestSecret ?? readEnv("HEZAERD_INGEST_SECRET");
  const endpoint =
    options.endpoint ?? readEnv("HEZAERD_ANALYTICS_URL") ?? DEFAULT_SERVER_ENDPOINT;

  if (!siteKey || !ingestSecret) {
    return null;
  }

  return { siteKey, ingestSecret, endpoint };
}

/** Track a custom event from Node, server actions, or route handlers. */
export async function track(
  event: string,
  options: ServerTrackOptions = {},
): Promise<void> {
  if (!isValidEventName(event)) {
    return;
  }

  const credentials = resolveServerCredentials(options);
  if (!credentials) {
    return;
  }

  const path = options.path ?? SERVER_DEFAULT_PATH;

  await fetch(credentials.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${credentials.ingestSecret}`,
    },
    body: JSON.stringify({
      siteKey: credentials.siteKey,
      path,
      event,
    }),
  }).catch(() => {});
}
