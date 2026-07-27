import { Skeleton } from "@hezaerd/ui/components/skeleton";

export function OperatorHomeSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-1 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="border-border bg-muted/20 flex flex-col gap-3 rounded-xl border px-4 py-4"
            >
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-52 max-w-full" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border-border bg-muted/20 flex items-center gap-4 rounded-xl border px-5 py-4"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48 max-w-full" />
                <div className="flex gap-1 pt-0.5">
                  <Skeleton className="h-4 w-14 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
