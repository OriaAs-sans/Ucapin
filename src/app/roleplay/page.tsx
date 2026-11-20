import type { Metadata } from "next";
import {
  getActiveUser,
  getRoleplayScenario,
} from "@/server/repositories/ucapin-repository";
import { RoleplayWorkspace } from "@/features/roleplay/roleplay-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Roleplay: Memesan di kafe · Ucapin",
  description:
    "Latihan percakapan berskenario: memesan minuman di kafe dalam bahasa Inggris.",
};

export default async function RoleplayPage() {
  const [scenario, user] = await Promise.all([
    getRoleplayScenario("memesan-di-kafe"),
    getActiveUser(),
  ]);
  return (
    <RoleplayWorkspace
      scenario={scenario}
      initialCorrectionPref={user.correctionPref}
    />
  );
}
