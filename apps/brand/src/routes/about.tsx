import { createFileRoute, Link } from "@tanstack/react-router";

import { site } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Hezaerd" },
      {
        name: "description",
        content:
          "Hezaerd is a software engineer focused on high-performance systems, product delivery, and technical partnership.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hezaerd.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">About</h1>
      <div className="text-muted-foreground mt-8 space-y-5 text-lg leading-relaxed">
        <p>
          I am Hezaerd — a software engineer who cares about systems that stay fast under pressure
          and products that still make sense six months later.
        </p>
        <p>
          My work spans game engines and tooling, full-stack applications, and the operational
          layers around them. I prefer clear ownership, measurable outcomes, and fewer moving parts
          than the industry default.
        </p>
        <p>
          For the long archive — experiments, résumé detail, and personal projects — visit the{" "}
          <a href={site.portfolioUrl} className="text-primary">
            portfolio
          </a>
          .
        </p>
      </div>
      <Link
        to="/contact"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-10 inline-flex rounded-md px-5 py-3 text-sm font-medium"
      >
        Work with me
      </Link>
    </main>
  );
}
