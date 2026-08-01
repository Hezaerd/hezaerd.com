import type { HezaerdInitOptions } from "./config.js";
import { setActiveConfig } from "./config.js";
import { isEmbedded } from "./embed.js";
import { trackEvent, trackPageview } from "./track.js";

const INIT_FLAG = "__hezaerd_analytics_init__";

declare global {
  interface Window {
    hezaerd?: { track: (name: string) => void };
    [INIT_FLAG]?: boolean;
  }
}

function installClickDelegation(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const element = target.closest("[data-hezaerd-event]");
      if (!element) {
        return;
      }

      const name = element.getAttribute("data-hezaerd-event");
      if (name) {
        trackEvent(name);
      }
    },
    true,
  );
}

function installSpaTracking(): void {
  if (typeof window === "undefined" || typeof history === "undefined") {
    return;
  }

  let lastPath = `${location.pathname}${location.search}`;

  function onNavigate(): void {
    const nextPath = `${location.pathname}${location.search}`;
    if (nextPath === lastPath) {
      return;
    }
    lastPath = nextPath;
    trackPageview();
  }

  const { pushState, replaceState } = history;
  history.pushState = function (...args) {
    const result = pushState.apply(this, args);
    onNavigate();
    return result;
  };
  history.replaceState = function (...args) {
    const result = replaceState.apply(this, args);
    onNavigate();
    return result;
  };
  window.addEventListener("popstate", onNavigate);
}

/** Initialize browser analytics. Safe to call once per page load. */
export function init(options: HezaerdInitOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!options.siteKey.trim()) {
    return;
  }

  if (isEmbedded()) {
    return;
  }

  if (window[INIT_FLAG]) {
    setActiveConfig(options);
    return;
  }

  window[INIT_FLAG] = true;
  setActiveConfig(options);
  window.hezaerd = { track: trackEvent };

  installClickDelegation();
  installSpaTracking();
  trackPageview();
}

export type { HezaerdInitOptions };
