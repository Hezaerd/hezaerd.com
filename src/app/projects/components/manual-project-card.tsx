import { ProjectCard } from "@/components/projects/project-card";
import { ProjectLanguage } from "@/components/projects/project-language";
import { MorphingLinkIcon } from "@/components/projects/project-link-icon";
import { ProjectLink } from "@/components/projects/project-link";
import { Repository } from "@/components/projects/types";

export default function ManualProjectCard({
  project,
  index,
}: {
  project: Repository;
  index: number;
}) {
  return (
    <ProjectCard
      index={index}
      title={project.name}
      description={project.description}
      thumbnail={project.thumbnail}
      titleExtra={
        <ProjectLink href={project.html_url}>
          <MorphingLinkIcon showGithub={false} />
        </ProjectLink>
      }
      footerContent={
        project.language ? (
          <ProjectLanguage language={project.language} />
        ) : null
      }
    />
  );
}
