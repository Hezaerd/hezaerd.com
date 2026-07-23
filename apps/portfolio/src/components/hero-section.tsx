import { Button } from "@hezaerd/ui/components/button";
import { Download01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";

import { personalInfo } from "@/data/personal-info";
import { heroContainerVariants, heroItemVariants } from "@/lib/motion";
import { scrollToSection } from "@/lib/navigation";

import { Section } from "./section";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Section id="home" className="flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto max-w-7xl text-center"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : heroContainerVariants}
      >
        <motion.div
          className="font-display text-foreground mb-2 text-4xl font-bold tracking-tight sm:text-6xl"
          variants={prefersReducedMotion ? undefined : heroItemVariants}
        >
          {personalInfo.name}
        </motion.div>

        <motion.div
          className="text-primary mb-6 font-mono text-sm font-medium tracking-wide sm:text-base"
          variants={prefersReducedMotion ? undefined : heroItemVariants}
        >
          {personalInfo.role}
        </motion.div>

        <motion.div
          className="text-muted-foreground mx-auto mb-8 max-w-3xl text-lg sm:text-xl"
          variants={prefersReducedMotion ? undefined : heroItemVariants}
        >
          {personalInfo.hero}
        </motion.div>

        <motion.div
          className="flex flex-col justify-center gap-4 sm:flex-row"
          variants={prefersReducedMotion ? undefined : heroItemVariants}
        >
          <Button size="lg" onClick={() => scrollToSection("projects")}>
            <HugeiconsIcon icon={Folder01Icon} data-icon="inline-start" />
            View my projects
          </Button>

          <Button variant="outline" size="lg" onClick={() => scrollToSection("resume")}>
            <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
            Grab my resume
          </Button>
        </motion.div>
      </motion.div>
    </Section>
  );
}
