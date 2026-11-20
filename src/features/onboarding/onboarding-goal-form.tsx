"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  MessageSquare,
  Mic,
  Volume2,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

const GOAL_OPTIONS = [
  {
    id: "kerja",
    title: "Wawancara dan kerja",
    desc: "Perkenalan diri, rapat, presentasi singkat",
    scenarioPreview: "Wawancara kerja di startup (bersama Rina, HR Lead)",
    phonemeFocus: "Akhiran -ed (worked, solved), /θ/ (think), /v/ (version)",
    Icon: Mic,
    tileClass: "bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]",
  },
  {
    id: "jalan",
    title: "Jalan-jalan ke luar negeri",
    desc: "Bandara, hotel, tanya arah",
    scenarioPreview: "Check-in hotel di Singapura (bersama Liam, Resepsionis)",
    phonemeFocus: "/ʃ/ (shuttle, station), -d akhir (card), /θ/ (third)",
    Icon: MessageSquare,
    tileClass: "bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]",
  },
  {
    id: "ielts",
    title: "IELTS atau kuliah di luar negeri",
    desc: "Latihan speaking test Part 1-3",
    scenarioPreview: "Simulasi IELTS Speaking Part 1 (bersama Dr. Claire)",
    phonemeFocus: "/θ/ (both, methods), -vd akhir (lived), /v/ (invest)",
    Icon: BookOpen,
    tileClass: "bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]",
  },
  {
    id: "harian",
    title: "Ngobrol sehari-hari",
    desc: "Basa-basi, kafe, teman baru",
    scenarioPreview: "Memesan di kafe Bean Corner (bersama Sam, Barista)",
    phonemeFocus: "/v/ (very, visit), /ð/ (this, they), /θ/ (thank)",
    Icon: Volume2,
    tileClass: "bg-[var(--tile-green)] text-[var(--tile-green-fg)]",
  },
];

const LEVEL_OPTIONS = [
  { id: "A1", desc: "Baru tahu beberapa kata" },
  { id: "A2", desc: "Bisa kalimat sederhana" },
  { id: "B1", desc: "Bisa ngobrol sehari-hari" },
  { id: "B2", desc: "Bisa bahas banyak topik" },
  { id: "C1", desc: "Lancar, ingin lebih rapi" },
];

const MINUTE_OPTIONS = [
  { val: 5, desc: "Santai" },
  { val: 10, desc: "Rutin" },
  { val: 15, desc: "Serius" },
  { val: 20, desc: "Intensif" },
];

