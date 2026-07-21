import { Link, createFileRoute } from "@tanstack/react-router";

import { getProject } from "@/data/projects";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const project = getProject(slug);

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-3xl font-bold">Project not found</h1>
        <p className="text-muted-foreground mt-4">
          No project matches <span className="font-mono">{slug}</span>.
        </p>
        <Link to="/" hash="projects" className="text-primary mt-8 inline-block text-sm font-medium">
          ← Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <Link to="/" hash="projects" className="text-primary mb-8 inline-block text-sm font-medium">
        ← Back to projects
      </Link>

      {project.previewVideo || project.previewImage ? (
        <div className="bg-secondary/30 mb-8 h-64 overflow-hidden rounded-lg md:h-80">
          {project.previewVideo ? (
            <video
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

      <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        {project.longDescription || project.description}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {project.releaseUrl ? (
          <a
            href={project.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            View release
          </a>
        ) : null}
        {project.sourcesUrl ? (
          <a
            href={project.sourcesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium"
          >
            View source
          </a>
        ) : null}
      </div>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        {project.duration ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Duration</dt>
            <dd className="text-muted-foreground text-sm">{project.duration}</dd>
          </div>
        ) : null}
        {project.teamSize ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Team size</dt>
            <dd className="text-muted-foreground text-sm">{project.teamSize}</dd>
          </div>
        ) : null}
        {project.role ? (
          <div className="bg-secondary/50 rounded-lg p-3">
            <dt className="text-sm font-medium">Role</dt>
            <dd className="text-muted-foreground text-sm">{project.role}</dd>
          </div>
        ) : null}
      </dl>

      {project.technologies && project.technologies.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Technologies & tools</h2>
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li
                key={tech}
                className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-sm"
              >
                {tech}
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
            <li
              key={tag}
              className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
            >
              {tag}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
