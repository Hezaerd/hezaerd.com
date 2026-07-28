import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { ArrowUpRight01Icon, ReloadIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";
import { useState } from "react";

import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { clientBySlugQuery, siteSnapshotQuery } from "@/lib/convex-queries";
import type { SiteHealthStatus } from "@/lib/portal-types";

export const Route = createFileRoute("/op/clients/$clientId/site")({
  component: ClientDeskSitePage,
});

const healthLabels: Record<SiteHealthStatus, string> = {
  up: "En ligne",
  degraded: "Dégradé",
  down: "Hors ligne",
  unknown: "Inconnu",
};

const healthDotClass: Record<SiteHealthStatus, string> = {
  up: "bg-emerald-500",
  degraded: "bg-amber-500",
  down: "bg-red-500",
  unknown: "bg-muted-foreground/50",
};

const deployLabels = {
  success: "Réussi",
  failure: "Échec",
  in_progress: "En cours",
} as const;

function ClientDeskSitePage() {
  const { clientId } = Route.useParams();
  const { data: clientDoc } = useSuspenseQuery(clientBySlugQuery(clientId));
  const { data: snapshot } = useSuspenseQuery(siteSnapshotQuery(clientId));
  const refreshGit = useAction(api.sites.refreshGit);
  const [refreshing, setRefreshing] = useState(false);

  if (clientDoc === null || snapshot === null) {
    throw notFound();
  }

  async function handleRefreshGit() {
    setRefreshing(true);
    try {
      await refreshGit({ slug: clientId });
    } finally {
      setRefreshing(false);
    }
  }

  const checkedAt = new Date(snapshot.health.checkedAt).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <section className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${healthDotClass[snapshot.health.status]}`}
              />
              <p className="font-display text-base font-semibold tracking-tight">
                {healthLabels[snapshot.health.status]}
              </p>
            </div>
            <p className="text-muted-foreground font-mono text-xs">{snapshot.linkedSite.productionUrl}</p>
            <p className="text-muted-foreground text-xs">
              Vérifié {checkedAt}
              {snapshot.health.latencyMs !== undefined ? ` · ${snapshot.health.latencyMs} ms` : null}
              {snapshot.health.httpStatus !== undefined ? ` · HTTP ${snapshot.health.httpStatus}` : null}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={snapshot.linkedSite.productionUrl}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              Ouvrir
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`https://github.com/${snapshot.linkedSite.githubRepo}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              GitHub
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">Dernier deploy</h3>
            {snapshot.deploy ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {deployLabels[snapshot.deploy.status]}
                {snapshot.deploy.commitSha ? ` · ${snapshot.deploy.commitSha.slice(0, 7)}` : null}
                {" · "}
                {new Date(snapshot.deploy.finishedAt).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            ) : (
              <p className="text-muted-foreground mt-1 text-sm">Aucun deploy signalé par la CI.</p>
            )}
          </div>
          {snapshot.deploy?.previewUrl ? (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <a href={snapshot.deploy.previewUrl} target="_blank" rel="noreferrer" />
              }
            >
              Preview
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} />
            </Button>
          ) : null}
        </div>
      </section>

      <section className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">Git</h3>
            <p className="text-muted-foreground mt-1 font-mono text-xs">
              {snapshot.git?.branch ?? snapshot.linkedSite.defaultBranch}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={() => void handleRefreshGit()}
          >
            <HugeiconsIcon icon={ReloadIcon} size={13} />
            {refreshing ? "Sync…" : "Rafraîchir"}
          </Button>
        </div>

        {snapshot.git?.commits.length ? (
          <ol className="divide-border flex flex-col divide-y">
            {snapshot.git.commits.map((commit) => (
              <li key={commit.sha} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-mono text-xs hover:underline"
                  >
                    {commit.shortSha}
                  </a>
                  <span className="text-muted-foreground text-xs">
                    {new Date(commit.committedAt).toLocaleString("fr-FR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-sm">{commit.message}</p>
                <p className="text-muted-foreground text-xs">{commit.author}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground text-sm">
            Pas encore d&apos;historique. Vérifie le webhook GitHub ou rafraîchis.
          </p>
        )}

        {snapshot.git?.syncedAt ? (
          <p className="text-muted-foreground text-xs">
            Sync{" "}
            {new Date(snapshot.git.syncedAt).toLocaleString("fr-FR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        ) : null}
      </section>

      <p className="text-muted-foreground text-xs">
        Configuration du site lié dans{" "}
        <Link
          to="/op/clients/$clientId/settings"
          params={{ clientId }}
          className="text-foreground hover:underline"
        >
          Paramètres
        </Link>
        .
      </p>
    </div>
  );
}
