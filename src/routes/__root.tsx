/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

import appCss from "../app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Hezaerd - Software Engineer" },
      {
        name: "description",
        content:
          "Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications.",
      },
      {
        name: "keywords",
        content: "software engineer,game developer,game engine,full stack,minecraft modding",
      },

      // Open Graph
      { property: "og:title", content: "Hezaerd - Software Engineer" },
      {
        property: "og:description",
        content:
          "Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications.",
      },
      { property: "og:type", content: "website" },

      // Twitter
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Hezaerd - Software Engineer" },
      {
        name: "twitter:description",
        content:
          "Passionate about building high-performance software solutions, ranging from game engines, game development tools, to full-stack applications.",
      },
      { name: "twitter:image", content: "https://hezaerd.com/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "author", href: "https://hezaerd.com" },
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
