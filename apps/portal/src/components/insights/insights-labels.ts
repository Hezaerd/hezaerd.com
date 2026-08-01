import type { InsightsPeriod } from "@/lib/convex-queries";

export const periodLabels: Record<InsightsPeriod, string> = {
  "7d": "7j",
  "30d": "30j",
  "90d": "90j",
};

export const periodStatSuffix: Record<InsightsPeriod, string> = {
  "7d": "sur 7 jours",
  "30d": "sur 30 jours",
  "90d": "sur 90 jours",
};

export const sourceKindLabels: Record<string, string> = {
  google: "Recherche",
  direct: "Direct",
  social: "Réseaux sociaux",
  referral: "Référence",
  email: "Courriel",
  other: "Autre",
};

export const periodComparisonSuffix: Record<InsightsPeriod, string> = {
  "7d": "vs 7j préc.",
  "30d": "vs 30j préc.",
  "90d": "vs 90j préc.",
};

export function formatCount(value: number) {
  return value.toLocaleString("fr-CA");
}

export function formatShare(value: number, total: number) {
  if (total <= 0) {
    return "0 %";
  }
  const percent = (value / total) * 100;
  return `${percent.toLocaleString("fr-CA", { maximumFractionDigits: 0 })} %`;
}

export function formatVisitorDelta(deltaPercent: number | null) {
  if (deltaPercent === null) {
    return null;
  }

  const rounded = Math.round(deltaPercent);
  if (rounded === 0) {
    return "stable";
  }

  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("fr-CA")} %`;
}
