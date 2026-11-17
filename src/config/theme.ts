/** Wardrobe wood palette (muted so clothes read clearly on top). */
export const theme = {
  /** Medium-light teak back wall (tight lightness range) */
  backPlankLight: 0xd2b888,
  backPlankA: 0xcbae7a,
  backPlankB: 0xc9a976,
  backPlankC: 0xc7a674,
  backPlankD: 0xc5a372,
  backPlankDeep: 0xb8996a,
  backPlankSeam: 0xb5956c,
  backGrain: 0xae8f62,
  backGrainDark: 0xa5885c,
  backVignette: 0x7a6348,

  /** Dark walnut frame / stiles */
  walnutA: 0x4a3229,
  walnutB: 0x3f2b23,
  walnutHighlight: 0x5c3f34,
  walnutGrain: 0x2f1e18,
  walnutGrainLight: 0x6b4d42,
  walnutShadow: 0x1f1410,

  backWallTop: 0xc9a66b,
  backWallBottom: 0xa67c52,
  plankSeam: 0x4a3229,
  sidePanel: 0x4a3229,
  sidePanelShadow: 0x2f1e18,
  crownTrim: 0x4a3229,
  bottomPlinth: 0x4a3229,
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
    menuTitle: "92px",
    menuTagline: "46px",
    menuLevel: "58px",
    heading: "48px",
    body: "36px",
    small: "28px",
  },
} as const;

export const WARDROBE_SHOW_GRAIN = true;
