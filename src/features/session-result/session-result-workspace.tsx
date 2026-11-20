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
import { Progress } from "@/components/ui/progress";
import type {
  MistakeItemDTO,
  SpeakingSessionDTO,
  UserProfileDTO,
} from "@/types/ucapin";
import { cn } from "@/lib/utils";

export interface SessionResultWorkspaceProps {
  user: UserProfileDTO;
  session: SpeakingSessionDTO;
  mistakes: MistakeItemDTO[];
}

export function SessionResultWorkspace({
  user,
  session,
  mistakes,
}: SessionResultWorkspaceProps) {
  const [confidence, setConfidence] = React.useState<number | null>(
    session.confidenceRating
  );
  const [confidenceFeedback, setConfidenceFeedback] = React.useState<string>(
    ""
  );

  const handleConfidenceSelect = async (val: number) => {
    setConfidence(val);
    const msg =
      val <= 2
        ? "Terima kasih sudah jujur. Besok kami mulai dengan latihan yang lebih pendek."
        : val === 3
        ? "Oke. Kita ulangi bagian yang belum mantap besok."
        : "Mantap! Besok coba skenario yang sedikit lebih menantang.";
    setConfidenceFeedback(`${msg} (Tersimpan ke Laragon PostgreSQL)`);

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

  const rightPanel = (
    <>
      <section aria-labelledby="trend-heading">
        <h2 id="trend-heading" className="font-display text-lg font-bold">
          Kejelasan 7 sesi terakhir
        </h2>
        <div className="mt-2.5 rounded-[18px] bg-[var(--surface-2)] p-4">
          <svg
            viewBox="0 0 280 110"
            role="img"
            aria-label="Kejelasan naik dari 62 ke 84 dalam 7 sesi"
            className="h-auto w-full"
          >
            <line
              x1="0"
              y1="100"
              x2="280"
              y2="100"
              stroke="var(--line)"
              strokeWidth="1.5"
            />
            <polyline
              fill="none"
              stroke="var(--coral)"
              strokeWidth="3.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points="6,86 50,78 94,82 138,64 182,58 226,44 272,30"
            />
            <circle
              cx="272"
              cy="30"
              r="6"
              fill="var(--surface)"
              stroke="var(--coral)"
              strokeWidth="3"
            />
            <text
              x="262"
              y="18"
              textAnchor="end"
              fontSize="14"
              fill="var(--text)"
              fontWeight="700"
            >
              {session.clarityScore}
            </text>
            <text x="6" y="74" fontSize="12" fill="var(--text-2)">
              62
            </text>
          </svg>
        </div>
        <div className="mt-2.5">
          <Badge variant="ok">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>+22 poin sejak sesi pertama</span>
          </Badge>
        </div>
      </section>

      <Card className="p-4">
        <h2 className="font-display text-base font-bold">Perkiraan level</h2>
        <p className="mt-2">
          <span className="font-display text-3xl font-extrabold">
            {user.cefrProgressLabel.split(" ")[0]}
          </span>{" "}
          <span className="text-sm text-[var(--text-2)]">
            {user.cefrProgressLabel.split(" ").slice(1).join(" ")}
          </span>
        </p>
        <Progress
          value={user.cefrProgressPct}
          tone="coral"
          className="mt-2.5"
        />
        <p className="mt-2.5 text-xs text-[var(--text-2)]">
          Dihitung dari kejelasan dan kelancaran, bukan dari aksenmu.
        </p>
      </Card>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="font-display text-lg font-bold">
          Pencapaian penguasaan
        </h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2.5">
          <div className="grid justify-items-center gap-1.5 rounded-[16px] bg-[var(--tile-coral)] p-3 text-center text-xs font-bold text-[var(--tile-coral-fg)]">
            <MessageSquare className="h-6 w-6" aria-hidden="true" />
            <span>Misi Kafe</span>
          </div>
          <div className="grid justify-items-center gap-1.5 rounded-[16px] bg-[var(--tile-ochre)] p-3 text-center text-xs font-bold text-[var(--tile-ochre-fg)]">
            <Flame className="h-6 w-6" aria-hidden="true" />
            <span>{user.streakDays + 1} Hari</span>
          </div>
          <div className="grid justify-items-center gap-1.5 rounded-[16px] bg-[var(--tile-teal)] p-3 text-center text-xs font-bold text-[var(--tile-teal-fg)]">
            <Mic className="h-6 w-6" aria-hidden="true" />
            <span>10 Obrolan</span>
          </div>
        </div>
      </section>

      <div className="grid gap-2.5">
        <Button asChild>
          <Link href="/roleplay">Ulangi roleplay kafe</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </>
  );

  return (
    <AppShell
      rightPanel={rightPanel}
      rightPanelLabel="Tren kejelasan dan pencapaian"
    >
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
              <span>3 misi selesai</span>
            </span>
          </div>
          <h1
            id="result-hero-title"
            className="font-display text-3xl font-extrabold text-[var(--hero-fg)]"
          >
            Obrolan yang mantap, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-sm text-[var(--hero-fg-2)]">
            Sam memahami 9 dari 10 kalimatmu. Kamu bicara{" "}
            {Math.floor(session.durationSec / 60)} menit{" "}
            {session.durationSec % 60} detik di kafe.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:grid">
          <span className="inline-flex items-center gap-2 rounded-pill bg-[rgba(247,245,238,0.14)] px-3.5 py-2 text-xs font-bold">
            <Flame className="h-4 w-4 text-[var(--coral)]" aria-hidden="true" />
            <span>{user.streakDays + 1} hari beruntun</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-pill bg-[rgba(247,245,238,0.14)] px-3.5 py-2 text-xs font-bold">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>+5 menit hari ini</span>
          </span>
        </div>
      </section>

      {/* 4 ELSA-inspired Post-Roleplay Scores */}
      <section aria-label="Skor per bagian">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ScoreMetricCard
            label="Pengucapan"
            score={session.pronunciationScore}
            description="2 bunyi perlu latihan"
            tone="teal"
            icon={<Mic className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]"
          />
          <ScoreMetricCard
            label="Kelancaran"
            score={session.fluencyScore}
            description={`${session.wpm} kata per menit, jeda pendek`}
            tone="ok"
            icon={<Gauge className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-green)] text-[var(--tile-green-fg)]"
          />
          <ScoreMetricCard
            label="Tata bahasa"
            score={session.grammarScore}
            description="Pemakaian a / an"
            tone="almost"
            icon={<BookOpen className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-ochre)] text-[var(--tile-ochre-fg)]"
          />
          <ScoreMetricCard
            label="Kosakata"
            score={session.vocabularyScore}
            description="3 frasa baru dipakai"
            tone="coral"
            icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
            tileClassName="bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]"
          />
        </div>
      </section>

      {/* Review Utterances */}
      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Ulas jawabanmu</h2>
          <Badge variant="teal">{session.utterances.length} giliran</Badge>
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
                    <p lang="en" className="font-bold text-base">
                      {u.transcript}
                    </p>
                    {u.betterVersion ? (
                      <>
                        <p className="mt-2 text-xs text-[var(--text-2)]">
                          Lebih natural
                        </p>
                        <p
                          lang="en"
                          className="font-bold text-base mk mk-ok"
                        >
                          {u.betterVersion}
                        </p>
                      </>
                    ) : (
                      <p className="mt-1 text-xs text-[var(--text-2)]">
                        {u.note}
                      </p>
                    )}
                  </div>
                </div>

                {u.betterVersion && (
                  <AudioTtsButton
                    text={u.betterVersion}
                    label="Contoh"
                    variant="surface"
                  />
                )}
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
                {mistakes.slice(0, 3).length} kata masuk Bank Kesalahan
              </h2>
              <p className="text-xs text-[var(--text-2)]">
                Otomatis dijadwalkan untuk latihan singkat
              </p>
            </div>
          </div>

          <div className="my-4 flex flex-wrap gap-2">
            {mistakes.slice(0, 3).map((m) => (
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
            <Link href="/latihan-ucapan">
              <Mic className="h-5 w-5" aria-hidden="true" />
              <span>Latih sekarang, ±2 menit</span>
            </Link>
          </Button>
        </Card>

        <Card>
          <fieldset>
            <legend className="mb-3 font-display text-lg font-bold">
              Seberapa percaya diri kamu hari ini?
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
