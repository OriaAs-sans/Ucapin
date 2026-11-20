import * as React from "react";
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
    tone ?? (score >= 85 ? "ok" : score >= 75 ? "almost" : "work");

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
          <span className="text-sm font-medium text-[var(--text-2)]">
            {label}
          </span>
        )}
        <span className="font-display text-3xl font-extrabold tabular-nums">
          {score}
        </span>
      </div>
      {icon && <p className="font-bold text-[var(--text)]">{label}</p>}
      <Progress
        value={score}
        tone={resolvedTone}
        aria-label={`${label}: ${score} dari 100`}
      />
      <small className="text-xs text-[var(--text-2)]">{description}</small>
    </Card>
  );
}
