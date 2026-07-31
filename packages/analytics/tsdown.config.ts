import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    outDir: "dist",
    format: ["esm", "cjs"],
    platform: "browser",
    target: "es2018",
    dts: true,
    clean: true,
  },
  {
    entry: ["src/react/index.ts"],
    outDir: "dist/react",
    format: ["esm", "cjs"],
    platform: "browser",
    target: "es2018",
    dts: true,
    deps: {
      neverBundle: ["react", "react/jsx-runtime"],
    },
  },
  {
    entry: ["src/server/index.ts"],
    outDir: "dist/server",
    format: ["esm", "cjs"],
    platform: "node",
    target: "es2022",
    dts: true,
  },
]);
