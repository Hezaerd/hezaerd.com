import { AnimatedFadeIn } from "@/components/ui/animated-wrapper";
import { SECTION_IDS } from "@/lib/sections";
import { ProjectsClient } from "./projects-client";

export function Projects() {
	return (
		<section
			id={SECTION_IDS.projects}
			className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8"
		>
			<div className="max-w-7xl mx-auto w-full">
				<AnimatedFadeIn className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8 flex items-center justify-center gap-2">
					<svg
						className="w-7 h-7 text-primary"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<title>Projects Icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 1v6"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M16 1v6"
						/>
					</svg>{" "}
					Featured Projects
				</AnimatedFadeIn>

				<ProjectsClient />
			</div>
		</section>
	);
}
