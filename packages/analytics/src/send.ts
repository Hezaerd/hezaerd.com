import { getActiveConfig } from "./config.js";

export type CollectPayload = {
  path: string;
  referrer?: string;
  event?: string;
};

function isCrossOriginEndpoint(endpoint: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return new URL(endpoint).origin !== window.location.origin;
  } catch {
    return true;
  }
}

export function send(payload: CollectPayload): void {
  const config = getActiveConfig();
  if (!config) {
    return;
  }

  const body = JSON.stringify({
    siteKey: config.siteKey,
    path: payload.path,
    referrer: payload.referrer,
    event: payload.event,
  });

  const crossOrigin = isCrossOriginEndpoint(config.endpoint);
  const blob = new Blob([body], { type: "application/json" });

  // sendBeacon always uses credentials: "include" — fails cross-origin unless the
  // collect endpoint echoes Access-Control-Allow-Credentials. Same-origin only.
  if (
    !crossOrigin &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    if (navigator.sendBeacon(config.endpoint, blob)) {
      return;
    }
  }

  void fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    mode: "cors",
    credentials: "omit",
  }).catch(() => {});
}
