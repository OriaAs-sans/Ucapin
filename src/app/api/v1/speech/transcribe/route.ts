import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { checkSpeechQuota } from "@/server/activity";
import { getSessionUserId } from "@/server/repositories/ucapin-repository";
import { SpeechServiceError, transcribeEnglish } from "@/server/elevenlabs";
import { getSpeechMockMode, mockTranscription } from "@/server/speech-mock";

export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // kira-kira 60 detik audio webm/opus
const MIN_AUDIO_BYTES = 1500;

// Audio hanya diteruskan ke ElevenLabs untuk ditranskrip; Ucapin tidak menyimpannya.
// Yang dicatat hanya durasinya (SpeechAttempt) untuk menit bicara dan kuota.
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Sesi berakhir. Silakan masuk lagi." },
      { status: 401 }
    );
  }

  const quotaError = await checkSpeechQuota(userId);
  if (quotaError) {
    return NextResponse.json({ ok: false, error: quotaError }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "Rekaman tidak terkirim." }, { status: 400 });
  }
  if (audio.size < MIN_AUDIO_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Rekaman terlalu pendek. Tahan sedikit lebih lama saat bicara." },
      { status: 400 }
    );
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Rekaman terlalu panjang. Ucapkan satu kalimat saja per rekaman." },
      { status: 413 }
    );
  }

  const mockMode = getSpeechMockMode();
  const reference = String(form?.get("reference") ?? "").trim().slice(0, 300);
  if (mockMode && !reference) {
    return NextResponse.json(
      { ok: false, error: "Mode uji pengenal suara butuh kalimat acuan dari halaman latihan." },
      { status: 400 }
    );
  }

  try {
    const result = mockMode
      ? mockTranscription(reference, mockMode)
      : await transcribeEnglish(audio);
    // Rekaman tanpa kata tetap dihitung untuk kuota, tetapi tidak menambah menit bicara.
    const lastWordEnd = result.words.at(-1)?.end ?? 0;
    const audioSec =
      result.words.length === 0 ? 0 : Math.min(60, result.audioDurationSec || lastWordEnd);
    await prisma.speechAttempt.create({ data: { userId, audioSec } });
    return NextResponse.json({ ok: true, ...result, ...(mockMode ? { mock: mockMode } : {}) });
  } catch (error) {
    const status = error instanceof SpeechServiceError ? error.status : 500;
    const message =
      error instanceof SpeechServiceError
        ? error.message
        : "Rekaman gagal dinilai. Coba sekali lagi.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
