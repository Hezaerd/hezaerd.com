import type { SourceKindKey } from "./insights-favicon";

export const sourceKindChartClass: Record<SourceKindKey, string> = {
  google: "bg-chart-1",
  direct: "bg-chart-2",
  social: "bg-chart-3",
  referral: "bg-chart-4",
  email: "bg-chart-5",
  other: "bg-muted-foreground/50",
};

export function sourceKindBarClass(sourceKind: string) {
  if (sourceKind in sourceKindChartClass) {
    return sourceKindChartClass[sourceKind as SourceKindKey];
  }
  return sourceKindChartClass.other;
}
