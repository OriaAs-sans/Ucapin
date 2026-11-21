import { NextResponse } from "next/server";
import { completeSpeakingSession } from "@/server/repositories/ucapin-repository";
import type { PhonemeStatus } from "@/types/ucapin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const score = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
    if (!Array.isArray(body.utterances) || body.utterances.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Belum ada ucapan yang dinilai di sesi ini." },
        { status: 400 }
      );
    }
    const session = await completeSpeakingSession({
      mode: body.mode === "drill" ? "drill" : "roleplay",
      scenarioTitle: body.scenarioTitle ?? "Latihan Ucapan",
      durationSec:
        typeof body.durationSec === "number" ? Math.max(0, Math.round(body.durationSec)) : 0,
      // Batas atas mencegah satu sesi menggelembungkan liga menit bicara.
      addedMinutes:
        typeof body.addedMinutes === "number"
          ? Math.max(0, Math.min(30, Math.round(body.addedMinutes)))
          : 0,
      clarityScore: score(body.clarityScore),
      pronunciationScore: score(body.pronunciationScore),
      fluencyScore: score(body.fluencyScore),
      // Tata bahasa dan kosakata belum dinilai oleh sistem mana pun: simpan 0, jangan dikarang.
      grammarScore: 0,
      vocabularyScore: 0,
      utterances: body.utterances as {
        referenceText: string;
        transcript: string;
        betterVersion: string | null;
        status: PhonemeStatus;
        note: string;
        clarityScore: number;
      }[],
      mistakes: Array.isArray(body.mistakes) ? body.mistakes : [],
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      redirectTo: `/hasil?sessionId=${session.id}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan hasil sesi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
