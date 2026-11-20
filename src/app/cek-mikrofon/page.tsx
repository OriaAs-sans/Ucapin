import type { Metadata } from "next";
import { getActiveUser } from "@/server/repositories/ucapin-repository";
import { MicCheckWorkspace } from "@/features/onboarding/mic-check-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cek Mikrofon · Ucapin",
  description:
    "Tes izin dan kejelasan suara mikrofon sebelum memulai latihan bicara pertama.",
};

export default async function CekMikrofonPage() {
  const user = await getActiveUser();
  return <MicCheckWorkspace user={user} />;
}
