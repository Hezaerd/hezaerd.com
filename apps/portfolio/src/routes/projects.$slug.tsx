import { Badge } from "@hezaerd/ui/components/badge";
import { Button } from "@hezaerd/ui/components/button";
import { useEffect, useRef, useState } from "react";

import { Link, createFileRoute } from "@tanstack/react-router";

import { Reveal, RevealItem, RevealStagger } from "@/components/reveal";
import { getProject } from "@/data/projects";
import { clearPreviewPlaybackTime, getPreviewPlaybackTime } from "@/lib/preview-playback";
import { jsonLdScript, pageHead } from "@/lib/seo";
import { site } from "@/lib/site";
import { projectJsonLd } from "@/lib/structured-data";
import { armProjectMediaTransition, projectMediaTransitionName } from "@/lib/view-transitions";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => getProject(params.slug),
  head: ({ params, loaderData }) => {
    const project = loaderData ?? getProject(params.slug);

    if (!project) {
      return pageHead({
        title: `Project not found — ${site.name}`,
        description: site.description,
        path: `/projects/${params.slug}`,
      });
    }

    const head = pageHead({
      title: `${project.title} — ${site.name}`,
      description: project.description,
      path: `/projects/${project.slug}`,
      image: project.previewImage,
    });

    return {
      ...head,
      scripts: [jsonLdScript(projectJsonLd(project))],
    };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const project = Route.useLoaderData() ?? getProject(slug);
  const [initialVideoTime] = useState(() => getPreviewPlaybackTime(slug));
  const hasSeekedRef = useRef(false);

  useEffect(() => {
    clearPreviewPlaybackTime(slug);
  }, [slug]);

  // Keep the shared media name armed so returning to the grid can reverse-morph.
  useEffect(() => {
    armProjectMediaTransition(slug);
  }, [slug]);

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-display text-3xl font-bold tracking-tight">Project not found</h1>
        <p className="text-muted-foreground mt-4">
          No project matches <span className="font-mono text-sm">{slug}</span>.
        </p>
        <Link to="/" hash="projects" className="text-primary mt-8 inline-block text-sm font-medium">
          ← Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <Reveal>
        <Link to="/" hash="projects" className="text-primary mb-8 inline-block text-sm font-medium">
          ← Back to projects
        </Link>
      </Reveal>

      {project.previewVideo || project.previewImage ? (
        <div
          className="bg-secondary/30 mb-8 h-64 overflow-hidden rounded-lg md:h-80"
          style={{ viewTransitionName: projectMediaTransitionName(project.slug) }}
        >
          {project.previewVideo ? (
            <video
              ref={(element) => {
                if (!element || hasSeekedRef.current || initialVideoTime <= 0) return;

                const seek = () => {
                  element.currentTime = initialVideoTime;
                  hasSeekedRef.current = true;
                };

                if (element.readyState >= 1) {
                  seek();
                } else {
                  element.addEventListener("loadedmetadata", seek, { once: true });
                }
              }}
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster={project.previewImage}
              aria-label={`${project.title} preview`}
            >
              <source src={project.previewVideo} />
            </video>
          ) : (
            <img
              src={project.previewImage}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ) : null}

      <RevealStagger>
        <RevealItem>
          <h1 className="font-display text-4xl font-bold tracking-tight">{project.title}</h1>
        </RevealItem>
        <RevealItem>
          <p className="text-muted-foreground mt-4 text-lg">
            {project.longDescription || project.description}
          </p>
        </RevealItem>
      </RevealStagger>

      <div className="mt-8 flex flex-wrap gap-3">
        {project.releaseUrl ? (
          <Button
            nativeButton={false}
            render={<a href={project.releaseUrl} target="_blank" rel="noopener noreferrer" />}
          >
            View release
          </Button>
        ) : null}
        {project.sourcesUrl ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={project.sourcesUrl} target="_blank" rel="noopener noreferrer" />}
          >
            View source
          </Button>
        ) : null}
      </div>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {project.duration ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Duration</dt>
            <dd className="text-muted-foreground font-mono text-sm">{project.duration}</dd>
          </div>
        ) : null}
        {project.teamSize ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Team size</dt>
            <dd className="text-muted-foreground font-mono text-sm">{project.teamSize}</dd>
          </div>
        ) : null}
        {project.role ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Role</dt>
            <dd className="text-muted-foreground font-mono text-sm">{project.role}</dd>
          </div>
        ) : null}
      </dl>

      {project.technologies && project.technologies.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Technologies & tools</h2>
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <Badge variant="outline" className="font-mono">
                  {tech}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(project.features && project.features.length > 0) ||
      (project.challenges && project.challenges.length > 0) ? (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {project.features && project.features.length > 0 ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Key features</h2>
              <ul className="space-y-2">
                {project.features.map((feature) => (
                  <li key={feature} className="text-sm">
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {project.challenges && project.challenges.length > 0 ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Technical challenges</h2>
              <ul className="space-y-2">
                {project.challenges.map((challenge) => (
                  <li key={challenge} className="text-sm">
                    {challenge}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Tags</h2>
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="font-mono">
                {tag}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
