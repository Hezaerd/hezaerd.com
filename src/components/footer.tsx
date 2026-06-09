import {
  GithubIcon,
  DiscordIcon,
  SpotifyIcon,
  ExternalLinkIcon,
  ExternalLink,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "./ui/button";

const socials = [
  { name: "Github", url: "https://github.com/hezaerd", icon: GithubIcon },
  { name: "Discord", url: "https://discord.com/users/225942632050720768", icon: DiscordIcon },
  {
    name: "Spotify",
    url: "https://open.spotify.com/user/31pzfqspsr5e4rwe3vwbs2wudeki",
    icon: SpotifyIcon,
  },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-border border-t px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground mb-2">
              © {currentYear} Hezaerd. All rights reserved.
            </p>
            <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm md:justify-start">
              Portfolio crafted by{" "}
              <a
                href="https://hezaerd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors duration-200"
              >
                Hezaerd
                <HugeiconsIcon icon={ExternalLinkIcon} size={16} />
              </a>
            </p>
          </div>

          <div className="flex gap-4">
            {socials.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="icon"
                onClick={() => window.open(social.url, "_blank")}
                className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
              >
                <HugeiconsIcon icon={social.icon} size={24} />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