export function OnboardingGoalForm({ user }: { user: UserProfileDTO }) {
  const router = useRouter();
  const [goals, setGoals] = React.useState<string[]>(user.goals);
  const [level, setLevel] = React.useState<string>(user.cefrLevel || "A2");
  const [minutes, setMinutes] = React.useState<number>(
    user.dailyTargetMinutes || 10
  );
  const [isReconfiguring, setIsReconfiguring] = React.useState<boolean>(
    user.onboardingCompleted
  );
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Always fetch latest user preferences from PostgreSQL on mount to bypass any router cache
  React.useEffect(() => {
    let active = true;
    fetch("/api/v1/onboarding", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!active || !data?.ok || !data?.user) return;
        const fresh: UserProfileDTO = data.user;
        setGoals(Array.isArray(fresh.goals) ? fresh.goals : []);
        setLevel(fresh.cefrLevel || "A2");
        setMinutes(fresh.dailyTargetMinutes || 10);
        setIsReconfiguring(Boolean(fresh.onboardingCompleted));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const toggleGoal = (id: string) => {
    setSavedSuccess(false);
    setGoals((prev) => {
      const next = prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id];
      if (next.length > 0) setError(false);
      return next;
    });
  };

  const selectedGoalDetails = GOAL_OPTIONS.filter((g) => goals.includes(g.id));

  const savePreferencesToDb = async () => {
    if (goals.length === 0) {
      setError(true);
      return false;
    }
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          cefrLevel: level,
          dailyTargetMinutes: minutes,
        }),
      });
      const data = await res.json();
      return Boolean(data?.ok);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await savePreferencesToDb();
    if (!ok) return;

    if (isReconfiguring) {
      setSavedSuccess(true);
      router.refresh();
    } else {
      router.push("/cek-mikrofon");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* Left Brand Panel: Real-time Curriculum Plan Summary */}
      <aside className="flex flex-col justify-between gap-8 bg-[var(--side-bg)] p-7 text-[var(--side-text)] lg:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[#F7F5EE] no-underline">
            <span className="font-display text-3xl font-extrabold tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
              Ucapin
            </span>
          </Link>
          <Badge variant="teal">
            {isReconfiguring ? "Pengaturan Preferensi" : "Langkah 1 / 3"}
          </Badge>
        </div>

        <div className="rounded-[18px] border border-[rgba(212,200,183,0.32)] bg-[rgba(19,41,46,0.55)] p-5 text-[#F7F5EE]">
          <div className="flex items-center justify-between border-b border-[rgba(212,200,183,0.22)] pb-3">
            <div>
              <p className="text-xs font-bold text-[#D4C8B7]">
                Rencana Belajar Akun
              </p>
              <p className="font-display text-lg font-bold text-[#F7F5EE]">
                {user.name} ({user.email})
              </p>
            </div>
            <span className="rounded-[8px] bg-[rgba(255,122,89,0.2)] px-2.5 py-1 font-display text-xs font-extrabold text-[#FF9B80]">
              Level {level}
            </span>
          </div>

          <div className="mt-3.5 grid gap-3 text-xs">
            <div>
              <p className="font-bold text-[#D4C8B7]">
                Tujuan tersimpan / dipilih ({selectedGoalDetails.length}):
              </p>
              {selectedGoalDetails.length > 0 ? (
                <ul className="mt-1.5 grid gap-2">
                  {selectedGoalDetails.map((g) => (
                    <li
                      key={g.id}
                      className="rounded-[10px] border border-[rgba(212,200,183,0.2)] bg-[rgba(247,245,238,0.06)] p-2.5"
                    >
                      <p className="flex items-center gap-1.5 font-bold text-[#7CC7A0]">
                        <Check className="h-3.5 w-3.5" />
                        <span>{g.title}</span>
                      </p>
                      <p className="mt-1 text-[#E8E5D7]">
                        <strong>Roleplay:</strong> {g.scenarioPreview}
                      </p>
                      <p className="mt-0.5 text-[#D4C8B7]">
                        <strong>Fokus bunyi:</strong> {g.phonemeFocus}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 rounded-[10px] border border-dashed border-[rgba(212,200,183,0.3)] p-3 text-[#D4C8B7]">
                  Belum ada tujuan dipilih. Centang minimal satu tujuan di
                  formulir sebelah kanan untuk menyusun paket latihanmu.
                </p>
              )}
            </div>

            <div className="border-t border-[rgba(212,200,183,0.2)] pt-3">
              <div className="flex items-center justify-between text-[11px] text-[#D4C8B7]">
                <span>Progres bicara hari ini</span>
                <span className="font-display font-bold tabular-nums text-[#F7F5EE]">
                  {user.spokenTodayMinutes} / {minutes} mnt
                </span>
              </div>
              <div
                className="mt-1.5 grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${minutes}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: minutes }).map((_, i) => (
                  <i
                    key={i}
                    className={cn(
                      "block h-2.5 rounded-[3px] border",
                      i < user.spokenTodayMinutes
                        ? "border-[var(--coral)] bg-[var(--coral)]"
                        : "border-[rgba(212,200,183,0.28)] bg-[rgba(247,245,238,0.08)]"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#F7F5EE]">
            Bicara dulu, sempurna belakangan.
          </h2>
          <p className="mt-2 text-sm text-[var(--side-text)]">
            Setiap perubahan yang kamu simpan langsung diperbarui di tabel{" "}
            <code>User</code> pada PostgreSQL Laragon.
          </p>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main
        id="main-content"
        className="flex max-w-4xl flex-col gap-7 p-6 sm:p-10"
      >
        <div className="flex items-center gap-4">
          <Button asChild variant="quiet" size="sm">
            <Link
              href={isReconfiguring ? "/" : "/masuk"}
              aria-label="Kembali"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          {!isReconfiguring ? (
            <>
              <ol
                aria-label="Langkah 1 dari 3"
                className="grid flex-1 grid-cols-3 gap-2"
              >
                <li className="h-2.5 rounded-full bg-[var(--coral)]" />
                <li className="h-2.5 rounded-full bg-[var(--line)]" />
                <li className="h-2.5 rounded-full bg-[var(--line)]" />
              </ol>
              <span className="text-xs font-bold text-[var(--text)]">
                Langkah 1 dari 3 · Tujuan Belajar
              </span>
            </>
          ) : (
            <span className="flex-1 text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
              Pengaturan Tujuan, Level & Target Harian
            </span>
          )}
          <ThemeToggle onLightSurface />
        </div>

        <header>
          <h1 className="font-display text-3xl font-extrabold">
            {isReconfiguring
              ? "Atur ulang tujuan dan target belajarmu"
              : "Kamu ingin bisa bicara bahasa Inggris untuk apa?"}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Pilihan yang sudah kamu simpan otomatis tercentang dari database.
            Ubah kapan saja untuk mengganti fokus latihan dan skenario roleplay.
          </p>
        </header>

        {savedSuccess && (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-3 rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] px-5 py-3.5"
          >
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--ok)]">
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>
                Preferensi berhasil disimpan ke PostgreSQL Laragon!
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="default">
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
              <Button asChild size="sm" variant="accent">
                <Link href="/latihan-ucapan">Buka Latihan Ucapan</Link>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Tujuan belajar (boleh pilih lebih dari satu)
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOAL_OPTIONS.map((g) => {
                const checked = goals.includes(g.id);
                const Icon = g.Icon;
                return (
                  <label
                    key={g.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-control border-2 p-4 font-semibold transition-all",
                      checked
                        ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                        : "border-[var(--line)] bg-[var(--surface)]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleGoal(g.id)}
                      className="h-4 w-4 accent-[var(--coral)]"
                    />
                    <span className="flex-1">
                      {g.title}
                      <small className="block text-xs font-normal text-[var(--text-2)]">
                        {g.desc}
                      </small>
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-[12px]",
                        g.tileClass
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </label>
                );
              })}
            </div>
            {error && (
              <p
                role="alert"
                className="mt-2 text-sm font-bold text-[var(--work-text)]"
              >
                Pilih minimal satu tujuan belajar terlebih dahulu.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Seberapa nyaman kamu bicara bahasa Inggris saat ini?
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {LEVEL_OPTIONS.map((lv) => (
                <label
                  key={lv.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-control border-2 p-3 font-semibold transition-all",
                    level === lv.id
                      ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  )}
                >
                  <input
                    type="radio"
                    name="level"
                    value={lv.id}
                    checked={level === lv.id}
                    onChange={() => {
                      setSavedSuccess(false);
                      setLevel(lv.id);
                    }}
                    className="mt-1 h-4 w-4 accent-[var(--coral)]"
                  />
                  <span>
                    {lv.id}
                    <small className="block text-xs font-normal text-[var(--text-2)]">
                      {lv.desc}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Target bicara per hari
            </legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MINUTE_OPTIONS.map((m) => (
                <label
                  key={m.val}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 rounded-control border-2 p-3 font-semibold transition-all",
                    minutes === m.val
                      ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  )}
                >
                  <input
                    type="radio"
                    name="menit"
                    value={m.val}
                    checked={minutes === m.val}
                    onChange={() => {
                      setSavedSuccess(false);
                      setMinutes(m.val);
                    }}
                    className="mt-1 h-4 w-4 accent-[var(--coral)]"
                  />
                  <span>
                    {m.val} menit
                    <small className="block text-xs font-normal text-[var(--text-2)]">
                      {m.desc}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-[var(--line)] pt-5">
            {isReconfiguring ? (
              <Link
                href="/cek-mikrofon"
                className="text-sm font-semibold text-[var(--link)] underline"
              >
                Buka Pengaturan Mikrofon & Privasi
              </Link>
            ) : (
              <Link href="/masuk" className="text-sm font-semibold underline">
                Ganti akun
              </Link>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {isReconfiguring && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={async () => {
                    const ok = await savePreferencesToDb();
                    if (ok) {
                      router.push("/cek-mikrofon");
                      router.refresh();
                    }
                  }}
                >
                  Simpan & Cek Mikrofon
                </Button>
              )}
              <Button type="submit" variant="accent" disabled={saving}>
                <span>
                  {saving
                    ? "Menyimpan ke Database..."
                    : isReconfiguring
                    ? "Simpan Perubahan Preferensi"
                    : "Simpan & Lanjut ke Cek Mikrofon (Langkah 2/3)"}
                </span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
