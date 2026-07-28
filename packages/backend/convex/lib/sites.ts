import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export const DEGRADED_LATENCY_MS = 2000;
export const DOWN_AFTER_CONSECUTIVE_FAILURES = 2;

export type SiteHealthStatus = "up" | "degraded" | "down" | "unknown";

export type LinkedSiteInput = {
  githubRepo: string;
  defaultBranch: string;
  productionUrl: string;
};

const GITHUB_REPO_PATTERN = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

export function normalizeGithubRepo(input: string): string {
  const trimmed = input.trim().replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
  if (!GITHUB_REPO_PATTERN.test(trimmed)) {
    throw new Error("Repo GitHub invalide (format attendu : owner/repo)");
  }
  return trimmed;
}

export function normalizeProductionUrl(input: string): string {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("URL de production invalide");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("URL de production invalide");
  }
  return url.toString().replace(/\/$/, "");
}

export function normalizeDefaultBranch(input: string): string {
  const branch = input.trim();
  if (!branch) {
    throw new Error("Branche par défaut requise");
  }
  return branch;
}

export function validateLinkedSite(input: LinkedSiteInput): LinkedSiteInput {
  return {
    githubRepo: normalizeGithubRepo(input.githubRepo),
    defaultBranch: normalizeDefaultBranch(input.defaultBranch),
    productionUrl: normalizeProductionUrl(input.productionUrl),
  };
}

export function hasLinkedSite(client: Pick<Doc<"clients">, "linkedSite">): boolean {
  return Boolean(
    client.linkedSite?.githubRepo &&
      client.linkedSite.defaultBranch &&
      client.linkedSite.productionUrl,
  );
}

type DbCtx = QueryCtx | MutationCtx;

export async function getClientByGithubRepo(
  ctx: DbCtx,
  githubRepo: string,
): Promise<Doc<"clients"> | null> {
  return await ctx.db
    .query("clients")
    .withIndex("by_linkedSite_githubRepo", (q) => q.eq("linkedSite.githubRepo", githubRepo))
    .unique();
}

export function evaluateHealthCheck(args: {
  previousStatus: SiteHealthStatus;
  consecutiveFailures: number;
  ok: boolean;
  latencyMs: number;
  httpStatus?: number;
}): { status: SiteHealthStatus; consecutiveFailures: number } {
  if (args.ok) {
    const status = args.latencyMs > DEGRADED_LATENCY_MS ? "degraded" : "up";
    return { status, consecutiveFailures: 0 };
  }

  const consecutiveFailures = args.consecutiveFailures + 1;
  const status =
    consecutiveFailures >= DOWN_AFTER_CONSECUTIVE_FAILURES ? "down" : args.previousStatus;
  return { status, consecutiveFailures };
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}
