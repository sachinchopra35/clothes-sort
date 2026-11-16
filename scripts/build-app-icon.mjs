/**
 * Renders design/app-icon.svg → iOS AppIcon (1024×1024).
 * Run: npm run build:icon
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "design/app-icon.svg");
const outPath = join(
  root,
  "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png",
);

const svg = readFileSync(svgPath);
await sharp(svg, { density: 300 })
  .resize(1024, 1024)
  .png()
  .toFile(outPath);

console.log(`Wrote ${outPath}`);