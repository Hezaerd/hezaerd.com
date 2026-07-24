import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";

export const Route = createFileRoute("/")({ component: PortalHome });

function PortalHome() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-svh items-center justify-center px-6">
        <p className="text-muted-foreground font-mono text-sm">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Dashboard email={user.email} />;
}

function LoginScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <form
        className="border-border bg-muted/40 w-full max-w-sm rounded-xl border p-8 shadow-[0_0_0_1px_rgb(42_50_44_/_0.4)]"
        action="/api/auth/sign-in"
        method="get"
      >
        <p className="font-mono text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
          Portal
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Freelance software business dashboard. Invite-only — no self-registration.
        </p>

        <button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 w-full rounded-md px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Continue to sign in
        </button>
      </form>
    </main>
  );
}

function Dashboard({ email }: { email: string }) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-8">
      <header className="border-border flex items-center justify-between gap-4 border-b pb-6">
        <div>
          <p className="font-mono text-primary text-xs font-medium tracking-[0.2em] uppercase">
            Portal
          </p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground hidden text-sm sm:block">{email}</p>
          <Link
            to="/signout"
            className="border-border hover:bg-accent rounded-md border px-3 py-2 text-sm font-medium"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-16">
        <p className="font-display text-xl font-medium tracking-tight">Business overview</p>
        <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
          Manage products, customers, and sales for your freelance software business. Modules
          will land here.
        </p>
      </main>
    </div>
  );
}
