"use client";

import { useCallback } from "react";

import { trackEvent } from "../track.js";

/** Returns a stable track function for custom events. */
export function useTrack(): (name: string) => void {
  return useCallback((name: string) => {
    trackEvent(name);
  }, []);
}
