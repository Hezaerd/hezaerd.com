import { getBrandCaseStudies } from "@hezaerd/content";

import { createFileRoute, Link } from "@tanstack/react-router";

import { site } from "@/lib/site";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const featured = getBrandCaseStudies();

  return (
    <main>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-6 py-24">
        <p className="text-primary mb-4 text-sm font-medium tracking-[0.2em] uppercase">Hezaerd</p>
        <h1 className="font-display max-w-3xl text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
          Software that earns its place in production.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
          I help founders and product teams ship durable systems — performance-sensitive backends,
          sharp interfaces, and the operational pieces that keep them honest.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            to="/contact"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-5 py-3 text-sm font-medium"
          >
            Start a project
          </Link>
          <Link
            to="/work"
            className="border-border hover:bg-accent rounded-md border px-5 py-3 text-sm font-medium"
          >
            See selected work
          </Link>
        </div>
      </section>

      <section className="border-border border-y">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-3">
          {[
            {
              title: "Product engineering",
              body: "End-to-end delivery for web products: architecture, implementation, and clean handoff.",
            },
            {
              title: "Performance systems",
              body: "When latency and throughput matter — profiling, redesign, and measurable gains.",
            },
            {
              title: "Technical partnership",
              body: "A steady engineer in the loop for roadmap decisions, reviews, and hard problems.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">Selected outcomes</h2>
          <Link to="/work" className="text-primary text-sm font-medium">
            All work
          </Link>
        </div>
        <ul className="divide-border mt-10 divide-y">
          {featured.map((study) => (
            <li
              key={study.slug}
              className="flex flex-col gap-2 py-8 md:flex-row md:items-baseline md:justify-between"
            >
              <div>
                <h3 className="text-xl font-medium">{study.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{study.summary}</p>
              </div>
              <a
                href={`${site.portfolioUrl}${study.portfolioPath}`}
                className="text-primary shrink-0 text-sm font-medium"
              >
                Case study
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="bg-muted rounded-2xl px-8 py-12 md:px-12">
          <h2 className="text-3xl font-semibold tracking-tight">Ready when you are</h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed">
            Tell me what you are building, where it hurts, and what success looks like. I will reply
            with fit, timeline, and next steps.
          </p>
          <Link
            to="/contact"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-8 inline-flex rounded-md px-5 py-3 text-sm font-medium"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}
