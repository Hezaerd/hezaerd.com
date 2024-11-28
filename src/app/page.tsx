import { AuroraBackground } from "@/components/ui/aurora-background";
import { Hero } from "@/components/home/hero";

export default function Home() {
  return (
    <section id="hero">
      <AuroraBackground className="flex h-screen flex-col">
        <Hero />
      </AuroraBackground>
    </section>
  );
}
