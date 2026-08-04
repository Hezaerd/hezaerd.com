import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  installCommand: "bun install",
  buildCommand: "cd ../.. && VERCEL_USE_EXPERIMENTAL_FRAMEWORKS=1 bun run build:marion",
};
