import { cn } from "@hezaerd/ui/lib/utils";

export type ChartTooltipItem = {
  key: string;
  label: React.ReactNode;
  value: React.ReactNode;
  color?: string;
};

type ChartTooltipCardProps = {
  label?: React.ReactNode;
  items: ChartTooltipItem[];
  className?: string;
};

export function ChartTooltipCard({ label, items, className }: ChartTooltipCardProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-32 items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {label ? <p className="text-muted-foreground font-medium">{label}</p> : null}
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {item.color ? (
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              ) : null}
              <span className="text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-foreground font-medium tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
