import { Skeleton } from "@hezaerd/ui/components/skeleton";
import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsShellVariant } from "./insights-types";

type InsightsOverviewSkeletonProps = {
  variant?: InsightsShellVariant;
};

function SourceRowSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-[18px] rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function InsightsOverviewSkeleton({ variant = "desk" }: InsightsOverviewSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        variant === "workspace" && "gap-8",
        "motion-safe:animate-pulse motion-reduce:animate-none",
      )}
      aria-busy="true"
      aria-label="Chargement des statistiques"
    >
      <section className="flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-60 w-full rounded-xl" />
      </section>

      <div
        className={cn(
          "grid gap-6",
          variant === "desk" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : "gap-8",
        )}
      >
        <div className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-4">
          <SourceRowSkeleton />
          <SourceRowSkeleton />
          <SourceRowSkeleton />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
