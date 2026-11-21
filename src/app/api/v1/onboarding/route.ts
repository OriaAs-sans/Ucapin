import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getActiveUser,
  updateOnboardingProfile,
} from "@/server/repositories/ucapin-repository";
import { setSessionCookie } from "@/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getActiveUser();
    return NextResponse.json(
      { ok: true, user },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat profil";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateOnboardingProfile({
      goals: Array.isArray(body.goals) ? body.goals : undefined,
      cefrLevel:
        typeof body.cefrLevel === "string" ? body.cefrLevel : undefined,
      dailyTargetMinutes:
        typeof body.dailyTargetMinutes === "number"
          ? body.dailyTargetMinutes
          : undefined,
      correctionPref:
        typeof body.correctionPref === "string"
          ? body.correctionPref
          : undefined,
      saveAudioOptIn:
        typeof body.saveAudioOptIn === "boolean"
          ? body.saveAudioOptIn
          : undefined,
      onboardingCompleted:
        typeof body.onboardingCompleted === "boolean"
          ? body.onboardingCompleted
          : undefined,
      micChecked:
        typeof body.micChecked === "boolean" ? body.micChecked : undefined,
      activeScenarioSlug:
        typeof body.activeScenarioSlug === "string"
          ? body.activeScenarioSlug
          : undefined,
      leagueOptIn:
        typeof body.leagueOptIn === "boolean" ? body.leagueOptIn : undefined,
      // Nama panggilan liga: dipangkas, tanpa karakter kontrol, maksimal 20 karakter.
      leagueNickname:
        typeof body.leagueNickname === "string"
          ? body.leagueNickname.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 20) || null
          : undefined,
    });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/mulai");
    revalidatePath("/cek-mikrofon");
    revalidatePath("/latihan-ucapan");
    revalidatePath("/roleplay");

    const response = NextResponse.json({ ok: true, user: updated });
    setSessionCookie(response, updated.id);

    return response;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui profil belajar";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
