import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  installCommand: "bun install",
  buildCommand: "cd ../.. && bun run build:brand",
  framework: "nitro",
};
