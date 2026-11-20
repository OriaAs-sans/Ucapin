"use client";

import * as React from "react";
import { X, RotateCcw, Check } from "lucide-react";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { cn } from "@/lib/utils";

export interface PhoneticSpecimenCardProps {
  word?: string;
  ipa?: string;
  errorPattern?: string;
  heardAs?: string;
  tip?: string;
  spokenMinutes?: number;
  targetMinutes?: number;
  variant?: "hero" | "onboarding";
  className?: string;
}

/**
 * Editorial Phonetic Notebook Specimen Card.
 * Replaces the generic concentric radar rings + overlapping floating chat bubbles
 * with a clean, functional dictionary entry specimen and minute tally ruler.
 */
export function PhoneticSpecimenCard({
  word = "very",
  ipa = "/ˈvɛri/",
  errorPattern = "/v/ → /f/",
  heardAs = "terdengar “fery”",
  tip = "Gigi atas menyentuh bibir bawah, getarkan pita suara.",
  spokenMinutes = 9,
  targetMinutes = 15,
  variant = "hero",
  className,
}: PhoneticSpecimenCardProps) {
  const totalTicks = Math.max(targetMinutes, 10);
  const filledTicks = Math.min(spokenMinutes, totalTicks);

  return (
    <div
      className={cn(
        "rounded-[18px] border border-[rgba(212,200,183,0.32)] bg-[rgba(19,41,46,0.55)] p-4 text-[#F7F5EE] backdrop-blur-none",
        variant === "onboarding" && "w-full",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(212,200,183,0.22)] pb-2.5">
        <span className="text-xs font-bold tracking-wide text-[#D4C8B7]">
          Catatan Fonetik Hari Ini
        </span>
        <span className="inline-flex items-center gap-1 rounded-[8px] bg-[rgba(242,147,124,0.18)] px-2 py-0.5 text-xs font-bold text-[#F2937C]">
          <X className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
          <span lang="en">{errorPattern}</span>
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span
              lang="en"
              className="mk mk-work font-display text-3xl font-extrabold tracking-tight text-[#F7F5EE]"
            >
              {word}
            </span>
            <span lang="en" className="font-ipa text-base text-[#D4C8B7]">
              {ipa}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-[#D4C8B7]">{heardAs}</p>
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
            <span>Koreksi mandiri</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[#7CC7A0] font-bold">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Target Jelas</span>
          </span>
        </div>
        <p className="leading-relaxed text-[#E8E5D7]">{tip}</p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-[#D4C8B7]">
          <span>Takaran menit bicara</span>
          <span className="font-display font-bold tabular-nums text-[#F7F5EE]">
            {spokenMinutes} / {targetMinutes} mnt
          </span>
        </div>
        <div
          className="mt-1.5 grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(totalTicks, 15)}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label={`${spokenMinutes} dari ${targetMinutes} menit target harian`}
        >
          {Array.from({ length: Math.min(totalTicks, 15) }).map((_, i) => (
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
