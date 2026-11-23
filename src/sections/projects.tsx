import { type CSSProperties, useEffect, useEffectEvent, useRef, useState } from "react";

import { type Project, projects } from "@/data/projects";

const reducedMotion = "(prefers-reduced-motion: reduce)";
const chapterLead = 0.45;

function ProjectDetails({ project }: { project: Project }) {
  return (
    <div className="project-details">
      <div className="min-h-0 overflow-hidden">
        <div className="space-y-2.5 pb-4 text-sm leading-snug">
          <p className="text-xs text-muted">{project.kind}</p>
          <p className="max-w-[52ch]">{project.summary}</p>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 [&_dt]:mb-0.5 [&_dt]:text-xs [&_dt]:text-muted">
            {project.role && (
              <div>
                <dt>Role</dt>
                <dd>{project.role}</dd>
              </div>
            )}
            <div>
              <dt>Team</dt>
              <dd>{project.team}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{project.duration}</dd>
            </div>
          </dl>
          <ul aria-label="Stack" className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {project.stack.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {project.release && (
              <a className="link underline decoration-faint underline-offset-4" href={project.release.href}>
                {project.release.label}
              </a>
            )}
            {project.source && (
              <a className="link underline decoration-faint underline-offset-4" href={project.source}>
                Source code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const plateVisible = useRef(false);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const shown = preview ?? active;

  useEffect(() => {
    const track = section.current!;
    const sticky = stage.current!;
    const motion = window.matchMedia(reducedMotion);
    let frame = 0;
    let index = 0;

    function update() {
      frame = 0;
      if (motion.matches) return;

      const chapterHeight = track.clientHeight / projects.length;
      const position = Math.max(0, Math.min(projects.length - 1, -track.getBoundingClientRect().top / chapterHeight));
      const next = Math.floor(position + chapterLead);
      if (next !== index) {
        index = next;
        setActive(index);
      }

      const unfold = index === 0 ? 1 : Math.min(1, (position - index + chapterLead) / 0.18);
      sticky.style.setProperty("--unfold", `${Math.max(0, unfold)}fr`);
      sticky.style.setProperty("--progress", String((position + 1) / projects.length));
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    motion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      motion.removeEventListener("change", schedule);
    };
  }, []);

  useEffect(() => {
    const row = chips.current!;
    if (!row.clientWidth) return;
    const chip = row.children[active].getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    if (chip.left < bounds.left || chip.right > bounds.right) {
      row.scrollLeft += chip.left - bounds.left - 4;
    }
  }, [active]);

  const syncPlayback = useEffectEvent(() => {
    const canPlay = plateVisible.current && !document.hidden && !window.matchMedia(reducedMotion).matches;
    const media = plate.current!;
    const selected = canPlay ? media.querySelector<HTMLVideoElement>('video[data-shown="true"]') : null;
    for (const video of media.querySelectorAll("video")) {
      if (video !== selected) video.pause();
    }
    if (selected?.paused) void selected.play().catch(() => {});
  });

  useEffect(() => {
    const media = plate.current!;
    const motion = window.matchMedia(reducedMotion);
    const observer = new IntersectionObserver(([entry]) => {
      plateVisible.current = entry.isIntersecting;
      syncPlayback();
    });
    const refresh = () => syncPlayback();

    observer.observe(media);
    document.addEventListener("visibilitychange", refresh);
    motion.addEventListener("change", refresh);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", refresh);
      motion.removeEventListener("change", refresh);
      plateVisible.current = false;
      for (const video of media.querySelectorAll("video")) video.pause();
    };
  }, []);

  useEffect(() => {
    syncPlayback();
  }, [shown]);

  function jumpTo(index: number) {
    const track = section.current!;
    setPreview(null);
    window.scrollTo({
      top: window.scrollY + track.getBoundingClientRect().top + (index * track.clientHeight) / projects.length,
    });
  }

  return (
    <section
      id="projects"
      ref={section}
      aria-labelledby="projects-title"
      className="motion-safe:h-(--projects-height)"
      style={{ "--projects-height": `${projects.length * 100}svh` } as CSSProperties}
    >
      <div ref={stage} className="project-stage mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="projects-title" className="section-label">
          Projects
        </h2>
        <div className="project-layout motion-reduce:hidden">
          <div className="project-index divide-y divide-line">
            {projects.map((project, index) => (
              <div key={project.slug}>
                <button
                  type="button"
                  className="project-title"
                  aria-current={index === active ? true : undefined}
                  onClick={() => jumpTo(index)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setPreview(index);
                  }}
                  onPointerLeave={() => setPreview(null)}
                >
                  {project.title}
                </button>
                {index === active && <ProjectDetails project={project} />}
              </div>
            ))}
          </div>
          <div ref={chips} className="project-chips" aria-label="Project titles" role="group">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                className="project-chip"
                aria-current={index === active ? true : undefined}
                onClick={() => jumpTo(index)}
              >
                {project.title}
              </button>
            ))}
          </div>
          <figure className="min-w-0">
            <div ref={plate} className="relative aspect-4/3 overflow-hidden border border-line">
              {projects.map(({ slug, title, image, video }, index) => {
                const layer = {
                  className: "project-shot",
                  "data-shown": index === shown,
                  "aria-hidden": index !== shown,
                };
                return video ? (
                  <video
                    key={slug}
                    {...layer}
                    aria-label={title}
                    src={video}
                    poster={image}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img key={slug} {...layer} src={image} alt={title} loading="lazy" />
                );
              })}
            </div>
            <figcaption className="mt-3 flex justify-between gap-3 text-xs text-muted">
              <span className="text-foreground">{projects[shown].title}</span>
              <span className="text-right">{projects[shown].kind}</span>
            </figcaption>
            <div className="mt-2.5 h-px bg-line" aria-hidden="true">
              <div className="h-full origin-left scale-x-(--progress) bg-muted" />
            </div>
          </figure>
          <div className="project-mobile-details">
            <ProjectDetails project={projects[active]} />
          </div>
        </div>
        <ol className="mt-6 hidden divide-y divide-line motion-reduce:block">
          {projects.map((project) => (
            <li key={project.slug} className="py-7">
              <h3 className="text-[clamp(2.25rem,6vw,5rem)] leading-none font-[640] tracking-[-0.045em]">
                {project.title}
              </h3>
              <img
                className="my-4 aspect-4/3 w-full max-w-xl border border-line object-cover"
                src={project.image}
                alt=""
                loading="lazy"
              />
              <ProjectDetails project={project} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
