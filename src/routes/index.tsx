import { createFileRoute } from "@tanstack/react-router";

import { Section } from "@/components/section";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main>
      <Section id="home" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-center text-4xl font-bold">Hezaerd</h1>
      </Section>
      <Section id="about" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h2 className="text-center text-3xl font-bold">About</h2>
      </Section>
      <Section id="projects" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h2 className="text-center text-3xl font-bold">Projects</h2>
      </Section>
      <Section id="resume" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h2 className="text-center text-3xl font-bold">Resume</h2>
      </Section>
      <Section id="github" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h2 className="text-center text-3xl font-bold">GitHub</h2>
      </Section>
      <Section id="music" className="flex min-h-screen flex-col items-center justify-center p-8">
        <h2 className="text-center text-3xl font-bold">Music</h2>
      </Section>
    </main>
  );
}
