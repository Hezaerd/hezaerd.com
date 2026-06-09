import { createFileRoute } from "@tanstack/react-router";

import { Section } from "@/components/section";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Section id="home" className="min-h-screen p-8">
        <h1 className="text-4xl font-bold">Hezaerd</h1>
      </Section>
      <Section id="about" className="min-h-screen p-8">
        <h2 className="text-3xl font-bold">About</h2>
      </Section>
      <Section id="projects" className="min-h-screen p-8">
        <h2 className="text-3xl font-bold">Projects</h2>
      </Section>
      <Section id="resume" className="min-h-screen p-8">
        <h2 className="text-3xl font-bold">Resume</h2>
      </Section>
      <Section id="github" className="min-h-screen p-8">
        <h2 className="text-3xl font-bold">GitHub</h2>
      </Section>
      <Section id="music" className="min-h-screen p-8">
        <h2 className="text-3xl font-bold">Music</h2>
      </Section>
    </main>
  );
}