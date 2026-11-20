import type { Metadata } from "next";
import { getDrillSentences } from "@/server/repositories/ucapin-repository";
import { DrillWorkspace } from "@/features/drill/drill-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latihan Ucapan · Ucapin",
  description:
    "Baca kalimat bahasa Inggris dengan suara keras dan lihat bunyi mana yang meleset.",
};

export default async function LatihanUcapanPage({
  searchParams,
}: {
  searchParams: Promise<{
    goal?: string;
    source?: string;
    onboarding?: string;
  }>;
}) {
  const params = await searchParams;
  const { user, sentences, activeGoal } = await getDrillSentences({
    goalTag: params.goal,
    source: params.source,
  });

  return (
    <DrillWorkspace
      user={user}
      sentences={sentences}
      activeGoal={
        params.source === "bank" ? "bank" : params.goal || activeGoal
      }
      isFirstOnboardingStep={
        params.onboarding === "1" || user.totalSpokenMinutes === 0
      }
    />
  );
}
