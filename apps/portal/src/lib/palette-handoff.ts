export type PaletteHandoff = {
  type: "new-client";
  contactEmail: string;
};

let handoff: PaletteHandoff | null = null;
let handoffVersion = 0;
const listeners = new Set<() => void>();

function notifyPaletteHandoffListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function setPaletteHandoff(next: PaletteHandoff) {
  handoff = next;
  handoffVersion += 1;
  notifyPaletteHandoffListeners();
}

export function consumePaletteHandoff(): PaletteHandoff | null {
  const current = handoff;
  handoff = null;
  return current;
}

export function subscribePaletteHandoff(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPaletteHandoffVersion(): number {
  return handoffVersion;
}
