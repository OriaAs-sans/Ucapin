"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  onLightSurface?: boolean;
  /** Hanya ikon (untuk bar atas di layar kecil); label tetap tersedia untuk pembaca layar. */
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({
  onLightSurface = false,
  compact = false,
  className,
}: ThemeToggleProps) {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("ucapin-theme");
    const sysDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = saved ? saved === "dark" : sysDark;
    if (saved) {
      root.dataset.theme = saved;
    }
    setDark(initialDark);
  }, []);

  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ucapin-theme", next);
    } catch {
      /* ignore storage errors */
    }
    setDark(!dark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={compact ? (dark ? "Ganti ke mode terang" : "Ganti ke mode gelap") : undefined}
      className={cn(
        "inline-flex min-h-[40px] items-center gap-2 rounded-pill border-[1.5px] px-3.5 text-sm font-semibold transition-colors",
        compact && "h-11 w-11 justify-center px-0",
        onLightSurface
          ? "border-[var(--line)] text-[var(--text)] hover:bg-[var(--surface-2)]"
          : "border-[rgba(212,200,183,0.45)] text-[var(--side-text)] hover:bg-[rgba(232,229,215,0.08)]",
        className
      )}
    >
      {dark ? (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
      {!compact && <span>{dark ? "Mode terang" : "Mode gelap"}</span>}
    </button>
  );
}
