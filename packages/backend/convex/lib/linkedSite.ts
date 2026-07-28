import { v } from "convex/values";

export const linkedSiteValidator = v.object({
  productionUrl: v.string(),
  githubRepo: v.optional(v.string()),
  cfPagesProjectName: v.optional(v.string()),
});

export type LinkedSite = {
  productionUrl: string;
  githubRepo?: string;
  cfPagesProjectName?: string;
};

export function normalizeProductionUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("URL invalide");
  }

  parsed.hash = "";
  return parsed.toString().replace(/\/$/, "");
}

function normalizeGithubRepo(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return undefined;
  }

  const repo = trimmed
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\/$/, "")
    .replace(/\.git$/i, "");

  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error("Repo GitHub invalide (format org/repo)");
  }

  return repo;
}

function normalizeCfPagesProjectName(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateLinkedSiteInput(input: {
  productionUrl: string;
  githubRepo?: string;
  cfPagesProjectName?: string;
}): LinkedSite | undefined {
  const productionUrl = normalizeProductionUrl(input.productionUrl);
  if (!productionUrl) {
    return undefined;
  }

  return {
    productionUrl,
    githubRepo: normalizeGithubRepo(input.githubRepo),
    cfPagesProjectName: normalizeCfPagesProjectName(input.cfPagesProjectName),
  };
}
