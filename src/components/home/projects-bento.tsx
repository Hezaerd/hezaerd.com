"use client";

import useSWR from "swr";
import { ReactNode } from "react";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ProjectSkeleton = () => (
  <div className="flex h-full min-h-[6rem] w-full flex-1 rounded-xl border border-border bg-background bg-dot-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>
);

const ProjectIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Avatar className="h-9 w-9">
    <AvatarImage src={src} alt={alt} className="mx-auto" />
    <AvatarFallback>
      <Skeleton className="h-9 w-9 rounded-full" />
    </AvatarFallback>
  </Avatar>
);

interface ProjectItem {
  title: string;
  description: string;
  header: ReactNode;
  className: string;
  icon: ReactNode;
  html_url?: string;
}

async function getLatestProjects() {
  const projectCount = 5;
  const url =
    "https://api.github.com/users/hezaerd/repos?sort=pushed&per_page=" +
    projectCount;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();

  return data;
}

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
      </section>
    );
  }

  if (!data) {
    return (
      <section className="mt-16 flex w-full flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Latest Projects</h1>
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
      <h1 className="text-2xl font-bold">Latest Projects</h1>
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
