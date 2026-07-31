import { EVENT_NAME_PATTERN } from "./constants";

export function normalizePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "/";
  }

  try {
    const pathname = trimmed.startsWith("/")
      ? trimmed.split("?")[0]!
      : new URL(trimmed).pathname;
    const withoutTrailingSlash = pathname.replace(/\/+$/, "");
    return withoutTrailingSlash || "/";
  } catch {
    return "/";
  }
}

export function splitPathAndSearch(raw: string): { path: string; search: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { path: "/", search: "" };
  }

  if (trimmed.startsWith("/")) {
    const queryIndex = trimmed.indexOf("?");
    if (queryIndex === -1) {
      return { path: normalizePath(trimmed), search: "" };
    }
    return {
      path: normalizePath(trimmed.slice(0, queryIndex)),
      search: trimmed.slice(queryIndex),
    };
  }

  try {
    const parsed = new URL(trimmed);
    return {
      path: normalizePath(parsed.pathname),
      search: parsed.search,
    };
  } catch {
    return { path: normalizePath(trimmed), search: "" };
  }
}

export function buildRouteKey(paths: string[]): string {
  return paths.join(" → ");
}

export function isValidEventName(name: string): boolean {
  if (name === "pageview" || name.startsWith("_")) {
    return false;
  }
  return EVENT_NAME_PATTERN.test(name);
}
