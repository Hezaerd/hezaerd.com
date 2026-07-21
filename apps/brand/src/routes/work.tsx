import { createFileRoute } from "@tanstack/react-router";

import { getWork } from "@/data/work";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Hezaerd" },
      {
        name: "description",
        content: "Selected client work and commercial outcomes.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hezaerd.com/work" }],
  }),
  component: WorkPage,
});

function WorkPage() {
  const items = getWork();

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Work</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
        Real client engagements. Live sites and outcomes from commercial work.
      </p>

      <ul className="divide-border mt-14 divide-y">
        {items.map((item) => (
          <li key={item.slug} className="py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">{item.description}</p>
                <p className="text-muted-foreground mt-4 text-sm">
                  {[item.role, ...item.tags].filter(Boolean).join(" · ")}
                </p>
              </div>
              {item.releaseUrl ? (
                <a
                  href={item.releaseUrl}
                  className="text-primary shrink-0 text-sm font-medium"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Visit live site
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
