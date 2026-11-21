import fs from "node:fs";
import { FAKE_MIC_META, FAKE_MIC_WAV, FIXTURE_DIR, readLocalEnv } from "./env";

// Kalimat drill pertama untuk tujuan kerja level B1, diucapkan dengan satu salah ucap khas:
// "worked" menjadi "work" (konsonan akhir /t/ hilang).
const SPOKEN_WITH_MISTAKE = "I work on five product launches and solved the main issue.";

// Membuat audio mikrofon palsu dari ElevenLabs (PCM 16 kHz + header WAV) sekali per mesin.
export default async function globalSetup() {
  const env = readLocalEnv();
  if (!env.ELEVENLABS_API_KEY || fs.existsSync(FAKE_MIC_WAV)) return;
  fs.mkdirSync(FIXTURE_DIR, { recursive: true });

  const res = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=pcm_16000",
    {
      method: "POST",
      headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ text: SPOKEN_WITH_MISTAKE, model_id: "eleven_flash_v2_5" }),
    }
  );
  if (!res.ok) throw new Error(`Gagal membuat audio uji: ${res.status}`);

  const pcm = Buffer.from(await res.arrayBuffer());
  const data = Buffer.concat([pcm, Buffer.alloc(32000)]);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(16000, 24);
  header.writeUInt32LE(32000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(FAKE_MIC_WAV, Buffer.concat([header, data]));
  fs.writeFileSync(
    FAKE_MIC_META,
    JSON.stringify({ speechMs: Math.round((pcm.length / 32000) * 1000) })
  );
}
