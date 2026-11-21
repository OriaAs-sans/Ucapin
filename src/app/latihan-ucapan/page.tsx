import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getDrillChapter,
  getDrillChapterMap,
  getDrillSentences,
} from "@/server/repositories/ucapin-repository";
import { DrillChapterMap } from "@/features/drill/drill-chapter-map";
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
    bab?: string;
    source?: string;
    onboarding?: string;
    terkunci?: string;
  }>;
}) {
  const params = await searchParams;

  // Latihan dari Bank Kesalahan tidak berbentuk bab: isinya kata yang jatuh tempo.
  if (params.source === "bank") {
    const { user, sentences } = await getDrillSentences({ source: "bank" });
    return <DrillWorkspace user={user} sentences={sentences} activeGoal="bank" />;
  }

  if (params.bab) {
    const splitAt = params.bab.lastIndexOf("-");
    const goalTag = params.bab.slice(0, splitAt);
    const level = params.bab.slice(splitAt + 1);
    const data = splitAt > 0 ? await getDrillChapter(goalTag, level) : null;
    if (!data) notFound();
    if (data.chapter.status === "locked") redirect("/latihan-ucapan?terkunci=1");

    return (
      <DrillWorkspace
        user={data.user}
        sentences={data.sentences}
        activeGoal={goalTag}
        chapter={{
          key: data.chapter.key,
          order: data.chapter.order,
          title: data.chapter.title,
          pathLabel: data.pathLabel,
        }}
        isFirstOnboardingStep={params.onboarding === "1"}
      />
    );
  }

  const { user, paths } = await getDrillChapterMap();

  // Langkah 3 onboarding: langsung buka bab pertama yang terbuka di tujuan utama pelajar.
  if (params.onboarding === "1") {
    const firstPath = paths.find((p) => p.goalTag === user.goals[0]) ?? paths[0];
    const firstOpen = firstPath?.chapters.find((c) => c.status === "open");
    if (firstOpen) redirect(`${firstOpen.href}&onboarding=1`);
  }

  return <DrillChapterMap paths={paths} lockedNotice={params.terkunci === "1"} />;
}
