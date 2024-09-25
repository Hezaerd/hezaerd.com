"use client";

import useSWR from "swr";

import { type ProjectItem, getLatestProjects } from "@/schemas/project-item";

import { Button } from "@/components/ui/button";
import { ProjectIcon } from "@/components/icons/project-icon";
import { ProjectSkeleton } from "@/components/ui/project-skeleton";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export default function ProjectsBento() {
  const { data, error } = useSWR("projects", getLatestProjects);
  const projects: ProjectItem[] = [];

  if (error) {
    return (
      <section className="mt-16 flex w-full flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Latest Projects</h1>
        <div className="text-center text-destructive">
          Failed to load projects
        </div>

        <Button
          onClick={() => {
            window.location.reload();
          }}
          className="btn btn-primary"
        >
          Retry
        </Button>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mt-16 flex w-full flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Latest Contributions</h1>
        <div className="text-center text-primary/80">Loading projects...</div>
      </section>
    );
  }

  data.forEach((project: any) => {
    projects.push({
      title: project.name,
      description: project.description,
      header: <ProjectSkeleton />,
      className: "",
      icon: (
        <ProjectIcon src={project.owner.avatar_url} alt={project.owner.login} />
      ),
      html_url: project.html_url,
    });
  });

  return (
    <section className="mt-16 flex w-full flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Latest Contributions</h1>
      <BentoGrid className="max-w-8xl mx-auto">
        {projects.map((project, i) => (
          <a
            key={i}
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className={i === 3 ? "md:col-span-2" : ""}
          >
            <BentoGridItem
              key={i}
              title={project.title}
              header={project.header}
              description={
                project.description === "null"
                  ? "No description provided"
                  : project.description
              }
              className={"h-full"}
              icon={project.icon}
            />
          </a>
        ))}
      </BentoGrid>
    </section>
  );
}
