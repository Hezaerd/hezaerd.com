import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import type { Project } from "@/data/projects";
import { useCanHover } from "@/hooks/use-can-hover";
import { setPreviewPlaybackTime } from "@/lib/preview-playback";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const canHover = useCanHover();
  const prefersReducedMotion = useReducedMotion();
  const allowHoverVideo =
    Boolean(project.previewVideo) && canHover && !prefersReducedMotion;
  const showVideo = allowHoverVideo && isHovered;

  const handlePointerEnter = () => {
    if (!allowHoverVideo) return;

    setIsHovered(true);
    setShouldLoadVideo(true);

    const video = videoRef.current;
    if (video) {
      void video.play().catch(() => {
        /* Autoplay can be blocked; image remains visible. */
      });
    }
  };

  const handlePointerLeave = () => {
    if (!allowHoverVideo) return;

    setIsHovered(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const handleClick = () => {
    const time = videoRef.current?.currentTime ?? 0;
    setPreviewPlaybackTime(project.slug, time);
  };

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="border-border bg-card group/project flex h-full flex-col overflow-hidden rounded-lg border shadow-lg transition-shadow duration-(--duration-ui) ease-out hover:shadow-xl"
    >
      <div className="relative h-40 shrink-0 overflow-hidden">
        {project.previewImage ? (
          <>
            <img
              src={project.previewImage}
              alt={`${project.title} preview`}
              className={cn(
                "project-card-media absolute inset-0 h-full w-full object-cover",
                showVideo ? "opacity-0" : "opacity-100",
              )}
            />
            {project.previewVideo && allowHoverVideo ? (
              <video
                ref={videoRef}
                className={cn(
                  "project-card-media absolute inset-0 h-full w-full object-cover",
                  showVideo ? "opacity-100" : "opacity-0",
                )}
                muted
                loop
                playsInline
                preload={shouldLoadVideo ? "auto" : "none"}
                poster={project.previewImage}
                src={shouldLoadVideo ? project.previewVideo : undefined}
                aria-hidden={!showVideo}
                tabIndex={-1}
                onLoadedData={(event) => {
                  if (isHovered) {
                    void event.currentTarget.play().catch(() => {
                      /* Ignore autoplay rejection. */
                    });
                  }
                }}
              />
            ) : null}
          </>
        ) : (
          <div className="from-primary via-primary/90 to-primary/70 text-primary-foreground flex h-full items-center justify-center bg-linear-to-br p-4 text-center text-lg font-bold">
            {project.highlight || project.title}
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-4">
        <h3 className="font-display text-card-foreground group-hover/project:text-primary mb-2 text-lg font-semibold tracking-tight transition-colors duration-(--duration-ui) ease-out">
          {project.title}
        </h3>
        <p className="text-muted-foreground mb-3 line-clamp-3 grow text-sm">
          {project.description}
        </p>
        <div className="mb-3 flex flex-wrap gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="font-mono bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-primary text-xs font-medium">View details →</span>
      </div>
    </Link>
  );
}
