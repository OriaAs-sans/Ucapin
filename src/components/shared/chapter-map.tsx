import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import type { ChapterPath } from "@/lib/chapters";
import { cn } from "@/lib/utils";

export interface ChapterMapProps {
  paths: ChapterPath[];
  /** Satuan isi bab, misalnya "kalimat" atau "giliran". */
  unitLabel: string;
  className?: string;
}

// Peta bab bergaya daftar isi buku catatan: satu jalur per tujuan belajar, bab berurutan.
// Bab terkunci tidak bisa diklik dan menyebut bab mana yang harus diselesaikan dulu.
export function ChapterMap({ paths, unitLabel, className }: ChapterMapProps) {
  return (
    <div className={cn("grid gap-8", className)}>
      {paths.map((path) => (
        <section key={path.goalTag} aria-labelledby={`path-${path.goalTag}`}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b-[1.5px] border-[var(--line)] pb-2">
            <h2 id={`path-${path.goalTag}`} className="font-display text-xl font-bold">
              {path.label}
            </h2>
            <span className="text-sm font-semibold text-[var(--text-2)] tabular-nums">
              {path.doneCount} dari {path.chapters.length} bab selesai
            </span>
          </div>

          <ol className="grid gap-2">
            {path.chapters.map((ch, idx) => {
              const previous = path.chapters[idx - 1];
              const body = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold",
                      ch.status === "done" && "bg-[var(--ok-wash)] text-[var(--ok)]",
                      ch.status === "open" && "bg-[var(--coral)] text-[var(--on-coral)]",
                      ch.status === "locked" && "border-[1.5px] border-[var(--line)] text-[var(--text-2)]"
                    )}
                  >
                    {ch.status === "done" ? (
                      <Check className="h-5 w-5" />
                    ) : ch.status === "locked" ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      ch.order
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[var(--text-2)]">
                      Bab {ch.order} · {ch.itemCount} {unitLabel}
                    </span>
                    <span className="block font-display text-lg font-bold leading-tight">
                      {ch.title}
                    </span>
                    <span className="block text-sm text-[var(--text-2)]">
                      {ch.status === "locked" && previous
                        ? `Selesaikan Bab ${previous.order} dulu untuk membuka bab ini`
                        : ch.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm font-bold">
                    {ch.status === "done" && (
                      <span className="text-[var(--ok)]">
                        Selesai
                        {ch.bestClarity !== null && (
                          <span className="block text-xs font-semibold text-[var(--text-2)] tabular-nums">
                            Kejelasan terbaik {ch.bestClarity}
                          </span>
                        )}
                      </span>
                    )}
                    {ch.status === "open" && (
                      <span className="inline-flex items-center gap-1.5 text-[var(--text)]">
                        Mulai <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                    {ch.status === "locked" && (
                      <span className="text-[var(--text-2)]">Terkunci</span>
                    )}
                  </span>
                </>
              );

              const rowClass = cn(
                "flex items-center gap-3.5 rounded-card border-[1.5px] p-3.5",
                ch.status === "open" && "border-[var(--coral)] bg-[var(--surface)]",
                ch.status === "done" && "border-[var(--line)] bg-[var(--surface)]",
                ch.status === "locked" && "border-dashed border-[var(--line)] opacity-75"
              );

              return (
                <li key={ch.key}>
                  {ch.status === "locked" ? (
                    <div className={rowClass} aria-disabled="true">
                      {body}
                    </div>
                  ) : (
                    <Link
                      href={ch.href}
                      className={cn(
                        rowClass,
                        "no-underline transition-colors hover:border-[var(--text-2)]"
                      )}
                    >
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
