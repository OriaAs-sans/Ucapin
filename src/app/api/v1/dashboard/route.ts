import { NextResponse } from "next/server";
import { getDashboardData } from "@/server/repositories/ucapin-repository";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data Beranda";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
