import { UserIcon, Wrench01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { personalInfo } from "@/data/personal-info";
import { skills } from "@/data/skills";

import { Reveal, RevealItem, RevealStagger } from "./reveal";
import { Section } from "./section";

export function AboutSection() {
  return (
    <Section id="about" className="bg-card px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="font-display text-card-foreground mb-12 flex items-center justify-center gap-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            <HugeiconsIcon icon={UserIcon} size={28} className="text-primary" />
            About Me
          </h2>
        </Reveal>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal delay={0.05}>
            <p className="text-muted-foreground mb-6 text-lg">{personalInfo.bio}</p>
            {personalInfo.location ? (
              <p className="text-muted-foreground text-lg">Based in {personalInfo.location}</p>
            ) : null}
          </Reveal>
          <Reveal delay={0.1}>
            <div className="bg-primary rounded-lg p-1">
              <div className="bg-background rounded-lg p-8">
                <h3 className="text-foreground mb-4 flex items-center gap-2 text-xl font-semibold">
                  <HugeiconsIcon icon={Wrench01Icon} size={20} className="text-primary" />
                  Skills & Technologies
                </h3>
                <RevealStagger className="grid grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <RevealItem
                      key={skill}
                      className="text-muted-foreground flex items-center gap-2 font-mono text-sm"
                    >
                      <span className="bg-primary inline-block h-2 w-2 rounded-full" />
                      {skill}
                    </RevealItem>
                  ))}
                </RevealStagger>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
