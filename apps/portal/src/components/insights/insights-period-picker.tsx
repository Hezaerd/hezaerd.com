import { ToggleGroup, ToggleGroupItem } from "@hezaerd/ui/components/toggle-group";

import { insightsPeriods, type InsightsPeriod } from "@/lib/convex-queries";

import { periodLabels } from "./insights-labels";

type InsightsPeriodPickerProps = {
  value: InsightsPeriod;
  onValueChange: (period: InsightsPeriod) => void;
};

export function InsightsPeriodPicker({ value, onValueChange }: InsightsPeriodPickerProps) {
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={[value]}
      onValueChange={(next) => {
        const period = next[0] as InsightsPeriod | undefined;
        if (period) {
          onValueChange(period);
        }
      }}
    >
      {insightsPeriods.map((period) => (
        <ToggleGroupItem key={period} value={period} aria-label={periodLabels[period]}>
          {periodLabels[period]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
