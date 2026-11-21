/**
 * Fetches Microsoft Fluent UI Emoji flat SVGs and writes recoloured game assets.
 * Run once when art changes: npm run build:clothes
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/assets/clothes");
const BASE =
  "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";

const FLUENT = {
  jeans: `${BASE}/Jeans/Flat/jeans_flat.svg`,
  tee: `${BASE}/T-shirt/Flat/t-shirt_flat.svg`,
  dress: `${BASE}/Dress/Flat/dress_flat.svg`,
  coat: `${BASE}/Coat/Flat/coat_flat.svg`,
  shorts: `${BASE}/Shorts/Flat/shorts_flat.svg`,
  socks: `${BASE}/Socks/Flat/socks_flat.svg`,
  scarf: `${BASE}/Scarf/Flat/scarf_flat.svg`,
  gloves: `${BASE}/Gloves/Flat/gloves_flat.svg`,
  cap: `${BASE}/Billed%20cap/Flat/billed_cap_flat.svg`,
  hat: `${BASE}/Womans%20hat/Flat/womans_hat_flat.svg`,
  kimono: `${BASE}/Kimono/Flat/kimono_flat.svg`,
  swimsuit: `${BASE}/One-piece%20swimsuit/Flat/one-piece_swimsuit_flat.svg`,
  boot: `${BASE}/Womans%20boot/Flat/womans_boot_flat.svg`,
  shoe: `${BASE}/Running%20shoe/Flat/running_shoe_flat.svg`,
  crown: `${BASE}/Crown/Flat/crown_flat.svg`,
  penguin: `${BASE}/Penguin/Flat/penguin_flat.svg`,
  topHat: `${BASE}/Top%20hat/Flat/top_hat_flat.svg`,
  fish: `${BASE}/Fish/Flat/fish_flat.svg`,
  tropicalFish: `${BASE}/Tropical%20fish/Flat/tropical_fish_flat.svg`,
};

/** Only write assets that don't exist yet (keeps existing art stable). */
const NEW_ONLY = process.argv.includes("--new-only");

const PSYCHEDELIC_DEFS = `
  <defs>
    <linearGradient id="psy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FF2E93"/>
      <stop offset="0.2" stop-color="#FF9F1C"/>
      <stop offset="0.4" stop-color="#FFE45E"/>
      <stop offset="0.6" stop-color="#3CF0A0"/>
      <stop offset="0.8" stop-color="#3A86FF"/>
      <stop offset="1" stop-color="#9B5DE5"/>
    </linearGradient>
    <linearGradient id="psyBand" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9B5DE5"/>
      <stop offset="0.5" stop-color="#FF2E93"/>
      <stop offset="1" stop-color="#FFE45E"/>
    </linearGradient>
  </defs>`;

const TIE_DYE_DEFS = `
  <defs>
    <radialGradient id="tiedye" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="0.18" stop-color="#FF70A6"/>
      <stop offset="0.36" stop-color="#70D6FF"/>
      <stop offset="0.54" stop-color="#FFD670"/>
      <stop offset="0.72" stop-color="#B388EB"/>
      <stop offset="1" stop-color="#FF70A6"/>
    </radialGradient>
  </defs>`;

function addDefs(svg, defs) {
  return svg.replace(/<svg([^>]*)>/, `<svg$1>${defs}`);
}

