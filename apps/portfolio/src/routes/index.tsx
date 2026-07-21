import { createFileRoute } from "@tanstack/react-router";

import { AboutSection } from "@/components/about-section";
import { HeroSection } from "@/components/hero-section";
import { ProjectsSection } from "@/components/projects-section";
import { ResumeSection } from "@/components/resume-section";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ResumeSection />
    </main>
  );
}
