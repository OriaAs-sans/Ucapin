import * as React from "react";
import { cn } from "@/lib/utils";

export interface ClarityRingProps {
  score: number;
  label?: string;
  className?: string;
}

export function ClarityRing({
  score,
  label = "Kejelasan",
  className,
}: ClarityRingProps) {
  const circumference = 352;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = Math.round(circumference * (1 - clamped / 100));

  return (
    <div
      className={cn("relative h-[132px] w-[132px] shrink-0", className)}
      role="img"
      aria-label={`${label} ${clamped} dari 100`}
    >
      <svg
        viewBox="0 0 132 132"
        aria-hidden="true"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="66"
          cy="66"
          r="56"
          fill="none"
          stroke="rgba(247, 245, 238, 0.2)"
          strokeWidth="12"
        />
        <circle
          cx="66"
          cy="66"
          r="56"
          fill="none"
          stroke="var(--coral)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center text-[var(--hero-fg)]">
        <b className="font-display text-4xl font-extrabold leading-none tabular-nums">
          {clamped}
        </b>
        <small className="mt-1 text-xs text-[var(--hero-fg-2)]">{label}</small>
      </div>
    </div>
  );
}
