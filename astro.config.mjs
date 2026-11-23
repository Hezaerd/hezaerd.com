// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { typegpuWgsl } from "./typegpu-wgsl.mjs";

export default defineConfig({
  site: "https://hezaerd.com",
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss(), typegpuWgsl({ minify: true })] },
});
