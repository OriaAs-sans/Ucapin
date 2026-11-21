import { NextResponse } from "next/server";
import { getSessionUserId } from "@/server/repositories/ucapin-repository";
import {
  allowRequest,
  SpeechServiceError,
  transcribeEnglish,
} from "@/server/elevenlabs";

export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 3 * 1024 * 1024; // kira-kira 60 detik audio webm/opus
const MIN_AUDIO_BYTES = 1500;

// Audio hanya diteruskan ke ElevenLabs untuk ditranskrip; Ucapin tidak menyimpannya.
export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "Sesi berakhir. Silakan masuk lagi." },
      { status: 401 }
    );
  }
  if (!allowRequest(userId, "stt", 20)) {
    return NextResponse.json(
      { ok: false, error: "Terlalu banyak rekaman dalam semenit. Istirahat sebentar lalu coba lagi." },
      { status: 429 }
    );
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

  try {
    const result = await transcribeEnglish(audio);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const status = error instanceof SpeechServiceError ? error.status : 500;
    const message =
      error instanceof SpeechServiceError
        ? error.message
        : "Rekaman gagal dinilai. Coba sekali lagi.";
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
