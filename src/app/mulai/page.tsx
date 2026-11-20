import type { Metadata } from "next";
import { getActiveUser } from "@/server/repositories/ucapin-repository";
import { OnboardingGoalForm } from "@/features/onboarding/onboarding-goal-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atur Tujuan Belajar · Ucapin",
  description:
    "Pilih tujuan belajar, level kenyamanan CEFR, dan target menit bicara harian.",
};

export default async function MulaiOnboardingPage() {
  const user = await getActiveUser();
  return <OnboardingGoalForm user={user} />;
}
