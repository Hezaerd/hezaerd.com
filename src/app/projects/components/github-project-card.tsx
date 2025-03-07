import { ProjectCard } from "@/components/projects/project-card";
import { ProjectGithubStats } from "@/components/projects/project-github-stats";
import { ProjectLanguage } from "@/components/projects/project-language";
import { MorphingLinkIcon } from "@/components/projects/project-link-icon";
import { ProjectLink } from "@/components/projects/project-link";
import { Repository } from "@/components/projects/types";

export default function GithubProjectCard({
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
          <MorphingLinkIcon showGithub={true} />
        </ProjectLink>
      }
      footerContent={
        <>
          {project.language && <ProjectLanguage language={project.language} />}
          <ProjectGithubStats
            stargazers_count={project.stargazers_count}
            forks_count={project.forks_count}
          />
        </>
      }
    />
  );
}
