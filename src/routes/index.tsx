import { createFileRoute } from '@tanstack/react-router';
import { About, Contact, Hero, Projects } from '@/components/sections';
import { BackgroundImage } from '@/components/ui/background-image';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <>
      <BackgroundImage theme="moody-forest" alt="Forest background" fixed />
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  );
}
