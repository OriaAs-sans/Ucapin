import { NextResponse } from "next/server";
import { updateOnboardingProfile } from "@/server/repositories/ucapin-repository";

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
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui profil belajar";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
