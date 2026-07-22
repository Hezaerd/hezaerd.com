/** Ephemeral handoff of hover-preview playback time into the project page. */
const previewPlaybackTimes = new Map<string, number>();

export function setPreviewPlaybackTime(slug: string, time: number) {
  if (time > 0) {
    previewPlaybackTimes.set(slug, time);
  } else {
    previewPlaybackTimes.delete(slug);
  }
}

export function getPreviewPlaybackTime(slug: string): number {
  return previewPlaybackTimes.get(slug) ?? 0;
}

export function clearPreviewPlaybackTime(slug: string) {
  previewPlaybackTimes.delete(slug);
}
