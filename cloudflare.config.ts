import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "hezaerd-com",
    compatibilityDate: "2026-11-01",
    assets: { notFoundHandling: "404-page" },
    domains: ["hezaerd.com"],
  },
});
