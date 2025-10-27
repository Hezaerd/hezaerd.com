import { forwardRef } from "react"
import Link from "next/link"
import { projects } from "@/data/projects"
import { SECTION_IDS } from "@/data/constants"

const ProjectsSection = forwardRef<HTMLElement>((_, ref) => {
	// Select featured projects (first 6)
	const featuredProjects = projects.slice(0, 6)

	return (
		<section
			id={SECTION_IDS.PROJECTS}
			ref={ref}
			className="min-h-screen py-20 sm:py-32 opacity-0"
		>
			<div className="space-y-12 sm:space-y-16">
				<div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
					<h2 className="text-3xl sm:text-4xl font-light">Featured Projects</h2>
					<div className="text-sm text-muted-foreground font-mono">2019 — 2025</div>
				</div>

				<div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
					{featuredProjects.map((project, index) => (
						<article
							key={index}
							className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer"
						>
							<div className="space-y-4">
								<div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
									<span>{project.duration || "N/A"}</span>
									<span>{project.teamSize || "N/A"}</span>
								</div>

								<h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
									{project.title}
								</h3>

								<p className="text-muted-foreground leading-relaxed line-clamp-3">
									{project.description}
								</p>

								<div className="flex flex-wrap gap-2 pt-2">
									{project.tags.slice(0, 3).map((tag) => (
										<span
											key={tag}
											className="px-2 py-1 text-xs text-muted-foreground border border-border rounded transition-colors duration-300"
										>
											{tag}
										</span>
									))}
									{project.tags.length > 3 && (
										<span className="px-2 py-1 text-xs text-muted-foreground">
											+{project.tags.length - 3} more
										</span>
									)}
								</div>

								<div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 pt-2">
									<span>Learn more</span>
									<svg
										className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</div>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	)
})

ProjectsSection.displayName = "ProjectsSection"

export { ProjectsSection }
