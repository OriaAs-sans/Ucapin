"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Mic,
  MessageSquare,
  BookOpen,
  LogIn,
  LogOut,
  SlidersHorizontal,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/latihan-ucapan", label: "Latihan Ucapan", icon: Mic },
  { href: "/roleplay", label: "Roleplay", icon: MessageSquare },
  { href: "/bank-kesalahan", label: "Bank Kesalahan", icon: BookOpen },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

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
      <div className="flex flex-wrap items-center justify-between gap-4 lg:flex-col lg:items-stretch lg:gap-8">
        <Link href="/" className="block px-3 text-[#F7F5EE] no-underline">
          <span className="font-display text-[1.75rem] font-extrabold leading-none tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
            Ucapin
          </span>
          <span
            aria-hidden="true"
            className="mt-1 hidden font-ipa text-sm text-[var(--side-text-2)] lg:block"
          >
            /ʊˈtʃapɪn/
          </span>
        </Link>

        <nav className="flex w-full gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
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
                    ? "bg-[var(--side-active)] font-bold text-[#F7F5EE]"
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

          <div className="mt-4 hidden px-4 pb-1 text-xs font-semibold text-[var(--side-text-2)] lg:block">
            Alur & Akun
          </div>
          <Link
            href="/mulai"
            className="flex min-h-[42px] items-center gap-3 whitespace-nowrap rounded-control px-4 text-sm font-semibold text-[var(--side-text)] no-underline transition-all hover:bg-[rgba(232,229,215,0.08)]"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Tujuan Belajar</span>
          </Link>
          <Link
            href="/masuk"
            className="flex min-h-[42px] items-center gap-3 whitespace-nowrap rounded-control px-4 text-sm font-semibold text-[var(--side-text)] no-underline transition-all hover:bg-[rgba(232,229,215,0.08)]"
          >
            <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Ganti Akun / Masuk</span>
          </Link>

          <div className="mt-3 hidden px-4 pb-1 text-xs font-semibold text-[var(--side-text-2)] lg:block">
            Segera hadir
          </div>
          <span className="hidden min-h-[38px] items-center justify-between px-4 text-xs font-semibold text-[var(--side-text-2)] lg:flex">
            <span>Shadowing</span>
            <small className="rounded-pill border border-[rgba(212,200,183,0.35)] px-2 py-0.5 text-[10px]">
              Segera
            </small>
          </span>
          <span className="hidden min-h-[38px] items-center justify-between px-4 text-xs font-semibold text-[var(--side-text-2)] lg:flex">
            <span>Speaking Test</span>
            <small className="rounded-pill border border-[rgba(212,200,183,0.35)] px-2 py-0.5 text-[10px]">
              Segera
            </small>
          </span>
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 text-sm lg:grid lg:justify-start">
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-left text-xs font-semibold text-[var(--side-text-2)] underline underline-offset-4 hover:text-[#F7F5EE]"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Keluar ke halaman Login</span>
        </button>
      </div>
    </aside>
  );
}
