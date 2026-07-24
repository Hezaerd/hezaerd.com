import { Button } from "@hezaerd/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@hezaerd/ui/components/dropdown-menu";
import { cn } from "@hezaerd/ui/lib/utils";
import { DiscordIcon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { useActiveSection } from "@/hooks/use-active-section";
import { DEFAULT_SECTION, navigation, scrollToSection, type SectionId } from "@/lib/navigation";

const NAV_UNDERLINE_LAYOUT_ID = "nav-underline";
const NAV_PILL_LAYOUT_ID = "nav-pill";

const navIndicatorTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 35,
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [hoveredId, setHoveredId] = useState<SectionId | null>(null);
  const activeSection = useActiveSection(DEFAULT_SECTION);
  const prefersReducedMotion = useReducedMotion();
  const highlightedId = hoveredId ?? activeSection;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{ viewTransitionName: "site-nav" }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-(--duration-ui) ease-out motion-reduce:transition-none",
        scrolled
          ? "border-b border-border bg-background/80 shadow-lg backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="font-display text-primary hover:text-primary/80 shrink-0 text-2xl font-bold tracking-tight transition-colors"
        >
          Hezaerd
        </button>

        <LayoutGroup id="navbar">
          <ul
            className="absolute left-1/2 flex max-w-[calc(100%-12rem)] -translate-x-1/2 gap-1 overflow-x-auto md:max-w-none"
            onMouseLeave={() => setHoveredId(null)}
          >
            {navigation.map((item) => {
              const isActive = activeSection === item.id;
              const isHovered = hoveredId === item.id;
              const isHighlighted = highlightedId === item.id;

              return (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    className={cn(
                      "flex h-16 items-center transition-colors",
                      isActive
                        ? "text-primary"
                        : isHovered
                          ? "text-accent-foreground"
                          : "text-foreground",
                    )}
                  >
                    <span className="relative inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium">
                      <span className="relative z-10">{item.label}</span>

                      {isHighlighted && (
                        <motion.span
                          layoutId={NAV_PILL_LAYOUT_ID}
                          aria-hidden
                          initial={hasMounted || prefersReducedMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "pointer-events-none absolute inset-0 rounded-md",
                            isHovered ? "bg-accent" : "bg-primary/10",
                          )}
                          transition={
                            prefersReducedMotion || !hasMounted
                              ? { duration: 0 }
                              : navIndicatorTransition
                          }
                        />
                      )}

                      {isActive && (
                        <motion.span
                          layoutId={NAV_UNDERLINE_LAYOUT_ID}
                          aria-hidden
                          className="bg-primary pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 rounded-full"
                          transition={
                            prefersReducedMotion || !hasMounted
                              ? { duration: 0 }
                              : navIndicatorTransition
                          }
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </LayoutGroup>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="h-9 shrink-0 px-4 shadow-lg hover:shadow-xl">Get In Touch</Button>
            }
          />
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>How would you like to reach out?</DropdownMenuLabel>
              <DropdownMenuItem
                nativeButton={false}
                render={<a href="mailto:hezaerd@hezaerd.com" />}
              >
                <HugeiconsIcon icon={Mail01Icon} />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  window.open(
                    "https://discord.com/users/225942632050720768",
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                <HugeiconsIcon icon={DiscordIcon} />
                Discord
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
