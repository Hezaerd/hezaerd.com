import { api } from "@hezaerd/backend/api";
import { Button } from "@hezaerd/ui/components/button";
import { Link01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useAction } from "convex/react";

import { resolveLinkedSiteLinks } from "@/lib/linked-site-links";
import type { PortalClient } from "@/lib/portal-types";

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
    <section className="border-border bg-muted/20 overflow-hidden rounded-xl border">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="border-border relative min-h-52 overflow-hidden border-b lg:min-h-72 lg:border-r lg:border-b-0">
          <iframe
            src={linkedSite.productionUrl}
            title={`Aperçu du site de ${clientName}`}
            className="pointer-events-none absolute top-0 left-0 h-[720px] w-[1280px] origin-top-left scale-[0.28] sm:scale-[0.32] lg:scale-[0.36]"
            loading="lazy"
            tabIndex={-1}
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
            {links.cloudflareUrl ? (
              <Button
                variant="outline"
                render={<a href={links.cloudflareUrl} target="_blank" rel="noreferrer" />}
              >
                Cloudflare Pages
              </Button>
            ) : null}
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed">
            Aperçu live du site.{" "}
            <Link
              to="/op/clients/$clientId/settings"
              params={{ clientId: clientSlug }}
              className="text-foreground hover:underline"
            >
              Modifier l&apos;URL
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
