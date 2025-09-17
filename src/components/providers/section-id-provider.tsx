"use client";

import { createContext, type ReactNode, useContext, useId } from "react";

interface SectionIds {
	home: string;
	about: string;
	projects: string;
	resume: string;
	githubStats: string;
	contact: string;
}

interface SectionIdsContextType {
	sectionIds: SectionIds;
	navigationItems: Array<{
		name: string;
		href: string;
		icon: any;
		id: string;
	}>;
}

const SectionIdsContext = createContext<SectionIdsContextType | undefined>(
	undefined,
);

interface SectionIdsProviderProps {
	children: ReactNode;
}

export function SectionIdsProvider({ children }: SectionIdsProviderProps) {
	const homeId = useId();
	const aboutId = useId();
	const projectsId = useId();
	const resumeId = useId();
	const githubStatsId = useId();
	const contactId = useId();

	const sectionIds: SectionIds = {
		home: homeId,
		about: aboutId,
		projects: projectsId,
		resume: resumeId,
		githubStats: githubStatsId,
		contact: contactId,
	};

	// Import icons here to avoid circular dependencies
	const {
		Briefcase,
		FileText,
		Github,
		Home,
		Mail,
		User,
	} = require("lucide-react");

	const navigationItems = [
		{ name: "Home", href: `#${homeId}`, icon: Home, id: homeId },
		{ name: "About", href: `#${aboutId}`, icon: User, id: aboutId },
		{
			name: "Projects",
			href: `#${projectsId}`,
			icon: Briefcase,
			id: projectsId,
		},
		{ name: "Resume", href: `#${resumeId}`, icon: FileText, id: resumeId },
		{
			name: "GitHub",
			href: `#${githubStatsId}`,
			icon: Github,
			id: githubStatsId,
		},
		{ name: "Contact", href: `#${contactId}`, icon: Mail, id: contactId },
	];

	return (
		<SectionIdsContext.Provider value={{ sectionIds, navigationItems }}>
			{children}
		</SectionIdsContext.Provider>
	);
}

export function useSectionIds() {
	const context = useContext(SectionIdsContext);
	if (context === undefined) {
		throw new Error("useSectionIds must be used within a SectionIdsProvider");
	}
	return context;
}