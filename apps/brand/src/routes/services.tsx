import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Hezaerd" },
      {
        name: "description",
        content:
          "Freelance software engineering services: product delivery, performance systems, and technical partnership.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hezaerd.com/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Services</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
        Clear engagements for teams that need senior execution without a permanent headcount
        commitment.
      </p>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        {[
          {
            title: "Build",
            body: "Greenfield features and products — from architecture through production — with maintainable TypeScript and honest scope.",
          },
          {
            title: "Harden",
            body: "Performance audits, reliability fixes, and refactors that reduce risk without rewriting everything.",
          },
          {
            title: "Partner",
            body: "Retainer-style support for roadmap reviews, hiring help, and ongoing engineering judgment.",
          },
          {
            title: "Integrate",
            body: "Auth, billing, analytics, and the glue between your product and the services it depends on.",
          },
        ].map((item) => (
          <article key={item.title}>
            <h2 className="text-2xl font-semibold">{item.title}</h2>
            <p className="text-muted-foreground mt-3 leading-relaxed">{item.body}</p>
          </article>
        ))}
      </div>

      <section className="border-border mt-20 border-t pt-12">
        <h2 className="text-2xl font-semibold">How we work</h2>
        <ol className="text-muted-foreground mt-6 max-w-2xl list-decimal space-y-3 pl-5">
          <li>Short discovery call to confirm fit and constraints.</li>
          <li>Written proposal with milestones, communication cadence, and ownership.</li>
          <li>Weekly demos, async updates, and production-minded delivery.</li>
        </ol>
        <Link
          to="/contact"
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex rounded-md px-5 py-3 text-sm font-medium"
        >
          Discuss an engagement
        </Link>
      </section>
    </main>
  );
}
