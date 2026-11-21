import { NextResponse } from "next/server";
import { recordBankPractice } from "@/server/repositories/ucapin-repository";
import type { PhonemeStatus } from "@/types/ucapin";

const VALID_STATUS: PhonemeStatus[] = ["ok", "almost", "work"];

// POST hasil latihan kata: kata di Bank Kesalahan yang terdengar jelas naik tahap jadwalnya.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { results?: unknown };
  const results = Array.isArray(body.results)
    ? body.results
        .filter(
          (r): r is { word: string; status: PhonemeStatus } =>
            typeof r === "object" &&
            r !== null &&
            typeof (r as { word?: unknown }).word === "string" &&
            VALID_STATUS.includes((r as { status?: PhonemeStatus }).status as PhonemeStatus)
        )
        .slice(0, 40)
    : [];

  try {
    const { advanced } = await recordBankPractice(results);
    return NextResponse.json({ ok: true, advanced });
  } catch (error) {
    console.error("Gagal mencatat latihan bank", error);
    return NextResponse.json({ ok: false, error: "Gagal mencatat latihan." }, { status: 500 });
  }
}
