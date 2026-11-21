"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Mic } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PhoneticWordRow } from "@/components/shared/phonetic-word-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MASTERY_STAGE } from "@/lib/spaced-repetition";
import type { MistakeItemDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

type Filter = "due" | "scheduled" | "mastered" | "all";

const EMPTY_COPY: Record<Filter, string> = {
  due: "Tidak ada kata yang harus diulang hari ini. Kata berikutnya muncul sesuai jadwalnya.",
  scheduled: "Belum ada kata yang menunggu jadwal. Kata pindah ke sini setelah berhasil kamu ulangi.",
  mastered: "Belum ada kata yang dikuasai. Sebuah kata dianggap dikuasai setelah 4 kali berhasil diulang.",
  all: "Bank Kesalahan masih kosong. Mulai Latihan Ucapan atau Roleplay; kata yang meleset akan masuk ke sini.",
};

function StageDots({ stage, mastered }: { stage: number; mastered: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1"
      role="img"
      aria-label={mastered ? "Sudah dikuasai" : `Tahap ${stage} dari ${MASTERY_STAGE}`}
    >
      {Array.from({ length: MASTERY_STAGE }, (_, i) => (
        <i
          key={i}
          className={cn(
            "block h-2 w-2 rounded-full",
            mastered || i < stage ? "bg-[var(--ok)]" : "border border-[var(--text-2)]"
          )}
        />
      ))}
    </span>
  );
}

export function MistakeBankWorkspace({
  initialMistakes,
}: {
  initialMistakes: MistakeItemDTO[];
}) {
  const due = initialMistakes.filter((m) => m.isDue);
  const scheduled = initialMistakes.filter((m) => !m.isDue && !m.isMastered);
  const mastered = initialMistakes.filter((m) => m.isMastered);
  const [filter, setFilter] = React.useState<Filter>(due.length > 0 ? "due" : "all");

  const lists: Record<Filter, MistakeItemDTO[]> = {
    due,
    scheduled,
    mastered,
    all: initialMistakes,
  };
  const visible = lists[filter];

  // Pola bunyi yang paling sering muncul, dihitung dari data pelajar sendiri.
  const topPatterns = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of initialMistakes) {
      if (m.isMastered) continue;
      counts.set(m.errorPattern, (counts.get(m.errorPattern) ?? 0) + m.occurrenceCount);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [initialMistakes]);

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "due", label: "Ulang hari ini", count: due.length },
    { id: "scheduled", label: "Terjadwal", count: scheduled.length },
    { id: "mastered", label: "Dikuasai", count: mastered.length },
    { id: "all", label: "Semua", count: initialMistakes.length },
  ];

  return (
    <AppShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-extrabold">Bank Kesalahan</h1>
            <p className="text-sm text-[var(--text-2)]">
              {due.length > 0
                ? `${due.length} kata siap diulang hari ini`
                : "Semua kata sudah diulang sesuai jadwal"}
              {mastered.length > 0 && ` · ${mastered.length} kata dikuasai`}
            </p>
          </div>
        </div>

        {due.length > 0 && (
          <Button asChild variant="accent">
            <Link href="/latihan-ucapan?source=bank">
              <Mic className="h-5 w-5" aria-hidden="true" />
              <span>Ulangi {due.length} kata sekarang</span>
            </Link>
          </Button>
        )}
      </header>

      <Card>
        <p className="flex items-start gap-2 text-sm text-[var(--text-2)]">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Setiap kata yang berhasil kamu ucapkan jelas dijadwalkan ulang makin jarang: 1,
            3, 7, lalu 14 hari. Kalau salah lagi, jadwalnya kembali ke awal.
          </span>
        </p>

        <div
          className="mt-4 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Kelompok kata berdasarkan jadwal"
        >
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              size="sm"
              variant={filter === tab.id ? "default" : "surface"}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        <div className="mt-4 grid gap-2.5" role="tabpanel">
          {visible.length === 0 ? (
            <p className="rounded-card border-[1.5px] border-dashed border-[var(--line)] p-5 text-sm text-[var(--text-2)]">
              {EMPTY_COPY[filter]}
            </p>
          ) : (
            visible.map((item) => (
              <div key={item.id} className="grid gap-1.5">
                <PhoneticWordRow
                  word={item.word}
                  ipa={item.ipa}
                  subtitle={`${item.heardAs} · muncul ${item.occurrenceCount}x · dari ${item.sourceMode}`}
                  errorPattern={item.errorPattern}
                  status={item.isMastered ? "ok" : item.status}
                />
                <p className="flex items-center gap-2 pl-2 text-xs text-[var(--text-2)]">
                  <StageDots stage={item.reviewStage} mastered={item.isMastered} />
                  <span className={cn(item.isDue && "font-bold text-[var(--text)]")}>
                    {item.scheduleLabel}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>

        {topPatterns.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--text-2)]">
            <span>Pola yang paling sering muncul:</span>
            {topPatterns.map(([pattern, count]) => (
              <span
                key={pattern}
                className="rounded-[8px] border border-[var(--line)] px-2 py-0.5 font-semibold text-[var(--text)]"
              >
                {pattern} <span className="text-[var(--text-2)]">({count}x)</span>
              </span>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
