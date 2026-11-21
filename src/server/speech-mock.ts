import { knownL1Substitute } from "@/lib/speech-assessor";
import type { TranscriptionResult } from "@/server/elevenlabs";

// Pengenal suara tiruan untuk pengembangan dan tes E2E: tidak memanggil ElevenLabs,
// jadi kuota tidak terpakai. Transkrip dibuat dari kalimat acuan, bukan dari audio.
//   SPEECH_MOCK="jelas"       semua kata terdengar jelas
//   SPEECH_MOCK="salah-ucap"  satu kata diucapkan dengan pola salah ucap khas Indonesia
// Tidak pernah aktif di production, apa pun isi variabelnya.

export type SpeechMockMode = "jelas" | "salah-ucap";

const SECONDS_PER_WORD = 0.42;
const WORD_GAP = 0.08;

export function getSpeechMockMode(
  env: Record<string, string | undefined> = process.env
): SpeechMockMode | null {
  if (env.NODE_ENV === "production") return null;
  const value = env.SPEECH_MOCK?.trim();
  return value === "jelas" || value === "salah-ucap" ? value : null;
}

function cleanToken(t: string): string {
  return t.replace(/[^A-Za-z']/g, "").toLowerCase();
}

// Salah ucap yang meniru pola L1: kamus dulu, lalu aturan bunyi yang sama dengan penilai.
function mispronounce(word: string): string | null {
  const known = knownL1Substitute(word);
  if (known) return known;
  if (word.includes("th")) return word.replace(/th/g, "t");
  if (word.includes("v")) return word.replace(/v/g, "f");
  if (word.includes("sh")) return word.replace(/sh/g, "s");
  if (word.length >= 5 && word.endsWith("ed")) return word.slice(0, -2);
  return null;
}

export function mockTranscription(referenceText: string, mode: SpeechMockMode): TranscriptionResult {
  const tokens = referenceText.split(/\s+/).map(cleanToken).filter(Boolean);

  let changedIndex = -1;
  let changedText = "";
  if (mode === "salah-ucap") {
    // Utamakan kata isi yang panjang (bukan "with", "the") agar hasilnya masuk Bank Kesalahan
    // seperti kasus nyata; kata pendek hanya dipakai bila tidak ada pilihan lain.
    const indexes = tokens.map((_, i) => i);
    const order = [
      ...indexes.filter((i) => tokens[i].length >= 5),
      ...indexes.filter((i) => tokens[i].length < 5),
    ];
    for (const i of order) {
      const variant = mispronounce(tokens[i]);
      if (variant && variant !== tokens[i]) {
        changedIndex = i;
        changedText = variant;
        break;
      }
    }
  }

  const words = tokens.map((token, i) => {
    const start = Number((i * SECONDS_PER_WORD).toFixed(2));
    return {
      text: i === changedIndex ? changedText : token,
      confidence: i === changedIndex ? 0.88 : 0.96,
      start,
      end: Number((start + SECONDS_PER_WORD - WORD_GAP).toFixed(2)),
    };
  });

  return {
    transcript: words.map((w) => w.text).join(" "),
    words,
    audioDurationSec: words.length ? words[words.length - 1].end + 0.3 : 0,
  };
}