function replaceColors(svg, map) {
  let out = svg;
  for (const [from, to] of Object.entries(map)) {
    const re = new RegExp(from.replace(/#/g, "#"), "gi");
    out = out.replaceAll(from, to);
    out = out.replaceAll(from.toLowerCase(), to);
    out = out.replaceAll(from.toUpperCase(), to);
  }
  return out;
}

function replaceAllLiteral(svg, replacements) {
  let out = svg;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

async function fetchSvg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function addPolkaDots(svg) {
  const dotPattern = `
  <defs>
    <pattern id="polka" patternUnits="userSpaceOnUse" width="24" height="24">
      <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </pattern>
  </defs>`;
  const withPattern = svg.replace("<svg", `<svg`).replace(
    /<svg([^>]*)>/,
    `<svg$1>${dotPattern}`,
  );
  return withPattern.replace(
    /(<path[^>]*fill="[^"]*"[^>]*\/>)/,
    '$1<rect width="100%" height="100%" fill="url(#polka)" opacity="0.55"/>',
  );
}

const MIT = `Microsoft Fluent UI Emoji — Flat assets
Source: https://github.com/microsoft/fluentui-emoji

MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`;

const VARIANTS = [
  {
    id: "light-blue-jeans",
    url: FLUENT.jeans,
    colors: [
      ["#0074BA", "#5B9BD5"],
      ["#00A6ED", "#9DC4E8"],
    ],
  },
  {
    id: "black-bootcut-jeans",
    url: FLUENT.jeans,
    colors: [
      ["#0074BA", "#1A1A22"],
      ["#00A6ED", "#3D3D48"],
    ],
  },
  {
    id: "brown-leather-jacket",
    url: FLUENT.coat,
    colors: [
      ["#8C5543", "#1B4332"],
      ["#E19747", "#2D6A4F"],
      ["#F3AD61", "#40916C"],
      ["#F3C07B", "#52B788"],
      ["#FFDEA7", "#74C69D"],
    ],
  },
  {
    id: "white-tee",
    url: FLUENT.tee,
    colors: [
      ["#00D26A", "#E8E8E8"],
      ["#44911B", "#D0D0D0"],
      ["#86D72F", "#F5F5F5"],
      ["#C3EF3C", "#FFFFFF"],
    ],
  },
  {
    id: "red-polka-dress",
    url: FLUENT.dress,
    colors: [
      ["#46A4FB", "#C41E3A"],
      ["#6B438B", "#9B1B30"],
    ],
    polka: true,
  },
  {
    id: "yellow-shorts",
    url: FLUENT.shorts,
    colors: [
      ["#00D26A", "#F2B705"],
      ["#6AFCAC", "#FFE07A"],
    ],
  },
  {
    id: "purple-socks",
    url: FLUENT.socks,
    colors: [
      ["#3F5FFF", "#7B2CBF"],
      ["#46A4FB", "#C77DFF"],
      ["#F9C23C", "#F1E4FF"],
    ],
  },
  {
    id: "orange-scarf",
    url: FLUENT.scarf,
    colors: [
      ["#990838", "#C2570C"],
      ["#CA0B4A", "#F07C14"],
      ["#F8312F", "#FFB347"],
    ],
  },
  {
    id: "red-jeans",
    url: FLUENT.jeans,
    colors: [
      ["#0074BA", "#9B1B30"],
      ["#00A6ED", "#D62839"],
    ],
  },
  {
    id: "green-tee",
    url: FLUENT.tee,
    colors: [],
  },
  {
    id: "red-tee",
    url: FLUENT.tee,
    colors: [
      ["#00D26A", "#C1121F"],
      ["#44911B", "#9B1B30"],
      ["#86D72F", "#E63946"],
      ["#C3EF3C", "#FF6B6B"],
    ],
  },
  {
    id: "purple-tee",
    url: FLUENT.tee,
    colors: [
      ["#00D26A", "#7B2CBF"],
      ["#44911B", "#5A189A"],
      ["#86D72F", "#9D4EDD"],
      ["#C3EF3C", "#C77DFF"],
    ],
  },
  {
    id: "blue-tee",
    url: FLUENT.tee,
    colors: [
      ["#00D26A", "#2563EB"],
      ["#44911B", "#1D4ED8"],
      ["#86D72F", "#3B82F6"],
      ["#C3EF3C", "#93C5FD"],
    ],
  },
  {
    id: "orange-dress",
    url: FLUENT.dress,
    colors: [
      ["#46A4FB", "#F77F00"],
      ["#6B438B", "#B85400"],
    ],
  },
  {
    id: "green-scarf",
    url: FLUENT.scarf,
    colors: [
      ["#990838", "#1B5E20"],
      ["#CA0B4A", "#2E7D32"],
      ["#F8312F", "#66BB6A"],
    ],
  },
  {
    id: "pink-gloves",
    url: FLUENT.gloves,
    colors: [
      ["#6B438B", "#A8235F"],
      ["#8C42B3", "#D9488A"],
      ["#B859D3", "#FF7EB6"],
    ],
  },
  {
    id: "blue-cap",
    url: FLUENT.cap,
    colors: [],
  },
  {
    id: "yellow-sun-hat",
    url: FLUENT.hat,
    colors: [
      ["#F3AD61", "#F5C518"],
      ["#F3C07B", "#FFE27A"],
      ["#990838", "#234A9A"],
      ["#CA0B4A", "#3A6FD8"],
    ],
  },
  {
    id: "teal-kimono",
    url: FLUENT.kimono,
    colors: [
      ["#0074BA", "#0E7C7B"],
      ["#00A6ED", "#2EC4B6"],
    ],
  },
  {
    id: "coral-swimsuit",
    url: FLUENT.swimsuit,
    colors: [
      ["#F70A8D", "#FF6F59"],
      ["#8D65C5", "#FFD166"],
    ],
  },
  {
    id: "black-boots",
    url: FLUENT.boot,
    colors: [
      ["#CA0B4A", "#2B2B33"],
      ["#F3C07B", "#D9B48F"],
    ],
  },
  {
    id: "red-trainers",
    url: FLUENT.shoe,
    colors: [
      ["#9B9B9B", "#C1121F"],
      ["#BEBEBE", "#E63946"],
      ["#635994", "#1D3557"],
    ],
  },
  {
    id: "psychedelic-tee",
    url: FLUENT.tee,
    defs: PSYCHEDELIC_DEFS,
    colors: [
      ["#86D72F", "url(#psy)"],
      ["#C3EF3C", "url(#psyBand)"],
      ["#44911B", "#2B0A3D"],
      ["#00D26A", "#FF2E93"],
    ],
  },
  {
    id: "tie-dye-tee",
    url: FLUENT.tee,
    defs: TIE_DYE_DEFS,
    colors: [
      ["#86D72F", "url(#tiedye)"],
      ["#C3EF3C", "#70D6FF"],
      ["#44911B", "#5A189A"],
      ["#00D26A", "#FF70A6"],
    ],
  },
  {
    id: "red-jacket",
    url: FLUENT.coat,
    colors: [
      ["#8C5543", "#5C0A14"],
      ["#E19747", "#8B1A2B"],
      ["#F3AD61", "#A4161A"],
      ["#F3C07B", "#C1121F"],
      ["#FFDEA7", "#E5383B"],
    ],
  },
  {
    id: "purple-jacket",
    url: FLUENT.coat,
    colors: [
      ["#8C5543", "#240046"],
      ["#E19747", "#3C096C"],
      ["#F3AD61", "#5A189A"],
      ["#F3C07B", "#7B2CBF"],
      ["#FFDEA7", "#9D4EDD"],
    ],
  },
  {
    id: "blue-jacket",
    url: FLUENT.coat,
    colors: [
      ["#8C5543", "#03045E"],
      ["#E19747", "#023E8A"],
      ["#F3AD61", "#0077B6"],
      ["#F3C07B", "#0096C7"],
      ["#FFDEA7", "#48CAE4"],
    ],
  },
  {
    id: "yellow-jacket",
    url: FLUENT.coat,
    colors: [
      ["#8C5543", "#7A5200"],
      ["#E19747", "#B07D00"],
      ["#F3AD61", "#D9A400"],
      ["#F3C07B", "#F2C200"],
      ["#FFDEA7", "#FFD60A"],
    ],
  },
  {
    id: "green-socks",
    url: FLUENT.socks,
    colors: [
      ["#46A4FB", "#2DC653"],
      ["#3F5FFF", "#1A7431"],
      ["#F9C23C", "#C8F7D2"],
    ],
  },
  {
    id: "orange-socks",
    url: FLUENT.socks,
    colors: [
      ["#46A4FB", "#FF8C42"],
      ["#3F5FFF", "#C2410C"],
      ["#F9C23C", "#FFE1C7"],
    ],
  },
  {
    id: "pink-socks",
    url: FLUENT.socks,
    colors: [
      ["#46A4FB", "#FF8FAB"],
      ["#3F5FFF", "#D6336C"],
      ["#F9C23C", "#FFE3EC"],
    ],
  },
  {
    id: "green-trunks",
    url: FLUENT.shorts,
    colors: [],
  },
  {
    id: "blue-trunks",
    url: FLUENT.shorts,
    colors: [
      ["#6AFCAC", "#4CC9F0"],
      ["#00D26A", "#1D4ED8"],
    ],
  },
  {
    id: "pink-trunks",
    url: FLUENT.shorts,
    colors: [
      ["#6AFCAC", "#FF8FAB"],
      ["#00D26A", "#D6336C"],
    ],
  },
  {
    id: "crown",
    url: FLUENT.crown,
    colors: [],
  },
  {
    id: "penguin",
    url: FLUENT.penguin,
    colors: [],
  },
  {
    id: "top-hat",
    url: FLUENT.topHat,
    colors: [],
  },
  {
    id: "sardine",
    url: FLUENT.fish,
    colors: [
      ["#00A6ED", "#A9B8C6"],
      ["#0074BA", "#5C6F82"],
    ],
  },
  {
    id: "tropical-fish",
    url: FLUENT.tropicalFish,
    colors: [],
  },
];

await mkdir(OUT_DIR, { recursive: true });

for (const variant of VARIANTS) {
  const outPath = join(OUT_DIR, `${variant.id}.svg`);
  if (NEW_ONLY && existsSync(outPath)) continue;
  let svg = await fetchSvg(variant.url);
  svg = replaceAllLiteral(svg, variant.colors);
  if (variant.defs) {
    svg = addDefs(svg, variant.defs);
  }
  if (variant.polka) {
    svg = addPolkaDots(svg);
  }
  await writeFile(outPath, svg, "utf8");
  console.log(`Wrote ${variant.id}.svg`);
}

await writeFile(join(OUT_DIR, "LICENSE-fluentui-emoji.txt"), MIT, "utf8");
console.log("Done.");
