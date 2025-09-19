import { FolderGit2 } from "lucide-react";
import { SECTION_IDS } from "@/lib/sections";
import { ProjectsClient } from "./projects-client";

export function Projects() {
	return (
		<section
			id={SECTION_IDS.projects}
			className="min-h-screen flex flex-col justify-center py-16 px-4 sm:px-6 lg:px-8"
		>
			<div className="max-w-7xl mx-auto w-full">
				<div className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-8 flex items-center justify-center gap-2">
					<FolderGit2 className="w-7 h-7 text-primary" />
					Featured Projects
				</div>

				<ProjectsClient />
			</div>
		</section>
	);
}
