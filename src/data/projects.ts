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
		technologies: ["C#", "Unity", "Wwise", "Android", "Jira", "Perforce"],
		duration: "9 months",
		teamSize: "16 developers",
		role: "Lead Programmer & Technical Architect",
	},
	{
		title: "Los Pingheros",
		description: "Los Pingheros is a chaotic 8-player arena brawler set in a snowy Mexican world, where penguins battle to be the last one standing.",
		tags: ["C#", "Unity", "TypeScript", "Node.js"],
		highlight: "Los Pingheros",
        previewImage: "/images/los-pingheros.jpg",
        previewVideo: "/videos/los-pingheros.webm",
		longDescription: "As a programmer on 'Los Pingheros,' I developed a real-time Twitch integration that allows streamers and their audience to interact with the game. This involved creating a responsive Twitch overlay, a Node.js backend to manage interactions, and a WebSocket communication system to seamlessly connect the overlay with the Unity game. My work enabled viewers to appear as spectator 'pingheros' in-game and optimized the backend to minimize latency for a dynamic, engaging experience.",
		features: [
			"Interactate with the game through a Twitch overlay",
            "Appear in the game as a spectator pinghero when viewing the stream",
            "Node.JS backend to handle the Twitch overlay and the game",
            "Websocket to communicate with the game",
		],
		challenges: [
			"Implementing a Twitch overlay that is responsive and works with the game",
			"Implementing a Websocket to communicate with the game",
            "Optimizing the performance of the backend to reduce the latency between the game and the Twitch overlay",
		],
		technologies: [
			"Unity",
			"C#",
            "Quantum ECS",
			"TypeScript",
			"Node.js",
			"Twitch Game SDK",
			"Twitch API",
		],
		duration: "4 months",
		teamSize: "8 developers",
		role: "Programmer",
	}
];
