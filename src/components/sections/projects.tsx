"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import {
	ChevronLeft,
	ChevronRight,
	FolderGit2,
	Mail,
	Search,
	User,
	Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProjectModal } from "@/components/project-modal";
import { useSectionIds } from "@/components/providers/SectionIdsProvider";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

export function Projects() {
	const { sectionIds } = useSectionIds();
	const [selectedProject, setSelectedProject] = useState<
		(typeof projects)[0] | null
	>(null);
	const [hoveredCard, setHoveredCard] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [isMac, setIsMac] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);

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
		[Autoplay({ delay: 4000, stopOnInteraction: true })],
	);

	const scrollPrev = useCallback(() => {
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	// Reset carousel when search changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reinit the carousel when the filtered projects change
	useEffect(() => {
		if (emblaApi) {
			emblaApi.reInit();
		}
	}, [emblaApi, filteredProjects]);

	// Keyboard shortcut to focus search (Ctrl+K or Cmd+K)
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<section
			id={sectionIds.projects}
			className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8"
		>
			<div className="max-w-7xl mx-auto w-full">
				<motion.h2
					className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8 flex items-center justify-center gap-2"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					viewport={{ once: true }}
				>
					<FolderGit2 className="w-7 h-7 text-primary" /> Featured Projects
				</motion.h2>

				{/* Search Bar */}
				<motion.div
					className="max-w-md mx-auto mb-8"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					viewport={{ once: true }}
				>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
						<input
							type="text"
							placeholder="Search projects by name, description, or tag..."
							value={searchTerm}
							onChange={(e) => {
								const value = e.target.value;
								setSearchTerm(value);
							}}
							className="w-full pl-10 pr-16 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-card-foreground placeholder-muted-foreground"
							ref={searchInputRef}
						/>
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded border opacity-60">
							<kbd className="font-mono">{isMac ? "⌘" : "Ctrl"} K</kbd>
						</div>
					</div>
				</motion.div>

				{/* Carousel Container */}
				<motion.div
					className="relative"
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					viewport={{ once: true }}
				>
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
								<motion.div
									key={`${project.title}-${index}`}
									className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
									initial={{ opacity: 0, scale: 0.9 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.4, delay: index * 0.1 }}
									viewport={{ once: true }}
								>
									<motion.div
										className="bg-card rounded-lg shadow-lg overflow-hidden border border-border cursor-pointer mx-2 h-full"
										onClick={() => setSelectedProject(project)}
										onHoverStart={() => setHoveredCard(project.title)}
										onHoverEnd={() => setHoveredCard(null)}
										whileHover={{
											y: -12,
											boxShadow:
												"0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)",
											transition: { duration: 0.3, ease: "easeOut" },
										}}
										whileTap={{ scale: 0.98 }}
									>
										<motion.div
											className="h-40 bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center text-primary-foreground text-lg font-bold p-4 text-center"
											animate={{
												scale: hoveredCard === project.title ? 1.05 : 1,
												filter:
													hoveredCard === project.title
														? "brightness(0.9)"
														: "brightness(1)",
											}}
											transition={{ duration: 0.2 }}
										>
											{project.highlight || project.title}
										</motion.div>
										<div className="p-4">
											<motion.h3
												className="text-lg font-semibold text-card-foreground mb-2 flex items-center gap-2"
												animate={{
													color:
														hoveredCard === project.title
															? "hsl(var(--primary))"
															: "hsl(var(--card-foreground))",
												}}
												transition={{ duration: 0.2 }}
											>
												<FolderGit2 className="w-4 h-4 text-primary" />
												{project.title}
											</motion.h3>
											<p className="text-muted-foreground mb-3 text-sm line-clamp-3">
												{project.description}
											</p>
											<div className="flex gap-1 flex-wrap mb-3">
												{project.tags.slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center gap-1"
													>
														{tag === "C++" && (
															<Wrench className="w-3 h-3 text-primary" />
														)}
														{tag === "Unity" && (
															<User className="w-3 h-3 text-primary" />
														)}
														{tag === "AI" && (
															<Mail className="w-3 h-3 text-primary" />
														)}
														{tag}
													</span>
												))}
												{project.tags.length > 3 && (
													<span className="px-2 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-full">
														+{project.tags.length - 3}
													</span>
												)}
											</div>
											<div className="text-xs text-primary font-medium relative inline-block">
												<span>Click to view details →</span>
												<motion.div
													className="absolute bottom-0 left-0 h-0.5 bg-primary w-full"
													animate={{
														scaleX: hoveredCard === project.title ? 1 : 0,
													}}
													style={{ originX: 0 }}
													transition={{ duration: 0.3, ease: "easeOut" }}
												/>
											</div>
										</div>
									</motion.div>
								</motion.div>
							))}
						</div>
					</div>

					{/* Search Results Info */}
					{searchTerm && (
						<motion.div
							className="text-center mt-4 text-sm text-muted-foreground"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							{filteredProjects.length === 0 ? (
								<span>No projects found matching "{searchTerm}"</span>
							) : (
								<span>
									Showing {filteredProjects.length} of {projects.length}{" "}
									projects
									{filteredProjects.length < projects.length &&
										` for "${searchTerm}"`}
								</span>
							)}
						</motion.div>
					)}
				</motion.div>
			</div>

			{/* Project Detail Modal */}
			{selectedProject && (
				<ProjectModal
					project={selectedProject}
					isOpen={!!selectedProject}
					onClose={() => setSelectedProject(null)}
				/>
			)}
		</section>
	);
}
