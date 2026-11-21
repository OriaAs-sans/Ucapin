"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LogIn,
  RotateCcw,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

// Sama dengan TEST_ACCOUNT_IDS.fresh di src/server/test-accounts.ts (modul server tidak diimpor ke klien).
const TEST_ACCOUNT_FRESH_ID = "learner-baru";
const MIN_PASSWORD_LENGTH = 8;

// Materi produk: pola bunyi yang paling sering tertukar pada penutur Indonesia (PRODUCT.md § Positioning).
const SOUND_PATTERNS = [
  { word: "very", ipa: "/ˈvɛri/", pattern: "/v/ jadi /f/" },
  { word: "think", ipa: "/θɪŋk/", pattern: "/θ/ jadi /t/" },
  { word: "this", ipa: "/ðɪs/", pattern: "/ð/ jadi /d/" },
  { word: "shop", ipa: "/ʃɒp/", pattern: "/ʃ/ jadi /s/" },
  { word: "worked", ipa: "/wɜːkt/", pattern: "-ed akhir hilang" },
];

export interface LoginWorkspaceProps {
  testingUsers: UserProfileDTO[];
  showTestAccounts: boolean;
  currentUserId?: string;
}

export function LoginWorkspace({
  testingUsers,
  showTestAccounts,
  currentUserId,
}: LoginWorkspaceProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [pdpConsent, setPdpConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [resetMsg, setResetMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setErrorMsg(null);
    setPassword("");
  };

  const postAuth = async (url: string, body: unknown, fallbackError: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? fallbackError);
        setLoading(false);
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setErrorMsg("Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.");
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void postAuth("/api/v1/auth/login", { email, password }, "Gagal masuk ke akun.");
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Nama panggilan dan email wajib diisi.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMsg(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }
    if (!pdpConsent) {
      setErrorMsg("Centang persetujuan pemrosesan suara dulu supaya ucapanmu bisa dinilai.");
      return;
    }
    void postAuth(
      "/api/v1/auth/register",
      { name, email, password },
      "Gagal membuat akun."
    );
  };

  const handleQuickLogin = (user: UserProfileDTO) => {
    void postAuth(
      "/api/v1/auth/login",
      { testAccountId: user.id },
      "Gagal masuk dengan akun testing."
    );
  };

  const handleResetDatabase = async () => {
    setErrorMsg(null);
    setResetMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: TEST_ACCOUNT_FRESH_ID }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Gagal me-reset data testing.");
        return;
      }
      setResetMsg(data.message);
      window.setTimeout(() => {
        router.push(data.redirectTo ?? "/mulai");
        router.refresh();
      }, 500);
    } catch {
      setErrorMsg("Tidak bisa terhubung ke server. Periksa koneksimu lalu coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
      <aside className="flex flex-col gap-10 bg-[var(--side-bg)] p-7 text-[var(--side-text)] lg:sticky lg:top-0 lg:h-screen lg:justify-between lg:p-10">
        <Link href="/masuk" className="w-fit text-[#F7F5EE] no-underline">
          <span className="font-display text-3xl font-extrabold tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
            Ucapin
          </span>
          <span className="mt-1 block font-ipa text-sm text-[var(--side-text-2)]">
            /ʊˈtʃapɪn/
          </span>
        </Link>

        <section aria-labelledby="patterns-title" className="hidden lg:block">
          <h2
            id="patterns-title"
            className="font-display text-base font-bold text-[#F7F5EE]"
          >
            Lima bunyi yang paling sering tertukar
          </h2>
          <p className="mt-1 text-sm text-[var(--side-text-2)]">
            Ucapin mencatat bunyi ini setiap kamu bicara, lalu menjadikannya
            latihan besok.
          </p>
          <ul className="mt-4 divide-y divide-[rgba(212,200,183,0.16)] border-y border-[rgba(212,200,183,0.16)]">
            {SOUND_PATTERNS.map((p) => (
              <li
                key={p.word}
                className="flex items-baseline justify-between gap-3 py-2.5"
              >
                <span className="flex items-baseline gap-2">
                  <span
                    lang="en"
                    className="font-display text-lg font-bold text-[#F7F5EE]"
                  >
                    {p.word}
                  </span>
                  <span lang="en" className="font-ipa text-sm text-[var(--side-text-2)]">
                    {p.ipa}
                  </span>
                </span>
                <span className="text-xs font-semibold text-[#F2937C]">
                  {p.pattern}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div>
          <p className="font-display text-2xl font-extrabold leading-tight text-[#F7F5EE]">
            Ubah salah ucap kemarin jadi lancar hari ini.
          </p>
          <p className="mt-2 text-sm text-[var(--side-text-2)]">
            Tanpa skor aksen. Yang diukur hanya seberapa jelas ucapanmu
            dipahami dan seberapa rutin kamu berlatih.
          </p>
        </div>
      </aside>

      <main
        id="main-content"
        className="flex w-full max-w-xl flex-col gap-6 px-5 py-8 sm:px-10 lg:mx-auto lg:justify-center lg:py-12"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold">
              {mode === "login" ? "Masuk ke Ucapin" : "Buat akun Ucapin"}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-2)]">
              {mode === "login"
                ? "Lanjutkan latihan bicaramu dari terakhir kali."
                : "Dua menit untuk daftar, lalu langsung pilih tujuan belajarmu."}
            </p>
          </div>
          <ThemeToggle onLightSurface compact />
        </div>

        <Card className="p-6">
          <div
            className="mb-5 grid grid-cols-2 rounded-[12px] border border-[var(--line)] bg-[var(--bg)] p-1"
            role="tablist"
            aria-label="Pilih masuk atau daftar"
          >
            {(
              [
                { key: "login", label: "Masuk", icon: LogIn },
                { key: "register", label: "Daftar", icon: UserPlus },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => switchMode(key)}
                className={cn(
                  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[9px] px-4 text-sm font-bold transition-colors",
                  mode === key
                    ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)]"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 rounded-control border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] px-4 py-3 text-sm font-bold text-[var(--work-text)]"
            >
              {errorMsg}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="login-password">Kata sandi</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="mt-1 w-full">
                <span>{loading ? "Memeriksa..." : "Masuk"}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <p className="text-center text-sm text-[var(--text-2)]">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-bold text-[var(--link)] underline"
                >
                  Daftar di sini
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="reg-name">Nama panggilan</Label>
                <Input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="nickname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="reg-password">Kata sandi</Label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  aria-describedby="reg-password-hint"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p id="reg-password-hint" className="text-xs text-[var(--text-2)]">
                  Minimal {MIN_PASSWORD_LENGTH} karakter.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-control border border-[var(--line)] bg-[var(--bg)] p-3 text-xs leading-relaxed">
                <input
                  type="checkbox"
                  checked={pdpConsent}
                  onChange={(e) => setPdpConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--coral)]"
                />
                <span>
                  Saya setuju rekaman suara saya dikirim ke layanan pengenal
                  suara (ElevenLabs) hanya untuk menilai kejelasan ucapan, sesuai
                  UU PDP No. 27/2022. Ucapin <strong>tidak menyimpan</strong>{" "}
                  rekaman kecuali saya mengaktifkannya di pengaturan mikrofon.
                </span>
              </label>

              <Button type="submit" variant="accent" disabled={loading} className="w-full">
                <span>{loading ? "Membuat akun..." : "Daftar dan pilih tujuan"}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          )}
        </Card>

        {showTestAccounts && (
          <details className="group rounded-card border-[1.5px] border-dashed border-[var(--line)] p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold">
              <span>Akun testing (mode pengembangan)</span>
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-2 text-xs text-[var(--text-2)]">
              Hanya muncul saat <code>next dev</code> dan{" "}
              <code>ENABLE_TEST_ACCOUNTS=&quot;true&quot;</code>. Email dan sandinya
              diatur di <code>.env.local</code>.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {testingUsers.map((u) => {
                const isFreshAccount = u.id === TEST_ACCOUNT_FRESH_ID;
                const isCurrent = u.id === currentUserId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center gap-3 rounded-control border-[1.5px] border-[var(--line)] bg-[var(--surface)] p-3 text-left transition-colors hover:border-[var(--text-2)] disabled:opacity-60"
                  >
                    <UserCheck className="h-5 w-5 shrink-0 text-[var(--text-2)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">
                        {isFreshAccount ? "Pelajar baru" : "Pelajar aktif"}
                      </span>
                      <span className="block truncate text-xs text-[var(--text-2)]">
                        {u.name} ·{" "}
                        {u.onboardingCompleted ? `level ${u.cefrLevel}` : "belum onboarding"}
                      </span>
                    </span>
                    {isCurrent && (
                      <Badge variant="ok">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        <span>Aktif</span>
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--text-2)]">
                Hapus semua data dan isi ulang dari seed.
              </p>
              <Button
                type="button"
                variant="surface"
                size="sm"
                disabled={loading}
                onClick={handleResetDatabase}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset data testing</span>
              </Button>
            </div>
            {resetMsg && (
              <p
                role="status"
                className="mt-2.5 rounded-control bg-[var(--ok-wash)] px-3 py-2 text-xs font-bold text-[var(--ok)]"
              >
                {resetMsg}
              </p>
            )}
          </details>
        )}
      </main>
    </div>
  );
}
