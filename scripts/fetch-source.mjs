import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bases = [
  "https://cdn.jsdelivr.net/gh/nmigueles/gym-routine-tracker@main",
  "https://raw.githubusercontent.com/nmigueles/gym-routine-tracker/main",
];

const files = [
  "components/gym-routine.tsx",
  "app/globals.css",
  "lib/routine-data.ts",
];

async function fetchText(rel) {
  let lastErr;
  for (const base of bases) {
    const url = `${base}/${rel}`;
    try {
      const res = await fetch(url);
      if (res.ok) return await res.text();
      lastErr = new Error(`${url} -> ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function main() {
  for (const rel of files) {
    const text = await fetchText(rel);
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
