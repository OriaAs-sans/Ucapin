import { NextResponse } from "next/server";
import {
  AuthError,
  registerNewUser,
} from "@/server/repositories/ucapin-repository";
import { setSessionCookie } from "@/server/session";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Nama, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const user = await registerNewUser({ name, email, password });
    const response = NextResponse.json({
      ok: true,
      user,
      redirectTo: "/mulai",
    });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    console.error("Pendaftaran gagal:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal mendaftarkan akun. Coba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}
