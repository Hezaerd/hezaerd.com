import { TooltipProvider } from "@hezaerd/ui/components/tooltip";

/// <reference types="vite/client" />
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import { PortalConvexProvider } from "@/components/convex-provider";
import { loadWorkosInitialAuth, type WorkosInitialAuth } from "@/lib/workos-auth";
import type { RouterContext } from "@/router";

import appCss from "../app.css?url";

const title = "Portail Hezaerd";
const description = "Tableau de bord pour l'activité freelance Hezaerd.";

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: async (): Promise<{ initialAuth?: WorkosInitialAuth }> => {
    const initialAuth = await loadWorkosInitialAuth();
    return { initialAuth };
  },
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
  const { initialAuth } = Route.useLoaderData();

  return (
    <PortalConvexProvider initialAuth={initialAuth}>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </PortalConvexProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
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
