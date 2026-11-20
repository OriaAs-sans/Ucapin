import { NextResponse } from "next/server";
import {
  getDashboardData,
  recordMistakeInBank,
} from "@/server/repositories/ucapin-repository";
import type { PhonemeStatus } from "@/types/ucapin";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ ok: true, mistakes: data.mistakes });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memuat data Bank Kesalahan";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      word,
      ipa = "/.../",
      phoneme = "/v/",
      errorPattern = "v → f",
      heardAs = "perlu latihan ulang",
      sourceMode = "Latihan Ucapan",
      status = "work",
    } = body as {
      word?: string;
      ipa?: string;
      phoneme?: string;
      errorPattern?: string;
      heardAs?: string;
      sourceMode?: string;
      status?: PhonemeStatus;
    };

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { ok: false, error: "Kata wajib diisi" },
        { status: 400 }
      );
    }

    const item = await recordMistakeInBank({
      word,
      ipa,
      phoneme,
      errorPattern,
      heardAs,
      sourceMode,
      status,
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan ke Bank Kesalahan";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
