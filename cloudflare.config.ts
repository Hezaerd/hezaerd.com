import { bindings, defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "hezaerd-com",
    compatibilityDate: "2026-11-01",
    entrypoint: "./src/server.ts",
    env: { ASSETS: bindings.assets() },
    assets: { notFoundHandling: "404-page", runWorkerFirst: ["/", "/index.md"] },
    domains: ["hezaerd.com"],
  },
});
