import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type MemoryKind = "fact" | "lesson";

export interface MemoryEntry {
  key: string;
  kind: MemoryKind;
  value: string;
  updatedAt: string;
}

interface MemoryFile {
  entries: Record<string, MemoryEntry>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const MEMORY_PATH = path.join(DATA_DIR, "memory.json");

async function load(): Promise<MemoryFile> {
  try {
    const raw = await readFile(MEMORY_PATH, "utf8");
    const parsed = JSON.parse(raw) as MemoryFile;
    return { entries: parsed.entries ?? {} };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return { entries: {} };
    }
    throw error;
  }
}

async function save(file: MemoryFile): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(MEMORY_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

export const memoryStore = {
  async list(options: { limit: number; kind?: MemoryKind }): Promise<MemoryEntry[]> {
    const file = await load();
    const all = Object.values(file.entries)
      .filter((entry) => (options.kind ? entry.kind === options.kind : true))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return all.slice(0, options.limit);
  },

  async get(key: string): Promise<MemoryEntry | null> {
    const file = await load();
    return file.entries[normalizeKey(key)] ?? null;
  },

  async put(input: {
    key: string;
    value: string;
    kind: MemoryKind;
  }): Promise<MemoryEntry> {
    const file = await load();
    const key = normalizeKey(input.key);
    const entry: MemoryEntry = {
      key,
      kind: input.kind,
      value: input.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    file.entries[key] = entry;
    await save(file);
    return entry;
  },

  async delete(key: string): Promise<boolean> {
    const file = await load();
    const normalized = normalizeKey(key);
    if (!(normalized in file.entries)) {
      return false;
    }
    delete file.entries[normalized];
    await save(file);
    return true;
  },
};
