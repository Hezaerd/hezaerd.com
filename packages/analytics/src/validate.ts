import { EVENT_NAME_PATTERN } from "./constants.js";

export function isValidEventName(name: string): boolean {
  return name !== "pageview" && !name.startsWith("_") && EVENT_NAME_PATTERN.test(name);
}

export function pathWithSearch(): string {
  if (typeof location === "undefined") {
    return "/";
  }
  return `${location.pathname}${location.search}`;
}
