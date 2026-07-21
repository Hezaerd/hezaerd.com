export interface Project {
  slug: string;
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
  sourcesUrl?: string;
  releaseUrl?: string;
  duration?: string;
  teamSize?: string;
  role?: string;
}

export const projects: Project[] = [
  {
    slug: "stellar-suplex",
    title: "Stellar Suplex",
    description:
      "Mobile action rhythm game where gameplay and visuals dynamically react to music in real-time",
    tags: ["Game", "Unity"],
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
    releaseUrl: "https://isart-digital.itch.io/stellarsuplex",
    duration: "9 months",
    teamSize: "16 developers",
    role: "Lead Programmer & Technical Architect",
  },
  {
    slug: "los-pingheros",
    title: "Los Pingheros",
    description:
      "Los Pingheros is a chaotic 8-player arena brawler set in a snowy Mexican world, where penguins battle to be the last one standing.",
    tags: ["Game", "Unity"],
    highlight: "Los Pingheros",
    previewImage: "/images/los-pingheros.jpg",
    previewVideo: "/videos/los-pingheros.webm",
    longDescription:
      "As a programmer on 'Los Pingheros,' I developed a real-time Twitch integration that allows streamers and their audience to interact with the game. This involved creating a responsive Twitch overlay, a Node.js backend to manage interactions, and a WebSocket communication system to seamlessly connect the overlay with the Unity game. My work enabled viewers to appear as spectator 'pingheros' in-game and optimized the backend to minimize latency for a dynamic, engaging experience.",
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
      "Twitch Game SDK",
      "Twitch API",
      "Node.js",
      "TypeScript",
      "Git",
    ],
    releaseUrl: "https://store.steampowered.com/app/2418600/Los_Pingheros/",
    duration: "4 months",
    teamSize: "8 developers",
    role: "Programmer",
  },
  {
    slug: "coloris",
    title: "Coloris",
    description:
      "Coloris is a 2D platformer where you play a specter gaining colorful powers to navigate a monochromatic world and uncover its secrets.",
    tags: ["Game", "Unity"],
    highlight: "Coloris",
    previewImage: "/images/coloris.jpg",
    previewVideo: "/videos/coloris.mp4",
    longDescription:
      "Coloris is a 4-day game jam project where I served as the sole programmer. In this 2D platformer, players embody a specter exploring a black and white world, acquiring new colorful powers that enable interaction with the environment and progression. Drawing inspiration from 'Hollow Knight' and 'Celeste', I implemented polished platforming mechanics like coyote time, dash, and wall jump. I also focused on a clean codebase architecture using Scriptable Objects for game data management and ensured configurable controls for game designers, all while supporting an engaging mini-lore.",
    features: [
      "2D platformer inspired by Hollow Knight and Celeste",
      "Mini lore to make the game more engaging",
      "Full 2D platformer mechanics (coyote time, dash, wall jump, etc.)",
      "Collect colorful powers to interact with the black and white world",
    ],
    challenges: [
      "First real game jam experience",
      "Recreate a fully polished 2D platformer using all famous mechanics from the genre",
      "Implement a fun story along side the gameplay",
      "Architecture the codebase to avoid spaghetti code",
      "Usage of Scriptable Objects to manage all the game data",
      "Make configurable the controllers for the game designers",
    ],
    technologies: ["C#", "Unity", "Perforce", "Trello"],
    sourcesUrl: "https://github.com/Hezaerd/Coloris",
    duration: "4 days",
    teamSize: "6 developers",
    role: "Programmer",
  },
  {
    slug: "kokopelli",
    title: "Kokopelli",
    description:
      "Kokopelli is a turn-based RPG taking place in Albuquerque, USA. You embody the member of a Spirit Brigade in charge of befriending spirits in a world in which humans and spirits live in harmony.",
    tags: ["Game", "Unreal Engine 4"],
    highlight: "Kokopelli",
    previewImage: "/images/kokopelli.jpg",
    previewVideo: "/videos/kokopelli.mp4",
    longDescription:
      "Kokopelli is a turn-based RPG taking place in Albuquerque, USA. You embody the member of a Spirit Brigade in charge of befriending spirits in a world in which humans and spirits live in harmony.",
    features: [
      "Car controller",
      "Immersive audio",
      "Turn-based combat",
      "Custom AI enemies",
    ],
    challenges: [
      "Graphical optimization on Unreal Engine 4",
      "Immersive and dynamic audio system with FMOD",
      "Turn-based combat AI system with a custom behavior tree",
    ],
    technologies: ["C++", "Unreal Engine 4", "FMOD", "Perforce", "Hack'n'Plan"],
    releaseUrl: "https://jaythil.itch.io/kokopelli",
    duration: "3 months",
    teamSize: "18 developers",
    role: "Programmer & Gameplay Programmer",
  },
  {
    slug: "better-axolotls",
    title: "Better Axolotl",
    description:
      "This mod enhances the axolotl to be a fully tameable, interactive pet that can even join you on your shoulders!",
    tags: ["Minecraft", "Modding"],
    highlight: "Better Axolotl",
    previewImage: "/images/better-axolotl.jpg",
    longDescription:
      "This mod enhances the axolotl to be a fully tameable, give them a brand new refreshed AI and make them cuter than ever by allowing to pick them up and put them on your shoulders!",
    features: [
      "Overhaul of the axolot AI",
      "Tameable axolotl",
      "Pickup axolotl on shoulders (like parrots)",
    ],
    challenges: [
      "Almost fully rewrote the vanilla axolotl code",
      "Custom rendering of the axolotl on player shoulders",
      "Make it compatible with other axolotl related mods through a clean Mixins usage.",
    ],
    technologies: ["Java", "Fabric", "Minecraft", "Gradle", "Git"],
    sourcesUrl: "https://github.com/Hezaerd/BetterAxolotls",
    releaseUrl: "https://modrinth.com/mod/betteraxolotls",
    duration: "1 week",
    teamSize: "Solo",
  },
  {
    slug: "hezaerd-com",
    title: "Hezaerd.com",
    description: "If you're reading this, you probably already know what this is. :)",
    tags: ["Web", "Next.JS"],
    highlight: "Hezaerd.com",
    previewImage: "/images/hezaerd-com.jpg",
    features: [
      "Display Github stats",
      "Display Spotify stats",
      "Dynamic OG images",
      "SEO optimization",
      "Responsive design",
      "Performance optimization",
      "Analytics & Metrics",
    ],
    challenges: [
      "Create a website that is both responsive and performant",
      "Analyze metrics to improve performance",
      "Keep a clean codebase",
      "Integrate Partial Prerendering",
    ],
    technologies: [
      "Next.JS",
      "TailwindCSS",
      "TypeScript",
      "Shadcn/UI",
      "Vercel",
      "Vercel Analytics",
      "Vercel Speed Insights",
      "Git",
    ],
    sourcesUrl: "https://github.com/Hezaerd/hezaerd.com",
    releaseUrl: "https://hezaerd.com",
    duration: "2 weeks",
    teamSize: "Solo",
    role: "Developer & Designer",
  },
];

export function getProjects(): readonly Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
