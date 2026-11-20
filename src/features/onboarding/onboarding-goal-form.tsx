"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Mic,
  Volume2,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PhoneticSpecimenCard } from "@/components/shared/phonetic-specimen-card";
import { Button } from "@/components/ui/button";
import type { UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

const GOAL_OPTIONS = [
  {
    id: "kerja",
    title: "Wawancara dan kerja",
    desc: "Perkenalan diri, rapat, presentasi singkat",
    Icon: Mic,
    tileClass: "bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]",
  },
  {
    id: "jalan",
    title: "Jalan-jalan ke luar negeri",
    desc: "Bandara, hotel, tanya arah",
    Icon: MessageSquare,
    tileClass: "bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]",
  },
  {
    id: "ielts",
    title: "IELTS atau kuliah di luar negeri",
    desc: "Latihan speaking test",
    Icon: BookOpen,
    tileClass: "bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]",
  },
  {
    id: "harian",
    title: "Ngobrol sehari-hari",
    desc: "Basa-basi, kafe, teman baru",
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
  const [level, setLevel] = React.useState<string>(user.cefrLevel);
  const [minutes, setMinutes] = React.useState<number>(
    user.dailyTargetMinutes
  );
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const toggleGoal = (id: string) => {
    setGoals((prev) => {
      const next = prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id];
      if (next.length > 0) setError(false);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goals.length === 0) {
      setError(true);
      return;
    }
    setSaving(true);
    try {
      await fetch("/api/v1/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          cefrLevel: level,
          dailyTargetMinutes: minutes,
        }),
      });
    } finally {
      setSaving(false);
      router.push("/cek-mikrofon");
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* Left Brand Panel with Editorial Phonetic Specimen (No floating bubble overlap) */}
      <aside className="flex flex-col justify-between gap-8 bg-[var(--side-bg)] p-7 text-[var(--side-text)] lg:p-10">
        <Link href="/" className="text-[#F7F5EE] no-underline">
          <span className="font-display text-3xl font-extrabold tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
            Ucapin
          </span>
        </Link>

        <div className="hidden lg:block">
          <PhoneticSpecimenCard
            variant="onboarding"
            spokenMinutes={minutes}
            targetMinutes={minutes}
          />
        </div>

        <div>
          <h2 className="font-display text-3xl font-extrabold text-[#F7F5EE]">
            Bicara dulu, sempurna belakangan.
          </h2>
          <p className="mt-2 text-sm text-[var(--side-text)]">
            Latihan 5 sampai 15 menit sehari. Kamu yang menentukan kapan
            dikoreksi.
          </p>
          <div className="mt-5 hidden grid-cols-3 gap-2.5 lg:grid">
            <div className="rounded-[14px] bg-[rgba(247,245,238,0.08)] p-3">
              <b className="block font-display text-lg font-extrabold text-[#F7F5EE]">
                5-15
              </b>
              <small className="text-xs text-[var(--side-text-2)]">
                menit sehari
              </small>
            </div>
            <div className="rounded-[14px] bg-[rgba(247,245,238,0.08)] p-3">
              <b className="block font-display text-lg font-extrabold text-[#F7F5EE]">
                4
              </b>
              <small className="text-xs text-[var(--side-text-2)]">
                mode latihan
              </small>
            </div>
            <div className="rounded-[14px] bg-[rgba(247,245,238,0.08)] p-3">
              <b className="block font-display text-lg font-extrabold text-[#F7F5EE]">
                A1-C1
              </b>
              <small className="text-xs text-[var(--side-text-2)]">
                semua level
              </small>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Form Panel */}
      <main id="main-content" className="flex max-w-4xl flex-col gap-7 p-6 sm:p-10">
        <div className="flex items-center gap-4">
          <Button asChild variant="quiet" size="sm">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <ol
            aria-label="Langkah 2 dari 4"
            className="grid flex-1 grid-cols-4 gap-1.5"
          >
            <li className="h-2 rounded-full bg-[var(--coral)]" />
            <li className="h-2 rounded-full bg-[var(--coral)]" />
            <li className="h-2 rounded-full bg-[var(--line)]" />
            <li className="h-2 rounded-full bg-[var(--line)]" />
          </ol>
          <span className="text-xs font-semibold text-[var(--text-2)]">
            Langkah 2 dari 4
          </span>
          <ThemeToggle onLightSurface />
        </div>

        <header>
          <h1 className="font-display text-3xl font-extrabold">
            Kamu ingin bisa bicara bahasa Inggris untuk apa?
          </h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Kami pilihkan roleplay dan kosakata yang cocok. Disimpan langsung ke
            profilmu di database Laragon.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Tujuan (boleh lebih dari satu)
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
                Pilih minimal satu tujuan dulu ya.
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Seberapa nyaman kamu bicara bahasa Inggris?
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
                    onChange={() => setLevel(lv.id)}
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
                    onChange={() => setMinutes(m.val)}
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
            <p className="mt-2.5 text-xs text-[var(--text-2)]">
              Kamu dapat 2 jatah libur per bulan. Bolos sehari tidak menghapus
              progres.
            </p>
          </fieldset>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-[var(--line)] pt-5">
            <Link href="/" className="text-sm font-semibold underline">
              Lewati dulu
            </Link>
            <Button type="submit" disabled={saving}>
              <span>
                {saving ? "Menyimpan..." : "Lanjut ke cek mikrofon"}
              </span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
