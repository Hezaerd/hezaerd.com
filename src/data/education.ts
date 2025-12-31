export interface Education {
	degree: string;
	school: string;
	period: string;
	description: string;
}

export const EDUCATION = [
    {
        degree: "Game Programming",
		school: "Isart Digital Paris",
		period: "2023 - 2025",
		description: "Switched to the Paris campus to pursue a specialization in Game Programming.",
    },
	{
		degree: "Game Engine Programing",
		school: "Isart Digital Montreal",
		period: "2021 - 2023",
		description: "Specialized in Game Engine Programing, with a focus on developing a game engine from scratch.",
	},
] as const satisfies Array<Education>