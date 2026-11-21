import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { FAKE_MIC_META, FAKE_MIC_WAV, FIXTURE_DIR } from "./env";

const SAMPLE_RATE = 16000;
const MS_PER_WORD = 420;
const FIXTURE_SOURCE = "nada-lokal-v1";

// Audio mikrofon palsu untuk kalimat pertama bab Kerja A1 (bab pertama jalur Kerja).
// Server E2E memakai pengenal suara tiruan (SPEECH_MOCK), jadi isi audio tidak ditranskrip:
// cukup berbunyi dan cukup panjang agar lolos meter level dan batas ukuran. Dibuat lokal,
// tanpa TTS, sehingga tanpa kuota.
export default async function globalSetup() {
  const prisma = new PrismaClient();
  const first = await prisma.drillSentence.findFirst({
    where: { goalTag: "kerja", cefrLevel: "A1" },
    orderBy: { orderIndex: "asc" },
    select: { text: true },
  });
  await prisma.$disconnect();
  if (!first) return;

  if (fs.existsSync(FAKE_MIC_META) && fs.existsSync(FAKE_MIC_WAV)) {
    const meta = JSON.parse(fs.readFileSync(FAKE_MIC_META, "utf8")) as {
      reference?: string;
      source?: string;
    };
    if (meta.reference === first.text && meta.source === FIXTURE_SOURCE) return;
  }
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });

  const wordCount = first.text.split(/\s+/).filter(Boolean).length;
  const speechMs = wordCount * MS_PER_WORD;
  const pcm = syllableTone(speechMs);
  const data = Buffer.concat([pcm, Buffer.alloc(SAMPLE_RATE * 2)]); // 1 detik hening di akhir
  fs.writeFileSync(FAKE_MIC_WAV, Buffer.concat([wavHeader(data.length), data]));
  fs.writeFileSync(
    FAKE_MIC_META,
    JSON.stringify({ reference: first.text, speechMs, source: FIXTURE_SOURCE })
  );
}

// Nada 220 Hz yang naik turun per "suku kata" supaya meter level bergerak seperti orang bicara.
function syllableTone(durationMs: number): Buffer {
  const samples = Math.round((durationMs / 1000) * SAMPLE_RATE);
  const buf = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = 0.25 + 0.75 * Math.abs(Math.sin(Math.PI * t * (1000 / MS_PER_WORD)));
    const value = Math.sin(2 * Math.PI * 220 * t) * envelope * 0.5;
    buf.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  return buf;
}

function wavHeader(dataLength: number): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}
