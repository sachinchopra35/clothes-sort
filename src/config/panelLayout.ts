/** Horizontal padding inside modal panels (buttons and content inset). */
export const PANEL_INSET = 48;

/** Standard primary button height in modals. */
export const PANEL_BUTTON_H = 92;

/** Taller dismiss buttons (settings, how-to, intros, about music). */
export const PANEL_PRIMARY_BTN_H = 116;

export function panelContentWidth(panelWidth: number): number {
  return panelWidth - PANEL_INSET * 2;
}
