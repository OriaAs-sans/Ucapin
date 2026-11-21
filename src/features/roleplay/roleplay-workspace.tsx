"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
  Languages,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import {
  MicRecorder,
  type MicState,
  type RecordedSpeechResult,
} from "@/components/shared/mic-recorder";
import { PhoneticWordRow } from "@/components/shared/phonetic-word-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { assessSpokenUtterance } from "@/lib/speech-assessor";
import type { ScenarioDTO, UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

interface ChatTurn {
  id: string;
  who: "char" | "me";
  speakerLabel: string;
  text: string;
  translation?: string;
  correction?: {
    title: string;
    detail?: string;
    chips?: string[];
  };
  okTag?: string;
  /** Penilaian nyata giliran pelajar (hanya untuk who === "me"). */
  assessment?: {
    referenceText: string;
    scores: number[];
    speechSec: number;
    wpm: number;
    hasMistake: boolean;
    hasWork: boolean;
    flaggedWords: string[];
  };
}

export interface RoleplayWorkspaceProps {
  user: UserProfileDTO;
  scenario: ScenarioDTO;
  allScenarios: Pick<
    ScenarioDTO,
    "slug" | "goalTag" | "title" | "category" | "cefrLevel" | "characterName"
  >[];
  initialCorrectionPref?: string;
  /** Kunci dan nomor bab skenario ini di jalur roleplay. */
  chapterKey: string;
  chapterOrder: number;
}

export function RoleplayWorkspace({
  scenario,
  chapterKey,
  chapterOrder,
  initialCorrectionPref = "giliran",
}: RoleplayWorkspaceProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [selectedHint, setSelectedHint] = React.useState<string | null>(null);
  const [correctionMode, setCorrectionMode] = React.useState(
    initialCorrectionPref
  );
  const [completedMissions, setCompletedMissions] = React.useState(0);
  const [elapsedSec, setElapsedSec] = React.useState(0);
  const [turnNotice, setTurnNotice] = React.useState<string | null>(null);
  const [savingSession, setSavingSession] = React.useState(false);
  const [openTranslations, setOpenTranslations] = React.useState<
    Record<string, boolean>
  >({});

  const buildInitialTurns = React.useCallback(
    (sc: ScenarioDTO): ChatTurn[] => [
      {
        id: `turn-init-${sc.slug}-1`,
        who: "char",
        speakerLabel: `${sc.characterName}, ${sc.characterRole}`,
        text:
          sc.nodes[0]?.speakerLine ??
          "Hi there! Welcome. How can I help you today?",
        translation:
          sc.nodes[0]?.translation ??
          "Halo! Selamat datang. Ada yang bisa saya bantu hari ini?",
      },
    ],
    []
  );

  const [turns, setTurns] = React.useState<ChatTurn[]>(() =>
    buildInitialTurns(scenario)
  );

  React.useEffect(() => {
    setStepIndex(0);
    setMicState("idle");
    setSelectedHint(null);
    setCompletedMissions(0);
    setTurnNotice(null);
    setTurns(buildInitialTurns(scenario));
  }, [scenario, buildInitialTurns]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentNode = scenario.nodes[stepIndex];
  const isFinished = stepIndex >= scenario.nodes.length;

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleCompleteAndViewResult = async () => {
    setSavingSession(true);
    try {
      const assessedTurns = turns.filter((t) => t.who === "me" && t.assessment);
      if (assessedTurns.length === 0) {
        setSavingSession(false);
        return;
      }
      const avg = (idx: number) =>
        Math.round(
          assessedTurns.reduce((acc, t) => acc + (t.assessment!.scores[idx] ?? 0), 0) /
            assessedTurns.length
        );
      const speechSec = assessedTurns.reduce((acc, t) => acc + t.assessment!.speechSec, 0);
      const myUtterances = assessedTurns.map((t) => ({
        referenceText: t.assessment!.referenceText,
        transcript: t.text,
        betterVersion: t.assessment!.hasMistake ? t.assessment!.referenceText : null,
        status: (t.assessment!.hasWork ? "work" : t.assessment!.hasMistake ? "almost" : "ok") as
          | "work"
          | "almost"
          | "ok",
        note: t.assessment!.hasMistake
          ? `Perhatikan kata: ${t.assessment!.flaggedWords.join(", ")}`
          : "Semua kata terdengar jelas",
        clarityScore: t.assessment!.scores[0] ?? 0,
      }));

      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "roleplay",
          chapterKey,
          scenarioTitle: scenario.title,
          durationSec: elapsedSec,
          // Menit bicara dihitung dari lama rekaman, bukan lama halaman terbuka.
          addedMinutes: Math.max(1, Math.round(speechSec / 60)),
          clarityScore: avg(0),
          pronunciationScore: avg(1),
          fluencyScore: avg(2),
          wpm: Math.round(
            assessedTurns.reduce((acc, t) => acc + t.assessment!.wpm, 0) / assessedTurns.length
          ),
          utterances: myUtterances,
          // Kesalahan sudah dicatat per giliran saat dinilai; tidak ada kesalahan contoh dari skrip.
          mistakes: [],
        }),
      });
      const data = await res.json();
      if (data.ok && data.redirectTo) {
        router.push(data.redirectTo);
        router.refresh();
        return;
      }
    } finally {
      setSavingSession(false);
    }
    router.push("/hasil");
  };

  const submitTurn = React.useCallback(
    async (rec?: RecordedSpeechResult) => {
      if (!currentNode) return;
      if (!rec || rec.words.length === 0) return;
      const spokenText = rec.transcript.trim();

      // Pelajar boleh menjawab dengan petunjuk mana pun: nilai terhadap petunjuk yang paling mirip.
      const candidates = selectedHint
        ? [selectedHint]
        : currentNode.hints.length > 0
        ? currentNode.hints
        : [spokenText];
      const assessments = candidates.map((hint) => ({
        hint,
        result: assessSpokenUtterance({
          referenceText: hint,
          spokenWords: rec.words,
          defaultTargetMarks: {},
        }),
      }));
      const best = assessments.reduce((a, b) =>
        (b.result.scores[0]?.score ?? 0) > (a.result.scores[0]?.score ?? 0) ? b : a
      );
      const targetReference = best.hint;
      const evaluated = best.result;
      setMicState("idle");

      // Jawaban yang tidak nyambung: minta coba lagi dulu (prompt), jangan langsung dikoreksi.
      if ((evaluated.scores[0]?.score ?? 0) < 30) {
        setTurnNotice(
          `Kami menangkap "${spokenText}", tapi belum nyambung dengan pertanyaannya. Coba jawab lagi, atau pilih salah satu petunjuk di bawah.`
        );
        return;
      }
      setTurnNotice(null);
      setSelectedHint(null);

      fetch("/api/v1/mistakes/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: Object.values(evaluated.wordDetails).map((d) => ({
            word: d.word,
            status: d.status,
          })),
        }),
      }).catch(() => {});

      const firstMistake = evaluated.flaggedMistakes[0];
      const shouldShowInline =
        correctionMode === "giliran" && Boolean(firstMistake);

      const myTurn: ChatTurn = {
        id: `turn-me-${Date.now()}`,
        who: "me",
        speakerLabel: "Kamu",
        text: spokenText,
        correction:
          shouldShowInline && firstMistake
            ? {
                title: `Perhatikan pengucapan kata "${firstMistake.word}" (${firstMistake.errorPattern})`,
                detail: `${firstMistake.heardAs}. Kalimat acuan: "${targetReference}". Kata ini masuk Bank Kesalahan.`,
              }
            : undefined,
        okTag: !firstMistake ? "Ucapan jelas dan natural" : undefined,
        assessment: {
          referenceText: targetReference,
          scores: evaluated.scores.map((sc) => sc.score),
          speechSec: rec.durationMs / 1000,
          wpm: evaluated.wordsPerMinute,
          hasMistake: evaluated.flaggedMistakes.length > 0,
          hasWork: evaluated.flaggedMistakes.some((m) => m.status === "work"),
          flaggedWords: evaluated.flaggedMistakes.map((m) => m.word),
        },
      };

      if (evaluated.flaggedMistakes.length > 0) {
        for (const m of evaluated.flaggedMistakes) {
          fetch("/api/v1/mistakes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              word: m.word,
              ipa: m.ipa,
              phoneme: m.phoneme,
              errorPattern: m.errorPattern,
              heardAs: m.heardAs,
              sourceMode: `Roleplay: ${scenario.title}`,
              status: m.status,
            }),
          }).catch(() => {});
        }
      }

      const nextIdx = stepIndex + 1;
      const nextNode = scenario.nodes[nextIdx];

      setTurns((prev) => [...prev, myTurn]);
      setCompletedMissions(currentNode.targetMission);
      setStepIndex(nextIdx);

      if (nextNode) {
        window.setTimeout(() => {
          setTurns((prev) => [
            ...prev,
            {
              id: `turn-char-${Date.now()}`,
              who: "char",
              speakerLabel: `${scenario.characterName}, ${scenario.characterRole}`,
              text: nextNode.speakerLine,
              translation: nextNode.translation,
            },
          ]);
        }, 450);
      } else {
        setCompletedMissions(scenario.missions.length);
      }
    },
    [currentNode, selectedHint, correctionMode, stepIndex, scenario]
  );

  const rightPanel = (
    <>
      <div className="grid gap-2 rounded-[18px] bg-[var(--tile-coral)] p-4">
        <p className="text-xs font-bold text-[var(--tile-coral-fg)]">
          Situasi · {scenario.cefrLevel}
        </p>
        <p className="text-sm text-[var(--text)]">{scenario.description}</p>
      </div>

      <section aria-labelledby="missions-heading">
        <h2 id="missions-heading" className="font-display text-lg font-bold">
          Misimu ({scenario.missions.length} tugas)
        </h2>
        <div className="mt-2.5 grid gap-2">
          {scenario.missions.map((m, idx) => {
            const isDone = idx < completedMissions;
            const isCurrent = idx === completedMissions;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 py-1.5 font-semibold"
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 font-display text-xs font-extrabold",
                    isDone &&
                      "border-[var(--ok)] bg-[var(--ok)] text-[var(--bg)]",
                    isCurrent &&
                      "border-[var(--coral)] bg-[var(--coral)] text-[var(--on-coral)]",
                    !isDone &&
                      !isCurrent &&
                      "border-[var(--line)] text-[var(--text-2)]"
                  )}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.6]" />
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={cn(isDone && "line-through text-[var(--text-2)]")}
                >
                  {m}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="phrases-heading">
        <h2 id="phrases-heading" className="font-display text-lg font-bold">
          Frasa berguna
        </h2>
        <div className="mt-2.5 grid gap-2">
          {scenario.usefulPhrases.map((p) => (
            <PhoneticWordRow
              key={p.phrase}
              word={p.phrase}
              subtitle={p.meaning}
            />
          ))}
        </div>
      </section>

      <fieldset>
        <legend className="mb-2.5 font-display text-base font-bold">
          Kapan kamu mau dikoreksi?
        </legend>
        <div className="grid gap-2.5">
          {[
            {
              value: "giliran",
              title: "Setiap giliran",
              desc: "Belajar lebih cepat",
            },
            {
              value: "akhir",
              title: "Di akhir sesi",
              desc: "Lebih santai saat bicara",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-control border-2 p-3 font-semibold transition-all",
                correctionMode === opt.value
                  ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              )}
            >
              <input
                type="radio"
                name="koreksi"
                value={opt.value}
                checked={correctionMode === opt.value}
                onChange={() => setCorrectionMode(opt.value)}
                className="mt-1 h-4 w-4 accent-[var(--coral)]"
              />
              <span>
                {opt.title}
                <small className="block text-xs font-normal text-[var(--text-2)]">
                  {opt.desc}
                </small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );

  return (
    <AppShell
      rightPanel={rightPanel}
      rightPanelLabel="Misi dan bantuan roleplay"
    >
      {/* Topbar */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/roleplay" aria-label="Kembali ke daftar bab roleplay">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-2)]">
              Roleplay · {scenario.category} · Bab {chapterOrder}
            </p>
            <h1 className="font-display text-2xl font-extrabold">
              {scenario.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="teal">{scenario.cefrLevel}</Badge>
          <Badge variant="ghost" className="text-sm">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            <span aria-label="Lama sesi" className="tabular-nums">
              {formatTimer(elapsedSec)}
            </span>
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={savingSession}
            onClick={handleCompleteAndViewResult}
          >
            {savingSession ? "Menyimpan..." : "Akhiri & Simpan Hasil"}
          </Button>
        </div>
      </header>

      {/* Scenario Switcher across All 4 Goals */}
      {/* Conversation Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--teal-600)] font-display text-base font-extrabold text-[#F7F5EE]"
            >
              {scenario.characterName[0]}
            </span>
            <div>
              <p className="font-bold">
                {scenario.characterName}, {scenario.characterRole}{" "}
                <span className="font-normal text-[var(--text-2)]">
                  (karakter)
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-[var(--text-2)]">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--ok)]" />
                <span>{scenario.characterTrait}</span>
              </p>
            </div>
          </div>
          <Badge variant="green">
            Koreksi: {correctionMode === "giliran" ? "tiap giliran" : "di akhir"}
          </Badge>
        </div>

        {/* Chat Stream */}
        <div className="mt-5 flex flex-col gap-5" aria-live="polite">
          {turns.map((turn) => {
            const isMe = turn.who === "me";
            const trOpen = !!openTranslations[turn.id];
            return (
              <div
                key={turn.id}
                className={cn(
                  "enter-rise max-w-[34rem]",
                  isMe ? "self-end text-right" : "self-start text-left"
                )}
              >
                <div className="mb-1.5 text-xs font-bold text-[var(--text-2)]">
                  {turn.speakerLabel}
                </div>
                <p
                  lang="en"
                  className={cn(
                    "rounded-[20px] px-4 py-3 text-lg leading-relaxed",
                    isMe
                      ? "rounded-br-[6px] bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                      : "rounded-bl-[6px] bg-[var(--surface-2)] text-[var(--text)]"
                  )}
                >
                  {turn.text}
                </p>

                <div
                  className={cn(
                    "mt-2 flex flex-wrap gap-2",
                    isMe ? "justify-end" : "justify-start"
                  )}
                >
                  <AudioTtsButton
                    text={turn.text}
                    rate={1}
                    label="Putar"
                    className="min-h-[34px] rounded-pill px-3 text-xs"
                  />
                  {!isMe && (
                    <>
                      <AudioTtsButton
                        text={turn.text}
                        rate={0.7}
                        label="Pelan"
                        className="min-h-[34px] rounded-pill px-3 text-xs"
                      />
                      {turn.translation && (
                        <Button
                          type="button"
                          variant="surface"
                          size="sm"
                          aria-pressed={trOpen}
                          onClick={() =>
                            setOpenTranslations((prev) => ({
                              ...prev,
                              [turn.id]: !prev[turn.id],
                            }))
                          }
                          className="min-h-[34px] rounded-pill px-3 text-xs"
                        >
                          <Languages className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Arti</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {trOpen && turn.translation && (
                  <p className="mt-1.5 text-sm text-[var(--text-2)]">
                    {turn.translation}
                  </p>
                )}

                {turn.correction && (
                  <div className="mt-3 rounded-card border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] p-4 text-left">
                    <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[var(--text)]">
                      <RotateCcw
                        className="h-4 w-4 shrink-0 text-[var(--almost-text)]"
                        aria-hidden="true"
                      />
                      <span>{turn.correction.title}</span>
                    </h3>
                    {turn.correction.detail && (
                      <p className="mt-1 text-xs text-[var(--text)]">
                        {turn.correction.detail}
                      </p>
                    )}
                  </div>
                )}

                {turn.okTag && (
                  <div className="mt-2 flex justify-end">
                    <Badge variant="ok">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{turn.okTag}</span>
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Speaking Hints */}
        {!isFinished && currentNode && (
          <div className="mt-6 border-t border-dashed border-[var(--line)] pt-4">
            <p className="mb-2.5 text-sm text-[var(--text-2)]">
              Bingung? Pilih petunjuk kalimat di bawah, lalu tetap ucapkan
              sendiri dengan suaramu:
            </p>
            <div className="flex flex-wrap gap-2">
              {currentNode.hints.map((hint) => {
                const active = selectedHint === hint;
                return (
                  <Button
                    key={hint}
                    type="button"
                    lang="en"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    aria-pressed={active}
                    onClick={() => setSelectedHint(hint)}
                    className="rounded-pill"
                  >
                    {hint}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {isFinished && (
          <div className="mt-6 rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] p-5">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--ok)]">
              <Check className="h-5 w-5" aria-hidden="true" />
              <span>Semua misi beres!</span>
            </h3>
            <p className="mt-1 text-sm text-[var(--text)]">
              Simpan hasil sesi ini untuk menambah menit bicaramu hari ini dan
              melihat kata yang masuk Bank Kesalahan.
            </p>
            <div className="mt-3.5">
              <Button
                type="button"
                variant="accent"
                disabled={savingSession}
                onClick={handleCompleteAndViewResult}
              >
                {savingSession
                  ? "Menyimpan Sesi..."
                  : "Simpan & Lihat Hasil Sesi (+5 mnt)"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Voice Composer */}
      {!isFinished && (
        <Card className="p-5">
          {turnNotice && (
            <p
              role="status"
              className="rounded-control border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] px-4 py-3 text-sm text-[var(--text)]"
            >
              {turnNotice}
            </p>
          )}
          <MicRecorder
            compact
            state={micState}
            referenceText={
              selectedHint ?? currentNode?.hints[0] ?? "Yes, please."
            }
            onStateChange={setMicState}
            onFinishRecording={submitTurn}
            idleLabel={
              selectedHint
                ? `Sekarang ucapkan: "${selectedHint}"`
                : "Ketuk mikrofon untuk menjawab"
            }
          />
        </Card>
      )}
    </AppShell>
  );
}
