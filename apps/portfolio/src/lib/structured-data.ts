import type { Project } from "@/data/projects";

import { personalInfo } from "@/data/personal-info";
import { absoluteOgImage, absoluteUrl, site } from "@/lib/site";

function personNode() {
  return {
    "@type": "Person" as const,
    "@id": `${site.authorUrl}/#person`,
    name: personalInfo.name,
    jobTitle: personalInfo.role,
    description: personalInfo.bio,
    email: personalInfo.email,
    url: site.authorUrl,
    homeLocation: {
      "@type": "Place" as const,
      name: personalInfo.location,
    },
    sameAs: [site.url, site.authorUrl],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite" as const,
    "@id": `${site.url}/#website`,
    name: site.title,
    description: site.description,
    url: site.url,
    inLanguage: "en",
    publisher: { "@id": `${site.authorUrl}/#person` },
  };
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [personNode(), websiteNode()],
  };
}

export function projectJsonLd(project: Project) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  const image = project.previewImage ? absoluteUrl(project.previewImage) : absoluteOgImage();

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url,
    image,
    keywords: project.tags.join(", "),
    author: { "@id": `${site.authorUrl}/#person` },
    creator: {
      "@type": "Person",
      name: personalInfo.name,
      url: site.authorUrl,
    },
    ...(project.releaseUrl ? { sameAs: [project.releaseUrl] } : {}),
    ...(project.technologies?.length
      ? { about: project.technologies.map((name) => ({ "@type": "Thing", name })) }
      : {}),
  };
}
