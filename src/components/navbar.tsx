import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSlidingUnderline } from "@/hooks/use-sliding-underline";
import { DEFAULT_SECTION, navigation, sectionHref, type SectionId } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function scrollToSection(id: SectionId) {
  document.querySelector(sectionHref(id))?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
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

        <Button
          onClick={() => window.open("mailto:hezaerd@hezaerd.com", "_blank")}
          className="shrink-0 shadow-lg hover:shadow-xl"
        >
          Get In Touch
        </Button>
      </div>
    </nav>
  );
}
