import { Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { getProjects } from "@/data/projects";

import { ProjectCard } from "./project-card";
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
              <ProjectCard project={project} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </Section>
  );
}
