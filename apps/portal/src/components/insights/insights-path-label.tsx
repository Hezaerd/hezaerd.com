import { cn } from "@hezaerd/ui/lib/utils";

import { SiteFavicon } from "./insights-favicon";

type InsightsPathLabelProps = {
  path: string;
  siteHost?: string;
  mono?: boolean;
  className?: string;
};

export function InsightsPathLabel({ path, siteHost, mono = true, className }: InsightsPathLabelProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      {siteHost ? <SiteFavicon siteHost={siteHost} size={16} /> : null}
      <span className={cn("truncate", mono && "font-mono text-[0.8125rem]")}>{path}</span>
    </span>
  );
}

type InsightsRouteLabelProps = {
  routeKey: string;
  siteHost?: string;
  className?: string;
};

export function InsightsRouteLabel({ routeKey, siteHost, className }: InsightsRouteLabelProps) {
  const segments = routeKey.split(" → ");

  return (
    <span className={cn("inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1", className)}>
      {siteHost ? <SiteFavicon siteHost={siteHost} size={16} className="mr-0.5" /> : null}
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span aria-hidden="true" className="text-muted-foreground/70 font-mono text-[0.75rem]">
              →
            </span>
          ) : null}
          <span className="font-mono text-[0.8125rem]">{segment}</span>
        </span>
      ))}
    </span>
  );
}
