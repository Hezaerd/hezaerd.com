import handler from "@tanstack/react-start/server-entry";

import { homeMarkdown } from "@/data/markdown";

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const markdown = homeMarkdown();

function wantsMarkdown(request: Request) {
  return request.headers.get("accept")?.includes("text/markdown") ?? false;
}

function serveMarkdown() {
  return new Response(markdown, {
    headers: { "content-type": "text/markdown; charset=utf-8", vary: "Accept" },
  });
}

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/index.md") return serveMarkdown();
    if (pathname !== "/") return handler.fetch(request);
    if (wantsMarkdown(request)) return serveMarkdown();
    const page = await env.ASSETS.fetch(request);
    const response = page.ok ? new Response(page.body, page) : await handler.fetch(request);
    response.headers.set("link", '</index.md>; rel="alternate"; type="text/markdown"');
    response.headers.append("vary", "Accept");
    return response;
  },
};
