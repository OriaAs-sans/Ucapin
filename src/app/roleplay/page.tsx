import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getRoleplayChapterMap,
  getRoleplayChapterStatus,
  getRoleplayScenario,
} from "@/server/repositories/ucapin-repository";
import { RoleplayChapterMap } from "@/features/roleplay/roleplay-chapter-map";
import { RoleplayWorkspace } from "@/features/roleplay/roleplay-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roleplay · Ucapin",
  description:
    "Latihan percakapan berskenario sesuai tujuan belajar dalam bahasa Inggris.",
};

export default async function RoleplayPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; terkunci?: string }>;
}) {
  const params = await searchParams;

  if (!params.slug) {
    const { paths } = await getRoleplayChapterMap();
    return <RoleplayChapterMap paths={paths} lockedNotice={params.terkunci === "1"} />;
  }

  const chapter = await getRoleplayChapterStatus(params.slug);
  if (!chapter) notFound();
  if (chapter.status === "locked") redirect("/roleplay?terkunci=1");

  const { user, scenario, allScenarios } = await getRoleplayScenario(params.slug);
  return (
    <RoleplayWorkspace
      user={user}
      scenario={scenario}
      allScenarios={allScenarios}
      chapterKey={chapter.key}
      chapterOrder={chapter.order}
      initialCorrectionPref={user.correctionPref}
    />
  );
}
