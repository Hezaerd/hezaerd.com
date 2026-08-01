import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const LEAKED_REACT_REQUIRE = /__require\(["']react["']\)/g;

/**
 * Vite SSR lowers CJS `require("react")` inside use-sync-external-store
 * (via @base-ui/react / recharts in @hezaerd/ui) to a runtime `__require("react")`.
 * Nitro inlines React as `require_react()` in some chunks, but other shared SSR
 * chunks keep the leaked require — Vercel lambdas have no node_modules/react.
 * Chunks under `.output/server` are patched after build via scripts/patch-ssr-react-require.ts.
 * @see https://github.com/nitrojs/nitro/issues/4171
 */
function patchLeakedReactRequire(): Plugin {
  return {
    name: "patch-leaked-react-require",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        if (!LEAKED_REACT_REQUIRE.test(chunk.code)) continue;
        LEAKED_REACT_REQUIRE.lastIndex = 0;
        const match = chunk.code.match(/\brequire_react(?:\$\d+)?\b/);
        if (!match) continue;
        chunk.code = chunk.code.replaceAll(LEAKED_REACT_REQUIRE, `${match[0]}()`);
      }
    },
  };
}

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    nitro(),
    patchLeakedReactRequire(),
    tailwindcss(),
    tanstackStart({
      start: {
        entry: "start.ts",
      },
    }),
    viteReact(),
  ],
});
