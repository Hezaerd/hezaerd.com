"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, GitBranch, ArrowUpRight, Github } from "lucide-react";
import { motion } from "framer-motion";
import useSWR from "swr";

interface Repository {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

interface ProjectsData {
  pinned: Repository[];
  recent: Repository[];
}

// GitHub language colors
const languageColors: { [key: string]: string } = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#CC342D",
  Go: "#00ADD8",
  Rust: "#DEA584",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
  Vue: "#41B883",
  React: "#61DAFB",
  Svelte: "#FF3E00",
};

function ProjectCard({
  project,
  index,
}: {
  project: Repository;
  index: number;
}) {
  const languageColor = project.language
    ? languageColors[project.language] || "#6e7681"
    : "#6e7681";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      whileTap={{ y: 0 }}
    >
      <Card className="group flex h-full flex-col p-4 transition-all duration-200 hover:border-primary hover:shadow-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-2 flex items-start justify-between"
        >
          <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
            {project.name}
          </h3>
          <motion.a
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-primary"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center"
            >
              <ArrowUpRight
                size={20}
                className="transition-opacity duration-200 group-hover:opacity-0"
              />
              <Github
                size={20}
                className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </motion.div>
          </motion.a>
        </motion.div>
        <p className="mb-4 flex-grow text-sm text-muted-foreground">
          {project.description || "No description available"}
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="flex items-center gap-4 text-sm text-muted-foreground"
        >
          {project.language && (
            <span className="flex items-center gap-1">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: languageColor }}
              />
              {project.language}
            </span>
          )}
          <motion.span
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <Star size={16} className="text-yellow-500" fill="currentColor" />
            {project.stargazers_count}
          </motion.span>
          <motion.span
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <GitBranch size={16} />
            {project.forks_count}
          </motion.span>
        </motion.div>
      </Card>
    </motion.div>
  );
}

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
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Recently Updated Projects</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.recent.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
