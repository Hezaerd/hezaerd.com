export interface Project {
	title: string;
	description: string;
	tags: string[];
	highlight?: string;
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
		title: "Custom Game Engine",
		description:
			"A 3D game engine built from scratch in C++ and OpenGL, featuring a real-time renderer, physics, and editor tools.",
		tags: ["C++", "OpenGL", "Engine"],
		highlight: "Custom Game Engine",
		longDescription:
			"A comprehensive 3D game engine developed from the ground up using modern C++ and OpenGL. This project demonstrates advanced engine architecture principles, real-time rendering techniques, and tool development. The engine features a component-based entity system, advanced material system, and a complete editor suite for level design and asset management.",
		features: [
			"Real-time 3D rendering with PBR materials",
			"Component-based Entity-Component-System (ECS)",
			"Integrated physics engine with collision detection",
			"Visual scripting system for gameplay logic",
			"Complete editor tools with scene hierarchy",
			"Asset pipeline with automatic optimization",
			"Cross-platform support (Windows",
			"Linux",
			"macOS)",
		],
		challenges: [
			"Implementing efficient memory management for large scenes",
			"Optimizing rendering pipeline for 60+ FPS on various hardware",
			"Designing a flexible architecture for different game genres",
			"Creating intuitive editor tools for non-programmers",
		],
		technologies: [
			"C++17",
			"OpenGL 4.5",
			"GLFW",
			"Dear ImGui",
			"Assimp",
			"PhysX",
		],
		duration: "18 months",
		teamSize: "Solo project",
		role: "Lead Engine Programmer",
	},
	{
		title: "Physics Sandbox",
		description:
			"An interactive physics simulation tool for rapid prototyping and educational demos. Built with C# and Unity.",
		tags: ["C#", "Unity", "Physics"],
		highlight: "Physics Sandbox",
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
	{
		title: "Rendering Demo",
		description:
			"Real-time rendering demo using DirectX 12, showcasing physically based rendering and post-processing effects.",
		tags: ["DirectX 12", "C++", "Rendering"],
		highlight: "Rendering Demo",
		longDescription:
			"A cutting-edge real-time rendering demonstration built with DirectX 12, showcasing modern graphics techniques including physically based rendering, advanced lighting models, and high-quality post-processing effects. This project demonstrates mastery of low-level graphics APIs and modern rendering pipelines.",
		features: [
			"Physically Based Rendering (PBR) with image-based lighting",
			"Real-time global illumination using screen-space techniques",
			"Temporal anti-aliasing (TAA) and other post-processing effects",
			"Dynamic environment mapping and reflections",
			"Volumetric lighting and atmospheric scattering",
			"Advanced material system with subsurface scattering",
			"GPU-driven rendering pipeline",
		],
		challenges: [
			"Managing DirectX 12s explicit resource management and synchronization",
			"Implementing efficient GPU memory allocation strategies",
			"Optimizing render passes for maximum GPU utilization",
			"Achieving high visual quality while maintaining real-time performance",
		],
		technologies: [
			"C++",
			"DirectX 12",
			"HLSL",
			"Win32 API",
			"PIX",
			"RenderDoc",
		],
		duration: "6 months",
		teamSize: "Solo project",
		role: "Graphics Programmer",
	},
	{
		title: "AI Pathfinding Toolkit",
		description:
			"Modular toolkit for A* and navigation mesh pathfinding, designed for easy integration into custom engines and Unity projects.",
		tags: ["C#", "Unity", "AI"],
		highlight: "AI Pathfinding Toolkit",
		longDescription:
			"A comprehensive pathfinding solution designed for game developers, featuring multiple pathfinding algorithms, navigation mesh generation, and dynamic obstacle avoidance. The toolkit is designed to be engine-agnostic while providing Unity-specific bindings for ease of use.",
		features: [
			"Multiple pathfinding algorithms (A*",
			"Dijkstra",
			"Flow Fields)",
			"Automatic navigation mesh generation and runtime updates",
			"Dynamic obstacle avoidance with local steering behaviors",
			"Hierarchical pathfinding for large worlds",
			"Multi-threaded pathfinding with job system integration",
			"Visual debugging tools and performance profilers",
			"Easy integration API with comprehensive documentation",
		],
		challenges: [
			"Creating a flexible API that works across different game engines",
			"Optimizing pathfinding performance for hundreds of agents",
			"Handling dynamic environment changes efficiently",
			"Balancing pathfinding accuracy with computational cost",
		],
		technologies: [
			"C#",
			"Unity",
			"Job System",
			"Burst Compiler",
			"Mathematics Library",
		],
		duration: "10 months",
		teamSize: "3 developers",
		role: "AI Systems Programmer",
	},
	{
		title: "Tools Development",
		description:
			"Custom tools for asset pipeline automation, level design, and debugging, improving workflow efficiency for game teams.",
		tags: ["C#", "Unity", "Tools"],
		highlight: "Tools Development",
		longDescription:
			"A comprehensive suite of development tools designed to streamline game development workflows. Includes asset pipeline automation, level design tools, debugging utilities, and team collaboration features. These tools have proven to reduce development time by 40% and improve team productivity.",
		features: [
			"Automated asset import and optimization pipeline",
			"Visual scripting editor for designers",
			"Real-time collaboration tools for level design",
			"Advanced debugging and profiling utilities",
			"Automated testing framework for gameplay systems",
			"Version control integration with conflict resolution",
			"Performance monitoring and optimization suggestions",
		],
		challenges: [
			"Creating tools that adapt to different team workflows",
			"Ensuring tool stability across various Unity versions",
			"Implementing efficient file monitoring for large projects",
			"Designing intuitive UIs for complex technical operations",
		],
		technologies: [
			"C#",
			"Unity Editor",
			"Version Control APIs",
			"File System Watchers",
			"SQLite",
		],
		duration: "15 months",
		teamSize: "2 developers",
		role: "Tools Programmer & UX Designer",
	},
];
