import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { emitHomeMarkdown } from "./home-markdown.ts";
import { site } from "./src/data/site.ts";
import { typegpuWgsl } from "./typegpu-wgsl.ts";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    typegpuWgsl({ minify: true }),
    emitHomeMarkdown(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true },
      sitemap: { host: site.url },
      pages: [{ path: "/404", prerender: { outputPath: "/404.html" }, sitemap: { exclude: true } }],
    }),
    react(),
  ],
});
