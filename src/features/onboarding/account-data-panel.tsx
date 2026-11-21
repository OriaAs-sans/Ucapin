"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Hak pengguna atas datanya (UU PDP 27/2022): unduh salinan data dan hapus akun.
export function AccountDataPanel() {
  const router = useRouter();
  const [confirmText, setConfirmText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const deleteAccount = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Akun gagal dihapus.");
        return;
      }
      router.push(data.redirectTo ?? "/masuk");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="grid gap-4 p-5" aria-labelledby="data-privacy-title">
      <div>
        <h2 id="data-privacy-title" className="font-display text-lg font-bold">
          Data &amp; privasi
        </h2>
        <p className="mt-1 text-sm text-[var(--text-2)]">
          Ucapin tidak menyimpan audio rekamanmu. Baca{" "}
          <Link href="/privasi" className="font-semibold text-[var(--link)] underline">
            kebijakan privasi
          </Link>{" "}
          untuk rinciannya.
        </p>
      </div>

      <div>
        <Button asChild variant="surface" size="sm">
          <a href="/api/v1/account" download>
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Unduh semua dataku (JSON)</span>
          </a>
        </Button>
      </div>

      <div className="grid gap-2 rounded-control border-[1.5px] border-[var(--work)] p-4">
        <p className="text-sm font-bold text-[var(--work-text)]">Hapus akun</p>
        <p className="text-xs text-[var(--text)]">
          Profil, riwayat latihan, dan Bank Kesalahanmu dihapus permanen dan tidak bisa
          dipulihkan.
        </p>
        <Label htmlFor="confirm-delete" className="text-xs">
          Ketik HAPUS untuk mengonfirmasi
        </Label>
        <Input
          id="confirm-delete"
          value={confirmText}
          autoComplete="off"
          onChange={(e) => setConfirmText(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-xs font-bold text-[var(--work-text)]">
            {error}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={confirmText.trim() !== "HAPUS" || deleting}
          onClick={deleteAccount}
          className="justify-self-start border-[var(--work)] text-[var(--work-text)]"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span>{deleting ? "Menghapus..." : "Hapus akun dan semua data"}</span>
        </Button>
      </div>
    </Card>
  );
}
