import Image from "next/image";

import {
  Timeline,
  type TimelineConfig,
  type TimelineEntry,
} from "@/components/ui/timeline";
import { HoverVideo } from "@/components/ui/hover-video";
import { ContactForm } from "@/components/contact/contact-form";
export const metadata = {
  title: "Hezaerd - About Me",
  description: "Learn more about my education and professional experience.",
  openGraph: {
    title: "Hezaerd - About Me",
    description: "Learn more about my education and professional experience.",
    type: "website",
    url: "https://hezaerd.com/about",
    siteName: "Hezaerd",
    images: [
      {
        url: "https://github.com/hezaerd.png",
        width: 1200,
        height: 630,
        alt: "Hezaerd",
      },
    ],
  },
  twitter: {
    site: "@hezaerd",
    creator: "@hezaerd",
    description: "Learn more about my education and professional experience.",
    title: "Hezaerd - About Me",
    images: [
      {
        url: "https://github.com/hezaerd.png",
      },
    ],
  },
};

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
        <p className="mt-2 text-white">
          I&apos;m working on my graduation project, which is a mobile rhythm
          game named RhytmWreackers.
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
          Isart Digital Paris - GAME ENGINE PROGRAMMING
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
          After completing my baccalauréat in Martinique, I moved to Montreal to
          pursue my studies in game engine programming at Isart Digital.
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
        I&apos;m a passionate game developer currently studying Game Engine
        Programming at Isart Digital Paris. I&apos;m eager to enhance my skills
        and learn more about the industry, and I&apos;m actively seeking an
        internship at a game studio.
      </p>

      <Timeline config={tlConfig} data={data} />

      <div className="mt-16">
        <ContactForm />
      </div>
    </div>
  );
}
