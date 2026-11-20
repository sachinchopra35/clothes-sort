/** Opens an https link (in-app browser / new tab depending on platform). */
export function openExternalUrl(url: string): void {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}