import { useAuth } from "@workos/authkit-tanstack-react-start/client";

import {
  Link,
  Outlet,
  createFileRoute,
  notFound,
} from "@tanstack/react-router";

import { ClientWorkspaceShell } from "@/components/shell/client-workspace-shell";
import { getClient } from "@/lib/portal-fixtures";

export const Route = createFileRoute("/w/$clientId")({
  loader: ({ params }) => {
    const client = getClient(params.clientId);
    if (!client) {
      throw notFound();
    }
    return { client };
  },
  component: ClientWorkspaceLayout,
});

function ClientWorkspaceLayout() {
  const { client } = Route.useLoaderData();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground text-sm">
          Sign in to reach your Client Workspace.{" "}
          <Link to="/" className="text-primary font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </main>
    );
  }

  return (
    <ClientWorkspaceShell client={client} email={user.email}>
      <Outlet />
    </ClientWorkspaceShell>
  );
}
