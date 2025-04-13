import { Landing } from "./components/landing";
import { AboutMe } from "./components/about-me";
import { MyTimeline } from "./components/my-timeline";
import { ContactMe } from "./components/contact-me";

export default function Home() {
  return (
    <>
      <Landing />
      <div className="mx-auto max-w-3xl px-4">
        <AboutMe />
        <MyTimeline />
        <ContactMe />
      </div>
    </>
  );
}
