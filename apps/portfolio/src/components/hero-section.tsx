import { Download01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { scrollToSection } from "@/lib/navigation";

import { Section } from "./section";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <Section id="home" className="flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <div className="text-foreground mb-2 text-4xl font-bold sm:text-6xl">Hezaerd</div>

        <div className="text-primary mb-6 text-xl font-semibold tracking-widest uppercase sm:text-2xl">
          Software Engineer
        </div>

        <div className="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg sm:text-xl">
          Passionate about building high-performance software solutions, ranging from game engines,
          to games, to tools, to full-stack applications.
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg" onClick={() => scrollToSection("projects")}>
            <HugeiconsIcon icon={Folder01Icon} size={16} />
            View my projects
          </Button>

          <Button variant="outline" size="lg">
            <HugeiconsIcon icon={Download01Icon} size={16} />
            Grab my resume
          </Button>
        </div>
      </div>
    </Section>
  );
}
