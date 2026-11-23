import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { site } from "@/data/site";
import { mountFlock } from "@/scripts/flock";
import { seo } from "@/seo";

export const Route = createFileRoute("/")({
  head: () => seo({ path: "/" }),
  component: Home,
});

function Home() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const heroText = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    mountFlock(canvas.current!, {
      shape: "streak",
      scenes: [{ form: "sheet", centre: { wide: [0.68, 0.38], narrow: [0.5, 0.3] }, scale: 1 }],
      progress: () => 0,
      signal: abort.signal,
      cell: 1,
      size: 1.5,
      clear: [heroText.current],
    }).then((ok) => ok && requestAnimationFrame(() => !abort.signal.aborted && setLit(true)));
    return () => abort.abort();
  }, []);

  return (
    <section id="top" className="relative isolate min-h-[max(640px,100svh)] overflow-hidden">
      <canvas
        ref={canvas}
        aria-hidden="true"
        className={`absolute inset-0 -z-10 h-full w-full transition-opacity duration-1000 ${lit ? "" : "opacity-0"}`}
      />
      <div className="mx-auto flex min-h-[max(640px,100svh)] max-w-6xl flex-col justify-end px-5 pb-20 sm:px-8 md:pb-28">
        <div ref={heroText} className="w-fit max-w-xl lg:max-w-none">
          <h1 className="text-[clamp(3.5rem,11vw,8.5rem)] leading-[0.86] font-[640] tracking-[-0.045em] [font-stretch:110%]">
            {site.name}
          </h1>
          <p className="mt-6 text-lg text-foreground sm:text-xl">{site.role}</p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-muted italic lg:max-w-none">
            Jack of all trades, master of none, but oftentimes better than a master of one.
          </p>
        </div>
      </div>
    </section>
  );
}
