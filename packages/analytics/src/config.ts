import { DEFAULT_BROWSER_ENDPOINT } from "./constants.js";

export type HezaerdInitOptions = {
  siteKey: string;
  endpoint?: string;
};

type ActiveConfig = {
  siteKey: string;
  endpoint: string;
};

let activeConfig: ActiveConfig | null = null;

export function resolveBrowserEndpoint(endpoint?: string): string {
  return endpoint ?? DEFAULT_BROWSER_ENDPOINT;
}

export function getActiveConfig(): ActiveConfig | null {
  return activeConfig;
}

export function setActiveConfig(options: HezaerdInitOptions): ActiveConfig {
  const config: ActiveConfig = {
    siteKey: options.siteKey,
    endpoint: resolveBrowserEndpoint(options.endpoint),
  };
  activeConfig = config;
  return config;
}

export function clearActiveConfig(): void {
  activeConfig = null;
}
