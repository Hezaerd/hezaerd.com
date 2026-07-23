import { Skeleton } from "@hezaerd/ui/components/skeleton";
import { cn } from "@hezaerd/ui/lib/utils";

function SkeletonRow({ rounded = "rounded" }: { rounded?: string }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <Skeleton className={cn("size-12", rounded)} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

type ColumnRowsSkeletonProps = {
  rounded?: string;
};

export function ColumnRowsSkeleton({ rounded = "rounded" }: ColumnRowsSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonRow key={index} rounded={rounded} />
      ))}
    </div>
  );
}
