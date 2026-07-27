import { Skeleton } from "@hezaerd/ui/components/skeleton";

export function InvoiceListSkeleton() {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="border-border bg-muted/20 flex flex-col gap-4 rounded-xl border p-5">
        <Skeleton className="h-5 w-36" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-8 sm:col-span-2" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="border-border bg-muted/20 flex items-center gap-4 rounded-xl border px-5 py-4"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
