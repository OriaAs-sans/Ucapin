"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  LogIn,
  RotateCcw,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PhoneticSpecimenCard } from "@/components/shared/phonetic-specimen-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

export interface LoginWorkspaceProps {
  testingUsers: UserProfileDTO[];
  currentUserId?: string;
}

export function LoginWorkspace({
  testingUsers,
  currentUserId,
}: LoginWorkspaceProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("baru@ucapin.id");
  const [password, setPassword] = React.useState("ucapin123");
  const [name, setName] = React.useState("");
  const [pdpConsent, setPdpConsent] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [resetMsg, setResetMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Gagal masuk ke akun.");
        setLoading(false);
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name.trim() || !email.trim()) {
      setErrorMsg("Nama lengkap dan email wajib diisi.");
      return;
    }
    if (!pdpConsent) {
      setErrorMsg(
        "Harap centang persetujuan pemrosesan data suara sesuai UU PDP."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error ?? "Gagal mendaftarkan akun.");
        setLoading(false);
        return;
      }
      router.push(data.redirectTo ?? "/mulai");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: UserProfileDTO) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(data.redirectTo ?? "/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async (targetUserId: string) => {
    setErrorMsg(null);
    setResetMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });
      const data = await res.json();
      if (data.ok) {
        setResetMsg(data.message);
        window.setTimeout(() => {
          router.push(data.redirectTo ?? "/mulai");
          router.refresh();
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[440px_minmax(0,1fr)]">
      {/* Left Editorial Brand & Phonetic Specimen Column */}
      <aside className="flex flex-col justify-between gap-8 bg-[var(--side-bg)] p-7 text-[var(--side-text)] lg:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[#F7F5EE] no-underline">
            <span className="font-display text-3xl font-extrabold tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
              Ucapin
            </span>
            <span className="mt-1 block font-ipa text-sm text-[var(--side-text-2)]">
              /ʊˈtʃapɪn/
            </span>
          </Link>
          <Badge variant="teal">PostgreSQL Laragon</Badge>
        </div>

        <div className="hidden lg:grid lg:gap-4">
          <div className="rounded-[18px] border border-[rgba(212,200,183,0.32)] bg-[rgba(19,41,46,0.55)] p-5 text-[#F7F5EE]">
            <div className="flex items-center justify-between border-b border-[rgba(212,200,183,0.22)] pb-3">
              <span className="text-xs font-bold text-[#D4C8B7]">
                Status Database PostgreSQL Laragon
              </span>
              <span className="rounded-[8px] bg-[rgba(124,199,160,0.18)] px-2.5 py-0.5 text-xs font-bold text-[#7CC7A0]">
                Terhubung · 127.0.0.1:5432
              </span>
            </div>
            <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-[10px] bg-[rgba(247,245,238,0.06)] p-2.5">
                <b className="block font-display text-xl font-extrabold text-[#F7F5EE]">
                  {testingUsers.length} Akun
                </b>
                <span className="text-[#D4C8B7]">Tabel User aktif</span>
              </div>
              <div className="rounded-[10px] bg-[rgba(247,245,238,0.06)] p-2.5">
                <b className="block font-display text-xl font-extrabold text-[#F7F5EE]">
                  12 Kalimat
                </b>
                <span className="text-[#D4C8B7]">4 tujuan belajar</span>
              </div>
              <div className="rounded-[10px] bg-[rgba(247,245,238,0.06)] p-2.5">
                <b className="block font-display text-xl font-extrabold text-[#F7F5EE]">
                  4 Skenario
                </b>
                <span className="text-[#D4C8B7]">12 node dialog</span>
              </div>
              <div className="rounded-[10px] bg-[rgba(247,245,238,0.06)] p-2.5">
                <b className="block font-display text-xl font-extrabold text-[#F7F5EE]">
                  5 Fonem
                </b>
                <span className="text-[#D4C8B7]">Katalog artikulasi</span>
              </div>
            </div>
          </div>

          <div className="rounded-[16px] border border-[rgba(212,200,183,0.22)] bg-[rgba(247,245,238,0.06)] p-4 text-xs leading-relaxed text-[#D4C8B7]">
            <p className="font-bold text-[#F7F5EE]">
              Alur Testing End-to-End (3 Langkah Onboarding + Latihan):
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>
                <strong>Masuk / Daftar</strong> di halaman ini (<code>/masuk</code>).
              </li>
              <li>
                <strong>Langkah 1/3: Tujuan Belajar</strong> (<code>/mulai</code>: mulai dari 0 pilihan, 0/10 menit).
              </li>
              <li>
                <strong>Langkah 2/3: Cek Mikrofon & Privasi</strong> (<code>/cek-mikrofon</code>).
              </li>
              <li>
                <strong>Langkah 3/3: Latihan Pertama</strong> (<code>/latihan-ucapan?onboarding=1</code>).
              </li>
              <li>
                <strong>Hasil Sesi</strong> (<code>/hasil</code>),{" "}
                <strong>Bank Kesalahan</strong> (<code>/bank-kesalahan</code>), dan{" "}
                <strong>Beranda</strong> (<code>/</code>) otomatis ter-update di database.
              </li>
            </ol>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#F7F5EE]">
            Ubah salah ucap kemarin jadi lancar hari ini.
          </h2>
          <p className="mt-2 text-sm text-[var(--side-text-2)]">
            Tanpa skor aksen. Hanya mengukur seberapa jelas ucapanmu dipahami
            dan seberapa rutin kamu berlatih.
          </p>
        </div>
      </aside>

      {/* Right Authentication & Quick E2E Testing Panel */}
      <main
        id="main-content"
        className="flex max-w-3xl flex-col gap-7 p-6 sm:p-10"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
              Pintu Masuk & Pengujian Alur
            </p>
            <h1 className="font-display text-3xl font-extrabold">
              Masuk atau mulai dari awal
            </h1>
          </div>
          <ThemeToggle onLightSurface />
        </div>

        {/* 1-Click End-to-End Testing Accounts Card */}
        <Card className="border-2 border-[var(--btn-bg)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="coral">Pintasan Testing E2E</Badge>
                <span className="text-xs text-[var(--text-2)]">
                  Terhubung ke tabel User di PostgreSQL Laragon
                </span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold">
                Pilih skenario akun dengan 1 klik
              </h2>
              <p className="text-sm text-[var(--text-2)]">
                Pilih <strong>Pelajar Baru</strong> untuk menguji alur dari
                Tujuan Belajar (`/mulai`), atau <strong>Pelajar Aktif</strong>{" "}
                untuk langsung masuk ke Beranda (`/`).
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {testingUsers.map((u) => {
              const isFresh = !u.onboardingCompleted;
              const isCurrent = u.id === currentUserId;
              return (
                <div
                  key={u.id}
                  className={cn(
                    "flex flex-col justify-between gap-3 rounded-control border-2 p-4 transition-all",
                    isFresh
                      ? "border-[var(--coral)] bg-[var(--tile-coral)]/45"
                      : "border-[var(--line)] bg-[var(--bg)]"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "grid h-9 w-9 place-items-center rounded-full font-display text-xs font-extrabold",
                            isFresh
                              ? "bg-[var(--coral)] text-[var(--on-coral)]"
                              : "bg-[var(--teal-800)] text-[#F7F5EE]"
                          )}
                        >
                          {u.initials}
                        </span>
                        <div>
                          <p className="font-display text-base font-bold leading-tight">
                            {u.name}
                          </p>
                          <p className="text-xs text-[var(--text-2)]">
                            {u.email}
                          </p>
                        </div>
                      </span>
                      {isCurrent && (
                        <Badge variant="ok">
                          <Check className="h-3 w-3" />
                          <span>Aktif</span>
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-[var(--text)]">
                      <p>
                        <strong>Status:</strong>{" "}
                        {isFresh
                          ? "Akun Baru (0 menit, belum onboarding)"
                          : `Aktif (${u.spokenTodayMinutes}/${u.dailyTargetMinutes} mnt, streak ${u.streakDays} hari)`}
                      </p>
                      <p>
                        <strong>Arah setelah klik:</strong>{" "}
                        {isFresh
                          ? "Buka /mulai -> /cek-mikrofon -> Latihan"
                          : "Langsung buka Beranda (/)"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={isFresh ? "accent" : "default"}
                    size="sm"
                    disabled={loading}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full"
                  >
                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {isFresh
                        ? "Uji Alur dari Awal (/mulai)"
                        : "Masuk ke Beranda (Alya B1)"}
                    </span>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3.5">
            <p className="text-xs text-[var(--text-2)]">
              Ingin mengulang testing dari kondisi database bersih?
            </p>
            <Button
              type="button"
              variant="surface"
              size="sm"
              disabled={loading}
              onClick={() => handleResetDatabase("learner-baru")}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Data Laragon & Mulai dari Nol</span>
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
        </Card>

        {/* Manual Login / Register Form Card */}
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
            <div
              className="inline-flex rounded-[12px] border border-[var(--line)] bg-[var(--bg)] p-1"
              role="tablist"
              aria-label="Pilih masuk atau daftar"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "login"}
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[9px] px-4 py-2 text-sm font-bold transition-colors",
                  mode === "login"
                    ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)]"
                )}
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Masuk dengan Email</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "register"}
                onClick={() => {
                  setMode("register");
                  setErrorMsg(null);
                  setEmail("");
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[9px] px-4 py-2 text-sm font-bold transition-colors",
                  mode === "register"
                    ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                    : "text-[var(--text-2)] hover:text-[var(--text)]"
                )}
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                <span>Daftar Akun Baru</span>
              </button>
            </div>

            <span className="text-xs text-[var(--text-2)]">
              Sandi default akun testing: <code>ucapin123</code>
            </span>
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
                <Label htmlFor="login-email">Alamat Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="baru@ucapin.id atau alya@ucapin.id"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="login-password">Kata Sandi</Label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("baru@ucapin.id");
                      setPassword("ucapin123");
                    }}
                    className="font-semibold text-[var(--link)] underline"
                  >
                    Isi email Pelajar Baru
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("alya@ucapin.id");
                      setPassword("ucapin123");
                    }}
                    className="font-semibold text-[var(--link)] underline"
                  >
                    Isi email Alya (B1)
                  </button>
                </div>

                <Button type="submit" disabled={loading}>
                  <span>{loading ? "Memproses..." : "Masuk Sekarang"}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="reg-name">Nama Panggilan / Lengkap</Label>
                <Input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dimas Pratama"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="reg-email">Alamat Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dimas@contoh.id"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="reg-password">Buat Kata Sandi</Label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-control border border-[var(--line)] bg-[var(--bg)] p-3 text-xs">
                <input
                  type="checkbox"
                  checked={pdpConsent}
                  onChange={(e) => setPdpConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--coral)]"
                />
                <span>
                  Saya menyetujui ketentuan privasi (UU PDP No. 27/2022):
                  rekaman suara hanya diproses untuk penilaian kejelasan ucapan
                  dan <strong>tidak disimpan</strong> kecuali saya mengaktifkan
                  opsi simpan rekaman di pengaturan mikrofon.
                </span>
              </label>

              <div className="mt-2 flex justify-end">
                <Button type="submit" variant="accent" disabled={loading}>
                  <span>
                    {loading
                      ? "Membuat Akun..."
                      : "Daftar & Pilih Tujuan Belajar"}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
