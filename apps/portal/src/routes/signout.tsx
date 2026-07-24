import { signOut } from "@workos/authkit-tanstack-react-start";

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signout")({
  loader: async () => {
    await signOut();
    throw redirect({ href: "/" });
  },
});
