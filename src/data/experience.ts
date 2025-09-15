export interface WorkExperience {
	title: string;
	company: string;
	period: string;
	description: string;
	color: "primary" | "accent";
}

export interface Education {
	degree: string;
	school: string;
	period: string;
	description: string;
}

export const workExperience: WorkExperience[] = [
	{
		title: "Senior Game Engine Developer",
		company: "TechCorp Studios",
		period: "2022 - Present",
		description:
			"Led the development of a custom 3D engine and tools for a cross-platform game project.",
		color: "primary",
	},
	{
		title: "Gameplay Programmer",
		company: "GameDev Solutions",
		period: "2020 - 2022",
		description:
			"Implemented core gameplay systems and optimized performance for shipped titles.",
		color: "accent",
	},
];

export const education: Education[] = [
	{
		degree: "AEC Game Engine Programing",
		school: "Isart Digital Montreal",
		period: "2018 - 2020",
		description: "skibidi feur",
	},
];
