import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";

import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// authkitMiddleware throws synchronously when WorkOS env vars are absent.
// Guard it so the dev preview can render without real credentials.
const hasWorkOsConfig =
  !!process.env["WORKOS_API_KEY"] &&
  !!process.env["WORKOS_CLIENT_ID"] &&
  !!process.env["WORKOS_COOKIE_PASSWORD"] &&
  !!process.env["WORKOS_REDIRECT_URI"];

export const startInstance = createStart(() => ({
  requestMiddleware: hasWorkOsConfig ? [csrfMiddleware, authkitMiddleware()] : [csrfMiddleware],
}));
