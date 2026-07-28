import { Skeleton } from "@hezaerd/ui/components/skeleton";

import { PageContentSkeleton } from "@/components/shell/page-content-skeleton";

export function ClientDeskLayoutSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
        <div className="flex shrink-0 items-center gap-3 self-end xl:order-2 xl:mb-2">
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40 max-w-[12rem]" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <div className="flex w-full gap-2 overflow-hidden pb-2 xl:order-1 xl:min-w-0 xl:flex-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-20 shrink-0 rounded-lg sm:w-24" />
          ))}
        </div>
      </div>
      <PageContentSkeleton />
    </div>
  );
}
