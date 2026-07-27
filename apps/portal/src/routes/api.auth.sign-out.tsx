import { getAuth, getAuthkit } from "@workos/authkit-tanstack-react-start";

import { createFileRoute } from "@tanstack/react-router";

type SignOutResult = {
  headers?: Record<string, string | string[]>;
  response?: Response;
};

function appendClearSessionHeaders(headers: Headers, result: SignOutResult) {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          headers.append(key, entry);
        }
      } else if (typeof value === "string") {
        headers.append(key, value);
      }
    }
    return;
  }

  const setCookies = result.response?.headers.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    headers.append("Set-Cookie", cookie);
  }
}

export const Route = createFileRoute("/api/auth/sign-out")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const returnTo = new URL(request.url).searchParams.get("returnTo") ?? "/";
        const auth = await getAuth();

        if (!auth.user || !("sessionId" in auth) || !auth.sessionId) {
          return new Response(null, {
            status: 307,
            headers: { Location: new URL(returnTo, request.url).toString() },
          });
        }

        const authkit = await getAuthkit();
        const { logoutUrl, headers: headersBag, response } = await authkit.signOut(auth.sessionId, {
          returnTo,
        });

        const headers = new Headers({ Location: logoutUrl });
        appendClearSessionHeaders(headers, { headers: headersBag, response });

        return new Response(null, { status: 307, headers });
      },
    },
  },
});
