import { Briefcase01Icon, GraduateMaleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { education, workExperience } from "@/data/experience";

import { Reveal, RevealItem, RevealStagger } from "./reveal";
import { Section } from "./section";

export function ResumeSection() {
  return (
    <Section id="resume" className="bg-card px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2 className="font-display text-card-foreground mb-12 flex items-center justify-center gap-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            <HugeiconsIcon icon={Briefcase01Icon} size={28} className="text-primary" />
            Experience & Education
          </h2>
        </Reveal>
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <Reveal>
              <h3 className="text-card-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                <HugeiconsIcon icon={Briefcase01Icon} size={20} className="text-primary" />
                Work Experience
              </h3>
            </Reveal>
            <RevealStagger className="space-y-6">
              {workExperience.map((exp) => (
                <RevealItem
                  key={`${exp.company}-${exp.title}`}
                  className={
                    exp.color === "primary"
                      ? "border-primary border-l-4 pl-6"
                      : "border-accent border-l-4 pl-6"
                  }
                >
                  <h4 className="font-display text-card-foreground text-lg font-semibold tracking-tight">
                    {exp.title}
                  </h4>
                  <p
                    className={
                      exp.color === "primary"
                        ? "font-mono text-primary text-sm"
                        : "font-mono text-accent-foreground text-sm"
                    }
                  >
                    {exp.company} • {exp.period}
                  </p>
                  <p className="text-muted-foreground mt-2">{exp.description}</p>
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
          <div>
            <Reveal delay={0.05}>
              <h3 className="text-card-foreground mb-6 flex items-center gap-2 text-2xl font-semibold">
                <HugeiconsIcon icon={GraduateMaleIcon} size={20} className="text-primary" />
                Education
              </h3>
            </Reveal>
            <RevealStagger className="space-y-6">
              {education.map((edu) => (
                <RevealItem
                  key={`${edu.school}-${edu.degree}`}
                  className="border-secondary border-l-4 pl-6"
                >
                  <h4 className="font-display text-card-foreground text-lg font-semibold tracking-tight">
                    {edu.degree}
                  </h4>
                  <p className="font-mono text-secondary-foreground text-sm">
                    {edu.school} • {edu.period}
                  </p>
                  {edu.description ? (
                    <p className="text-muted-foreground mt-2">{edu.description}</p>
                  ) : null}
                </RevealItem>
              ))}
            </RevealStagger>
          </div>
        </div>
      </div>
    </Section>
  );
}
