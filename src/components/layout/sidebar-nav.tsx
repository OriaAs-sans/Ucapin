"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Mic,
  MessageSquare,
  BookOpen,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

// shortLabel dipakai di tab bar bawah pada layar kecil.
const mainNavItems = [
  { href: "/", label: "Beranda", shortLabel: "Beranda", icon: Home },
  { href: "/latihan-ucapan", label: "Latihan Ucapan", shortLabel: "Ucapan", icon: Mic },
  { href: "/roleplay", label: "Roleplay", shortLabel: "Roleplay", icon: MessageSquare },
  { href: "/bank-kesalahan", label: "Bank Kesalahan", shortLabel: "Bank", icon: BookOpen },
  { href: "/mulai", label: "Tujuan & Target", shortLabel: "Target", icon: SlidersHorizontal },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeUser, setActiveUser] = React.useState<{
    name: string;
    initials: string;
    cefrLevel: string;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/onboarding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.user) {
          setActiveUser({
            name: d.user.name,
            initials: d.user.initials,
            cefrLevel: d.user.cefrLevel,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/masuk");
    router.refresh();
  };

  return (
    <aside
      aria-label="Navigasi utama"
      className="flex flex-col justify-between gap-6 bg-[var(--side-bg)] px-4 py-4 text-[var(--side-text)] lg:sticky lg:top-0 lg:h-screen lg:py-6"
    >
      <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:gap-7">
        <Link href="/" className="block px-3 text-[#F7F5EE] no-underline">
          <span className="font-display text-[1.8rem] font-extrabold leading-none tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
            Ucapin
          </span>
          <span
            aria-hidden="true"
            className="mt-1 hidden font-ipa text-sm text-[var(--side-text-2)] lg:block"
          >
            /ʊˈtʃapɪn/
          </span>
        </Link>

        {/* Layar kecil: tema dan keluar tetap terjangkau di bar atas */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Keluar dari akun"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(242,147,124,0.35)] text-[#F2937C] transition-colors hover:bg-[rgba(242,147,124,0.14)]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Menu utama"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[rgba(212,200,183,0.18)] bg-[var(--side-bg)] px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5 lg:static lg:flex lg:flex-col lg:gap-1.5 lg:border-0 lg:bg-transparent lg:p-0"
        >
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-control px-1 text-[11px] font-semibold no-underline transition-colors lg:min-h-[46px] lg:flex-row lg:justify-start lg:gap-3 lg:whitespace-nowrap lg:px-4 lg:text-base",
                  isActive
                    ? "font-bold text-[#F7F5EE] lg:bg-[var(--side-active)] lg:shadow-sm"
                    : "text-[var(--side-text)] hover:bg-[rgba(232,229,215,0.08)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-[var(--coral)]"
                  )}
                  aria-hidden="true"
                />
                <span className="lg:hidden">{item.shortLabel}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="hidden rounded-[18px] border border-[rgba(212,200,183,0.18)] lg:block bg-[rgba(14,33,37,0.45)] p-3.5">
        {activeUser && (
          <div className="mb-3 flex items-center gap-2.5 border-b border-[rgba(212,200,183,0.14)] pb-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--coral)] font-display text-xs font-extrabold text-[var(--on-coral)]"
            >
              {activeUser.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-bold text-[#F7F5EE]">
                {activeUser.name}
              </p>
              <p className="truncate text-[11px] text-[var(--side-text-2)]">
                Level {activeUser.cefrLevel}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <ThemeToggle className="w-full justify-center rounded-[12px] min-h-[38px] text-xs" />

          <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(242,147,124,0.35)] bg-[rgba(242,147,124,0.1)] px-2.5 text-xs font-semibold text-[#F2937C] transition-colors hover:bg-[rgba(242,147,124,0.2)]"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Keluar</span>
            </button>
        </div>
      </div>
    </aside>
  );
}
