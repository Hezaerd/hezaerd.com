import AboutMe from "@/components/home/about-me";
import HeroLanding from "@/components/home/hero-landing";
import ProjectsBento from "@/components/home/projects-bento";
import { TracingBeam } from "@/components/ui/tracing-beam";

export default function Home() {
  return (
    <main>
      <HeroLanding />
      <TracingBeam>
        <AboutMe />
        <ProjectsBento />
      </TracingBeam>
    </main>
  );
}
