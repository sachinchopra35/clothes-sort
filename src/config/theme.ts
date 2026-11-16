/** Wardrobe wood palette (muted so clothes read clearly on top). */
export const theme = {
  backWallTop: 0xc9a66b,
  backWallBottom: 0xa67c52,
  plankSeam: 0x8b6340,
  sidePanel: 0x6b4a32,
  sidePanelShadow: 0x3d2a1c,
  crownTrim: 0x7a5638,
  bottomPlinth: 0x7a5638,
  grainLine: 0x6b4a32,

  shelfWood: 0xd4b896,
  shelfFrontEdge: 0xe8d4b8,
  shelfShadow: 0x000000,
  shelfBracket: 0x8b6340,

  ui: {
    text: "#fff8ef",
    textMuted: "#e8d4c4",
    buttonFill: 0xc97b4a,
    buttonFillPressed: 0xa85f34,
    buttonStroke: 0x5c3d28,
    overlayDim: 0x000000,
    panelFill: 0x4a3424,
    panelStroke: 0x8b6340,
    accent: 0xf4a261,
    locked: "#9a8b7e",
    success: "#5dce6a",
    successStroke: "#2f6b38",
  },

  fontFamily: '"Fredoka", "Trebuchet MS", system-ui, sans-serif',
  fontSize: {
    title: "72px",
    heading: "48px",
    body: "36px",
    small: "28px",
  },
} as const;

export const WARDROBE_SHOW_GRAIN = true;
