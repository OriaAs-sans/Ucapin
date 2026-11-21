import { NextResponse, type NextRequest } from "next/server";

// Hanya mengecek keberadaan cookie sesi. Tanda tangannya diperiksa di server
// (getActiveUser), karena middleware berjalan di runtime edge tanpa node:crypto.
const SESSION_COOKIE_NAME = "ucapin_session";

export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, error: "Sesi berakhir. Silakan masuk lagi." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/masuk", request.url));
}

export const config = {
  matcher: [
    "/((?!masuk|privasi|api/v1/auth|_next/static|_next/image|fonts|icons.svg|favicon.ico).*)",
  ],
};
