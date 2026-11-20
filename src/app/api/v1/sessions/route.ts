import { NextResponse } from "next/server";
import { completeSpeakingSession } from "@/server/repositories/ucapin-repository";
import type { PhonemeStatus } from "@/types/ucapin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await completeSpeakingSession({
      mode: body.mode === "drill" ? "drill" : "roleplay",
      scenarioTitle: body.scenarioTitle ?? "Latihan Ucapan",
      durationSec: typeof body.durationSec === "number" ? body.durationSec : 180,
      addedMinutes:
        typeof body.addedMinutes === "number" ? body.addedMinutes : 3,
      clarityScore:
        typeof body.clarityScore === "number" ? body.clarityScore : 83,
      pronunciationScore:
        typeof body.pronunciationScore === "number"
          ? body.pronunciationScore
          : 79,
      fluencyScore:
        typeof body.fluencyScore === "number" ? body.fluencyScore : 86,
      grammarScore:
        typeof body.grammarScore === "number" ? body.grammarScore : 84,
      vocabularyScore:
        typeof body.vocabularyScore === "number" ? body.vocabularyScore : 88,
      utterances: Array.isArray(body.utterances)
        ? body.utterances
        : [
            {
              referenceText: "I have a very good feeling about this weather.",
              transcript: "I have a fery good feeling about dis weather.",
              betterVersion: "I have a very good feeling about this weather.",
              status: "almost" as PhonemeStatus,
              note: "Fokus getaran /v/ pada very dan /ð/ pada this",
              clarityScore: 83,
            },
          ],
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
