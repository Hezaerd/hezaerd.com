import { DiscordIcon, Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSlidingUnderline } from "@/hooks/use-sliding-underline";
import { DEFAULT_SECTION, navigation, scrollToSection } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const activeSection = useActiveSection(DEFAULT_SECTION);
  const { navListRef, setItemRef, underline } = useSlidingUnderline(activeSection);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 shadow-lg backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="text-primary hover:text-primary/80 shrink-0 text-2xl font-bold transition-colors"
        >
          Hezaerd
        </button>

        <ul
          ref={navListRef}
          className="absolute left-1/2 flex max-w-[calc(100%-12rem)] -translate-x-1/2 gap-1 overflow-x-auto md:max-w-none"
        >
          {navigation.map((item) => (
            <li key={item.id} className="shrink-0">
              <button
                ref={setItemRef(item.id)}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  activeSection === item.id
                    ? "text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}

          <div
            aria-hidden
            className="bg-primary pointer-events-none absolute bottom-0 h-0.5 rounded-full transition-all duration-300 ease-out"
            style={{
              left: underline.left,
              width: underline.width,
              transform: "translateY(-2px)",
            }}
          />
        </ul>

        <Popover open={contactOpen} onOpenChange={setContactOpen}>
          <PopoverTrigger
            render={
              <Button className="h-9 shrink-0 px-4 shadow-lg hover:shadow-xl">Get In Touch</Button>
            }
          />
          <PopoverContent align="end" sideOffset={8} className="w-56 p-2">
            <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
              How would you like to reach out?
            </p>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setContactOpen(false)}
                render={
                  <a href={`mailto:hezaerd@hezaerd.com`}>
                    <HugeiconsIcon icon={Mail01Icon} size={16} />
                    Email
                  </a>
                }
              />
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  window.open(
                    "https://discord.com/users/225942632050720768",
                    "_blank",
                    "noopener,noreferrer",
                  );
                  setContactOpen(false);
                }}
              >
                <HugeiconsIcon icon={DiscordIcon} size={16} />
                Discord
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
