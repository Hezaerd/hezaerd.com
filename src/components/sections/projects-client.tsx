"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectModal } from "@/components/project-modal";
import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { Button } from "@/components/ui/button";
import { type Project, projects } from "@/data/projects";
import { ProjectCard } from "./project-card";

export function ProjectsClient() {
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [isMac, setIsMac] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// Create autoplay plugin reference
	const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

	// Detect operating system
	useEffect(() => {
		const platform = navigator.platform.toLowerCase();
		const userAgent = navigator.userAgent.toLowerCase();
		setIsMac(platform.includes("mac") || userAgent.includes("mac"));
	}, []);

	// Filter projects based on search term
	const filteredProjects = projects.filter(
		(project) =>
			project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			project.tags.some((tag) =>
				tag.toLowerCase().includes(searchTerm.toLowerCase()),
			),
	);

	// Carousel setup with autoplay
	const [emblaRef, emblaApi] = useEmblaCarousel(
		{
			loop: true,
			align: "start",
			slidesToScroll: 1,
			breakpoints: {
				"(min-width: 768px)": { slidesToScroll: 2 },
				"(min-width: 1024px)": { slidesToScroll: 3 },
			},
		},
		[autoplay.current],
	);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	// Handlers for pausing/resuming carousel on project hover
	const handleProjectHover = useCallback(() => {
		autoplay.current.stop();
	}, []);

	const handleProjectLeave = useCallback(() => {
		autoplay.current.reset();
	}, []);

	// Handler for project click with video time synchronization
	const handleProjectClick = useCallback((project: Project, videoTime?: number) => {
		setSelectedProject(project);
		setVideoCurrentTime(videoTime || 0);
	}, []);

	// Keyboard shortcut to focus search
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				searchInputRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<>
			{/* Search Bar */}
			<AnimatedFadeIn className="max-w-md mx-auto mb-8" delay={0.2}>
				<div className="relative group">
					<Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-all duration-300 ease-in-out ${
						isSearchFocused || searchTerm
							? "text-primary scale-110"
							: "text-muted-foreground group-hover:text-foreground"
					}`} />
					<input
						type="text"
						placeholder="Search projects by name, description, or tag..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
						}}
						onFocus={() => setIsSearchFocused(true)}
						onBlur={() => setIsSearchFocused(false)}
						ref={searchInputRef}
						className={`w-full pl-10 pr-20 py-3 text-sm bg-card border rounded-lg placeholder:text-muted-foreground transition-all duration-300 ease-in-out transform ${
							isSearchFocused
								? "scale-105 border-primary shadow-lg shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
								: "border-border hover:border-foreground/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
						}`}
					/>
					<div className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-muted px-2 py-1 rounded border flex items-center gap-1 transition-all duration-300 ease-in-out ${
						isSearchFocused
							? "text-primary border-primary/50 shadow-sm scale-105"
							: "text-muted-foreground border-border group-hover:text-foreground group-hover:border-foreground/30"
					}`}>
						<kbd className="font-mono">{isMac ? "⌘" : "Ctrl"} K</kbd>
					</div>
				</div>
			</AnimatedFadeIn>

			{/* Carousel Container */}
			<AnimatedFadeIn className="relative" delay={0.4}>
				{/* Navigation Buttons */}
				<Button
					onClick={scrollPrev}
					className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-accent hover:scale-110 transition-all duration-200"
					aria-label="Previous projects"
				>
					<ChevronLeft className="w-5 h-5 text-foreground" />
				</Button>
				<Button
					onClick={scrollNext}
					className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-accent hover:scale-110 transition-all duration-200"
					aria-label="Next projects"
				>
					<ChevronRight className="w-5 h-5 text-foreground" />
				</Button>

				{/* Carousel */}
				<div className="overflow-hidden py-8" ref={emblaRef}>
					<div className="flex">
						{filteredProjects.map((project, index) => (
							<ProjectCard
								key={`${project.title}-${index}`}
								project={project}
								index={index}
								onClick={(videoTime) => handleProjectClick(project, videoTime)}
								onHover={handleProjectHover}
								onLeave={handleProjectLeave}
							/>
						))}
					</div>
				</div>

				{/* Search Results Info */}
				{searchTerm && (
					<AnimatedFadeIn className="text-center mt-4 text-sm text-muted-foreground">
						{filteredProjects.length === 0 ? (
							<span>No projects found matching "{searchTerm}"</span>
						) : (
							<span>
								Showing {filteredProjects.length} of {projects.length} projects
								{filteredProjects.length < projects.length &&
									` for "${searchTerm}"`}
							</span>
						)}
					</AnimatedFadeIn>
				)}
			</AnimatedFadeIn>

			{/* Project Detail Modal */}
			{selectedProject && (
				<ProjectModal
					project={selectedProject}
					isOpen={!!selectedProject}
					onClose={() => setSelectedProject(null)}
					initialVideoTime={videoCurrentTime}
				/>
			)}
		</>
	);
}
