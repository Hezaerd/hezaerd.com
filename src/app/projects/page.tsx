"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  ExternalLink,
  Star,
  GitBranch,
  Code,
  Calendar,
  Filter,
  Grid3X3,
  List,
  Search
} from "lucide-react";
import { Repository } from "@/components/projects/types";
import { GitHubData } from "@/interfaces/github";
import { createMetadata } from "@/lib/metadata";
import ProjectStats from "./components/project-stats";

const manualProjects: Repository[] = [
  {
    id: 1,
    name: "Stellar Suplex",
    description: "A 2D platformer game where you play as a space cowboy who can suplex enemies to death.",
    html_url: "https://isart-digital.itch.io/stellarsuplex",
    language: "C#",
    thumbnail: "https://via.placeholder.com/400x250/374151/ffffff?text=Stellar+Suplex",
    categories: ["Game Development", "Unity"],
    featured: true,
  },
  {
    id: 2,
    name: "Portfolio Website",
    description: "A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Features dark mode, animations, and a clean design.",
    html_url: "https://github.com/hezaerd/portfolio",
    language: "TypeScript",
    thumbnail: "https://via.placeholder.com/400x250/1f2937/ffffff?text=Portfolio",
    categories: ["Web Development", "Full Stack"],
    featured: true,
  },
  {
    id: 3,
    name: "AI Chat Application",
    description: "A real-time chat application powered by AI with natural language processing capabilities.",
    html_url: "https://github.com/hezaerd/ai-chat",
    language: "Python",
    thumbnail: "https://via.placeholder.com/400x250/059669/ffffff?text=AI+Chat",
    categories: ["Full Stack", "Data Science", "AI/ML"],
    featured: false,
  },
  {
    id: 4,
    name: "Mobile Fitness Tracker",
    description: "Cross-platform mobile app for tracking workouts and fitness goals with social features.",
    html_url: "https://github.com/hezaerd/fitness-tracker",
    language: "Dart",
    thumbnail: "https://via.placeholder.com/400x250/7c3aed/ffffff?text=Fitness+App",
    categories: ["Mobile", "Full Stack"],
    featured: false,
  },
  {
    id: 5,
    name: "DevOps Pipeline",
    description: "Automated CI/CD pipeline with Docker, Kubernetes, and cloud deployment.",
    html_url: "https://github.com/hezaerd/devops-pipeline",
    language: "YAML",
    thumbnail: "https://via.placeholder.com/400x250/1e40af/ffffff?text=DevOps",
    categories: ["DevOps", "Cloud"],
    featured: false,
  }
];

interface ProjectsData {
  pinned: Repository[];
  recent: Repository[];
}

// Get all unique categories from projects
const getAllCategories = (projects: Repository[]) => {
  const categorySet = new Set<string>();
  projects.forEach(project => {
    project.categories?.forEach(category => categorySet.add(category));
  });
  return ["All", ...Array.from(categorySet).sort()];
};

const viewModes = [
  { id: "grid", icon: Grid3X3, label: "Grid" },
  { id: "list", icon: List, label: "List" }
];

// export const metadata = createMetadata({
//   title: "Projects",
//   description: "My GitHub projects",
// });

export default function Projects() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const [fallbackData, setFallbackData] = useState<ProjectsData | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedData = localStorage.getItem("projects");
      if (cachedData) {
        setFallbackData(JSON.parse(cachedData));
      }
    }
  }, []);

  const { data: projects, error, isLoading } = useSWR<ProjectsData>(
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

  // Fetch GitHub stats from the same API as the stats page
  const { data: githubStats } = useSWR<GitHubData>(
    "/api/github/stats",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  // Combine all projects
  const allProjects = [
    ...(projects?.pinned || []),
    ...(projects?.recent || []),
    ...manualProjects
  ];

  // Filter projects based on category and search
  const filteredProjects = allProjects.filter(project => {
    const matchesCategory = selectedCategory === "All" ||
                           project.categories?.includes(selectedCategory);
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProjects = filteredProjects.filter(project => project.featured);
  const regularProjects = filteredProjects.filter(project => !project.featured);

  // Use GitHub stats from the API instead of calculating from projects
  const totalProjects = githubStats?.stats.public_repos || 0;
  const totalStars = githubStats?.stats.total_stars || 0;
  const totalForks = githubStats?.stats.total_forks || 0;
  const topLanguage = githubStats?.top_languages?.[0]?.language || "None";
  const totalContributions = githubStats?.stats.total_commits || 0;

  // Get dynamic categories from all projects
  const categories = getAllCategories(allProjects);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-8 text-center">
          <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Failed to load projects</h2>
          <p className="text-muted-foreground">Please try again later</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16 pt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A collection of my work, experiments, and contributions to the developer community.
            From games to libraries passing by web applications, here&apos;s what I&apos;ve been building.
          </p>
        </motion.div>

                {/* Project Statistics */}
        <ProjectStats
          totalProjects={totalProjects}
          totalStars={totalStars}
          totalForks={totalForks}
          topLanguage={topLanguage}
          totalContributions={totalContributions}
        />

        {/* Filters and Search */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="transition-all duration-200"
                    >
                      {category}
                    </Button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  {viewModes.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={viewMode === mode.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode(mode.id)}
                      className="transition-all duration-200"
                    >
                      <mode.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Featured Projects
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProjects.map((project, index) => (
                <FeaturedProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* All Projects */}
        {regularProjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6">All Projects</h2>
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {regularProjects.map((project, index) => (
                viewMode === "grid" ? (
                  <ProjectCard key={project.id} project={project} index={index} />
                ) : (
                  <ProjectListItem key={project.id} project={project} index={index} />
                )
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && !isLoading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Featured Project Card Component
function FeaturedProjectCard({ project, index }: { project: Repository; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative">
          <img
            src={project.thumbnail || `https://via.placeholder.com/600x300/1f2937/ffffff?text=${project.name}`}
            alt={project.name}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{project.name}</h3>
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {project.description}
          </p>
          <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
               {project.language && (
                 <Badge variant="secondary">
                   <Code className="h-3 w-3 mr-1" />
                   {project.language}
                 </Badge>
               )}
               {project.categories?.map((category, index) => (
                 <Badge key={index} variant="outline">{category}</Badge>
               ))}
             </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {project.stargazers_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {project.stargazers_count}
                </span>
              )}
              {project.forks_count !== undefined && (
                <span className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  {project.forks_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Regular Project Card Component
function ProjectCard({ project, index }: { project: Repository; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative">
          <img
            src={project.thumbnail || `https://via.placeholder.com/400x200/1f2937/ffffff?text=${project.name}`}
            alt={project.name}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {project.language && (
                <Badge variant="secondary" className="text-xs">
                  {project.language}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {project.stargazers_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {project.stargazers_count}
                </span>
              )}
              {project.forks_count !== undefined && (
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {project.forks_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// List View Component
function ProjectListItem({ project, index }: { project: Repository; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group p-4 hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4">
          <img
            src={project.thumbnail || `https://via.placeholder.com/80x80/1f2937/ffffff?text=${project.name}`}
            alt={project.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {project.description}
            </p>
                         <div className="flex items-center gap-4">
               {project.language && (
                 <Badge variant="secondary" className="text-xs">
                   {project.language}
                 </Badge>
               )}
               {project.categories?.map((category, index) => (
                 <Badge key={index} variant="outline" className="text-xs">
                   {category}
                 </Badge>
               ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {project.stargazers_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.stargazers_count}
                  </span>
                )}
                {project.forks_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {project.forks_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
