import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";

import { getProjects } from "@/data/projects";

import { Reveal, RevealItem, RevealStagger } from "./reveal";
import { Section } from "./section";

export function ProjectsSection() {
  const projects = getProjects();

  return (
    <Section
      id="projects"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-7xl">
        <Reveal>
          <h2 className="font-display text-foreground mb-10 flex items-center justify-center gap-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            <HugeiconsIcon icon={Folder01Icon} size={28} className="text-primary" />
            Featured Projects
          </h2>
        </Reveal>

        <RevealStagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <RevealItem key={project.slug}>
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="border-border bg-card group/project flex h-full flex-col overflow-hidden rounded-lg border shadow-lg transition-[box-shadow,transform] duration-(--duration-ui) ease-out hover:shadow-xl"
              >
                <div className="relative h-40 shrink-0 overflow-hidden">
                  {project.previewImage ? (
                    <img
                      src={project.previewImage}
                      alt={`${project.title} preview`}
                      className="project-card-media h-full w-full object-cover"
                    />
                  ) : (
                    <div className="project-card-media from-primary via-primary/90 to-primary/70 text-primary-foreground flex h-full items-center justify-center bg-gradient-to-br p-4 text-center text-lg font-bold">
                      {project.highlight || project.title}
                    </div>
                  )}
                </div>
                <div className="flex flex-grow flex-col p-4">
                  <h3 className="font-display text-card-foreground group-hover/project:text-primary mb-2 text-lg font-semibold tracking-tight transition-colors duration-(--duration-ui) ease-out">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-3 line-clamp-3 flex-grow text-sm">
                    {project.description}
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-primary text-xs font-medium">View details →</span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </Section>
  );
}
