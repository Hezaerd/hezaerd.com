import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useAction } from "convex/react";

import { resolveLinkedSiteLinks } from "@/lib/linked-site-links";
import type { PortalClient } from "@/lib/portal-types";
import { DeskCard } from "@/components/shell/client-desk-layout";

type ClientSitePreviewProps = {
  clientSlug: string;
  clientName: string;
  linkedSite: NonNullable<PortalClient["linkedSite"]>;
};

function siteHealthQueryKey(slug: string, url: string) {
  return ["site-health", slug, url] as const;
}

export function ClientSitePreview({ clientSlug, clientName, linkedSite }: ClientSitePreviewProps) {
  const checkHealth = useAction(api.linkedSite.checkHealth);
  const links = resolveLinkedSiteLinks(linkedSite);

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: siteHealthQueryKey(clientSlug, linkedSite.productionUrl),
    queryFn: () => checkHealth({ slug: clientSlug, url: linkedSite.productionUrl }),
    staleTime: 60_000,
  });

  return (
    <DeskCard className="gap-0 overflow-hidden p-0">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="border-border @container relative aspect-video overflow-hidden border-b lg:border-r lg:border-b-0">
          <iframe
            src={linkedSite.productionUrl}
            title={`Aperçu du site de ${clientName}`}
            className="pointer-events-none absolute top-0 left-0 h-[720px] w-[1280px] origin-top-left [transform:scale(calc(100cqw/1280px))]"
            loading="lazy"
            tabIndex={-1}
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
              Site public
            </p>
            <div className="mt-3 flex items-start gap-2">
              <span
                className={[
                  "mt-1.5 size-2 shrink-0 rounded-full",
                  healthLoading
                    ? "bg-muted-foreground/40 animate-pulse"
                    : health?.ok
                      ? "bg-emerald-500"
                      : "bg-destructive",
                ].join(" ")}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {healthLoading ? "Vérification…" : health?.ok ? "En ligne" : "Injoignable"}
                </p>
                <p className="text-muted-foreground mt-1 truncate text-xs">{links.productionUrl}</p>
                {!healthLoading && health ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {health.statusCode ? `HTTP ${health.statusCode}` : "Pas de réponse"}
                    {" · "}
                    {health.latencyMs} ms
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button render={<a href={links.productionUrl} target="_blank" rel="noreferrer" />}>
              Visiter
              <HugeiconsIcon icon={Link01Icon} size={14} className="ml-1.5" />
            </Button>
            {links.githubUrl ? (
              <Button
                variant="outline"
                render={<a href={links.githubUrl} target="_blank" rel="noreferrer" />}
              >
                GitHub
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </DeskCard>
  );
}
