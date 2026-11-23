export const site = {
  url: "https://hezaerd.com",
  name: "Hezaerd",
  title: "Hezaerd, full-stack engineer",
  description:
    "Hezaerd is a full-stack engineer from Martinique who started in game development. Projects, experience and contact.",
  role: "Full-stack engineer",
  location: "Martinique, FR",
  email: "hezaerd@hezaerd.com",
  hero: "I started in game dev: rhythm games, multiplayer, mods. These days I mostly build web apps, tools and sites.",
  bio: [
    "I learned to ship on Unity and C++, chasing 60fps and controls that feel right. That same care shows up in my web work now.",
    "I spend most of my time on full-stack apps and the systems behind them. The games and mods are still here; that's where I came from.",
  ],
  skills: ["TypeScript", "React", "C#", "C++", "Unity", "Unreal Engine", "Wwise", "FMOD"],
  links: [
    { label: "GitHub", href: "https://github.com/hezaerd" },
    { label: "Discord", href: "https://discord.com/users/225942632050720768" },
    { label: "Spotify", href: "https://open.spotify.com/user/31pzfqspsr5e4rwe3vwbs2wudeki" },
  ],
} as const;

export interface Role {
  title: string;
  org: string;
  period: string;
  detail?: string;
}

export const experience: Role[] = [
  {
    title: "Full-stack and game developer",
    org: "Hectiq",
    period: "2024, 4 months",
    detail: "Prototyped and built a Twitch extension and its game integration, working on my own.",
  },
  {
    title: "Game developer",
    org: "Vagabond",
    period: "2022, 2 months",
    detail: "Built a VR serious game about poverty.",
  },
];

export const education: Role[] = [
  { title: "Game Programming", org: "Isart Digital Paris", period: "2023 to 2025" },
  { title: "Game Engine Programming", org: "Isart Digital Montreal", period: "2021 to 2023" },
];
