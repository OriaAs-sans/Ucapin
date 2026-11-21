"use client";

import * as React from "react";
import { X, RotateCcw, Check, Sparkles } from "lucide-react";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { cn } from "@/lib/utils";

export interface PhoneticSpecimenCardProps {
  word?: string | null;
  ipa?: string | null;
  errorPattern?: string | null;
  heardAs?: string | null;
  tip?: string | null;
  spokenMinutes?: number;
  targetMinutes?: number;
  variant?: "hero" | "onboarding";
  className?: string;
}

/**
 * Editorial Phonetic Notebook Specimen Card.
 * 100% data-driven from PostgreSQL:
 * - If the learner has a recorded mistake in MistakeItem, displays that real word & phoneme rule.
 * - If the learner has 0 mistakes (fresh account), displays an honest zero-state card with 0/target minutes.
 */
export function PhoneticSpecimenCard({
  word,
  ipa,
  errorPattern,
  heardAs,
  tip,
  spokenMinutes = 0,
  targetMinutes = 10,
  variant = "hero",
  className,
}: PhoneticSpecimenCardProps) {
  const totalTicks = Math.max(5, Math.min(targetMinutes, 20));
  const filledTicks = Math.max(0, Math.min(spokenMinutes, totalTicks));
  const hasMistake = Boolean(word);

  return (
    <div
      className={cn(
        "rounded-[18px] border border-[rgba(212,200,183,0.32)] bg-[rgba(19,41,46,0.55)] p-4 text-[#F7F5EE]",
        variant === "onboarding" && "w-full",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(212,200,183,0.22)] pb-2.5">
        <span className="text-xs font-bold tracking-wide text-[#D4C8B7]">
          {hasMistake ? "Prioritas Bank Kesalahan" : "Status Bank Kesalahan"}
        </span>
        {hasMistake && errorPattern ? (
          <span className="inline-flex items-center gap-1 rounded-[8px] bg-[rgba(242,147,124,0.18)] px-2 py-0.5 text-xs font-bold text-[#F2937C]">
            <X className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
            <span lang="en">{errorPattern}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-[8px] bg-[rgba(124,199,160,0.18)] px-2 py-0.5 text-xs font-bold text-[#7CC7A0]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>0 kata tercatat</span>
          </span>
        )}
      </div>

      {hasMistake && word ? (
        <>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span
                  lang="en"
                  className="mk mk-work font-display text-3xl font-extrabold tracking-tight text-[#F7F5EE]"
                >
                  {word}
                </span>
                {ipa && (
                  <span lang="en" className="font-ipa text-base text-[#D4C8B7]">
                    {ipa}
                  </span>
                )}
              </div>
              {heardAs && (
                <p className="mt-1.5 text-xs text-[#D4C8B7]">{heardAs}</p>
              )}
            </div>
            <AudioTtsButton
              text={word}
              iconOnly
              variant="ghostLight"
              className="h-9 w-9 rounded-[10px]"
            />
          </div>

          <div className="mt-3 grid gap-1.5 rounded-[12px] border border-[rgba(212,200,183,0.18)] bg-[rgba(247,245,238,0.06)] p-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[#E3B95E]">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Dari sesi sebelumnya</span>
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-[#7CC7A0]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Siap dilatih</span>
              </span>
            </div>
            <p className="leading-relaxed text-[#E8E5D7]">
              {tip ??
                "Klik Latih kata ini di bawah untuk mengulang pengucapan fonem ini."}
            </p>
          </div>
        </>
      ) : (
        <div className="mt-3 rounded-[12px] border border-[rgba(212,200,183,0.18)] bg-[rgba(247,245,238,0.06)] p-3 text-xs leading-relaxed text-[#E8E5D7]">
          <p className="font-bold text-[#F7F5EE]">
            Belum ada catatan kesalahan bicara
          </p>
          <p className="mt-1 text-[#D4C8B7]">
            Selesaikan sesi Latihan Ucapan atau Roleplay pertamamu. Setiap bunyi
            yang meleset akan otomatis masuk ke sini.
          </p>
        </div>
      )}

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-[#D4C8B7]">
          <span>Takaran menit bicara hari ini</span>
          <span className="font-display font-bold tabular-nums text-[#F7F5EE]">
            {spokenMinutes} / {targetMinutes} mnt
          </span>
        </div>
        <div
          className="mt-1.5 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${totalTicks}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label={`${spokenMinutes} dari ${targetMinutes} menit target harian`}
        >
          {Array.from({ length: totalTicks }).map((_, i) => (
            <i
              key={i}
              className={cn(
                "block h-3 rounded-[3px] border transition-colors",
                i < filledTicks
                  ? "border-[var(--coral)] bg-[var(--coral)]"
                  : "border-[rgba(212,200,183,0.28)] bg-[rgba(247,245,238,0.08)]"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
