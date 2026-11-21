import { createHash } from "node:crypto";

// Klien ElevenLabs khusus server. Kunci API tidak pernah dikirim ke browser.
const API_BASE = "https://api.elevenlabs.io/v1";
const STT_MODEL = "scribe_v1";
const TTS_MODEL = "eleven_flash_v2_5";
// Suara bawaan ElevenLabs (premade, aksen Amerika). Bisa diganti lewat ELEVENLABS_VOICE_ID.
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export class SpeechServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new SpeechServiceError(
      "Layanan suara belum dikonfigurasi (ELEVENLABS_API_KEY kosong).",
      503
    );
  }
  return key;
}

export interface TranscribedWord {
  text: string;
  /** Peluang 0..1 dari logprob model; makin tinggi makin yakin kata itu yang diucapkan. */
  confidence: number;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  transcript: string;
  words: TranscribedWord[];
  audioDurationSec: number;
}

interface ScribeResponse {
  text?: string;
  audio_duration_secs?: number;
  words?: { text: string; type: string; start: number; end: number; logprob?: number }[];
}

export async function transcribeEnglish(audio: Blob): Promise<TranscriptionResult> {
  const form = new FormData();
  form.append("model_id", STT_MODEL);
  form.append("language_code", "en");
  form.append("tag_audio_events", "false");
  form.append("timestamps_granularity", "word");
  form.append("file", audio, "ucapan.webm");

  const res = await fetch(`${API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": getApiKey() },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("ElevenLabs STT gagal", res.status, detail.slice(0, 300));
    throw new SpeechServiceError(
      res.status === 401 || res.status === 403
        ? "Kunci layanan suara tidak punya izin speech-to-text."
        : res.status === 429
        ? "Layanan suara sedang sibuk. Tunggu sebentar lalu coba lagi."
        : "Layanan pengenal suara tidak merespons.",
      res.status === 429 ? 429 : 502
    );
  }

  const data = (await res.json()) as ScribeResponse;
  const words = (data.words ?? [])
    .filter((w) => w.type === "word" && w.text.trim())
    .map((w) => ({
      text: w.text.trim(),
      confidence: typeof w.logprob === "number" ? Math.exp(w.logprob) : 0.5,
      start: w.start,
      end: w.end,
    }));

  return {
    transcript: (data.text ?? "").trim(),
    words,
    audioDurationSec: data.audio_duration_secs ?? 0,
  };
}

// Cache TTS di memori proses: teks contoh yang sama tidak membakar kuota berulang kali.
const TTS_CACHE_LIMIT = 300;
const ttsCache = new Map<string, Buffer>();

export async function synthesizeEnglish(text: string, speed: number): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const cacheKey = createHash("sha256")
    .update(`${voiceId}|${TTS_MODEL}|${speed}|${text}`)
    .digest("hex");

  const cached = ttsCache.get(cacheKey);
  if (cached) {
    ttsCache.delete(cacheKey);
    ttsCache.set(cacheKey, cached);
    return cached;
  }

  const res = await fetch(
    `${API_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": getApiKey(), "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: TTS_MODEL,
        language_code: "en",
        voice_settings: { stability: 0.6, similarity_boost: 0.75, speed },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("ElevenLabs TTS gagal", res.status, detail.slice(0, 300));
    throw new SpeechServiceError("Suara contoh tidak bisa dibuat.", 502);
  }

  const audio = Buffer.from(await res.arrayBuffer());
  ttsCache.set(cacheKey, audio);
  if (ttsCache.size > TTS_CACHE_LIMIT) {
    const oldest = ttsCache.keys().next().value;
    if (oldest) ttsCache.delete(oldest);
  }
  return audio;
}

// Pembatas sederhana per pengguna agar satu akun tidak menghabiskan kuota.
const usage = new Map<string, number[]>();

export function allowRequest(userId: string, kind: string, limitPerMinute: number): boolean {
  const key = `${kind}:${userId}`;
  const now = Date.now();
  const recent = (usage.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= limitPerMinute) {
    usage.set(key, recent);
    return false;
  }
  recent.push(now);
  usage.set(key, recent);
  return true;
}
