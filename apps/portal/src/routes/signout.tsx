import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/signout")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const target = new URL("/api/auth/sign-out", request.url);
        const returnTo = new URL(request.url).searchParams.get("returnTo");
        if (returnTo) {
          target.searchParams.set("returnTo", returnTo);
        }

        return new Response(null, {
          status: 307,
          headers: { Location: target.toString() },
        });
      },
    },
  },
});
