import type { PortalClient } from "@/lib/portal-types";

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

export function resolveLinkedSiteLinks(linkedSite: NonNullable<PortalClient["linkedSite"]>) {
  return {
    productionUrl: linkedSite.productionUrl,
    githubUrl: linkedSite.githubRepo ? githubRepoUrl(linkedSite.githubRepo) : null,
  };
}
