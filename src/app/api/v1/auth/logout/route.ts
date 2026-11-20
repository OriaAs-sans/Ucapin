import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/repositories/ucapin-repository";

export async function POST() {
  const response = NextResponse.json({ ok: true, redirectTo: "/masuk" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
