import { TooltipProvider } from "@hezaerd/ui/components/tooltip";

/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";

import { PortalConvexProvider } from "@/components/convex-provider";

import appCss from "../app.css?url";

const title = "Hezaerd Portal";
const description = "Dashboard for the Hezaerd freelance software business.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

function RootLayout() {
  return (
    <PortalConvexProvider>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </PortalConvexProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
