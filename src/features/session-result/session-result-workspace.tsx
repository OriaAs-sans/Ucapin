"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Clock,
  Flame,
  Gauge,
  MessageSquare,
  Mic,
  RotateCcw,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ClarityRing } from "@/components/shared/clarity-ring";
import { ScoreMetricCard } from "@/components/shared/score-metric-card";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  MistakeItemDTO,
  SpeakingSessionDTO,
  UserProfileDTO,
} from "@/types/ucapin";
import { cn } from "@/lib/utils";

export interface SessionResultWorkspaceProps {
  user: UserProfileDTO;
  /** Sesi ini menyelesaikan satu bab (diverifikasi server). */
  chapterJustCompleted?: boolean;
  session: SpeakingSessionDTO | null;
  sessionHistory: {
    id: string;
    clarityScore: number;
    mode: string;
    scenarioTitle: string | null;
  }[];
  mistakes: MistakeItemDTO[];
}

export function SessionResultWorkspace({
  user,
  session,
  sessionHistory,
  mistakes,
  chapterJustCompleted = false,
}: SessionResultWorkspaceProps) {
  const [confidence, setConfidence] = React.useState<number | null>(
    session?.confidenceRating ?? null
  );
  const [confidenceFeedback, setConfidenceFeedback] =
    React.useState<string>("");

  const handleConfidenceSelect = async (val: number) => {
    if (!session) return;
    setConfidence(val);
    const msg =
      val <= 2
        ? "Terima kasih sudah jujur. Besok kami mulai dengan latihan yang lebih pendek."
        : val === 3
        ? "Oke. Kita ulangi bagian yang belum mantap besok."
        : "Mantap! Besok coba skenario yang sedikit lebih menantang.";
    setConfidenceFeedback(msg);

    try {
      await fetch("/api/v1/session-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          confidenceRating: val,
        }),
      });
    } catch {
      /* ignore */
    }
  };

  if (!session) {
    return (
      <AppShell
      >
        <Card className="p-8 text-center">
          <h1 className="font-display text-2xl font-extrabold">
            Belum ada hasil sesi latihan
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-2)]">
            Akun <strong>{user.name}</strong> belum menyelesaikan sesi Latihan
            Ucapan atau Roleplay. Selesaikan satu sesi terlebih dahulu untuk
            melihat analisis skor kejelasan dan kata yang masuk Bank Kesalahan.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent">
              <Link href="/latihan-ucapan">Mulai Latihan Ucapan</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/roleplay">Mulai Roleplay</Link>
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const firstScore = sessionHistory[0]?.clarityScore ?? session.clarityScore;
  const latestScore = session.clarityScore;
  const deltaScore = latestScore - firstScore;
  const durationMinutes = Math.floor(session.durationSec / 60);
  const durationSeconds = session.durationSec % 60;
  const clearUtteranceCount = session.utterances.filter(
    (u) => u.status === "ok" || u.status === "almost"
  ).length;

  const rightPanel = (
    <>
      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading" className="font-display text-lg font-bold">
          Riwayat kejelasan ({sessionHistory.length} sesi)
        </h2>
        <div className="mt-2.5 grid gap-2 rounded-[18px] bg-[var(--surface-2)] p-4">
          {sessionHistory.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="truncate font-medium text-[var(--text)]">
                #{idx + 1} · {item.scenarioTitle ?? item.mode}
              </span>
              <Badge
                variant={
                  item.clarityScore >= 85
                    ? "ok"
                    : item.clarityScore >= 75
                    ? "almost"
                    : "work"
                }
              >
                {item.clarityScore}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-2.5">
          <Badge variant="ok">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {sessionHistory.length > 1
                ? `${deltaScore >= 0 ? "+" : ""}${deltaScore} poin dibanding sesi pertama`
                : "Sesi pertamamu sudah tercatat"}
            </span>
          </Badge>
        </div>
      </section>


      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="font-display text-lg font-bold">
          Statistik Akun Saat Ini
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          <div className="grid justify-items-center gap-1 rounded-[16px] bg-[var(--tile-coral)] p-3 text-center text-xs font-bold text-[var(--tile-coral-fg)]">
            <Flame className="h-5 w-5" aria-hidden="true" />
            <span>{user.streakDays} Hari</span>
          </div>
          <div className="grid justify-items-center gap-1 rounded-[16px] bg-[var(--tile-teal)] p-3 text-center text-xs font-bold text-[var(--tile-teal-fg)]">
            <Clock className="h-5 w-5" aria-hidden="true" />
            <span>{user.spokenTodayMinutes} Mnt</span>
          </div>
          <div className="grid justify-items-center gap-1 rounded-[16px] bg-[var(--tile-green)] p-3 text-center text-xs font-bold text-[var(--tile-green-fg)]">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
            <span>{sessionHistory.length} Sesi</span>
          </div>
        </div>
      </section>

      <div className="grid gap-2.5">
        <Button asChild>
          <Link href="/">Lihat Progres Baru di Beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            href={
              session.mode === "drill" ? "/latihan-ucapan" : "/roleplay"
            }
          >
            Latihan lagi
          </Link>
        </Button>
      </div>
    </>
  );

  return (
    <AppShell
      rightPanel={rightPanel}
      rightPanelLabel="Riwayat kejelasan dan statistik akun"
    >
      {chapterJustCompleted && (
        <div
          role="status"
          className="enter-rise flex flex-wrap items-center justify-between gap-3 rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] px-5 py-3.5"
        >
          <p className="flex items-center gap-2 font-bold text-[var(--ok)]">
            <Check className="h-5 w-5" aria-hidden="true" />
            <span>Bab selesai. Bab berikutnya di jalur ini sudah terbuka.</span>
          </p>
          <Button asChild size="sm">
            <Link href={session?.mode === "roleplay" ? "/roleplay" : "/latihan-ucapan"}>
              Lanjut ke bab berikutnya
            </Link>
          </Button>
        </div>
      )}

      {/* Hero Clarity Ring Banner */}
      <section
        aria-labelledby="result-hero-title"
        style={{ background: "var(--hero-bg)" }}
        className="grid items-center gap-6 rounded-[28px] p-6 text-[var(--hero-fg)] md:grid-cols-[auto_minmax(0,1fr)_auto]"
      >
        <ClarityRing score={session.clarityScore} />

        <div className="grid gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(124,199,160,0.45)] bg-[rgba(124,199,160,0.16)] px-3 py-1 text-xs font-bold text-[#7CC7A0]">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>{session.scenarioTitle ?? "Sesi Latihan"} selesai</span>
            </span>
          </div>
          <h1
            id="result-hero-title"
            className="font-display text-3xl font-extrabold text-[var(--hero-fg)]"
          >
            Kerja bagus, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-[var(--hero-fg-2)]">
            {clearUtteranceCount} dari {session.utterances.length} kalimatmu
            terdengar jelas. Durasi latihan {durationMinutes} menit{" "}
            {durationSeconds} detik.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:grid">
          <span className="inline-flex items-center gap-2 rounded-pill bg-[rgba(247,245,238,0.14)] px-3.5 py-2 text-xs font-bold">
            <Flame className="h-4 w-4 text-[var(--coral)]" aria-hidden="true" />
            <span>{user.streakDays} hari beruntun</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill bg-[rgba(247,245,238,0.14)] px-3.5 py-2 text-xs font-bold">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>
              Total hari ini: {user.spokenTodayMinutes} /{" "}
              {user.dailyTargetMinutes} mnt
            </span>
          </span>
        </div>
      </section>

      <section aria-label="Skor per bagian">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScoreMetricCard
            label="Ketepatan kata"
            score={session.pronunciationScore}
            description="Seberapa yakin mesin menangkap tiap kata"
            tone="teal"
            icon={<Mic className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]"
          />
          <ScoreMetricCard
            label="Kelancaran"
            score={session.fluencyScore}
            description={`${session.wpm} kata per menit`}
            tone="ok"
            icon={<Gauge className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-green)] text-[var(--tile-green-fg)]"
          />
        </div>
      </section>

      {/* Review Utterances */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Ulas kalimatmu</h2>
          <Badge variant="teal">{session.utterances.length} kalimat</Badge>
        </div>

        <div className="grid gap-3">
          {session.utterances.map((u) => {
            const isOk = u.status === "ok";
            const isAlmost = u.status === "almost";
            return (
              <div
                key={u.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-4 rounded-control p-4",
                  isOk && "bg-[var(--ok-wash)]",
                  isAlmost && "bg-[var(--almost-wash)]",
                  u.status === "work" && "bg-[var(--work-wash)]"
                )}
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-[var(--bg)]",
                      isOk && "bg-[var(--ok)]",
                      isAlmost && "bg-[var(--almost)]",
                      u.status === "work" && "bg-[var(--work)]"
                    )}
                  >
                    {isOk ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : isAlmost ? (
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <X className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs text-[var(--text-2)]">Kamu bilang</p>
                    <p lang="en" className="text-base font-bold">
                      {u.transcript}
                    </p>
                    {u.betterVersion && u.betterVersion !== u.transcript ? (
                      <>
                        <p className="mt-2 text-xs text-[var(--text-2)]">
                          Versi acuan
                        </p>
                        <p lang="en" className="mk mk-ok text-base font-bold">
                          {u.betterVersion}
                        </p>
                      </>
                    ) : null}
                    {u.note && (
                      <p className="mt-1 text-xs text-[var(--text-2)]">
                        {u.note}
                      </p>
                    )}
                  </div>
                </div>

                <AudioTtsButton
                  text={u.betterVersion ?? u.referenceText}
                  label="Dengar contoh"
                  variant="surface"
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Closed Loop: Mistake Bank CTA & Self-Perceived Confidence Check */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">
                {mistakes.length} kata di Bank Kesalahan
              </h2>
              <p className="text-xs text-[var(--text-2)]">
                Tersimpan di akunmu untuk dilatih kembali
              </p>
            </div>
          </div>

          {mistakes.length > 0 ? (
            <>
              <div className="my-4 flex flex-wrap gap-2">
                {mistakes.slice(0, 4).map((m) => (
                  <Badge
                    key={m.id}
                    variant={m.status}
                    lang="en"
                    className="text-sm"
                  >
                    {m.word} ({m.errorPattern})
                  </Badge>
                ))}
              </div>

              <Button asChild variant="accent" className="w-full">
                <Link href="/latihan-ucapan?source=bank">
                  <Mic className="h-5 w-5" aria-hidden="true" />
                  <span>Latih kata dari Bank Kesalahan</span>
                </Link>
              </Button>
            </>
          ) : (
            <p className="mt-3 text-sm text-[var(--text-2)]">
              Tidak ada kesalahan baru pada sesi ini.
            </p>
          )}
        </Card>

        <Card>
          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Seberapa percaya diri kamu setelah sesi ini?
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, sub: "Grogi" },
                { val: 2, sub: "" },
                { val: 3, sub: "Biasa" },
                { val: 4, sub: "" },
                { val: 5, sub: "Yakin" },
              ].map((item) => (
                <label
                  key={item.val}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-control border-2 p-3 text-center font-bold transition-all",
                    confidence === item.val
                      ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                      : "border-[var(--line)] bg-[var(--surface)]"
                  )}
                >
                  <input
                    type="radio"
                    name="yakin"
                    value={item.val}
                    checked={confidence === item.val}
                    onChange={() => handleConfidenceSelect(item.val)}
                    className="sr-only"
                  />
                  <span className="font-display text-xl">{item.val}</span>
                  {item.sub && (
                    <small className="mt-0.5 text-[11px] font-normal text-[var(--text-2)]">
                      {item.sub}
                    </small>
                  )}
                </label>
              ))}
            </div>
            {confidenceFeedback && (
              <p
                aria-live="polite"
                className="mt-3 text-sm text-[var(--text-2)]"
              >
                {confidenceFeedback}
              </p>
            )}
          </fieldset>
        </Card>
      </div>
    </AppShell>
  );
}
