import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { site } from "./src/data/site.ts";
import { typegpuWgsl } from "./typegpu-wgsl.ts";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    typegpuWgsl({ minify: true }),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true },
      sitemap: { host: site.url },
      pages: [{ path: "/404", prerender: { outputPath: "/404.html" }, sitemap: { exclude: true } }],
    }),
    react(),
  ],
});
