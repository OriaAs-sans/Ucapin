import type { Metadata } from "next";
import { getLatestSessionResult } from "@/server/repositories/ucapin-repository";
import { SessionResultWorkspace } from "@/features/session-result/session-result-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hasil Sesi · Ucapin",
  description:
    "Ringkasan sesi latihan: skor kejelasan, ulasan jawaban, dan kata yang masuk Bank Kesalahan.",
};

export default async function HasilSesiPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const params = await searchParams;
  const { user, session, sessionHistory, mistakes } =
    await getLatestSessionResult(params.sessionId);
  return (
    <SessionResultWorkspace
      user={user}
      session={session}
      sessionHistory={sessionHistory}
      mistakes={mistakes}
    />
  );
}
