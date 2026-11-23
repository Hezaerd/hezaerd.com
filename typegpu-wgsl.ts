import { transformWgsl } from "@vgpu/wgsl/loader-vite";
import typegpu from "unplugin-typegpu/vite";
import { type Plugin, runnerImport } from "vite";

/**
 * Resolves `import shader from "./shader.ts?wgsl"` at build time: runs the
 * TypeGPU module in Node, takes the WGSL its default export resolved to, and
 * hands it to vgpu's loader. The bundle ships the WGSL, never TypeGPU.
 */
export function typegpuWgsl(options: { minify?: boolean } = {}): Plugin {
  return {
    name: "typegpu-wgsl",
    enforce: "pre",
    async load(id) {
      const [file, query] = id.split("?");
      if (query !== "wgsl") return null;
      const { module, dependencies } = await runnerImport<{ default: string }>(file, {
        configFile: false,
        logLevel: "silent",
        plugins: [typegpu()],
      });
      for (const dependency of dependencies) this.addWatchFile(dependency);
      return transformWgsl(module.default, file.replace(/\.ts$/, ".wgsl"), { minify: options.minify });
    },
  };
}
