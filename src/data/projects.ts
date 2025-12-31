export interface Project {
	title: string;
	description: string;
	tags: Array<string>;
	highlight?: string;
	previewImage?: string;
	previewVideo?: string;
	longDescription?: string;
	features?: Array<string>;
	challenges?: Array<string>;
	technologies?: Array<string>;
	sourcesUrl?: string;
	releaseUrl?: string;
	duration?: string;
	teamSize?: string;
	role?: string;
}

export const PROJECTS = [
    
] as const satisfies Array<Project>