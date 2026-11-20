"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clock,
  Flame,
  MessageSquare,
  Mic,
  Volume2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PhoneticSpecimenCard } from "@/components/shared/phonetic-specimen-card";
import { PhoneticWordRow } from "@/components/shared/phonetic-word-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  DailyActivityDTO,
  LeagueEntryDTO,
  MistakeItemDTO,
  UserProfileDTO,
} from "@/types/ucapin";
import { cn } from "@/lib/utils";

export interface DashboardWorkspaceProps {
  user: UserProfileDTO;
  mistakes: MistakeItemDTO[];
  weeklyActivities: DailyActivityDTO[];
  league: LeagueEntryDTO[];
  drillSentenceCount: number;
  scenarioCount: number;
  completedSessionCount: number;
  activeScenario: {
    slug: string;
    goalTag: string;
    title: string;
    characterName: string;
    characterRole: string;
    cefrLevel: string;
    lastPrompt: string;
    missions: string[];
    completedMissionsCount: number;
  } | null;
}

export function DashboardWorkspace({
  user,
  mistakes,
  weeklyActivities,
  league,
  drillSentenceCount,
  scenarioCount,
  completedSessionCount,
  activeScenario,
}: DashboardWorkspaceProps) {
  const dailyPct = Math.min(
    100,
    Math.round(
      (user.spokenTodayMinutes / Math.max(1, user.dailyTargetMinutes)) * 100
    )
  );
  const remainingMinutes = Math.max(
    0,
    user.dailyTargetMinutes - user.spokenTodayMinutes
  );
  const weeklyTotalMinutes = weeklyActivities.reduce(
    (acc, a) => acc + a.minutesSpoken,
    0
  );
  const maxDayMinutes = Math.max(
    user.dailyTargetMinutes,
    ...weeklyActivities.map((a) => a.minutesSpoken),
    10
  );
  const topMistake = mistakes[0] ?? null;

  const rightPanel = (
    <>
      <div className="grid justify-items-center gap-2 text-center">
        <span
          aria-hidden="true"
          className="grid h-[76px] w-[76px] place-items-center rounded-full bg-[var(--coral)] font-display text-2xl font-extrabold text-[var(--on-coral)]"
        >
          {user.initials}
        </span>
        <h2 className="font-display text-xl font-bold">{user.name}</h2>
        <Badge variant="teal">
          Level {user.cefrLevel} · {completedSessionCount} sesi selesai
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="grid justify-items-center gap-0.5 rounded-[16px] bg-[var(--tile-coral)] px-2 py-3.5 text-center text-[var(--tile-coral-fg)]">
          <Flame className="h-5 w-5" aria-hidden="true" />
          <b className="font-display text-2xl font-extrabold text-[var(--text)] tabular-nums">
            {user.streakDays}
          </b>
          <small className="text-xs text-[var(--text-2)]">hari</small>
        </div>
        <div className="grid justify-items-center gap-0.5 rounded-[16px] bg-[var(--tile-teal)] px-2 py-3.5 text-center text-[var(--tile-teal-fg)]">
          <Mic className="h-5 w-5" aria-hidden="true" />
          <b className="font-display text-2xl font-extrabold text-[var(--text)] tabular-nums">
            {user.totalSpokenMinutes}
          </b>
          <small className="text-xs text-[var(--text-2)]">menit</small>
        </div>
        <div className="grid justify-items-center gap-0.5 rounded-[16px] bg-[var(--tile-green)] px-2 py-3.5 text-center text-[var(--tile-green-fg)]">
          <Check className="h-5 w-5" aria-hidden="true" />
          <b className="font-display text-2xl font-extrabold text-[var(--text)] tabular-nums">
            {user.clarityAvg > 0 ? user.clarityAvg : "-"}
          </b>
          <small className="text-xs text-[var(--text-2)]">kejelasan</small>
        </div>
      </div>

      <section aria-labelledby="weekly-chart-title">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="weekly-chart-title" className="font-display text-lg font-bold">
            Bicara minggu ini
          </h2>
          <span className="text-sm font-semibold text-[var(--text-2)] tabular-nums">
            {weeklyTotalMinutes} menit
          </span>
        </div>
        <div
          role="img"
          aria-label={`Total bicara minggu ini ${weeklyTotalMinutes} menit`}
          className="grid h-[120px] grid-cols-7 items-end gap-2"
        >
          {weeklyActivities.map((day) => {
            const pct =
              day.minutesSpoken === 0
                ? 4
                : Math.max(
                    10,
                    Math.round((day.minutesSpoken / maxDayMinutes) * 100)
                  );
            return (
              <div
                key={day.id}
                className={cn(
                  "flex h-full flex-col items-center justify-end gap-1.5 text-xs",
                  day.isToday
                    ? "font-bold text-[var(--text)]"
                    : "text-[var(--text-2)]"
                )}
              >
                <b
                  style={{ height: `${pct}%` }}
                  title={`${day.dayLabel}: ${day.minutesSpoken} menit`}
                  className={cn(
                    "block w-full max-w-[24px] rounded-[8px] transition-all",
                    day.isToday && day.minutesSpoken > 0
                      ? "bg-[var(--coral)]"
                      : "bg-[var(--line)]"
                  )}
                />
                <span>{day.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="league-title">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="league-title" className="font-display text-lg font-bold">
            Peringkat Pelajar
          </h2>
          <Badge variant="ochre">menit bicara</Badge>
        </div>
        <div className="grid gap-1.5">
          {league.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex items-center gap-2.5 rounded-[12px] px-2.5 py-2",
                entry.isCurrentUser && "bg-[var(--tile-coral)]"
              )}
            >
              <span className="w-4 font-bold text-[var(--text-2)]">
                {entry.rank}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs font-extrabold",
                  entry.isCurrentUser
                    ? "bg-[var(--coral)] text-[var(--on-coral)]"
                    : "bg-[var(--teal-600)] text-[#F7F5EE]"
                )}
              >
                {entry.initials}
              </span>
              <span className="flex-1 font-bold">{entry.name}</span>
              <span className="text-xs font-semibold text-[var(--text-2)] tabular-nums">
                {entry.minutesSpoken} mnt
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-2)]">
          Dihitung langsung dari total menit bicara pengguna di PostgreSQL
          Laragon, bukan skor pengucapan.
        </p>
      </section>
    </>
  );

  return (
    <AppShell
      rightPanel={rightPanel}
      rightPanelLabel="Profil dan progres"
      prototypeNote={`Sesi aktif: ${user.name} (${user.email}) · Seluruh angka dimuat real-time dari PostgreSQL Laragon.`}
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold">
            Halo, {user.name.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-base text-[var(--text-2)]">
            {user.spokenTodayMinutes === 0
              ? "Kamu belum mulai latihan hari ini. Yuk mulai kalimat pertamamu!"
              : "Lanjutkan latihanmu hari ini untuk mencapai target menit bicara."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="teal">
            Tujuan:{" "}
            {user.goals.length > 0
              ? user.goals.join(", ").toUpperCase()
              : "UMUM"}
          </Badge>
          <Button asChild variant="surface" size="sm">
            <Link href="/masuk">Ganti Akun ({user.email})</Link>
          </Button>
        </div>
      </header>

      {/* Hero Banner with 100% Data-Driven Phonetic Specimen Card */}
      <section
        aria-labelledby="daily-goal-title"
        style={{ background: "var(--hero-bg)" }}
        className="grid items-center gap-6 rounded-[28px] p-6 text-[var(--hero-fg)] lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="grid gap-3.5">
          <h2
            id="daily-goal-title"
            className="font-display text-3xl font-extrabold text-[var(--hero-fg)]"
          >
            Kamu sudah bicara {user.spokenTodayMinutes} dari{" "}
            {user.dailyTargetMinutes} menit hari ini
          </h2>
          <p className="text-sm text-[var(--hero-fg-2)]">
            {remainingMinutes > 0
              ? `${remainingMinutes} menit lagi untuk mencapai target harianmu (${user.dailyTargetMinutes} menit).`
              : `Target harian ${user.dailyTargetMinutes} menit sudah tercapai hari ini!`}
          </p>
          <div className="flex max-w-md items-center gap-3">
            <Progress
              value={dailyPct}
              tone="coral"
              className="bg-[rgba(247,245,238,0.18)]"
              aria-label={`${dailyPct} persen target hari ini`}
            />
            <b className="font-display text-sm tabular-nums">{dailyPct}%</b>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <Button asChild variant="accent">
              <Link href="/latihan-ucapan">
                <Mic className="h-5 w-5" aria-hidden="true" />
                <span>
                  {user.spokenTodayMinutes === 0
                    ? "Mulai latihan hari ini"
                    : "Lanjut bicara"}
                </span>
              </Link>
            </Button>
            <Button asChild variant="ghostLight">
              <Link href="/mulai">Ubah tujuan & target</Link>
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <PhoneticSpecimenCard
            word={topMistake?.word ?? null}
            ipa={topMistake?.ipa ?? null}
            errorPattern={topMistake?.errorPattern ?? null}
            heardAs={
              topMistake
                ? `${topMistake.heardAs} · dari ${topMistake.sourceMode}`
                : null
            }
            spokenMinutes={user.spokenTodayMinutes}
            targetMinutes={user.dailyTargetMinutes}
          />
        </div>
      </section>

      {/* 4 Practice Modes */}
      <section aria-labelledby="modes-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="modes-heading" className="font-display text-xl font-bold">
            Pilih mode latihan
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <Card className="group relative flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]">
                <Mic className="h-6 w-6" aria-hidden="true" />
              </span>
              <Badge variant="coral">Sesuai Tujuan</Badge>
            </div>
            <h3 className="font-display text-lg font-bold">
              <Link
                href="/latihan-ucapan"
                className="text-[var(--text)] no-underline after:absolute after:inset-0 after:rounded-card"
              >
                Latihan Ucapan
              </Link>
            </h3>
            <p className="text-sm text-[var(--text-2)]">
              Baca kalimat dengan suara keras, lihat koreksi bunyi kata per
              kata.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-[var(--text-2)]">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{drillSentenceCount} kalimat tersedia · ±3 menit</span>
            </span>
          </Card>

          <Card className="group relative flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]">
                <MessageSquare className="h-6 w-6" aria-hidden="true" />
              </span>
              <Badge variant="teal">{scenarioCount} Skenario</Badge>
            </div>
            <h3 className="font-display text-lg font-bold">
              <Link
                href={
                  activeScenario
                    ? `/roleplay?slug=${activeScenario.slug}`
                    : "/roleplay"
                }
                className="text-[var(--text)] no-underline after:absolute after:inset-0 after:rounded-card"
              >
                Roleplay
              </Link>
            </h3>
            <p className="text-sm text-[var(--text-2)]">
              Ngobrol berskenario: wawancara startup, hotel, IELTS, atau kafe.
            </p>
            <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-[var(--text-2)]">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>3 misi per skenario · ±5 menit</span>
            </span>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--tile-green)] text-[var(--tile-green-fg)]">
                <Volume2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <Badge variant="ghost">Segera hadir</Badge>
            </div>
            <h3 className="font-display text-lg font-bold">Shadowing</h3>
            <p className="text-sm text-[var(--text-2)]">
              Dengarkan penutur asli, tirukan iramanya.
            </p>
            <span className="mt-auto text-xs text-[var(--text-2)]">
              Tahap pengembangan berikutnya
            </span>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]">
                <Clock className="h-6 w-6" aria-hidden="true" />
              </span>
              <Badge variant="ghost">Segera hadir</Badge>
            </div>
            <h3 className="font-display text-lg font-bold">Speaking Test</h3>
            <p className="text-sm text-[var(--text-2)]">
              Jawab satu topik terbuka selama satu menit, gaya IELTS.
            </p>
            <span className="mt-auto text-xs text-[var(--text-2)]">
              Tahap pengembangan v1.5
            </span>
          </Card>
        </div>
      </section>

      {/* Closed Loop: Bank Kesalahan & Active Roleplay */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card id="bank">
          <div className="mb-3.5 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold">
                  Bank Kesalahan ({mistakes.length})
                </h2>
                {mistakes.length > 0 && (
                  <Link
                    href="/bank-kesalahan"
                    className="text-xs font-bold text-[var(--link)] underline"
                  >
                    Lihat semua
                  </Link>
                )}
              </div>
              <p className="text-xs text-[var(--text-2)]">
                {mistakes.length === 0
                  ? "Belum ada kesalahan yang tercatat di akunmu"
                  : "Kata yang perlu diulang dari sesi latihan dan roleplay-mu"}
              </p>
            </div>
          </div>

          {mistakes.length > 0 ? (
            <div className="grid gap-2">
              {mistakes.slice(0, 3).map((m) => (
                <PhoneticWordRow
                  key={m.id}
                  word={m.word}
                  ipa={m.ipa}
                  subtitle={`${m.heardAs} · dari ${m.sourceMode}`}
                  errorPattern={m.errorPattern}
                  status={m.status}
                />
              ))}
              <Button asChild className="mt-2 w-full">
                <Link href="/latihan-ucapan?source=bank">
                  Latih {Math.min(3, mistakes.length)} kata ini dari Bank
                  Kesalahan
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-card border-[1.5px] border-[var(--line)] bg-[var(--bg)] p-4">
              <h3 className="font-display text-base font-bold">
                Bank Kesalahan masih kosong
              </h3>
              <p className="mt-1 text-sm text-[var(--text-2)]">
                Kamu belum memiliki catatan kesalahan bicara di database. Mulai
                Latihan Ucapan atau Roleplay, dan setiap bunyi yang meleset akan
                masuk ke sini secara otomatis.
              </p>
              <div className="mt-3">
                <Button asChild size="sm">
                  <Link href="/latihan-ucapan">Mulai latihan pertama</Link>
                </Button>
              </div>
            </div>
          )}
        </Card>

        {activeScenario && (
          <Card>
            <h2 className="sr-only">Skenario roleplay sesuai tujuanmu</h2>
            <div className="rounded-[18px] bg-[var(--tile-coral)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--surface)] text-[var(--tile-coral-fg)]">
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {activeScenario.title}
                    </h3>
                    <p className="text-xs text-[var(--text-2)]">
                      bersama {activeScenario.characterName} ·{" "}
                      {activeScenario.cefrLevel}
                    </p>
                  </div>
                </div>
                <Badge variant="ochre">
                  {activeScenario.completedMissionsCount}/
                  {activeScenario.missions.length} misi
                </Badge>
              </div>
              <p lang="en" className="mt-2.5 text-base font-medium">
                “{activeScenario.lastPrompt}”
              </p>
            </div>

            <div className="my-3.5 grid gap-1.5">
              {activeScenario.missions.map((mission, idx) => {
                const done = idx < activeScenario.completedMissionsCount;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 py-1 text-sm font-medium"
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                        done
                          ? "border-[var(--ok)] bg-[var(--ok)] text-[var(--bg)]"
                          : "border-[var(--line)] text-[var(--text-2)]"
                      )}
                    >
                      {done ? (
                        <Check
                          className="h-3.5 w-3.5 stroke-[2.6]"
                          aria-hidden="true"
                        />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className={cn(done && "text-[var(--text-2)]")}>
                      {mission}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button asChild className="w-full">
              <Link href={`/roleplay?slug=${activeScenario.slug}`}>
                {activeScenario.completedMissionsCount > 0
                  ? "Ulangi roleplay ini"
                  : "Mulai roleplay ini"}
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
