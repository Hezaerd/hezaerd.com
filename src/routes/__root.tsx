import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { preload } from "react-dom";

import { NotFoundWithTitle } from "@/not-found";
import coreFont from "@/assets/fonts/hezaerd-sans-core.woff2?url";
import fontCss from "@/styles/fonts.css?url";
import appCss from "@/styles/global.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "stylesheet", href: fontCss },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "sitemap", href: "/sitemap.xml" },
    ],
  }),
  shellComponent: Shell,
  notFoundComponent: NotFoundWithTitle,
});

function Shell({ children }: { children: ReactNode }) {
  preload(coreFont, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-foreground px-4 py-2 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <header className="absolute inset-x-0 top-0 z-40">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-sm sm:px-8">
            <a
              href="/"
              className="font-[620] tracking-[-0.02em] text-foreground [font-stretch:110%]"
              aria-label="Hezaerd, home"
            >
              hezaerd
            </a>
          </nav>
        </header>
        <main id="main">{children}</main>
        <Scripts />
      </body>
    </html>
  );
}
