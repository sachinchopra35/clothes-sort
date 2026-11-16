/** ~15% larger tap targets for menu, HUD, modals, and picker arrows. */
export const UI_BUTTON_SCALE = 1.15;

export function scaleButtonSize(width: number, height: number): { width: number; height: number } {
  return {
    width: Math.round(width * UI_BUTTON_SCALE),
    height: Math.round(height * UI_BUTTON_SCALE),
  };
}