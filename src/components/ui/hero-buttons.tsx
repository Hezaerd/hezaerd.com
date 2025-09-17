"use client";

import { FolderGit2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_IDS } from "@/lib/sections";

export function HeroButtons() {
	const scrollToProjects = () => {
		document.getElementById(SECTION_IDS.projects)?.scrollIntoView({
			behavior: "smooth",
		});
	};

	const openResume = () => {
		window.open(`/resume.pdf`, "_blank");
	};

	return (
		<>
			<Button
				variant="default"
				size="lg"
				className="hover:bg-primary/70 hover:shadow-lg transition-all duration-200"
				onClick={scrollToProjects}
			>
				<FolderGit2 className="w-5 h-5" />
				View Portfolio
			</Button>
			<Button
				variant="outline"
				size="lg"
				onClick={openResume}
			>
				<Wrench className="w-5 h-5" />
				Download Resume
			</Button>
		</>
	);
}
