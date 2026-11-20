import type { Metadata } from "next";
import { getRoleplayScenario } from "@/server/repositories/ucapin-repository";
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
  searchParams: Promise<{ slug?: string }>;
}) {
  const params = await searchParams;
  const { user, scenario, allScenarios } = await getRoleplayScenario(
    params.slug
  );
  return (
    <RoleplayWorkspace
      user={user}
      scenario={scenario}
      allScenarios={allScenarios}
      initialCorrectionPref={user.correctionPref}
    />
  );
}
