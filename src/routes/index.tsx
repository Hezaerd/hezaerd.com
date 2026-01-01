import { createFileRoute } from '@tanstack/react-router';
import { About, Contact, Hero, Projects } from '@/components/sections';
import { BackgroundImage } from '@/components/ui/background-image';
import { Navbar } from '@/components/ui/navbar';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <>
      <BackgroundImage alt="Forest background" fixed />
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  );
}
