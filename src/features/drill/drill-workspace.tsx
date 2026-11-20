"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Mic,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProofreadingSentence } from "@/components/shared/proofreading-sentence";
import {
  MicRecorder,
  type MicState,
  type RecordedSpeechResult,
} from "@/components/shared/mic-recorder";
import { ScoreMetricCard } from "@/components/shared/score-metric-card";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  assessSpokenUtterance,
  getArticulationGuideForWord,
  type UtteranceAssessmentResult,
} from "@/lib/speech-assessor";
import type { DrillSentenceDTO, UserProfileDTO } from "@/types/ucapin";

export interface DrillWorkspaceProps {
  user: UserProfileDTO;
  sentences: DrillSentenceDTO[];
  activeGoal: string;
  isFirstOnboardingStep?: boolean;
}

const GOAL_TABS = [
  { id: "user", label: "Sesuai Tujuanmu" },
  { id: "kerja", label: "Wawancara & Kerja" },
  { id: "jalan", label: "Jalan-jalan" },
  { id: "ielts", label: "IELTS & Kuliah" },
  { id: "harian", label: "Sehari-hari" },
  { id: "bank", label: "Dari Bank Kesalahan" },
];

export function DrillWorkspace({
  user,
  sentences,
  activeGoal,
  isFirstOnboardingStep = false,
}: DrillWorkspaceProps) {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [assessment, setAssessment] =
    React.useState<UtteranceAssessmentResult | null>(null);
  const [selectedCoachWord, setSelectedCoachWord] = React.useState<string>("");
  const [coachOpen, setCoachOpen] = React.useState(false);
  const [savedWordsToDb, setSavedWordsToDb] = React.useState<string[]>([]);
  const [finishingSession, setFinishingSession] = React.useState(false);
  const [completedHistory, setCompletedHistory] = React.useState<
    {
      referenceText: string;
      assessment: UtteranceAssessmentResult;
      durationSec: number;
    }[]
  >([]);

  const current = sentences[index] ?? sentences[0];
  const totalInDeck = sentences.length;
  const progressValue = Math.round(
    ((index + 1) / Math.max(1, totalInDeck)) * 100
  );

  React.useEffect(() => {
    setIndex(0);
    setMicState("idle");
    setAssessment(null);
    setSelectedCoachWord(sentences[0]?.coachWord ?? "");
    setSavedWordsToDb([]);
  }, [activeGoal, sentences]);

  const resetSentenceState = (nextIdx: number) => {
    const nextSentence = sentences[nextIdx] ?? sentences[0];
    setIndex(nextIdx);
    setMicState("idle");
    setAssessment(null);
    setSelectedCoachWord(nextSentence?.coachWord ?? "");
    setSavedWordsToDb([]);
  };

  const handleRecordingEvaluated = React.useCallback(
    async (rec: RecordedSpeechResult) => {
      setMicState("processing");
      window.setTimeout(async () => {
        const evaluated = assessSpokenUtterance({
          referenceText: current.text,
          spokenTranscript: rec.transcript,
          defaultTargetMarks: current.targetMarks,
          durationMs: rec.durationMs,
          confidence: rec.confidence,
        });

        setAssessment(evaluated);
        setSelectedCoachWord(evaluated.primaryFocusWord);
        setMicState("done");

        setCompletedHistory((prev) => [
          ...prev,
          {
            referenceText: current.text,
            assessment: evaluated,
            durationSec: Math.max(5, Math.round(rec.durationMs / 1000)),
          },
        ]);

        // Persist ONLY real mispronounced words into Laragon PostgreSQL MistakeItem table
        if (evaluated.flaggedMistakes.length > 0) {
          const savedList: string[] = [];
          for (const m of evaluated.flaggedMistakes) {
            try {
              await fetch("/api/v1/mistakes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  word: m.word,
                  ipa: m.ipa,
                  phoneme: m.phoneme,
                  errorPattern: m.errorPattern,
                  heardAs: m.heardAs,
                  sourceMode: `Latihan: ${current.category}`,
                  status: m.status,
                }),
              });
              savedList.push(m.word);
            } catch {
              /* ignore */
            }
          }
          setSavedWordsToDb(savedList);
        } else {
          setSavedWordsToDb([]);
        }
      }, 350);
    },
    [current]
  );

  const handleFinishSession = async () => {
    setFinishingSession(true);
    try {
      const historyToSave =
        completedHistory.length > 0
          ? completedHistory
          : assessment
          ? [
              {
                referenceText: current.text,
                assessment,
                durationSec: 30,
              },
            ]
          : [];

      const allMistakes = historyToSave.flatMap(
        (h) => h.assessment.flaggedMistakes
      );
      const avgScore = (idx: number, fallback: number) =>
        historyToSave.length > 0
          ? Math.round(
              historyToSave.reduce(
                (acc, h) => acc + (h.assessment.scores[idx]?.score ?? fallback),
                0
              ) / historyToSave.length
            )
          : fallback;

      const totalSec = historyToSave.reduce((acc, h) => acc + h.durationSec, 0);

      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "drill",
          scenarioTitle: `Latihan Ucapan: ${current.category}`,
          durationSec: Math.max(60, totalSec),
          addedMinutes: Math.max(2, Math.ceil(totalSec / 60) + 1),
          clarityScore: avgScore(0, 85),
          pronunciationScore: avgScore(1, 82),
          fluencyScore: avgScore(2, 86),
          grammarScore: 88,
          vocabularyScore: 90,
          utterances: historyToSave.map((h) => ({
            referenceText: h.referenceText,
            transcript: h.assessment.spokenTranscript,
            betterVersion: h.referenceText,
            status:
              h.assessment.flaggedMistakes.length === 0
                ? "ok"
                : h.assessment.flaggedMistakes.some((m) => m.status === "work")
                ? "work"
                : "almost",
            note:
              h.assessment.flaggedMistakes.length === 0
                ? "Semua kata terdengar jelas"
                : `Koreksi pada kata: ${h.assessment.flaggedMistakes
                    .map((m) => m.word)
                    .join(", ")}`,
            clarityScore: h.assessment.scores[0]?.score ?? 85,
          })),
          mistakes: allMistakes,
        }),
      });
      const data = await res.json();
      if (data.ok && data.redirectTo) {
        router.push(data.redirectTo);
        router.refresh();
        return;
      }
    } finally {
      setFinishingSession(false);
    }
    router.push("/hasil");
  };

  // Dynamic Coach Panel data based on clicked/active word
  const activeCoachDetail = React.useMemo(() => {
    const targetWord =
      selectedCoachWord ||
      assessment?.primaryFocusWord ||
      current.coachWord;
    if (assessment && assessment.wordDetails[targetWord]) {
      return assessment.wordDetails[targetWord];
    }
    const defaultArticulation = getArticulationGuideForWord(
      current.coachWord,
      current.focusPhonemes
    );
    return {
      word: current.coachWord,
      ipa: current.coachIpa,
      status: "work" as const,
      heardAs: "Klik kata pada kalimat untuk melihat analisis bunyinya",
      note: current.coachNote,
      phonemeBreakdown: current.phonemeBreakdown,
      articulation: {
        ...defaultArticulation,
        steps: current.coachSteps,
        minimalPairs: current.minimalPairs,
      },
    };
  }, [selectedCoachWord, assessment, current]);

  const rightPanel = (
    <>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--tile-teal)] text-[var(--tile-teal-fg)]">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold">Catatan pelatih</h2>
          <p className="text-xs text-[var(--text-2)]">
            Klik kata mana saja di kalimat untuk melihat bedah bunyinya
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={coachOpen}
        onClick={() => setCoachOpen((v) => !v)}
        className="w-full"
      >
        {coachOpen ? "Sembunyikan catatan" : "Tampilkan catatan pelatih"}
      </Button>

      {coachOpen && (
        <div className="grid gap-5">
          <div
            className={
              activeCoachDetail.status === "ok"
                ? "rounded-[18px] bg-[var(--ok-wash)] p-4"
                : activeCoachDetail.status === "almost"
                ? "rounded-[18px] bg-[var(--almost-wash)] p-4"
                : "rounded-[18px] bg-[var(--work-wash)] p-4"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <p
                lang="en"
                className="font-display text-4xl font-extrabold leading-none text-[var(--text)]"
              >
                <span className={`mk mk-${activeCoachDetail.status}`}>
                  {activeCoachDetail.word}
                </span>
              </p>
              <AudioTtsButton text={activeCoachDetail.word} iconOnly />
            </div>
            <p
              lang="en"
              className="mt-2 font-ipa text-base text-[var(--text-2)]"
            >
              {activeCoachDetail.ipa}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed">
              {activeCoachDetail.note}
            </p>
          </div>

          <section aria-labelledby="ph-breakdown-title">
            <h3
              id="ph-breakdown-title"
              className="font-display text-base font-bold"
            >
              Rincian bunyi kata &ldquo;{activeCoachDetail.word}&rdquo;
            </h3>
            <div className="mt-2.5 grid gap-2.5">
              {activeCoachDetail.phonemeBreakdown.map((ph, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[4.5rem_1fr_2.25rem] items-center gap-2.5"
                >
                  <span lang="en" className="font-ipa text-sm font-bold">
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
              {activeCoachDetail.articulation.title}
            </h3>
            <div className="mt-2.5 grid place-items-center rounded-[14px] bg-[var(--surface)] p-3.5">
              <svg
                viewBox="0 0 160 90"
                role="img"
                aria-label="Ilustrasi posisi artikulasi mulut"
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
              {activeCoachDetail.articulation.steps.map((step, idx) => (
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
              {activeCoachDetail.articulation.minimalPairs.map((pairWord) => (
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
      prototypeNote={`Sesi aktif: ${user.name} (${user.email}) · Penilaian suara real-time aktif & tersambung ke PostgreSQL Laragon.`}
    >
      {isFirstOnboardingStep && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-[var(--coral)] bg-[var(--tile-coral)] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Badge variant="coral">Langkah 3 dari 3 · Latihan Pertama</Badge>
            <p className="text-sm font-semibold text-[var(--text)]">
              Ucapkan kalimat di bawah ini dengan mikrofon (atau klik penguji
              transkrip), lalu klik <strong>Selesai & Lihat Hasil Sesi</strong>!
            </p>
          </div>
          <ol
            aria-label="Langkah 3 dari 3"
            className="flex w-28 items-center gap-1.5"
          >
            <li className="h-2 flex-1 rounded-full bg-[var(--coral)]" />
            <li className="h-2 flex-1 rounded-full bg-[var(--coral)]" />
            <li className="h-2 flex-1 rounded-full bg-[var(--coral)]" />
          </ol>
        </div>
      )}

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
              Latihan Ucapan · Level {current.cefrLevel}
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
              className="w-28"
              aria-label={`Kalimat ${index + 1} dari ${totalInDeck}`}
            />
            <span
              className="text-xs font-semibold text-[var(--text-2)]"
              aria-live="polite"
            >
              Kalimat {index + 1} dari {totalInDeck}
            </span>
          </div>
        </div>
      </header>

      {/* Curriculum Goal Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="navigation"
        aria-label="Filter paket kalimat berdasarkan tujuan belajar"
      >
        {GOAL_TABS.map((tab) => {
          const isSelected =
            (tab.id === "user" && activeGoal === (user.goals[0] ?? "kerja")) ||
            tab.id === activeGoal;
          const href =
            tab.id === "user"
              ? "/latihan-ucapan"
              : tab.id === "bank"
              ? "/latihan-ucapan?source=bank"
              : `/latihan-ucapan?goal=${tab.id}`;
          return (
            <Button
              key={tab.id}
              asChild
              variant={isSelected ? "default" : "surface"}
              size="sm"
              className="min-h-[36px] rounded-pill px-3.5 text-xs"
            >
              <Link href={href}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>

      {/* Reusable Editorial Proofreading Sentence Card driven by REAL assessment marks */}
      <ProofreadingSentence
        sentence={current.text}
        ipa={current.ipa}
        translation={current.translation}
        marks={assessment ? assessment.marks : {}}
        showMarks={Boolean(assessment)}
        onWordSelect={(word) => {
          setSelectedCoachWord(word);
          setCoachOpen(true);
        }}
      />

      {/* Reusable Tap-to-Talk Microphone Recorder with Real Web Speech STT & Audio Playback */}
      <section aria-labelledby="rec-section-title">
        <h2 id="rec-section-title" className="sr-only">
          Rekam ucapan
        </h2>
        <MicRecorder
          state={micState}
          referenceText={current.text}
          onStateChange={(next) => {
            if (next === "recording" && micState === "done") {
              setAssessment(null);
            }
            setMicState(next);
          }}
          onFinishRecording={handleRecordingEvaluated}
        />
      </section>

      {/* Real Dynamic Assessment Result & 4 Score Metric Cards */}
      {assessment && (
        <section
          aria-labelledby="drill-result-title"
          aria-live="polite"
          className="grid gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="drill-result-title"
              className="font-display text-xl font-bold"
            >
              Hasil penilaian suaramu
            </h2>
            <p className="text-xs text-[var(--text-2)]">
              Transkrip terdeteksi:{" "}
              <strong lang="en" className="text-[var(--text)]">
                &ldquo;{assessment.spokenTranscript}&rdquo;
              </strong>
            </p>
          </div>

          {assessment.flaggedMistakes.length > 0 ? (
            <div className="rounded-card border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text)]">
                <RotateCcw
                  className="h-5 w-5 shrink-0 text-[var(--almost-text)]"
                  aria-hidden="true"
                />
                <span>
                  Coba ucapkan lagi kata{" "}
                  <span lang="en" className="mk mk-work">
                    {assessment.primaryFocusWord}
                  </span>{" "}
                  saja.
                </span>
              </h3>
              <p className="mt-1.5 text-sm text-[var(--text)]">
                Klik kata yang bergaris bawah untuk melihat panduan bibir/lidah
                di panel Catatan Pelatih, lalu coba rekam sekali lagi.
              </p>
              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                <AudioTtsButton
                  text={assessment.primaryFocusWord}
                  label={`Dengar "${assessment.primaryFocusWord}"`}
                  variant="surface"
                />
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={() => {
                    setSelectedCoachWord(assessment.primaryFocusWord);
                    setCoachOpen(true);
                  }}
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>Buka panduan bunyi ini</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] p-5">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--ok)]">
                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>
                  Semua kata terdengar jelas! Tidak ada kesalahan pada kalimat
                  ini.
                </span>
              </h3>
              <p className="mt-1 text-sm text-[var(--text)]">
                Pengucapanmu pada kalimat ini sudah tepat. Lanjut ke kalimat
                berikutnya atau simpan hasil sesimu.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {assessment.scores.map((s, idx) => (
              <ScoreMetricCard
                key={s.label}
                label={s.label}
                score={s.score}
                description={s.desc}
                tone={idx === 0 ? "coral" : undefined}
              />
            ))}
          </div>

          {savedWordsToDb.length > 0 && (
            <p className="text-sm text-[var(--text-2)]">
              Kata{" "}
              <strong lang="en">{savedWordsToDb.join(", ")}</strong> sudah
              otomatis dicatat ke{" "}
              <Link
                href="/bank-kesalahan"
                className="font-bold text-[var(--link)] underline"
              >
                Bank Kesalahan di PostgreSQL Laragon
              </Link>
              .
            </p>
          )}
        </section>
      )}

      {/* Footer Navigation & End-to-End Session Completion */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <Button
          type="button"
          variant="quiet"
          onClick={() => resetSentenceState((index + 1) % totalInDeck)}
        >
          Lewati kalimat ini
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          {(assessment || completedHistory.length > 0) && (
            <Button
              type="button"
              variant="accent"
              disabled={finishingSession}
              onClick={handleFinishSession}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>
                {finishingSession
                  ? "Menyimpan Sesi..."
                  : "Selesai & Lihat Hasil Sesi"}
              </span>
            </Button>
          )}
          <Button
            type="button"
            disabled={!assessment}
            onClick={() => resetSentenceState((index + 1) % totalInDeck)}
          >
            <span>Kalimat berikutnya</span>
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
