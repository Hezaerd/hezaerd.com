import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/lib/site";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center px-6 py-24">
      <p className="font-mono text-primary mb-4 text-sm font-medium tracking-[0.2em] uppercase">
        Portal
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Hezaerd Portal
      </h1>
      <p className="text-muted-foreground mt-4 max-w-lg text-base leading-relaxed">
        App shell is up. Auth and Convex land next.
      </p>
      <p className="text-muted-foreground mt-8 font-mono text-xs">
        Public sites:{" "}
        <a href={site.brandUrl} className="text-primary hover:underline">
          Brand
        </a>
        {" · "}
        <a href={site.portfolioUrl} className="text-primary hover:underline">
          Portfolio
        </a>
      </p>
    </main>
  );
}
