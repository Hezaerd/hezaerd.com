export type DeskSection = "" | "invoices" | "files" | "insights" | "settings";

export type OperatorRecentVisit = {
  slug: string;
  section: DeskSection;
  visitedAt: number;
};

const STORAGE_KEY = "portal:operator:recent-desk-visits";
const MAX_RECENTS = 5;

const DESK_SECTION_LABELS: Record<DeskSection, string> = {
  "": "Bureau",
  invoices: "Factures",
  files: "Fichiers",
  insights: "Statistiques",
  settings: "Paramètres",
};

const DESK_PATH_SEGMENTS = new Set<string>(["invoices", "files", "insights", "settings"]);

export function getDeskSectionLabel(section: DeskSection): string {
  return DESK_SECTION_LABELS[section];
}

export function parseClientDeskPath(pathname: string): { slug: string; section: DeskSection } | null {
  const match = /^\/op\/clients\/([^/]+)(?:\/([^/?]*))?/.exec(pathname);
  if (!match) {
    return null;
  }

  const slug = decodeURIComponent(match[1]!);
  const segment = (match[2] ?? "").split("/")[0] ?? "";

  if (segment === "" || DESK_PATH_SEGMENTS.has(segment)) {
    return { slug, section: segment as DeskSection };
  }

  return { slug, section: "" };
}

function readRecents(): OperatorRecentVisit[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as OperatorRecentVisit[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry) =>
        typeof entry.slug === "string" &&
        typeof entry.section === "string" &&
        typeof entry.visitedAt === "number",
    );
  } catch {
    return [];
  }
}

export function readOperatorRecentVisits(): OperatorRecentVisit[] {
  return readRecents();
}

export function recordOperatorRecentVisit(visit: Pick<OperatorRecentVisit, "slug" | "section">) {
  if (typeof window === "undefined") {
    return;
  }

  const visits = readRecents();
  const next: OperatorRecentVisit = { ...visit, visitedAt: Date.now() };
  const withoutDuplicate = visits.filter((entry) => entry.slug !== visit.slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...withoutDuplicate].slice(0, MAX_RECENTS)));
}
