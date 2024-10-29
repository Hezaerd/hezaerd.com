import Image from "next/image";

import {
  Timeline,
  type TimelineConfig,
  type TimelineEntry,
} from "@/components/ui/timeline";
import { HoverVideo } from "@/components/ui/hover-video";

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
        <p className="mt-2 font-thin text-neutral-300">
          Game Engine Programming
        </p>
        <p className="mt-2 text-neutral-300">
          I am currently working on my graduation project which is a mobile
          rhythm game.
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
        <p className="mt-2 text-neutral-300">
          I was charged with developing a Twitch extension and integration for
          Los Pingheros
        </p>
        <p className="mt-2 text-neutral-300">
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
        <p className="mt-2 text-neutral-300">
          Started at Isart Digital Paris - GAME ENGINE PROGRAMMING
        </p>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div>
        <h4 className="text-xl font-semibold text-white">Education</h4>
        <p className="mt-2 text-neutral-300">
          Isart Digital Montréal - GAME ENGINE PROGRAMMING (2021-2023)
        </p>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <h1 className="text-4xl font-bold text-white">About Me</h1>
      <p className="mt-4 text-lg text-neutral-300">
        I&apos;m a game developer with a passion for programming and video
        games. I am currently studying at Isart Digital Paris to become a game
        programmer. I am actively looking for an internship in a game studio to
        learn more about the industry and improve my skills.
      </p>

      <Timeline config={tlConfig} data={data} />
    </div>
  );
}
