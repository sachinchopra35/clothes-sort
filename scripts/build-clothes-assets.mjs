/**
 * Fetches Microsoft Fluent UI Emoji flat SVGs and writes recoloured game assets.
 * Run once when art changes: npm run build:clothes
 */
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
};

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
];

await mkdir(OUT_DIR, { recursive: true });

for (const variant of VARIANTS) {
  let svg = await fetchSvg(variant.url);
  svg = replaceAllLiteral(svg, variant.colors);
  if (variant.polka) {
    svg = addPolkaDots(svg);
  }
  await writeFile(join(OUT_DIR, `${variant.id}.svg`), svg, "utf8");
  console.log(`Wrote ${variant.id}.svg`);
}

await writeFile(join(OUT_DIR, "LICENSE-fluentui-emoji.txt"), MIT, "utf8");
console.log("Done.");
