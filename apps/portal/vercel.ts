import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  installCommand: "bun install",
  // Production has CONVEX_DEPLOY_KEY → deploy Convex prod, then build portal.
  // Preview/Development have no key → build against shared Convex DEV only.
  buildCommand: "cd ../.. && bun run build:portal:vercel",
  framework: "nitro",
};
