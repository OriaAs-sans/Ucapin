import { NextResponse } from "next/server";
import {
  getSessionUserId,
  isKnownLearningText,
} from "@/server/repositories/ucapin-repository";
import { SpeechServiceError, synthesizeEnglish } from "@/server/elevenlabs";

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 300;

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Sesi berakhir." }, { status: 401 });
  }

  const url = new URL(request.url);
  const text = (url.searchParams.get("text") ?? "").trim();
  const slow = url.searchParams.get("slow") === "1";

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ ok: false, error: "Teks tidak valid." }, { status: 400 });
  }
  if (!(await isKnownLearningText(text))) {
    return NextResponse.json(
      { ok: false, error: "Teks ini bukan bagian dari materi latihan." },
      { status: 403 }
    );
  }

  try {
    const audio = await synthesizeEnglish(text, slow ? 0.75 : 1);
    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    const status = error instanceof SpeechServiceError ? error.status : 500;
    return NextResponse.json({ ok: false, error: "Suara contoh gagal dibuat." }, { status });
  }
}
