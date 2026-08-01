import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

const LEAKED_REACT_REQUIRE = /__require\(["']react["']\)/g;

function walkMjsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMjsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".mjs")) {
      files.push(fullPath);
    }
  }
  return files;
}

function findReactProvider(serverRoot: string): { file: string; exportName: string } | null {
  const libsDir = path.join(serverRoot, "_libs");
  if (!existsSync(libsDir)) return null;

  for (const file of walkMjsFiles(libsDir)) {
    const code = readFileSync(file, "utf8");
    const match = code.match(/require_react as (\w+)/);
    if (match) {
      return { file, exportName: match[1]! };
    }
  }

  return null;
}

function toImportPath(fromFile: string, toFile: string) {
  const relative = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, "/");
  return relative.startsWith(".") ? relative : `./${relative}`;
}

function patchLeakedReactRequiresInServerOutput(rootDir: string) {
  const serverRoot = path.join(rootDir, ".output/server");
  if (!existsSync(serverRoot)) return;

  const reactProvider = findReactProvider(serverRoot);
  if (!reactProvider) return;

  for (const file of walkMjsFiles(serverRoot)) {
    let code = readFileSync(file, "utf8");
    if (!LEAKED_REACT_REQUIRE.test(code)) continue;
    LEAKED_REACT_REQUIRE.lastIndex = 0;

    const sameChunkMatch = code.match(/\brequire_react(?:\$\d+)?\b/);
    if (sameChunkMatch) {
      code = code.replaceAll(LEAKED_REACT_REQUIRE, `${sameChunkMatch[0]}()`);
    } else {
      const importPath = toImportPath(file, reactProvider.file);
      const importLine = `import { ${reactProvider.exportName} as require_react } from "${importPath}";\n`;
      if (!code.includes(importLine.trim())) {
        code = importLine + code;
      }
      code = code.replaceAll(LEAKED_REACT_REQUIRE, "require_react()");
    }

    writeFileSync(file, code);
  }
}

/**
 * Vite SSR lowers CJS `require("react")` inside use-sync-external-store
 * (via @base-ui/react in @hezaerd/ui) to a runtime `__require("react")`.
 * Nitro inlines React as `require_react()` in some chunks, but shared SSR
 * chunks keep the leaked require — Vercel lambdas have no node_modules/react.
 * Recharts stays client-only; this patch covers the remaining base-ui leak.
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
    nitro({
      hooks: {
        compiled(nitro) {
          patchLeakedReactRequiresInServerOutput(nitro.options.rootDir);
        },
      },
    }),
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
