import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { seedUcapinDatabase } from "@/server/seed-data";
import { SESSION_COOKIE_NAME } from "@/server/repositories/ucapin-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetUserId =
      typeof body.userId === "string" ? body.userId : "learner-baru";

    await seedUcapinDatabase(prisma);

    const redirectTo = targetUserId === "learner-baru" ? "/mulai" : "/";
    const response = NextResponse.json({
      ok: true,
      message:
        "Seluruh data testing di PostgreSQL Laragon berhasil di-reset ke kondisi awal.",
      redirectTo,
    });

    response.cookies.set(SESSION_COOKIE_NAME, targetUserId, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal me-reset database";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
