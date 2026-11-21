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

const VALID_STATUS: PhonemeStatus[] = ["ok", "almost", "work"];
const text = (v: unknown, max: number, fallback: string) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const word = typeof body.word === "string" ? body.word.trim() : "";
    // Kata bahasa Inggris saja: huruf, apostrof, tanda hubung, maksimal 40 karakter.
    if (!/^[A-Za-z'-]{1,40}$/.test(word)) {
      return NextResponse.json({ ok: false, error: "Kata tidak valid." }, { status: 400 });
    }
    const status = VALID_STATUS.includes(body.status as PhonemeStatus)
      ? (body.status as PhonemeStatus)
      : "work";

    const item = await recordMistakeInBank({
      word,
      ipa: text(body.ipa, 60, ""),
      phoneme: text(body.phoneme, 20, ""),
      errorPattern: text(body.errorPattern, 80, "perlu latihan ulang"),
      heardAs: text(body.heardAs, 120, "perlu latihan ulang"),
      sourceMode: text(body.sourceMode, 80, "Latihan Ucapan"),
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
