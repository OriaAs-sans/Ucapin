"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  RotateCcw,
  Mic,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProofreadingSentence } from "@/components/shared/proofreading-sentence";
import { MicRecorder, type MicState } from "@/components/shared/mic-recorder";
import { ScoreMetricCard } from "@/components/shared/score-metric-card";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DrillSentenceDTO } from "@/types/ucapin";

export interface DrillWorkspaceProps {
  sentences: DrillSentenceDTO[];
}

export function DrillWorkspace({ sentences }: DrillWorkspaceProps) {
  const [index, setIndex] = React.useState(0);
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [showMarks, setShowMarks] = React.useState(false);
  const [coachOpen, setCoachOpen] = React.useState(false);
  const [savedToDb, setSavedToDb] = React.useState(false);

  const current = sentences[index] ?? sentences[0];
  const progressValue = Math.round(((index + 4) / 12) * 100);

  const resetSentenceState = (nextIdx: number) => {
    setIndex(nextIdx);
    setMicState("idle");
    setShowMarks(false);
    setSavedToDb(false);
  };

  const evaluateUtterance = React.useCallback(async () => {
    setMicState("processing");
    window.setTimeout(async () => {
      setShowMarks(true);
      setMicState("done");

      // Automatically record the primary work word into Laragon PostgreSQL Mistake Bank
      const workEntries = Object.entries(current.targetMarks).filter(
        ([, m]) => m.status === "work"
      );
      if (workEntries.length > 0) {
        const [wordKey, mark] = workEntries[0];
        try {
          await fetch("/api/v1/mistakes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              word: wordKey,
              ipa: mark.ipa ?? current.coachIpa,
              phoneme: current.phonemeBreakdown[0]?.phoneme ?? "/v/",
              errorPattern: mark.note.replace("jadi", "→"),
              heardAs: `terdengar kurang jelas (${mark.note})`,
              sourceMode: "Latihan Ucapan",
              status: "work",
            }),
          });
          setSavedToDb(true);
        } catch {
          setSavedToDb(true);
        }
      }
    }, 650);
  }, [current]);

  const primaryRetryWord = React.useMemo(() => {
    const found = Object.entries(current.targetMarks).find(
      ([, m]) => m.status === "work"
    );
    return found ? found[0] : current.coachWord;
  }, [current]);

  const rightPanel = (
    <>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold">Catatan pelatih</h2>
          <p className="text-xs text-[var(--text-2)]">
            Satu bunyi dulu, pelan-pelan
          </p>
        </div>
      </div>

      <p className="text-sm text-[var(--text-2)]">
        Coba ucapkan sendiri dulu. Buka catatan kalau sudah mencoba dan masih
        bingung.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={coachOpen}
        onClick={() => setCoachOpen((v) => !v)}
        className="w-full"
      >
        {coachOpen ? "Sembunyikan catatan" : "Tampilkan catatan"}
      </Button>

      {coachOpen && (
        <div className="grid gap-5">
          <div className="rounded-[18px] bg-[var(--work-wash)] p-4">
            <div className="flex items-center justify-between gap-2">
              <p
                lang="en"
                className="font-display text-4xl font-extrabold leading-none text-[var(--work-text)]"
              >
                <span className="mk mk-work">{current.coachWord}</span>
              </p>
              <AudioTtsButton text={current.coachWord} iconOnly />
            </div>
            <p
              lang="en"
              className="mt-2 font-ipa text-base text-[var(--text-2)]"
            >
              {current.coachIpa}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed">
              {current.coachNote}
            </p>
          </div>

          <section aria-labelledby="ph-breakdown-title">
            <h3 id="ph-breakdown-title" className="font-display text-base font-bold">
              Rincian bunyi{" "}
              <span className="font-ui text-xs font-normal text-[var(--text-2)]">
                (contoh)
              </span>
            </h3>
            <div className="mt-2.5 grid gap-2.5">
              {current.phonemeBreakdown.map((ph, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2.75rem_1fr_2.25rem] items-center gap-2.5"
                >
                  <span lang="en" className="font-ipa text-base">
                    {ph.phoneme}
                  </span>
                  <Progress
                    value={ph.score}
                    tone={ph.status}
                    aria-label={`Bunyi ${ph.phoneme}: skor ${ph.score}`}
                  />
                  <b
                    className="text-right font-display text-sm tabular-nums"
                    style={{
                      color:
                        ph.status === "work"
                          ? "var(--work-text)"
                          : ph.status === "almost"
                          ? "var(--almost-text)"
                          : "var(--ok)",
                    }}
                  >
                    {ph.score}
                  </b>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="articulation-title"
            className="rounded-[18px] bg-[var(--tile-teal)] p-4"
          >
            <h3
              id="articulation-title"
              className="font-display text-base font-bold text-[var(--text)]"
            >
              Cara mengucapkan {current.phonemeBreakdown[0]?.phoneme ?? "/v/"}
            </h3>
            <div className="mt-2.5 grid place-items-center rounded-[14px] bg-[var(--surface)] p-3.5">
              <svg
                viewBox="0 0 160 90"
                role="img"
                aria-label="Ilustrasi posisi bibir dan gigi"
                className="h-auto w-40"
              >
                <path
                  d="M14 46 Q80 6 146 46 Q80 30 14 46Z"
                  fill="#B5523B"
                />
                <rect
                  x="46"
                  y="34"
                  width="68"
                  height="16"
                  rx="4"
                  fill="#F7F5EE"
                  stroke="#D4C8B7"
                />
                <path
                  d="M58 34v16M70 34v16M82 34v16M94 34v16M106 34v16"
                  stroke="#D4C8B7"
                />
                <path
                  d="M14 46 Q80 52 146 46 Q80 92 14 46Z"
                  fill="#D86A50"
                />
                <path
                  d="M120 66 q14 -6 22 2"
                  stroke="#3B6A78"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M126 76 q14 -4 20 4"
                  stroke="#3B6A78"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
              {current.coachSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="minimal-pairs-title">
            <h3
              id="minimal-pairs-title"
              className="font-display text-base font-bold"
            >
              Dengar bedanya (pasangan minimal)
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {current.minimalPairs.map((pairWord) => (
                <AudioTtsButton
                  key={pairWord}
                  text={pairWord}
                  label={pairWord}
                  variant="outline"
                  size="sm"
                  className="rounded-pill font-display"
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );

  return (
    <AppShell
      rightPanel={rightPanel}
      rightPanelLabel="Catatan pelatih"
      prototypeNote="Prototype terhubung ke Laragon PostgreSQL: mikrofon dan pemutar suara berfungsi nyata, penilaian ucapan memakai contoh data."
    >
      {/* Topbar */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <p className="text-xs font-semibold text-[var(--text-2)]">
              Latihan Ucapan
            </p>
            <h1 className="font-display text-2xl font-extrabold">
              {current.category}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="ochre">Fokus: {current.focusPhonemes}</Badge>
          <div className="flex items-center gap-2.5">
            <Progress
              value={progressValue}
              tone="coral"
              className="w-32"
              aria-label={`Kalimat ${index + 4} dari 12`}
            />
            <span
              className="text-xs font-semibold text-[var(--text-2)]"
              aria-live="polite"
            >
              Kalimat {index + 4} dari 12
            </span>
          </div>
        </div>
      </header>

      {/* Reusable Editorial Proofreading Sentence Card */}
      <ProofreadingSentence
        sentence={current.text}
        ipa={current.ipa}
        translation={current.translation}
        marks={current.targetMarks}
        showMarks={showMarks}
        onWordSelect={() => setCoachOpen(true)}
      />

      {/* Reusable Tap-to-Talk Microphone Recorder */}
      <section aria-labelledby="rec-section-title">
        <h2 id="rec-section-title" className="sr-only">
          Rekam ucapan
        </h2>
        <MicRecorder
          state={micState}
          onStateChange={(next) => {
            if (next === "recording" && micState === "done") {
              setShowMarks(false);
            }
            setMicState(next);
          }}
          onFinishRecording={evaluateUtterance}
          onSimulateWithoutMic={evaluateUtterance}
        />
      </section>

      {/* Prompt-before-Recast Result & 4 Score Metric Cards */}
      {showMarks && (
        <section
          aria-labelledby="drill-result-title"
          aria-live="polite"
          className="grid gap-4"
        >
          <div className="flex items-baseline justify-between">
            <h2
              id="drill-result-title"
              className="font-display text-xl font-bold"
            >
              Hasil kalimat ini{" "}
              <span className="font-ui text-xs font-normal text-[var(--text-2)]">
                (contoh data)
              </span>
            </h2>
          </div>

          {/* Prompt before recast (SLA research: Lyster & Saito 2010) */}
          <div className="rounded-card border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
              <RotateCcw
                className="h-5 w-5 shrink-0 text-[var(--almost-text)]"
                aria-hidden="true"
              />
              <span>
                Coba ucapkan lagi kata{" "}
                <span lang="en" className="mk mk-work">
                  {primaryRetryWord}
                </span>{" "}
                saja.
              </span>
            </h3>
            <p className="mt-1.5 text-sm text-[var(--text)]">
              Dengarkan dulu kalau perlu, lalu ketuk mikrofon. Cara
              mengucapkannya ada di panel catatan pelatih.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <AudioTtsButton
                text={primaryRetryWord}
                label="Dengar kata ini"
                variant="surface"
              />
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => {
                  setCoachOpen(true);
                  setShowMarks(false);
                  setMicState("idle");
                }}
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
                <span>Ucapkan lagi</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {current.sampleScores.map((s, idx) => (
              <ScoreMetricCard
                key={s.label}
                label={s.label}
                score={s.score}
                description={s.desc}
                tone={idx === 0 ? "coral" : undefined}
              />
            ))}
          </div>

          {savedToDb && (
            <p className="text-sm text-[var(--text-2)]">
              Kata <strong lang="en">{primaryRetryWord}</strong> sudah otomatis
              tersimpan ke{" "}
              <Link
                href="/bank-kesalahan"
                className="font-bold text-[var(--link)] underline"
              >
                Bank Kesalahan (PostgreSQL Laragon)
              </Link>
              .
            </p>
          )}
        </section>
      )}

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <Button
          type="button"
          variant="quiet"
          onClick={() => resetSentenceState((index + 1) % sentences.length)}
        >
          Lewati kalimat ini
        </Button>
        <Button
          type="button"
          disabled={!showMarks}
          onClick={() => resetSentenceState((index + 1) % sentences.length)}
        >
          <span>Kalimat berikutnya</span>
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </AppShell>
  );
}
