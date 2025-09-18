import { Briefcase, FileText, Github, Home, User } from "lucide-react";

export const SECTION_IDS = {
	home: "home",
	about: "about",
	projects: "projects",
	resume: "resume",
	githubStats: "github-stats",
} as const;

export const NAVIGATION_ITEMS = [
	{
		name: "Home",
		href: `#${SECTION_IDS.home}`,
		icon: Home,
		id: SECTION_IDS.home,
	},
	{
		name: "About",
		href: `#${SECTION_IDS.about}`,
		icon: User,
		id: SECTION_IDS.about,
	},
	{
		name: "Projects",
		href: `#${SECTION_IDS.projects}`,
		icon: Briefcase,
		id: SECTION_IDS.projects,
	},
	{
		name: "Resume",
		href: `#${SECTION_IDS.resume}`,
		icon: FileText,
		id: SECTION_IDS.resume,
	},
	{
		name: "GitHub",
		href: `#${SECTION_IDS.githubStats}`,
		icon: Github,
		id: SECTION_IDS.githubStats,
	},
] as const;
