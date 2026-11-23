// @ts-check
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { wgslVitePlugin } from "@vgpu/wgsl/loader-vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://hezaerd.com",
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss(), wgslVitePlugin({ minify: true })] },
});
