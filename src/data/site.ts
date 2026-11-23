export const site = {
  url: "https://hezaerd.com",
  name: "Hezaerd",
  title: "Hezaerd, Game Dev",
  description:
    "Hezaerd is a game developer from Martinique. Projects, experience and contact.",
  role: "Game Dev",
  tagline: "Jack of all trades, master of none, but oftentimes better than a master of one.",
  locationLine: "From Martinique",
  email: "hezaerd@hezaerd.com",
  about: "Full-time Roblox developer and founder of Trio Forge.",
  stack: [
    { label: "Languages", items: ["C", "C++", "Rust", "TypeScript", "Java", "Lua(u)", "Python"] },
    { label: "Engines", items: ["Unity", "Unreal Engine", "Roblox Studio"] },
    { label: "Tools", items: ["Git", "Perforce", "Jira", "Trello", "Linear"] },
  ],
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
