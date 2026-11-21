import * as React from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  rightPanelLabel?: string;
  className?: string;
}

export function AppShell({
  children,
  rightPanel,
  rightPanelLabel = "Panel informasi dan progres",
  className,
}: AppShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen lg:grid",
        rightPanel
          ? "lg:grid-cols-[248px_minmax(0,1fr)] xl:grid-cols-[248px_minmax(0,1fr)_330px]"
          : "lg:grid-cols-[248px_minmax(0,1fr)]",
        className
      )}
    >
      <a
        href="#main-content"
        className="fixed left-3 -top-16 z-50 rounded-control bg-[var(--coral)] px-4 py-2.5 font-bold text-[var(--on-coral)] transition-all focus:top-3"
      >
        Langsung ke konten
      </a>

      <SidebarNav />

      <main
        id="main-content"
        className="min-w-0 px-4 pb-28 pt-6 sm:px-8 lg:px-10 lg:py-9"
      >
        <div className="flex flex-col gap-7 min-w-0">{children}</div>
      </main>

      {rightPanel && (
        <aside
          aria-label={rightPanelLabel}
          className="flex flex-col gap-6 border-t-[1.5px] border-[var(--line)] bg-[var(--surface)] px-5 pb-28 pt-7 lg:col-start-2 lg:pb-7 xl:col-start-auto xl:min-h-screen xl:border-l-[1.5px] xl:border-t-0"
        >
          {rightPanel}
        </aside>
      )}
    </div>
  );
}
