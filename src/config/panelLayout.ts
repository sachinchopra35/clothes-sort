/** Horizontal padding inside modal panels (buttons and content inset). */
export const PANEL_INSET = 48;

/** Standard primary button height in modals. */
export const PANEL_BUTTON_H = 92;

export function panelContentWidth(panelWidth: number): number {
  return panelWidth - PANEL_INSET * 2;
}
