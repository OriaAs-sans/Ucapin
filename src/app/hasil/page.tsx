import type { Metadata } from "next";
import { getLatestSessionResult } from "@/server/repositories/ucapin-repository";
import { SessionResultWorkspace } from "@/features/session-result/session-result-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hasil Sesi · Ucapin",
  description:
    "Ringkasan sesi latihan: skor kejelasan, ulasan jawaban, dan kata yang masuk Bank Kesalahan.",
};

export default async function HasilSesiPage() {
  const { user, session, mistakes } = await getLatestSessionResult();
  return (
    <SessionResultWorkspace
      user={user}
      session={session}
      mistakes={mistakes}
    />
  );
}
