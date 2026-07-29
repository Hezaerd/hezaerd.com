export type PaletteHandoff = {
  type: "new-client";
  contactEmail: string;
};

let handoff: PaletteHandoff | null = null;

export function setPaletteHandoff(next: PaletteHandoff) {
  handoff = next;
}

export function consumePaletteHandoff(): PaletteHandoff | null {
  const current = handoff;
  handoff = null;
  return current;
}
