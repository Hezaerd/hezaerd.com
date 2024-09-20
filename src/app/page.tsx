import AboutMe from "@/components/home/about-me";
import HeroLanding from "@/components/home/hero-landing";
import ProjectsBento from "@/components/home/projects-bento";

export default function Home() {
  return (
    <main>
      <HeroLanding />
      <AboutMe />
      <ProjectsBento />
    </main>
  );
}
