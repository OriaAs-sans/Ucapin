import { NextResponse } from "next/server";
import {
  authenticateUser,
  SESSION_COOKIE_NAME,
} from "@/server/repositories/ucapin-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, userId } = body as {
      email?: string;
      password?: string;
      userId?: string;
    };

    const user = await authenticateUser({ email, password, userId });
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Email atau kata sandi tidak cocok. Gunakan akun testing atau daftar akun baru.",
        },
        { status: 401 }
      );
    }

    const redirectTo = user.onboardingCompleted ? "/" : "/mulai";
    const response = NextResponse.json({
      ok: true,
      user,
      redirectTo,
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
      error instanceof Error ? error.message : "Gagal masuk ke akun";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
