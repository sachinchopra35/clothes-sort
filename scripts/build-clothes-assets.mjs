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
