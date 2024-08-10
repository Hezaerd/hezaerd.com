import AboutMe from "@/components/home/about-me";
import HeroLanding from "@/components/home/hero-landing";
import { TracingBeam } from "@/components/ui/tracing-beam";

export default function Home() {
  return (
    <main>
      <HeroLanding />
      <TracingBeam className="px-6">
        <AboutMe />
      </TracingBeam>
    </main>
  );
}
