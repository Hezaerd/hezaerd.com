import { getBrandCaseStudies } from "@hezaerd/content";

import { createFileRoute } from "@tanstack/react-router";

import { site } from "@/lib/site";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Hezaerd" },
      {
        name: "description",
        content: "Selected commercial work and outcomes. Full case studies live on the portfolio.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hezaerd.com/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  const studies = getBrandCaseStudies();

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Work</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
        A curated commercial showcase. Deep dives, experiments, and personal projects live on{" "}
        <a href={site.portfolioUrl} className="text-primary">
          portfolio.hezaerd.com
        </a>
        .
      </p>

      <ul className="divide-border mt-14 divide-y">
        {studies.map((study) => (
          <li key={study.slug} className="py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{study.title}</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">{study.summary}</p>
                <p className="text-muted-foreground mt-4 text-sm">
                  {study.role} · {study.tags.join(" · ")}
                </p>
              </div>
              <a
                href={`${site.portfolioUrl}${study.portfolioPath}`}
                className="text-primary shrink-0 text-sm font-medium"
                rel="noopener noreferrer"
              >
                Full case study
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
