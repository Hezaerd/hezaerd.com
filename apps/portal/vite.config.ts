import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * Vite SSR lowers CJS `require("react")` inside use-sync-external-store
 * (via @base-ui/react in @hezaerd/ui) to a runtime `__require("react")`.
 * Nitro experimental.cjsRequireRewrite rewrites those to the bundled copy.
 * Recharts stays client-only in insights-line-chart.tsx.
 * @see https://github.com/nitrojs/nitro/issues/4171
 * @see https://github.com/nitrojs/nitro/pull/4365
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    nitro({
      experimental: {
        cjsRequireRewrite: "react",
      },
    }),
    tailwindcss(),
    tanstackStart({
      start: {
        entry: "start.ts",
      },
    }),
    viteReact(),
  ],
});
