function SkeletonRow({ rounded = "rounded" }: { rounded?: string }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className={`bg-muted size-12 animate-pulse ${rounded}`} />
      <div className="flex-1 space-y-2">
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
        <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
      </div>
    </div>
  );
}

type ColumnRowsSkeletonProps = {
  rounded?: string;
};

export function ColumnRowsSkeleton({ rounded = "rounded" }: ColumnRowsSkeletonProps) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonRow key={index} rounded={rounded} />
      ))}
    </div>
  );
}
