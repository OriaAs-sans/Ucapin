import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { seedTestAccounts } from "@/server/seed-data";
import { setSessionCookie } from "@/server/session";
import {
  isTestAccountId,
  TEST_ACCOUNT_IDS,
  testAccountsEnabled,
} from "@/server/test-accounts";

// Mengisi ulang dua akun testing beserta riwayat contohnya. Hanya aktif di mode pengembangan.
export async function POST(request: Request) {
  if (!testAccountsEnabled()) {
    return NextResponse.json({ ok: false, error: "Tidak ditemukan." }, { status: 404 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
    const targetUserId =
      typeof body.userId === "string" && isTestAccountId(body.userId)
        ? body.userId
        : TEST_ACCOUNT_IDS.fresh;

    await seedTestAccounts(prisma);

    const response = NextResponse.json({
      ok: true,
      message: "Data testing di PostgreSQL Laragon sudah kembali ke kondisi awal.",
      redirectTo: targetUserId === TEST_ACCOUNT_IDS.fresh ? "/mulai" : "/",
    });
    setSessionCookie(response, targetUserId);
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal me-reset database";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
