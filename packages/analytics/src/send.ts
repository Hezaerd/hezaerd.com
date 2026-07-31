import { getActiveConfig } from "./config.js";

export type CollectPayload = {
  path: string;
  referrer?: string;
  event?: string;
};

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

  const blob = new Blob([body], { type: "application/json" });
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
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
  }).catch(() => {});
}
