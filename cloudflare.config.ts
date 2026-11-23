import { defineConfig } from "cf/config";

// An assets-only Worker: `cf deploy dist` uploads the Astro build as is.
export default defineConfig({
  worker: {
    name: "hezaerd-com",
    compatibilityDate: "2026-11-01",
    assets: { notFoundHandling: "404-page" },
    domains: ["hezaerd.com"],
  },
});
