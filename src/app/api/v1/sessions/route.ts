import { NextResponse } from "next/server";
import { completeSpeakingSession } from "@/server/repositories/ucapin-repository";
import type { PhonemeStatus } from "@/types/ucapin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const score = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0;
    if (
      !Array.isArray(body.utterances) ||
      body.utterances.length === 0 ||
      body.utterances.length > 60
    ) {
      return NextResponse.json(
        { ok: false, error: "Belum ada ucapan yang dinilai di sesi ini." },
        { status: 400 }
      );
    }
    const session = await completeSpeakingSession({
      mode: body.mode === "drill" ? "drill" : "roleplay",
      chapterKey:
        typeof body.chapterKey === "string" && /^(drill|roleplay):[a-z0-9:-]{1,80}$/i.test(body.chapterKey)
          ? body.chapterKey
          : null,
      scenarioTitle: typeof body.scenarioTitle === "string" ? body.scenarioTitle.slice(0, 120) : "Latihan Ucapan",
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
      wpm:
        typeof body.wpm === "number" && Number.isFinite(body.wpm)
          ? Math.max(0, Math.min(400, Math.round(body.wpm)))
          : 0,
      // Tata bahasa dan kosakata belum dinilai oleh sistem mana pun: simpan 0, jangan dikarang.
      grammarScore: 0,
      vocabularyScore: 0,
      // Teks dipangkas agar satu permintaan tidak bisa membanjiri basis data.
      utterances: (body.utterances as Record<string, unknown>[]).map((u) => ({
        referenceText: String(u.referenceText ?? "").slice(0, 300),
        transcript: String(u.transcript ?? "").slice(0, 300),
        betterVersion: u.betterVersion ? String(u.betterVersion).slice(0, 300) : null,
        status: (["ok", "almost", "work"].includes(String(u.status)) ? u.status : "almost") as PhonemeStatus,
        note: String(u.note ?? "").slice(0, 200),
        clarityScore: score(u.clarityScore),
      })) as {
        referenceText: string;
        transcript: string;
        betterVersion: string | null;
        status: PhonemeStatus;
        note: string;
        clarityScore: number;
      }[],
      // Kesalahan dicatat per kata lewat /api/v1/mistakes saat dinilai, bukan dari ringkasan sesi.
      mistakes: [],
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      chapterCompleted: session.chapterCompleted,
      redirectTo: `/hasil?sessionId=${session.id}${session.chapterCompleted ? "&bab=selesai" : ""}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal menyimpan hasil sesi";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
