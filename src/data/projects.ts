export interface Project {
  slug: string;
  title: string;
  summary: string;
  kind: string;
  image?: string;
  video?: string;
  about: string;
  features: string[];
  challenges: string[];
  stack: string[];
  source?: string;
  release?: { label: string; href: string };
  duration: string;
  team: string;
  role?: string;
}

export const projects: Project[] = [
  {
    slug: "stellar-suplex",
    title: "Stellar Suplex",
    summary: "A mobile action rhythm game where the gameplay and the visuals react to the music as it plays.",
    kind: "Mobile game, Unity",
    image: "/images/stellar-suplex.webp",
    video: "/videos/stellar-suplex.webm",
    about:
      "A mobile action rhythm game that uses Wwise as a second engine for real-time audio. As lead programmer on a team of 16, I designed the codebase so it could grow with the team, and built the system that reads Wwise audio events as they fire, so the whole world, from mechanics to effects, moves with the rhythm and intensity of the track.",
    features: [
      "Real-time processing of Wwise audio events",
      "Gameplay that adapts to the rhythm and intensity of the music",
      "Visual effects and environment changes synced to the track",
      "A steady 60fps on mobile hardware",
      "Battery use kept in check",
    ],
    challenges: [
      "A codebase that 16 developers could work in at once",
      "Getting the most out of Unity and Wwise on phones",
      "Holding 60fps without draining the battery",
      "Working with sound designers so the audio and visuals answer each other",
    ],
    stack: ["C#", "Unity", "Wwise", "Android", "Perforce", "Jira"],
    release: { label: "Play on itch.io", href: "https://isart-digital.itch.io/stellarsuplex" },
    duration: "9 months",
    team: "16 developers",
    role: "Lead programmer",
  },
  {
    slug: "los-pingheros",
    title: "Los Pingheros",
    summary:
      "A chaotic 8-player arena brawler where penguins fight to be the last one standing in a snowy Mexican world.",
    kind: "PC game, Unity",
    image: "/images/los-pingheros.webp",
    video: "/videos/los-pingheros.webm",
    about:
      "I built the real-time Twitch integration that lets streamers and their audience play along: a responsive Twitch overlay, a Node.js backend to manage interactions, and a WebSocket link between the overlay and the Unity game. Viewers show up in the arena as spectator pingheros, and the backend is tuned to keep the delay between stream and game low.",
    features: [
      "Viewers interact with the game through a Twitch overlay",
      "Viewers appear in the arena as spectator pingheros",
      "A Node.js backend between the overlay and the game",
      "WebSocket communication with the Unity client",
    ],
    challenges: [
      "An overlay that stays responsive alongside the game",
      "Keeping latency between the overlay and the game low",
    ],
    stack: ["Unity", "C#", "Quantum ECS", "Twitch Game SDK", "Twitch API", "Node.js", "TypeScript"],
    release: { label: "View on Steam", href: "https://store.steampowered.com/app/2418600/Los_Pingheros/" },
    duration: "4 months",
    team: "8 developers",
    role: "Programmer",
  },
  {
    slug: "coloris",
    title: "Coloris",
    summary: "A 2D platformer about a specter who gains colourful powers to explore a black and white world.",
    kind: "Game jam, Unity",
    image: "/images/coloris.webp",
    video: "/videos/coloris.webm",
    about:
      "A 4-day game jam where I was the only programmer. You play a specter in a black and white world, picking up colourful powers that let you interact with it and move forward. Taking cues from Hollow Knight and Celeste, I built tight platforming with coyote time, dash and wall jump, kept the game data in Scriptable Objects, and made the controller tunable by the designers.",
    features: [
      "Platforming with coyote time, dash and wall jump",
      "Colour powers that unlock the black and white world",
      "A short story told alongside the play",
    ],
    challenges: [
      "My first real game jam",
      "A polished platformer in four days",
      "Clean architecture under time pressure, with Scriptable Objects for all game data",
      "A controller the designers could tune without code",
    ],
    stack: ["C#", "Unity", "Perforce", "Trello"],
    source: "https://github.com/Hezaerd/Coloris",
    duration: "4 days",
    team: "6 developers",
    role: "Programmer",
  },
  {
    slug: "kokopelli",
    title: "Kokopelli",
    summary:
      "A turn-based RPG set in Albuquerque, where a Spirit Brigade befriends the spirits living alongside humans.",
    kind: "PC game, Unreal Engine 4",
    image: "/images/kokopelli.webp",
    video: "/videos/kokopelli.webm",
    about:
      "A turn-based RPG set in Albuquerque. You play a member of a Spirit Brigade whose job is to befriend spirits, in a world where humans and spirits live side by side. I worked on gameplay: the car controller, the combat AI and the audio system.",
    features: ["Car controller", "Turn-based combat", "Custom enemy AI", "Dynamic audio"],
    challenges: [
      "Graphics optimisation in Unreal Engine 4",
      "A dynamic audio system with FMOD",
      "Combat AI on a custom behaviour tree",
    ],
    stack: ["C++", "Unreal Engine 4", "FMOD", "Perforce"],
    release: { label: "Play on itch.io", href: "https://jaythil.itch.io/kokopelli" },
    duration: "3 months",
    team: "18 developers",
    role: "Gameplay programmer",
  },
  {
    slug: "better-axolotls",
    title: "Better Axolotls",
    summary: "A Minecraft mod that turns the axolotl into a tameable pet that can ride on your shoulder.",
    kind: "Minecraft mod, Fabric",
    image: "/images/better-axolotl.webp",
    about:
      "This mod makes axolotls tameable, gives them a new AI, and lets you pick them up and carry them on your shoulders like parrots. I rewrote most of the vanilla axolotl code and kept it compatible with other axolotl mods by using Mixins carefully.",
    features: ["A reworked axolotl AI", "Tameable axolotls", "Axolotls that ride on your shoulders"],
    challenges: [
      "Rewriting most of the vanilla axolotl code",
      "Custom rendering of the axolotl on the player's shoulders",
      "Staying compatible with other axolotl mods through clean Mixins",
    ],
    stack: ["Java", "Fabric", "Gradle"],
    source: "https://github.com/Hezaerd/BetterAxolotls",
    release: { label: "Get it on Modrinth", href: "https://modrinth.com/mod/betteraxolotls" },
    duration: "1 week",
    team: "Solo",
  },
  {
    slug: "hezaerd-com",
    title: "hezaerd.com",
    summary:
      "This site, rebuilt from scratch: a prerendered React site with a dithered dusk shader, served by Cloudflare.",
    kind: "Website, TypeScript",
    about:
      "The third version of my personal site. The old one was a monorepo with several apps; this one is a single static portfolio. The sky and sea at the top are a WebGL field drawn as an ordered dither, and the same dusk palette colours the footer and every project image.",
    features: [
      "A React site on TanStack Start, prerendered to static HTML",
      "A dithered WebGL sky and sea that follows the pointer",
      "Project images dithered in the browser to one shared palette",
      "Served from Cloudflare",
    ],
    challenges: [
      "Keeping the page pure black and readable with a moving shader behind the text",
      "A finished still frame for reduced motion",
    ],
    stack: ["TypeScript", "React", "TanStack Start", "Tailwind CSS", "WebGL", "Cloudflare"],
    source: "https://github.com/Hezaerd/hezaerd.com",
    duration: "Ongoing",
    team: "Solo",
    role: "Design and development",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
