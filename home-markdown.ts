import type { Plugin } from "vite";

import { homeMarkdown } from "./src/data/markdown.ts";

export function emitHomeMarkdown(): Plugin {
  return {
    name: "home-markdown",
    generateBundle() {
      if (this.environment.name !== "client") return;
      this.emitFile({ type: "asset", fileName: "index.md", source: homeMarkdown() });
    },
  };
}
