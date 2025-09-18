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
		title: "Full stack & game developer",
		company: "Hectiq",
		period: "2024 (4 months)",
		description: "Prototyping and development in autonomous mode of both a Twitch extension and integration for a game.",
		color: "primary",
	},
	{
		title: "Game developer",
		company: "Vagabond",
		period: "2022 (2 months)",
		description: "Development of a VR serious game to talk about poverty.",
		color: "accent",
	},
];

export const education: Education[] = [
    {
        degree: "Game Programming",
        school: "Isart Digital Paris",
        period: "2023 - 2025",
        description: ""
    },
	{
		degree: "Game Engine Programing",
		school: "Isart Digital Montreal",
		period: "2021 - 2023",
		description: "",
	},
];
