import { Skeleton } from "@hezaerd/ui/components/skeleton";
import { cn } from "@hezaerd/ui/lib/utils";

import type { InsightsShellVariant } from "./insights-types";

type InsightsOverviewSkeletonProps = {
  variant?: InsightsShellVariant;
};

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
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-60 w-full rounded-xl" />
      </section>

      <div
        className={cn(
          "grid gap-6",
          variant === "desk" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : "gap-8",
        )}
      >
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
