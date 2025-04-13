"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import GithubProjectCard from "./components/github-project-card";
import ManualProjectCard from "./components/manual-project-card";
import { Repository } from "@/components/projects/types";
import { createMetadata } from "@/lib/metadata";

const manualProjects: Repository[] = [
  {
    id: 1,
    name: "Manual Project 1",
    description: "Description for manual project 1",
    html_url: "https://github.com/user/manual-project-1",
    language: "JavaScript",
    thumbnail: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Manual Project 2",
    description: "Description for manual project 2",
    html_url: "https://github.com/user/manual-project-2",
    language: "TypeScript",
    thumbnail: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Manual Project 3",
    description: "Description for manual project 3",
    html_url: "https://github.com/user/manual-project-3",
    language: "Python",
    thumbnail: "https://via.placeholder.com/150",
  },
];

interface ProjectsData {
  pinned: Repository[];
  recent: Repository[];
}

// export const metadata = createMetadata({
//   title: "Projects",
//   description: "My GitHub projects",
// });

export default function Projects() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const [fallbackData, setFallbackData] = useState<ProjectsData | undefined>(
    undefined,
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedData = localStorage.getItem("projects");
      if (cachedData) {
        setFallbackData(JSON.parse(cachedData));
      }
    }
  }, []);

  const { data: projects, error } = useSWR<ProjectsData>(
    "/api/projects",
    fetcher,
    {
      fallbackData,
      onSuccess: (data) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("projects", JSON.stringify(data));
        }
      },
    },
  );

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to load projects</p>
      </div>
    );
  }

  if (!projects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <section id="projects" className="container mx-auto px-4 py-16">
      <h1 className="mb-12 mt-12 text-center text-3xl font-bold">
        My GitHub Projects
      </h1>
      <div className="space-y-12">
        <div>
          <h2 className="mb-6 text-2xl font-bold">Pinned Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.pinned.map((project, index) => (
              <GithubProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Recently Updated Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.recent.map((project, index) => (
              <GithubProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Manual Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {manualProjects.map((project, index) => (
              <ManualProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
