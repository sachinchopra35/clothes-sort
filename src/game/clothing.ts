export const CLOTHING_IDS = [
  "light-blue-jeans",
  "black-bootcut-jeans",
  "brown-leather-jacket",
  "white-tee",
  "red-polka-dress",
  "yellow-shorts",
  "purple-socks",
  "orange-scarf",
  "red-jeans",
  "green-tee",
  "red-tee",
  "purple-tee",
  "blue-tee",
  "orange-dress",
  "green-scarf",
  "pink-gloves",
  "blue-cap",
  "yellow-sun-hat",
  "teal-kimono",
  "coral-swimsuit",
  "black-boots",
  "red-trainers",
  "psychedelic-tee",
  "tie-dye-tee",
  "red-jacket",
  "purple-jacket",
  "blue-jacket",
  "yellow-jacket",
  "green-socks",
  "orange-socks",
  "pink-socks",
  "green-trunks",
  "blue-trunks",
  "pink-trunks",
  "crown",
  "penguin",
  "top-hat",
  "sardine",
  "tropical-fish",
] as const;

export type ClothingId = (typeof CLOTHING_IDS)[number];

export interface ClothingDef {
  id: ClothingId;
  name: string;
  assetPath: string;
  textureKey: string;
}

function def(id: ClothingId, name: string): ClothingDef {
  return { id, name, assetPath: `assets/clothes/${id}.svg`, textureKey: `clothes-${id}` };
}

export const CLOTHING_CATALOG: Record<ClothingId, ClothingDef> = {
  "psychedelic-tee": def("psychedelic-tee", "Psychedelic tee"),
  "tie-dye-tee": def("tie-dye-tee", "Tie-dye tee"),
  "red-jacket": def("red-jacket", "Red jacket"),
  "purple-jacket": def("purple-jacket", "Purple jacket"),
  "blue-jacket": def("blue-jacket", "Blue jacket"),
  "yellow-jacket": def("yellow-jacket", "Yellow jacket"),
  "green-socks": def("green-socks", "Green socks"),
  "orange-socks": def("orange-socks", "Orange socks"),
  "pink-socks": def("pink-socks", "Pink socks"),
  "green-trunks": def("green-trunks", "Green swim trunks"),
  "blue-trunks": def("blue-trunks", "Blue swim trunks"),
  "pink-trunks": def("pink-trunks", "Pink swim trunks"),
  crown: def("crown", "Crown"),
  penguin: def("penguin", "Penguin"),
  "top-hat": def("top-hat", "Top hat"),
  sardine: def("sardine", "Sardine"),
  "tropical-fish": def("tropical-fish", "Tropical fish"),
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
  "yellow-shorts": {
    id: "yellow-shorts",
    name: "Yellow shorts",
    assetPath: "assets/clothes/yellow-shorts.svg",
    textureKey: "clothes-yellow-shorts",
  },
  "purple-socks": {
    id: "purple-socks",
    name: "Purple socks",
    assetPath: "assets/clothes/purple-socks.svg",
    textureKey: "clothes-purple-socks",
  },
  "orange-scarf": {
    id: "orange-scarf",
    name: "Orange scarf",
    assetPath: "assets/clothes/orange-scarf.svg",
    textureKey: "clothes-orange-scarf",
  },
  "red-jeans": {
    id: "red-jeans",
    name: "Red jeans",
    assetPath: "assets/clothes/red-jeans.svg",
    textureKey: "clothes-red-jeans",
  },
  "green-tee": {
    id: "green-tee",
    name: "Green tee",
    assetPath: "assets/clothes/green-tee.svg",
    textureKey: "clothes-green-tee",
  },
  "red-tee": {
    id: "red-tee",
    name: "Red tee",
    assetPath: "assets/clothes/red-tee.svg",
    textureKey: "clothes-red-tee",
  },
  "purple-tee": {
    id: "purple-tee",
    name: "Purple tee",
    assetPath: "assets/clothes/purple-tee.svg",
    textureKey: "clothes-purple-tee",
  },
  "blue-tee": {
    id: "blue-tee",
    name: "Blue tee",
    assetPath: "assets/clothes/blue-tee.svg",
    textureKey: "clothes-blue-tee",
  },
  "orange-dress": {
    id: "orange-dress",
    name: "Orange dress",
    assetPath: "assets/clothes/orange-dress.svg",
    textureKey: "clothes-orange-dress",
  },
  "green-scarf": {
    id: "green-scarf",
    name: "Green scarf",
    assetPath: "assets/clothes/green-scarf.svg",
    textureKey: "clothes-green-scarf",
  },
  "pink-gloves": {
    id: "pink-gloves",
    name: "Pink gloves",
    assetPath: "assets/clothes/pink-gloves.svg",
    textureKey: "clothes-pink-gloves",
  },
  "blue-cap": {
    id: "blue-cap",
    name: "Blue cap",
    assetPath: "assets/clothes/blue-cap.svg",
    textureKey: "clothes-blue-cap",
  },
  "yellow-sun-hat": {
    id: "yellow-sun-hat",
    name: "Yellow sun hat",
    assetPath: "assets/clothes/yellow-sun-hat.svg",
    textureKey: "clothes-yellow-sun-hat",
  },
  "teal-kimono": {
    id: "teal-kimono",
    name: "Teal kimono",
    assetPath: "assets/clothes/teal-kimono.svg",
    textureKey: "clothes-teal-kimono",
  },
  "coral-swimsuit": {
    id: "coral-swimsuit",
    name: "Coral swimsuit",
    assetPath: "assets/clothes/coral-swimsuit.svg",
    textureKey: "clothes-coral-swimsuit",
  },
  "black-boots": {
    id: "black-boots",
    name: "Black boots",
    assetPath: "assets/clothes/black-boots.svg",
    textureKey: "clothes-black-boots",
  },
  "red-trainers": {
    id: "red-trainers",
    name: "Red trainers",
    assetPath: "assets/clothes/red-trainers.svg",
    textureKey: "clothes-red-trainers",
  },
};

export const ALL_CLOTHING: ClothingDef[] = CLOTHING_IDS.map((id) => CLOTHING_CATALOG[id]);
