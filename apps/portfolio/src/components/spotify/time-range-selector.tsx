import { Button } from "@hezaerd/ui/components/button";

import { TIME_RANGES, type TimeRange } from "@/types/spotify";

type TimeRangeSelectorProps = {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {TIME_RANGES.map((range) => (
        <Button
          key={range.value}
          type="button"
          variant={value === range.value ? "default" : "outline"}
          onClick={() => onChange(range.value)}
          className="h-auto flex-col items-center gap-1 px-4 py-3"
        >
          <span className="font-medium">{range.label}</span>
          <span className="text-xs opacity-70">{range.description}</span>
        </Button>
      ))}
    </div>
  );
}
