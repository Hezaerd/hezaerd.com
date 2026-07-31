import { isValidEventName, pathWithSearch } from "./validate.js";
import { send } from "./send.js";

export function trackEvent(name: string): void {
  if (!isValidEventName(name)) {
    return;
  }

  send({
    path: pathWithSearch(),
    event: name,
  });
}

export function trackPageview(): void {
  send({
    path: pathWithSearch(),
    referrer: typeof document !== "undefined" ? document.referrer : "",
  });
}
