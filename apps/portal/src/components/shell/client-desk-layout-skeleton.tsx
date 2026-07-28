import { Skeleton } from "@hezaerd/ui/components/skeleton";

import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";

export function ClientDeskLayoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
      </div>
      <PageContentSkeleton />
    </div>
  );
}
