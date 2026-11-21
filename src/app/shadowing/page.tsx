import type { Metadata } from "next";
import { getDrillSentences } from "@/server/repositories/ucapin-repository";
import { ShadowingWorkspace } from "@/features/shadowing/shadowing-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shadowing · Ucapin",
  description:
    "Dengarkan contoh ucapan, lalu tirukan tempo dan iramanya. Ucapin membandingkan tempomu dengan contoh.",
};

export default async function ShadowingPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string }>;
}) {
  const params = await searchParams;
  const { user, sentences } = await getDrillSentences({ goalTag: params.goal });
  return <ShadowingWorkspace user={user} sentences={sentences} />;
}
