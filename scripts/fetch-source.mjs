/**
 * Fetches large source files from the GitHub repo during Vercel install
 * so deploy_to_vercel payloads can stay small.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base =
  "https://raw.githubusercontent.com/nmigueles/gym-routine-tracker/main";

const files = [
  "components/gym-routine.tsx",
  "app/globals.css",
  "lib/routine-data.ts",
];

async function main() {
  for (const rel of files) {
    const url = `${base}/${rel}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }
    const text = await res.text();
    const dest = join(root, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, text);
    console.log("fetched", rel, text.length);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
