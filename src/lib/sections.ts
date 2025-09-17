import {
	Briefcase,
	FileText,
	Github,
	Home,
	Mail,
	User,
} from "lucide-react";

// Static section IDs - no client-side hooks needed
export const SECTION_IDS = {
	home: "home",
	about: "about",
	projects: "projects",
	resume: "resume",
	githubStats: "github-stats",
	contact: "contact",
} as const;

// Navigation items for navbar
export const NAVIGATION_ITEMS = [
	{ name: "Home", href: `#${SECTION_IDS.home}`, icon: Home, id: SECTION_IDS.home },
	{ name: "About", href: `#${SECTION_IDS.about}`, icon: User, id: SECTION_IDS.about },
	{ name: "Projects", href: `#${SECTION_IDS.projects}`, icon: Briefcase, id: SECTION_IDS.projects },
	{ name: "Resume", href: `#${SECTION_IDS.resume}`, icon: FileText, id: SECTION_IDS.resume },
	{ name: "GitHub", href: `#${SECTION_IDS.githubStats}`, icon: Github, id: SECTION_IDS.githubStats },
	{ name: "Contact", href: `#${SECTION_IDS.contact}`, icon: Mail, id: SECTION_IDS.contact },
] as const;
