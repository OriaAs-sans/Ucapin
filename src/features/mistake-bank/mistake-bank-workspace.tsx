"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Mic } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PhoneticWordRow } from "@/components/shared/phonetic-word-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MistakeItemDTO, PhonemeStatus } from "@/types/ucapin";

export function MistakeBankWorkspace({
  initialMistakes,
}: {
  initialMistakes: MistakeItemDTO[];
}) {
  const [filter, setFilter] = React.useState<"all" | PhonemeStatus>("all");

  const filtered = React.useMemo(() => {
    if (filter === "all") return initialMistakes;
    return initialMistakes.filter((m) => m.status === filter);
  }, [initialMistakes, filter]);

  return (
    <AppShell prototypeNote="Data Bank Kesalahan dimuat langsung dari tabel MistakeItem di Laragon PostgreSQL.">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-2)]">
              Katalog Bunyi & Kata
            </p>
            <h1 className="font-display text-3xl font-extrabold">
              Bank Kesalahan
            </h1>
          </div>
        </div>

        <Button asChild variant="accent">
          <Link href="/latihan-ucapan">
            <Mic className="h-5 w-5" aria-hidden="true" />
            <span>Latih semua kata ({initialMistakes.length})</span>
          </Link>
        </Button>
      </header>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">
              Daftar kata yang perlu diulang
            </h2>
            <p className="text-xs text-[var(--text-2)]">
              Setiap kata dikelompokkan berdasarkan pola substitusi bunyi khas
              penutur Indonesia (/v/→/f/, /θ/→/t/, konsonan akhir).
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter status kata"
          >
            {[
              { id: "all", label: `Semua (${initialMistakes.length})` },
              {
                id: "work",
                label: `Perlu latihan (${
                  initialMistakes.filter((m) => m.status === "work").length
                })`,
              },
              {
                id: "almost",
                label: `Hampir jelas (${
                  initialMistakes.filter((m) => m.status === "almost").length
                })`,
              },
            ].map((tab) => (
              <Button
                key={tab.id}
                type="button"
                size="sm"
                variant={filter === tab.id ? "default" : "surface"}
                onClick={() => setFilter(tab.id as "all" | PhonemeStatus)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5">
          {filtered.map((item) => (
            <div key={item.id} className="grid gap-1">
              <PhoneticWordRow
                word={item.word}
                ipa={item.ipa}
                subtitle={`${item.heardAs} · muncul ${item.occurrenceCount}x dari ${item.sourceMode} · jadwal: ${item.scheduleLabel}`}
                errorPattern={item.errorPattern}
                status={item.status}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-2)]">
            <span>Pola aktif:</span>
            <Badge variant="work" lang="en">
              /v/ → /f/
            </Badge>
            <Badge variant="work" lang="en">
              /θ/ → /t/
            </Badge>
            <Badge variant="almost" lang="en">
              Konsonan akhir (-ed, -d)
            </Badge>
          </div>
          <Button asChild size="sm">
            <Link href="/latihan-ucapan">Buka Latihan Ucapan</Link>
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
