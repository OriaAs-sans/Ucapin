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
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/latihan-ucapan", label: "Latihan Ucapan", icon: Mic },
  { href: "/roleplay", label: "Roleplay", icon: MessageSquare },
  { href: "/bank-kesalahan", label: "Bank Kesalahan", icon: BookOpen },
  { href: "/mulai", label: "Tujuan & Target", icon: SlidersHorizontal },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeUser, setActiveUser] = React.useState<{
    name: string;
    initials: string;
    email: string;
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
            email: d.user.email,
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
      className="flex flex-col justify-between gap-6 bg-[var(--side-bg)] px-4 py-6 text-[var(--side-text)] lg:sticky lg:top-0 lg:h-screen"
    >
      {/* Top Brand & Primary Menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:gap-7">
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

        <nav className="flex w-full gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
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
                  "flex min-h-[46px] items-center gap-3 whitespace-nowrap rounded-control px-4 font-semibold no-underline transition-all",
                  isActive
                    ? "bg-[var(--side-active)] font-bold text-[#F7F5EE] shadow-sm"
                    : "text-[var(--side-text)] hover:translate-x-0.5 hover:bg-[rgba(232,229,215,0.08)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive && "text-[var(--coral)]"
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Structured Account & Theme Card (Redesigned for clean hierarchy & zero overlap) */}
      <div className="rounded-[18px] border border-[rgba(212,200,183,0.18)] bg-[rgba(14,33,37,0.45)] p-3.5">
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
                Level {activeUser.cefrLevel} · {activeUser.email}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <ThemeToggle className="w-full justify-center rounded-[12px] min-h-[38px] text-xs" />

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/masuk"
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(212,200,183,0.28)] bg-[rgba(247,245,238,0.06)] px-2.5 text-xs font-semibold text-[#F7F5EE] no-underline transition-colors hover:bg-[rgba(247,245,238,0.14)]"
            >
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Akun</span>
            </Link>
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
      </div>
    </aside>
  );
}
