import type { Metadata } from "next";
import {
  getAllTestingUsers,
  getSessionUserId,
} from "@/server/repositories/ucapin-repository";
import { testAccountsEnabled } from "@/server/test-accounts";
import { LoginWorkspace } from "@/features/auth/login-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk atau Daftar · Ucapin",
  description:
    "Masuk ke akun Ucapin atau daftar akun baru untuk mulai latihan speaking.",
};

export default async function MasukPage() {
  const showTestAccounts = testAccountsEnabled();
  const [testingUsers, currentUserId] = await Promise.all([
    showTestAccounts ? getAllTestingUsers() : Promise.resolve([]),
    getSessionUserId(),
  ]);
  return (
    <LoginWorkspace
      testingUsers={testingUsers}
      showTestAccounts={showTestAccounts}
      currentUserId={currentUserId ?? undefined}
    />
  );
}
