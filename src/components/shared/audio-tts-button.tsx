"use client";

import * as React from "react";
import { Volume2, Gauge } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { speakEnglish, cn } from "@/lib/utils";

export interface AudioTtsButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  rate?: number;
  label?: string;
  iconOnly?: boolean;
}

export function AudioTtsButton({
  text,
  rate = 1,
  label,
  iconOnly = false,
  variant = "surface",
  size = "sm",
  className,
  ...props
}: AudioTtsButtonProps) {
  const [unsupported, setUnsupported] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const handlePlay = () => {
    const ok = speakEnglish(text, rate);
    if (!ok) {
      setUnsupported(true);
      return;
    }
    setActive(true);
    window.setTimeout(() => setActive(false), 900);
  };

  const Icon = rate < 1 ? Gauge : Volume2;

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : size}
      disabled={unsupported}
      onClick={handlePlay}
      aria-label={label ?? `Dengar: ${text}`}
      title={
        unsupported
          ? "Browser ini tidak mendukung pemutaran suara contoh"
          : label ?? `Dengar: ${text}`
      }
      className={cn(
        active && "border-[var(--coral)] bg-[var(--surface-2)]",
        className
      )}
      {...props}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      {!iconOnly && <span>{label ?? (rate < 1 ? "Pelan 0,7x" : "Dengar")}</span>}
    </Button>
  );
}
