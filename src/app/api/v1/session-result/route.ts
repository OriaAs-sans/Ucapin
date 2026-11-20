import { NextResponse } from "next/server";
import { updateSessionConfidence } from "@/server/repositories/ucapin-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, confidenceRating } = body as {
      sessionId?: string;
      confidenceRating?: number;
    };

    if (
      !sessionId ||
      typeof confidenceRating !== "number" ||
      confidenceRating < 1 ||
      confidenceRating > 5
    ) {
      return NextResponse.json(
        { ok: false, error: "Nilai kepercayaan diri harus antara 1 sampai 5" },
        { status: 400 }
      );
    }

    const updated = await updateSessionConfidence(sessionId, confidenceRating);
    return NextResponse.json({ ok: true, session: updated });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan tingkat kepercayaan diri";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
