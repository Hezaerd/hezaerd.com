import { Skeleton } from "@hezaerd/ui/components/skeleton";

export function ClientListSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-muted/20 flex items-center gap-4 rounded-xl border px-5 py-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
            <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
