export type PublishedSnapshot = {
  version: number;
  publishedAt: number;
  fields: Record<string, string>;
};

export function emptyPublishedSnapshot(): PublishedSnapshot {
  return {
    version: 0,
    publishedAt: 0,
    fields: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePublishedSnapshot(raw: unknown): PublishedSnapshot {
  if (!isRecord(raw)) {
    throw new Error("Snapshot invalide : objet attendu");
  }

  if (typeof raw.version !== "number" || typeof raw.publishedAt !== "number") {
    throw new Error("Snapshot invalide : version ou publishedAt manquant");
  }

  if (!isRecord(raw.fields)) {
    throw new Error("Snapshot invalide : fields manquant");
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw.fields)) {
    if (typeof value !== "string") {
      throw new Error(`Snapshot invalide : valeur non texte pour ${key}`);
    }
    fields[key] = value;
  }

  return {
    version: raw.version,
    publishedAt: raw.publishedAt,
    fields,
  };
}

export async function fetchPublishedSnapshot(url: string): Promise<PublishedSnapshot> {
  const response = await fetch(url);
  if (response.status === 404) {
    return emptyPublishedSnapshot();
  }

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Snapshot fetch failed (${response.status}): ${bodyText}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(bodyText);
  } catch {
    throw new Error(`Snapshot fetch failed: invalid JSON (${bodyText})`);
  }

  return parsePublishedSnapshot(raw);
}

export function getField(
  snapshot: PublishedSnapshot,
  key: string,
  fallback = "",
): string {
  return snapshot.fields[key] ?? fallback;
}
