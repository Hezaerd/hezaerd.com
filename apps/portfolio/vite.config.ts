import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import { getProjects } from "./src/data/projects";

const projectPages = getProjects().map((project) => ({
  path: `/projects/${project.slug}`,
}));

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    nitro(),
    tailwindcss(),
    tanstackStart({
      pages: projectPages,
      prerender: {
        enabled: true,
        crawlLinks: true,
        // Homepage is request-time SSR so Spotify stats stay fresh.
        // Crawl may also discover hash links like `/#projects` — treat those as `/`.
        filter: ({ path }) => {
          const pathname = path.split("#")[0] || "/";
          return pathname !== "/";
        },
      },
      sitemap: {
        enabled: true,
        host: "https://portfolio.hezaerd.com",
      },
    }),
    viteReact(),
  ],
});
