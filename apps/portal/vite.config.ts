import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * Vite SSR lowers CJS `require("react")` inside use-sync-external-store
 * (via @base-ui/react in @hezaerd/ui) to a runtime `__require("react")`.
 * Nitro already inlines React as `require_react()` in the same chunk, but
 * leaves the leaked require — Vercel lambdas have no node_modules/react.
 * @see https://github.com/nitrojs/nitro/issues/4171
 */
function patchLeakedReactRequire(): Plugin {
  return {
    name: "patch-leaked-react-require",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        if (!/__require\(["']react["']\)/.test(chunk.code)) continue;
        const match = chunk.code.match(/\brequire_react(?:\$\d+)?\b/);
        if (!match) continue;
        chunk.code = chunk.code.replaceAll(
          /__require\(["']react["']\)/g,
          `${match[0]}()`,
        );
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
