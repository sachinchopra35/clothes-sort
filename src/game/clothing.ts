export const CLOTHING_IDS = [
  "light-blue-jeans",
  "black-bootcut-jeans",
  "brown-leather-jacket",
  "white-tee",
  "red-polka-dress",
] as const;

export type ClothingId = (typeof CLOTHING_IDS)[number];

export interface ClothingDef {
  id: ClothingId;
  name: string;
  assetPath: string;
  textureKey: string;
}

export const CLOTHING_CATALOG: Record<ClothingId, ClothingDef> = {
  "light-blue-jeans": {
    id: "light-blue-jeans",
    name: "Light blue jeans",
    assetPath: "assets/clothes/light-blue-jeans.svg",
    textureKey: "clothes-light-blue-jeans",
  },
  "black-bootcut-jeans": {
    id: "black-bootcut-jeans",
    name: "Black bootcut jeans",
    assetPath: "assets/clothes/black-bootcut-jeans.svg",
    textureKey: "clothes-black-bootcut-jeans",
  },
  "brown-leather-jacket": {
    id: "brown-leather-jacket",
    name: "Green jacket",
    assetPath: "assets/clothes/brown-leather-jacket.svg",
    textureKey: "clothes-brown-leather-jacket",
  },
  "white-tee": {
    id: "white-tee",
    name: "White tee",
    assetPath: "assets/clothes/white-tee.svg",
    textureKey: "clothes-white-tee",
  },
  "red-polka-dress": {
    id: "red-polka-dress",
    name: "Red polka dress",
    assetPath: "assets/clothes/red-polka-dress.svg",
    textureKey: "clothes-red-polka-dress",
  },
};

export const ALL_CLOTHING: ClothingDef[] = CLOTHING_IDS.map((id) => CLOTHING_CATALOG[id]);
