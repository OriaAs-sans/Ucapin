import type { Metadata } from "next";
import { getDashboardData } from "@/server/repositories/ucapin-repository";
import { MistakeBankWorkspace } from "@/features/mistake-bank/mistake-bank-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bank Kesalahan · Ucapin",
  description:
    "Daftar kata dan pola bunyi yang perlu dilatih ulang dari sesi latihan dan roleplay.",
};

export default async function BankKesalahanPage() {
  const data = await getDashboardData();
  return <MistakeBankWorkspace initialMistakes={data.mistakes} />;
}
