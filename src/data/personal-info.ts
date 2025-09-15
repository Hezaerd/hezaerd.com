export interface PersonalInfo {
	name: string;
	role: string;
	bio: string;
	email: string;
	location: string;
	github: string;
	linkedin: string;
	twitter?: string;
	website?: string;
}

export const personalInfo: PersonalInfo = {
	name: "Hezaerd",
	role: "Software Engineer",
	bio: "Passionate about building high-performance game engines, tools, and interactive experiences. Specialized in C++, C#, and real-time graphics.",
	email: "hezaerd@hezaerd.com",
	location: "Martinique, France",
	github: "https://github.com/hezaerd",
	linkedin: "https://linkedin.com/in/hezaerd",
	website: "https://hezaerd.com",
};
