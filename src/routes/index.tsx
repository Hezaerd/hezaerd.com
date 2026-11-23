import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { site } from "@/data/site";
import { mountFlock, smoothstep, type FlockScene } from "@/scripts/flock";
import { globe, glyph } from "@/scripts/formations";
import { seo } from "@/seo";

export const Route = createFileRoute("/")({
  head: () => seo({ path: "/" }),
  component: Home,
});

type HomeScene = FlockScene & { id: string; position: string; width: string; content: ReactNode };

const sidePosition = "justify-end pb-[clamp(1rem,6svh,3.5rem)] md:justify-center md:pb-0";
const sideWidth = "w-fit max-w-md md:max-w-[min(28rem,calc(50%_-_1.5rem))]";
const sectionHeading = "text-[clamp(2.75rem,7vw,5rem)] leading-none font-[640] tracking-[-0.045em] [font-stretch:110%]";
const scenes = [
  {
    id: "hero",
    form: "sheet",
    centre: { wide: [0.68, 0.38], narrow: [0.5, 0.3] },
    scale: 1,
    position: "justify-end pb-20 md:pb-28",
    width: "w-fit max-w-xl lg:max-w-none",
    content: (
      <>
        <h1 className="text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.86] font-[640] tracking-[-0.045em] [font-stretch:110%]">
          {site.name}
        </h1>
        <p className="mt-6 text-lg text-foreground sm:text-xl">{site.role}</p>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted italic lg:max-w-none">
          Jack of all trades, master of none, but oftentimes better than a master of one.
        </p>
      </>
    ),
  },
  {
    id: "about",
    form: globe([12, -72], [14.64, -61.02]),
    centre: { wide: [0.71, 0.48], narrow: [0.5, 0.25] },
    scale: 0.56,
    turn: (time) => [0.08 * Math.sin(time * 0.15), 0.03 * Math.sin(time * 0.13)],
    position: sidePosition,
    width: sideWidth,
    content: (
      <>
        <h2 className={sectionHeading}>About</h2>
        <p className="mt-2 text-base text-foreground sm:text-lg">From Martinique</p>
        <div className="mt-4 space-y-2 text-sm leading-snug text-muted sm:text-base">
          <p>{site.hero}</p>
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul aria-label="Skills" className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground">
          {site.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    form: glyph("@"),
    centre: { wide: [0.75, 0.47], narrow: [0.5, 0.3] },
    scale: 0.54,
    position: sidePosition,
    width: sideWidth,
    content: (
      <>
        <h2 className={sectionHeading}>Contact</h2>
        <a className="link mt-4 inline-block text-lg text-foreground" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          {site.links.map(({ label, href }) => (
            <li key={label}>
              <a className="link" href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </>
    ),
  },
] satisfies [HomeScene, ...HomeScene[]];

function Home() {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    const { signal } = abort;
    const trackEl = track.current!;
    const stageEl = stage.current!;
    const blocks = Array.from(stageEl.querySelectorAll<HTMLElement>("[data-flock-scene]"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progress = 0;
    let raf = 0;

    const update = () => {
      const height = Math.max(1, stageEl.clientHeight);
      progress = Math.max(0, Math.min(scenes.length - 1, -trackEl.getBoundingClientRect().top / height));
      blocks.forEach((block, i) => {
        const offset = progress - i;
        const opacity = 1 - smoothstep(0.12, 0.42, Math.abs(offset));
        block.style.opacity = String(opacity);
        block.style.translate = motion.matches ? "" : `0 ${-offset * 32}px`;
        block.style.pointerEvents = opacity > 0 ? "auto" : "none";
      });
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    window.addEventListener("scroll", schedule, { passive: true, signal });
    window.addEventListener("resize", schedule, { signal });
    motion.addEventListener("change", schedule, { signal });
    stageEl.addEventListener(
      "focusin",
      (event) => {
        const block = (event.target as HTMLElement).closest<HTMLElement>("[data-flock-scene]");
        if (!block) return;
        const index = blocks.indexOf(block);
        const top = window.scrollY + trackEl.getBoundingClientRect().top + index * stageEl.clientHeight;
        window.scrollTo({ top, behavior: "instant" });
        update();
      },
      { signal },
    );
    update();

    mountFlock(canvas.current!, {
      scenes,
      progress: () => progress,
      signal,
      shape: "streak",
      cell: 1,
      size: 1.5,
      clear: blocks.map((block) => block.parentElement),
    }).then((ok) => ok && requestAnimationFrame(() => !signal.aborted && setLit(true)));
    return () => {
      abort.abort();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="top"
      ref={track}
      data-flock-track
      className="relative"
      style={{ minHeight: `calc(${scenes.length - 1} * 100svh + 100dvh)` }}
    >
      {scenes.map(({ id }, i) => (
        <div
          key={id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-px snap-start"
          style={{ top: `${i * 100}svh` }}
        />
      ))}
      <div ref={stage} className="sticky top-0 isolate h-svh overflow-clip">
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={`absolute inset-0 -z-10 h-full w-full transition-opacity duration-1000 motion-reduce:transition-none ${lit ? "" : "opacity-0"}`}
        />
        {scenes.map(({ id, position, width, content }, i) => (
          <div
            key={id}
            className={`pointer-events-none absolute inset-0 mx-auto flex max-w-6xl flex-col px-5 sm:px-8 ${position}`}
          >
            <div className={width}>
              <div data-flock-scene={id} style={{ opacity: i === 0 ? 1 : 0, pointerEvents: i === 0 ? "auto" : "none" }}>
                {content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
