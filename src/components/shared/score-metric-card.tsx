"use client";

import * as React from "react";
import { animate, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Progress, type ProgressProps } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ScoreMetricCardProps {
  label: string;
  score: number;
  description: string;
  tone?: ProgressProps["tone"];
  icon?: React.ReactNode;
  tileClassName?: string;
  className?: string;
}

// Angka naik dari 0 ke skor akhir sekali saat skor berubah, agar hasil baru terasa "datang".
function useCountUp(target: number): number {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = React.useState(reduceMotion ? target : 0);
  React.useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, reduceMotion]);
  return value;
}

export function ScoreMetricCard({
  label,
  score,
  description,
  tone,
  icon,
  tileClassName,
  className,
}: ScoreMetricCardProps) {
  const resolvedTone: NonNullable<ProgressProps["tone"]> =
    tone ?? (score >= 85 ? "ok" : score >= 65 ? "almost" : "work");
  const shown = useCountUp(score);
  // Bar bergerak sekali menuju nilai akhir (bukan mengikuti setiap frame hitungan) agar tidak tertinggal.
  const [barValue, setBarValue] = React.useState(0);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setBarValue(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  return (
    <Card className={cn("grid content-start gap-2.5 p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        {icon ? (
          <span
            className={cn(
              "grid h-10 w-10 place-items-center rounded-[12px]",
              tileClassName ?? "bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]"
            )}
          >
            {icon}
          </span>
        ) : (
          <span className="text-sm font-medium text-[var(--text-2)]">{label}</span>
        )}
        <span className="font-display text-3xl font-extrabold tabular-nums" aria-hidden="true">
          {shown}
        </span>
      </div>
      {icon && <p className="font-bold text-[var(--text)]">{label}</p>}
      <Progress
        value={barValue}
        tone={resolvedTone}
        className="[&>div]:duration-700 [&>div]:ease-[cubic-bezier(0.16,1,0.3,1)]"
        aria-label={`${label}: ${score} dari 100`}
      />
      <small className="text-xs text-[var(--text-2)]">{description}</small>
    </Card>
  );
}
