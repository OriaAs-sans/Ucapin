import { NextResponse } from "next/server";
import {
  registerNewUser,
  SESSION_COOKIE_NAME,
} from "@/server/repositories/ucapin-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email) {
      return NextResponse.json(
        { ok: false, error: "Nama lengkap dan email wajib diisi." },
        { status: 400 }
      );
    }

    const user = await registerNewUser({ name, email, password });
    const response = NextResponse.json({
      ok: true,
      user,
      redirectTo: "/mulai",
    });

    response.cookies.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mendaftarkan akun baru";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
