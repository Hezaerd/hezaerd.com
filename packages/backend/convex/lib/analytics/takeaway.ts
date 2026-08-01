import type { SourceKind } from "./constants";
import type { InsightsPeriod } from "./period";

type TakeawayInput = {
  period: InsightsPeriod;
  totalVisitors: number;
  deltaPercent: number | null;
  sources: Array<{ sourceKind: SourceKind; views: number }>;
  landings: Array<{ path: string; entries: number }>;
  topPages: Array<{ path: string; views: number }>;
};

function sourceShare(
  sources: TakeawayInput["sources"],
  kind: SourceKind,
): number {
  const total = sources.reduce((sum, row) => sum + row.views, 0);
  if (total <= 0) {
    return 0;
  }
  const match = sources.find((row) => row.sourceKind === kind);
  return (match?.views ?? 0) / total;
}

function formatPath(path: string): string {
  return path === "/" ? "l'accueil" : path;
}

/** Plain-language summary for the Insights hero (rule-based v1). */
export function buildInsightsTakeaway(input: TakeawayInput): string | null {
  if (input.totalVisitors < 8) {
    return "Trafic encore léger — cette lecture se stabilisera avec plus de visites.";
  }

  const parts: string[] = [];
  const searchShare = sourceShare(input.sources, "google");
  const directShare = sourceShare(input.sources, "direct");

  if (input.deltaPercent !== null) {
    if (input.deltaPercent >= 15) {
      parts.push("Le trafic progresse nettement par rapport à la période précédente.");
    } else if (input.deltaPercent <= -15) {
      parts.push("Le trafic recule par rapport à la période précédente.");
    }
  }

  if (searchShare >= 0.45) {
    parts.push("La recherche Google amène la majorité des visites.");
  } else if (directShare >= 0.5) {
    parts.push("Beaucoup de visites arrivent en direct — ta notoriété ou tes liens bookmarkés portent.");
  }

  const topLanding = input.landings[0];
  const contactLanding = input.landings.find((row) => /contact/i.test(row.path));
  const topPage = input.topPages[0];

  if (topLanding && topPage && topLanding.path !== topPage.path && topPage.views > topLanding.entries * 2) {
    parts.push(
      `${formatPath(topPage.path)} attire des vues, mais ${formatPath(topLanding.path)} reste la porte d'entrée principale.`,
    );
  }

  if (contactLanding && contactLanding.entries <= 1 && input.totalVisitors >= 20) {
    parts.push("Peu de monde n'atterrit sur une page contact — un lien plus visible pourrait aider.");
  } else if (!contactLanding && input.totalVisitors >= 30) {
    const hasContactViews = input.topPages.some((row) => /contact/i.test(row.path));
    if (!hasContactViews) {
      parts.push("Aucune page contact dans le top — les visiteurs ne voient peut-être pas comment te joindre.");
    }
  }

  if (parts.length === 0) {
    if (topLanding) {
      return `La plupart des visites commencent sur ${formatPath(topLanding.path)}.`;
    }
    return null;
  }

  return parts.slice(0, 2).join(" ");
}
