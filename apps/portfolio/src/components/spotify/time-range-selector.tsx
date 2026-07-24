import { ToggleGroup, ToggleGroupItem } from "@hezaerd/ui/components/toggle-group";

import { TIME_RANGES, type TimeRange } from "@/types/spotify";

type TimeRangeSelectorProps = {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
};

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => {
        const selected = next[0];
        if (selected) onChange(selected as TimeRange);
      }}
      variant="outline"
      spacing={2}
      className="mx-auto flex-wrap justify-center"
    >
      {TIME_RANGES.map((range) => (
        <ToggleGroupItem
          key={range.value}
          value={range.value}
          aria-label={range.label}
          className="h-auto flex-col items-center gap-1 px-4 py-3"
        >
          <span className="font-medium">{range.label}</span>
          <span className="text-xs opacity-70">{range.description}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
