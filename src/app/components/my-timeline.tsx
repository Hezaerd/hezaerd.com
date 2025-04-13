import {
  Timeline,
  TimelineConfig,
  TimelineEntry,
} from "@/components/ui/timeline";
import { HoverVideo } from "@/components/ui/hover-video";
import Image from "next/image";

const tlConfig: TimelineConfig = {
  title: "My timeline",
  description: "Here's a summary of my education and professional experience.",
  gradient: "from-primary-gradient to-secondary-gradient",
};

const data: TimelineEntry[] = [
  {
    title: "Present",
    content: (
      <div>
        <h4 className="text-xl font-semibold text-white">
          Education - Isart Digital Paris
        </h4>
        <p className="mt-2 font-thin text-neutral-300">Game Programming</p>
        <p className="mt-2 text-white">
          I&apos;m working on my graduation project, which is a mobile rhythm
          game named Stellar Suplex.
        </p>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div>
        <h4 className="text-xl font-semibold text-white">Internship</h4>
        <p className="mt-2 font-thin text-neutral-300">
          <a
            href="https://lospingheros.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Hectiq
          </a>{" "}
          (March 2024 - June 2024)
        </p>
        <p className="mt-2 text-white">
          During my third year at Isart Digital, I completed an internship at
          Hectiq, where I developed a Twitch extension and integration for Los
          Pingheros.
        </p>
        <p className="mt-2 text-white">
          <strong>Technologies used:</strong> Html, Css, Node.js, TypeScript
        </p>

        <a
          href="https://store.steampowered.com/app/2418600/Los_Pingheros/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <HoverVideo
            image={
              <Image
                src="https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2418600/header.jpg?t=1729012957"
                width={300}
                height={168}
                alt={"Los Pingheros steam header"}
                className="rounded-lg"
              />
            }
            video={
              <video
                src="https://video.akamai.steamstatic.com/store_trailers/257040178/movie480_vp9.webm?t=1721816610"
                className="rounded-lg"
              />
            }
            className="mt-4"
          />
        </a>
      </div>
    ),
  },
  {
    title: "2023",
    content: (
      <div>
        <h4 className="text-xl font-semibold text-white">Education</h4>
        <p className="mt-2 font-thin text-neutral-300">
          Isart Digital Paris - GAME PROGRAMMING
        </p>
        <p className="mt-2 text-white">
          After two years in Montreal and earning my AEC in game engine
          programming, I continued my studies in Paris.
        </p>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div>
        <h4 className="text-xl font-semibold text-white">Education</h4>
        <p className="mt-2 font-thin text-neutral-300">
          Isart Digital Montréal - GAME ENGINE PROGRAMMING
        </p>
        <p className="mt-2 text-white">
          Once I got my baccalauréat in the pocket, I moved to Montreal to
          pursue my studies as a game programmer at Isart Digital.
        </p>
      </div>
    ),
  },
];

export function MyTimeline() {
  return (
    <div id="timeline" className="py-10">
      <Timeline config={tlConfig} data={data} />
    </div>
  );
}
