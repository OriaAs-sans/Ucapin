import fs from "node:fs";
import path from "node:path";

// Membaca .env.local tanpa menulis nilainya ke mana pun. Kredensial testing tidak pernah ada di kode.
export function readLocalEnv(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
      })
  );
}

export const FIXTURE_DIR = path.join(process.cwd(), "e2e", ".fixtures");
export const FAKE_MIC_WAV = path.join(FIXTURE_DIR, "fake-mic.wav");
export const FAKE_MIC_META = path.join(FIXTURE_DIR, "fake-mic.json");
