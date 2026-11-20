import type { Metadata } from "next";
import { getDrillSentences } from "@/server/repositories/ucapin-repository";
import { DrillWorkspace } from "@/features/drill/drill-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latihan Ucapan · Ucapin",
  description:
    "Baca kalimat bahasa Inggris dengan suara keras dan lihat bunyi mana yang meleset.",
};

export default async function LatihanUcapanPage() {
  const sentences = await getDrillSentences();
  return <DrillWorkspace sentences={sentences} />;
}
