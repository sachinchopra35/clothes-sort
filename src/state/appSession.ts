const SESSION_KEY = "clothes-sort:warm";

/** Process still alive (in-app navigation or app backgrounded, not swiped away). */
export function hasWarmSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markWarmSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode / SSR */
  }
}