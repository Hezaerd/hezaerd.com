import type { PortalClient } from "@/lib/portal-types";

const cfAccountId = import.meta.env.VITE_CF_ACCOUNT_ID as string | undefined;

export function githubRepoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

export function cloudflarePagesDashboardUrl(projectName: string): string | null {
  if (!cfAccountId?.trim()) {
    return null;
  }
  return `https://dash.cloudflare.com/${cfAccountId.trim()}/pages/view/${projectName}`;
}

export function resolveLinkedSiteLinks(linkedSite: NonNullable<PortalClient["linkedSite"]>) {
  return {
    productionUrl: linkedSite.productionUrl,
    githubUrl: linkedSite.githubRepo ? githubRepoUrl(linkedSite.githubRepo) : null,
    cloudflareUrl: linkedSite.cfPagesProjectName
      ? cloudflarePagesDashboardUrl(linkedSite.cfPagesProjectName)
      : null,
  };
}
