"use client";

import { useEffect } from "react";

import type { HezaerdInitOptions } from "../init.js";
import { init } from "../init.js";

export type HezaerdAnalyticsProps = HezaerdInitOptions;

/** Mount once in the root layout — auto pageviews + SPA tracking. */
export function HezaerdAnalytics({ siteKey, endpoint }: HezaerdAnalyticsProps) {
  useEffect(() => {
    init({ siteKey, endpoint });
  }, [siteKey, endpoint]);

  return null;
}
