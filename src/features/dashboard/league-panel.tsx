"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LeagueEntryDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

// Liga mingguan opt-in: pelajar memilih ikut dan memilih nama panggilan yang tampil.
// Nama asli dan email tidak pernah ditampilkan ke pengguna lain.
export function LeaguePanel({
  optedIn,
  nickname,
  league,
}: {
  optedIn: boolean;
  nickname: string | null;
  league: LeagueEntryDTO[];
}) {
  const router = useRouter();
  const [draftName, setDraftName] = React.useState(nickname ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const save = async (body: { leagueOptIn: boolean; leagueNickname?: string }) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gagal menyimpan pilihan liga.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section aria-labelledby="league-title">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="league-title" className="font-display text-lg font-bold">
          Liga minggu ini
        </h2>
        <Badge variant="ochre">menit bicara</Badge>
      </div>

      {!optedIn ? (
        <form
          className="grid gap-2.5 rounded-card border-[1.5px] border-dashed border-[var(--line)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draftName.trim()) {
              setError("Isi nama panggilan dulu.");
              return;
            }
            void save({ leagueOptIn: true, leagueNickname: draftName });
          }}
        >
          <p className="text-sm text-[var(--text-2)]">
            Bandingkan menit bicaramu dengan pelajar lain mulai Senin. Hanya nama panggilan
            yang tampil, dan kamu bisa keluar kapan saja.
          </p>
          <Label htmlFor="league-nickname">Nama panggilan di liga</Label>
          <Input
            id="league-nickname"
            maxLength={20}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Menyimpan..." : "Ikut liga minggu ini"}
          </Button>
        </form>
      ) : league.length === 0 ? (
        <p className="text-sm text-[var(--text-2)]">Belum ada peserta minggu ini.</p>
      ) : (
        <ol className="grid gap-1.5">
          {league.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                "flex items-center gap-2.5 rounded-[12px] px-2.5 py-2",
                entry.isCurrentUser && "bg-[var(--tile-coral)]"
              )}
            >
              <span className="w-5 font-bold text-[var(--text-2)] tabular-nums">{entry.rank}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs font-extrabold",
                  entry.isCurrentUser
                    ? "bg-[var(--coral)] text-[var(--on-coral)]"
                    : "bg-[var(--teal-600)] text-[#F7F5EE]"
                )}
              >
                {entry.initials}
              </span>
              <span className="min-w-0 flex-1 truncate font-bold">
                {entry.name}
                {entry.isCurrentUser && " (kamu)"}
              </span>
              <span className="text-xs font-semibold text-[var(--text-2)] tabular-nums">
                {entry.minutesSpoken} mnt
              </span>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-bold text-[var(--work-text)]">
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-[var(--text-2)]">
        Diurutkan dari menit bicara sejak Senin, bukan skor pengucapan.
        {optedIn && (
          <>
            {" "}
            <button
              type="button"
              disabled={saving}
              onClick={() => save({ leagueOptIn: false })}
              className="font-semibold text-[var(--link)] underline"
            >
              Keluar dari liga
            </button>
          </>
        )}
      </p>
    </section>
  );
}
