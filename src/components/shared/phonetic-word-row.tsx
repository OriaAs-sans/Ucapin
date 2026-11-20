"use client";

import * as React from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { Badge } from "@/components/ui/badge";
import type { PhonemeStatus } from "@/types/ucapin";
import { cn } from "@/lib/utils";

export interface PhoneticWordRowProps {
  word: string;
  ipa?: string;
  subtitle: string;
  errorPattern?: string;
  status?: PhonemeStatus;
  className?: string;
}

const statusConfig: Record<
  PhonemeStatus,
  {
    variant: "ok" | "almost" | "work";
    Icon: React.ElementType;
    defaultLabel: string;
    markClass: string;
  }
> = {
  ok: {
    variant: "ok",
    Icon: Check,
    defaultLabel: "Jelas",
    markClass: "mk mk-ok",
  },
  almost: {
    variant: "almost",
    Icon: RotateCcw,
    defaultLabel: "Hampir",
    markClass: "mk mk-almost",
  },
  work: {
    variant: "work",
    Icon: X,
    defaultLabel: "Perlu latihan",
    markClass: "mk mk-work",
  },
};

export function PhoneticWordRow({
  word,
  ipa,
  subtitle,
  errorPattern,
  status,
  className,
}: PhoneticWordRowProps) {
  const cfg = status ? statusConfig[status] : null;
  const StatusIcon = cfg?.Icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-control border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 transition-colors",
        className
      )}
    >
      <AudioTtsButton text={word} iconOnly />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            lang="en"
            className={cn(
              "font-display text-lg font-extrabold tracking-tight text-[var(--text)]",
              cfg && status !== "ok" && cfg.markClass
            )}
          >
            {word}
          </span>
          {ipa && (
            <span
              lang="en"
              className="font-ipa text-sm font-normal text-[var(--text-2)]"
            >
              {ipa}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--text-2)]">{subtitle}</p>
      </div>
      {cfg && StatusIcon && (
        <Badge variant={cfg.variant} className="shrink-0">
          <StatusIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          <span>{errorPattern ?? cfg.defaultLabel}</span>
        </Badge>
      )}
    </div>
  );
}
