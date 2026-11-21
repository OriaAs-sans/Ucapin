import { NextResponse } from "next/server";
import {
  deleteActiveUser,
  exportActiveUserData,
} from "@/server/repositories/ucapin-repository";
import { SESSION_COOKIE_NAME } from "@/server/session";

export const dynamic = "force-dynamic";

// GET: unduh semua data milik pengguna (JSON).
export async function GET() {
  try {
    const data = await exportActiveUserData();
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="data-ucapin.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Ekspor data gagal", error);
    return NextResponse.json({ ok: false, error: "Data gagal diunduh." }, { status: 500 });
  }
}

// DELETE: hapus akun dan semua data. Wajib menyertakan konfirmasi teks "HAPUS".
export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { confirm?: unknown };
  if (body.confirm !== "HAPUS") {
    return NextResponse.json(
      { ok: false, error: 'Ketik HAPUS untuk mengonfirmasi.' },
      { status: 400 }
    );
  }
  try {
    await deleteActiveUser();
    const response = NextResponse.json({ ok: true, redirectTo: "/masuk" });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error("Hapus akun gagal", error);
    return NextResponse.json({ ok: false, error: "Akun gagal dihapus. Coba lagi." }, { status: 500 });
  }
}
