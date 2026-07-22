/** Shared-element name for a project's preview media (card ↔ detail banner). */
export function projectMediaTransitionName(slug: string): string {
  return `project-media-${slug}`;
}

/**
 * Which project media should carry `view-transition-name` for the active navigation.
 * Kept across the forward trip so the reverse morph can reattach on the card.
 */
let pendingProjectMediaSlug: string | null = null;

export function armProjectMediaTransition(slug: string) {
  pendingProjectMediaSlug = slug;
}

export function getPendingProjectMediaSlug(): string | null {
  return pendingProjectMediaSlug;
}

export function clearProjectMediaTransition() {
  pendingProjectMediaSlug = null;
}
