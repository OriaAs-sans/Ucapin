import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";

// Nama cookie sengaja berbeda dari versi lama (ucapin_user_id, berisi id polos),
// sehingga cookie lama otomatis tidak berlaku.
export const SESSION_COOKIE_NAME = "ucapin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET belum diisi di .env.local (minimal 32 karakter). Lihat .env.example."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

// Token: <userId>.<kedaluwarsa ms>.<tanda tangan HMAC>
export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const signatureStart = token.lastIndexOf(".");
  if (signatureStart <= 0) return null;

  const payload = token.slice(0, signatureStart);
  const given = Buffer.from(token.slice(signatureStart + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }

  const expiryStart = payload.lastIndexOf(".");
  if (expiryStart <= 0) return null;
  const expiresAt = Number(payload.slice(expiryStart + 1));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  return payload.slice(0, expiryStart);
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}
