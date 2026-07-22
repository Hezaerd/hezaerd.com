import { GithubIcon, DiscordIcon, SpotifyIcon, ExternalLinkIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";

import { useCanHover } from "@/hooks/use-can-hover";

import { Button } from "./ui/button";

const MotionButton = motion.create(Button);

const socialHoverTransition = {
  type: "spring" as const,
  stiffness: 700,
  damping: 32,
  mass: 0.4,
};

const creditLinkVariants = {
  rest: {},
  hover: {},
};

const creditIconVariants = {
  rest: { transform: "translate(0px, 0px)" },
  hover: { transform: "translate(2px, -2px)" },
};

const creditUnderlineVariants = {
  rest: { transform: "scaleX(0)" },
  hover: { transform: "scaleX(1)" },
};

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
  const prefersReducedMotion = useReducedMotion();
  const canHover = useCanHover();
  const allowHoverMotion = !prefersReducedMotion && canHover;

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
              <motion.a
                href="https://hezaerd.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors duration-(--duration-ui) ease-out"
                initial="rest"
                whileHover={allowHoverMotion ? "hover" : undefined}
                variants={creditLinkVariants}
              >
                <span className="font-display relative inline-block">
                  Hezaerd
                  <motion.span
                    aria-hidden
                    className="bg-primary absolute inset-x-0 -bottom-px h-px origin-left"
                    variants={creditUnderlineVariants}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  />
                </span>
                <motion.span
                  className="inline-flex"
                  variants={creditIconVariants}
                  transition={socialHoverTransition}
                >
                  <HugeiconsIcon icon={ExternalLinkIcon} size={16} />
                </motion.span>
              </motion.a>
            </p>
          </div>

          <div className="flex gap-4">
            {socials.map((social) => (
              <MotionButton
                key={social.name}
                variant="ghost"
                size="icon"
                onClick={() => window.open(social.url, "_blank")}
                className="hover:bg-accent hover:text-accent-foreground transition-[color,background-color,box-shadow] duration-(--duration-ui) ease-out"
                whileHover={
                  allowHoverMotion ? { transform: "scale(1.1)" } : undefined
                }
                whileTap={
                  prefersReducedMotion ? undefined : { transform: "scale(0.95)" }
                }
                transition={socialHoverTransition}
              >
                <HugeiconsIcon icon={social.icon} size={24} />
              </MotionButton>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
