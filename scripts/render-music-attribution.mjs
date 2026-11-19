#!/usr/bin/env node
/**
 * Regenerate music/ATTRIBUTION.md from music/manifest.json.
 * Fill musopenUrl, recordingLicense, and attribution in the manifest first.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "music/manifest.json");
const outPath = join(root, "music/ATTRIBUTION.md");
const snippetPath = join(root, "music/support-credits.snippet.md");

const strict = process.argv.includes("--strict");

/** @typedef {{ id: string, title: string, source: string, musopenUrl?: string, recordingLicense?: string, attribution?: string }} Track */

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
/** @type {Track[]} */
const tracks = manifest.tracks ?? [];

const licenseLabels = {
  pending: "_Fill in from Musopen recording page_",
  original: "Original performance (app developer)",
  "public-domain": "Public domain (recording)",
  cc0: "CC0 1.0",
  "cc-by-4.0": "CC BY 4.0 (attribution required)",
};

const problems = [];

function licenseCell(license) {
  const key = license || "pending";
  return licenseLabels[key] ?? key;
}

function urlCell(url, id, license) {
  if (license === "original") return "—";
  if (!url?.trim()) {
    problems.push(`${id}: missing musopenUrl`);
    return "_TBD_";
  }
  return `[link](${url.trim()})`;
}

const tableRows = tracks
  .map((t) => {
    const license = t.recordingLicense || "pending";
    const needsUrl =
      license !== "original" && license !== "pending" && !t.musopenUrl?.trim();
    if (strict && (license === "pending" || needsUrl)) {
      problems.push(`${t.id}: incomplete attribution (strict mode)`);
    }
    if (strict && license === "original" && !t.attribution?.trim()) {
      problems.push(`${t.id}: original recording needs attribution line`);
    }
    const credit = t.attribution?.trim() || "—";
    return `| ${t.title} | ${urlCell(t.musopenUrl, t.id, license)} | ${licenseCell(license)} | ${credit} |`;
  })
  .join("\n");

const table = `| In-app title | Musopen | Recording licence | Credit line |
|--------------|---------|-------------------|-------------|
${tableRows}`;

const body = `# Music attribution

Source of truth: \`music/manifest.json\` (\`musopenUrl\`, \`recordingLicense\`, \`attribution\`).
Regenerate this file after edits:

\`\`\`bash
npm run music:attribution
\`\`\`

Before App Store submission, run:

\`\`\`bash
npm run music:attribution:check
\`\`\`

## Summary

Background music in **Clothes Sort** uses recordings from [Musopen](https://musopen.org).
Only tracks whose **recording** is public domain, CC0, or CC BY (with credit) are shipped.
Compositions may be public domain; the **recording licence** on each Musopen page is what matters.

## Tracks

${table}

### \`recordingLicense\` values (in manifest)

| Value | Meaning |
|-------|---------|
| \`public-domain\` | Recording marked public domain on Musopen |
| \`cc0\` | CC0 1.0 |
| \`cc-by-4.0\` | CC BY 4.0 — set \`attribution\` to the credit Musopen shows |
| \`pending\` | Not documented yet (do not ship new tracks in this state) |

## Support page snippet

Paste the block below into the public support / credits section (also written to \`music/support-credits.snippet.md\`):

`;

const originals = tracks.filter((t) => t.recordingLicense === "original");
const ccByTracks = tracks.filter((t) => t.recordingLicense === "cc-by-4.0");
const musopenTracks = tracks.filter(
  (t) => t.recordingLicense && !["original", "pending"].includes(t.recordingLicense),
);

let snippet = "### Music\n\n";
if (originals.length > 0) {
  snippet +=
    "Background piano music: original performances recorded for this app.\n\n";
  for (const t of originals) {
    const credit = t.attribution?.trim() || "Performed and recorded by Sachin Chopra";
    snippet += `- **${t.title}** — ${credit}\n`;
  }
}
if (musopenTracks.length > 0 || ccByTracks.length > 0) {
  snippet += "\nAdditional recordings from [Musopen](https://musopen.org) where noted.\n";
  for (const t of [...musopenTracks, ...ccByTracks]) {
    const url = t.musopenUrl?.trim();
    if (!url) continue;
    const line = `- **${t.title}** — ${url}`;
    snippet += t.attribution?.trim() ? `${line} (${t.attribution.trim()})\n` : `${line}\n`;
  }
}

const fullDoc = `${body}\n\`\`\`markdown\n${snippet.trimEnd()}\n\`\`\`\n`;
writeFileSync(outPath, fullDoc, "utf8");
writeFileSync(snippetPath, `${snippet.trimEnd()}\n`, "utf8");

console.log(`Wrote ${outPath}`);
console.log(`Wrote ${snippetPath}`);

if (strict && problems.length > 0) {
  console.error("\nAttribution incomplete:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

if (problems.length > 0 && !strict) {
  console.warn("\nSome tracks still need URLs or licences (OK until release):");
  for (const p of problems) console.warn(`  - ${p}`);
}