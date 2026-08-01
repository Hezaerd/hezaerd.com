/** True when the page runs inside an iframe (e.g. Portal desk preview). */
export function isEmbedded(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin parent blocks access — treat as embedded.
    return true;
  }
}
