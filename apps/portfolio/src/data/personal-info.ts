export interface PersonalInfo {
  name: string;
  role: string;
  /** Short line under the role on the hero */
  hero: string;
  /** Longer about-section copy */
  bio: string;
  email: string;
  location: string;
}

export const personalInfo: PersonalInfo = {
  name: "Hezaerd",
  role: "Full-stack engineer",
  hero: "I started in game dev (rhythm games, multiplayer, mods). These days I mostly build web apps, tools, and sites.",
  bio: "I learned to ship on Unity and C++, chasing 60fps and controls that feel right. That same care shows up in my web work now. I spend most of my time on full-stack apps and the systems behind them. The games and mods are still here; that's where I came from.",
  email: "hezaerd@hezaerd.com",
  location: "Martinique, FR",
};
