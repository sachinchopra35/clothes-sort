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
  "public-domain": "Public domain (recording)",
  cc0: "CC0 1.0",
  "cc-by-4.0": "CC BY 4.0 (attribution required)",
};

const problems = [];

function licenseCell(license) {
  const key = license || "pending";
  return licenseLabels[key] ?? key;
}

function urlCell(url, id) {
  if (!url?.trim()) {
    problems.push(`${id}: missing musopenUrl`);
    return "_TBD_";
  }
  return `[link](${url.trim()})`;
}

const tableRows = tracks
  .map((t) => {
    const license = t.recordingLicense || "pending";
    if (strict && (license === "pending" || !t.musopenUrl?.trim())) {
      problems.push(`${t.id}: incomplete attribution (strict mode)`);
    }
    const credit = t.attribution?.trim() || "—";
    return `| ${t.title} | ${urlCell(t.musopenUrl, t.id)} | ${licenseCell(license)} | ${credit} |`;
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

const ccByTracks = tracks.filter((t) => t.recordingLicense === "cc-by-4.0");

let snippet = `### Music

Instrumental background music is provided by recordings from [Musopen](https://musopen.org). `;
snippet +=
  ccByTracks.length > 0
    ? "Some recordings are used under Creative Commons licences; credits are listed below.\n\n"
    : "Recordings used in this app are public domain or CC0 on Musopen.\n\n";

let anyUrl = false;
for (const t of tracks) {
  const url = t.musopenUrl?.trim();
  if (!url) continue;
  anyUrl = true;
  const line = `- **${t.title}** — ${url}`;
  snippet += t.attribution?.trim() ? `${line} (${t.attribution.trim()})\n` : `${line}\n`;
}

if (!anyUrl) {
  snippet +=
    "\n_(Links will appear here after you fill `musopenUrl` in the manifest and re-run `npm run music:attribution`.)_\n";
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