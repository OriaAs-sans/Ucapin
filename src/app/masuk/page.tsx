import type { Metadata } from "next";
import {
  getAllTestingUsers,
  getSessionUserId,
} from "@/server/repositories/ucapin-repository";
import { LoginWorkspace } from "@/features/auth/login-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk atau Daftar · Ucapin",
  description:
    "Masuk ke akun Ucapin atau pilih akun testing untuk mencoba alur latihan speaking dari awal sampai akhir.",
};

export default async function MasukPage() {
  const [testingUsers, currentUserId] = await Promise.all([
    getAllTestingUsers(),
    getSessionUserId(),
  ]);
  return (
    <LoginWorkspace
      testingUsers={testingUsers}
      currentUserId={currentUserId}
    />
  );
}
