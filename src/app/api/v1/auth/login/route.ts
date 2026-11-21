import { NextResponse } from "next/server";
import {
  authenticateUser,
  getUserById,
} from "@/server/repositories/ucapin-repository";
import { setSessionCookie } from "@/server/session";
import { isTestAccountId, testAccountsEnabled } from "@/server/test-accounts";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: unknown;
      password?: unknown;
      testAccountId?: unknown;
    };

    let user = null;

    if (typeof body.testAccountId === "string") {
      // Pintasan 1-klik hanya untuk akun testing, dan hanya di mode pengembangan.
      if (!testAccountsEnabled() || !isTestAccountId(body.testAccountId)) {
        return NextResponse.json(
          { ok: false, error: "Pintasan akun testing tidak aktif." },
          { status: 403 }
        );
      }
      user = await getUserById(body.testAccountId);
    } else {
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || !password) {
        return NextResponse.json(
          { ok: false, error: "Email dan kata sandi wajib diisi." },
          { status: 400 }
        );
      }
      user = await authenticateUser({ email, password });
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      user,
      redirectTo: user.onboardingCompleted ? "/" : "/mulai",
    });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    console.error("Login gagal:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal masuk ke akun. Coba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}
