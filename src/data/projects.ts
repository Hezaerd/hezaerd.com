export interface Project {
	title: string;
	description: string;
	tags: string[];
	highlight?: string;
	previewImage?: string;
	previewVideo?: string;
	longDescription?: string;
	features?: string[];
	challenges?: string[];
	technologies?: string[];
	githubUrl?: string;
	liveUrl?: string;
	duration?: string;
	teamSize?: string;
	role?: string;
}

export const projects: Project[] = [
	{
		title: "Stellar Suplex",
		description:
			"Mobile action rhythm game where gameplay and visuals dynamically react to music in real-time",
		tags: ["C#", "Unity", "Wwise"],
		highlight: "Stellar Suplex",
        previewImage: "/images/stellar-suplex.jpg",
		previewVideo: "/videos/stellar-suplex.mp4",
		longDescription:
			"An innovative mobile action rhythm game that seamlessly integrates Wwise as a secondary game engine for real-time audio processing. As the lead programmer on a 16-developer team, I architected a scalable codebase and designed a sophisticated system that processes Wwise audio events in real-time, making the entire game world - from gameplay mechanics to visual effects - react dynamically to the rhythm and intensity of the music.",
		features: [
			"Real-time audio event processing from Wwise integration",
			"Dynamic gameplay that adapts to music rhythm and intensity",
			"Synchronized visual effects and environment changes",
			"Optimized mobile performance maintaining 60fps",
			"Scalable architecture supporting large development teams",
			"Advanced audio-visual synchronization system",
			"Efficient battery consumption optimization",
		],
		challenges: [
			"Architecting scalable codebase for 16-developer team collaboration",
			"Squeezing maximum performance from Unity and Wwise on mobile hardware",
			"Achieving stable 60fps with normal battery consumption on mobile devices",
			"Designing real-time audio event processing system for rhythm-based mechanics",
			"Coordinating with sound designers to create responsive audio-visual experiences",
		],
		technologies: [
			"C#",
			"Unity",
			"Wwise",
			"Android",
			"Jira",
			"Perforce",
		],
		duration: "9 months",
		teamSize: "16 developers",
		role: "Lead Programmer & Technical Architect",
	},
	{
		title: "Physics Sandbox",
		description:
			"An interactive physics simulation tool for rapid prototyping and educational demos. Built with C# and Unity.",
		tags: ["C#", "Unity", "Physics"],
		highlight: "Physics Sandbox",
		// previewImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=240&fit=crop&crop=center",
		longDescription:
			"An advanced physics simulation environment designed for educational purposes and rapid prototyping. Features real-time physics manipulation, interactive debugging tools, and a comprehensive library of physics demonstrations ranging from basic mechanics to complex fluid dynamics.",
		features: [
			"Real-time physics parameter manipulation",
			"Interactive force visualization and debugging",
			"Pre-built physics demonstrations library",
			"Custom constraint and joint systems",
			"Fluid dynamics simulation",
			"Particle system integration",
			"Export system for physics configurations",
		],
		challenges: [
			"Achieving stable physics simulation at variable framerates",
			"Implementing intuitive UI for complex physics parameters",
			"Optimizing performance for hundreds of interactive objects",
			"Creating educational content thats both accurate and engaging",
		],
		technologies: [
			"C#",
			"Unity 2022.3",
			"Unity Physics",
			"Burst Compiler",
			"Job System",
		],
		duration: "8 months",
		teamSize: "2 developers",
		role: "Physics Programmer & UI Designer",
	},
	{
		title: "Platformer Game",
		description:
			"A 2D platformer built in Unity, featuring a custom level editor and advanced character controller.",
		tags: ["Unity", "C#", "Level Editor"],
		highlight: "Platformer Game",
		longDescription:
			"A polished 2D platformer game featuring tight controls, creative level design, and a powerful level editor. The project showcases advanced character controller implementation, procedural animation systems, and user-generated content tools.",
		features: [
			"Precise character controller with coyote time and jump buffering",
			"Advanced animation system with procedural elements",
			"In-game level editor with sharing capabilities",
			"Dynamic lighting and particle effects",
			"Adaptive difficulty based on player performance",
			"Steam Workshop integration for user levels",
			"Accessibility options including colorblind support",
		],
		challenges: [
			"Creating responsive controls that feel great across different input devices",
			"Implementing a user-friendly level editor with intuitive workflows",
			"Balancing gameplay difficulty to maintain engagement",
			"Optimizing performance for smooth 60 FPS gameplay",
		],
		technologies: [
			"C#",
			"Unity 2022.3",
			"Unity Input System",
			"Timeline",
			"Cinemachine",
		],
		duration: "12 months",
		teamSize: "4 developers + 2 artists",
		role: "Lead Gameplay Programmer",
	},
];
