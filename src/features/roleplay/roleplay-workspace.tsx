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
import { MicRecorder, type MicState } from "@/components/shared/mic-recorder";
import { PhoneticWordRow } from "@/components/shared/phonetic-word-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
}

export interface RoleplayWorkspaceProps {
  user: UserProfileDTO;
  scenario: ScenarioDTO;
  allScenarios: Pick<
    ScenarioDTO,
    "slug" | "goalTag" | "title" | "category" | "cefrLevel" | "characterName"
  >[];
  initialCorrectionPref?: string;
}

export function RoleplayWorkspace({
  user,
  scenario,
  allScenarios,
  initialCorrectionPref = "giliran",
}: RoleplayWorkspaceProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [selectedHint, setSelectedHint] = React.useState<string | null>(null);
  const [correctionMode, setCorrectionMode] = React.useState(
    initialCorrectionPref
  );
  const [completedMissions, setCompletedMissions] = React.useState(1);
  const [elapsedSec, setElapsedSec] = React.useState(165);
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
    setCompletedMissions(1);
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
      const myUtterances = turns
        .filter((t) => t.who === "me")
        .map((t) => ({
          referenceText: t.text,
          transcript: t.text,
          betterVersion: t.correction ? `${t.text} (perjelas konsonan)` : null,
          status: (t.correction ? "almost" : "ok") as "almost" | "ok",
          note: t.correction?.title ?? "Sudah jelas dan natural",
          clarityScore: t.correction ? 79 : 91,
        }));

      const mistakesFromNodes = scenario.nodes
        .filter((n) => n.sampleCorrection)
        .map((n) => ({
          word: n.sampleCorrection!.word,
          ipa: n.sampleCorrection!.ipa,
          phoneme: n.sampleCorrection!.phoneme,
          errorPattern: n.sampleCorrection!.errorPattern,
          heardAs: n.sampleCorrection!.detailText,
          status: n.sampleCorrection!.status,
        }));

      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "roleplay",
          scenarioTitle: scenario.title,
          durationSec: elapsedSec,
          addedMinutes: 5,
          clarityScore: 86,
          pronunciationScore: 83,
          fluencyScore: 88,
          grammarScore: 82,
          vocabularyScore: 91,
          utterances:
            myUtterances.length > 0
              ? myUtterances
              : [
                  {
                    referenceText:
                      scenario.nodes[0]?.hints[0] ?? "Yes, please.",
                    transcript: scenario.nodes[0]?.hints[0] ?? "Yes, please.",
                    betterVersion: null,
                    status: "ok",
                    note: "Sudah jelas dan sopan",
                    clarityScore: 88,
                  },
                ],
          mistakes: mistakesFromNodes,
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

  const submitTurn = React.useCallback(async () => {
    if (!currentNode) return;
    const spokenText = selectedHint ?? currentNode.hints[0] ?? "Yes, please.";
    setSelectedHint(null);
    setMicState("idle");

    const sampleCorr = currentNode.sampleCorrection;
    const shouldShowInline = correctionMode === "giliran" && sampleCorr;

    const myTurn: ChatTurn = {
      id: `turn-me-${Date.now()}`,
      who: "me",
      speakerLabel: "Kamu",
      text: spokenText,
      correction: shouldShowInline
        ? {
            title: sampleCorr.promptText,
            detail: sampleCorr.detailText,
          }
        : undefined,
      okTag: !sampleCorr ? "Jelas dan natural" : undefined,
    };

    if (sampleCorr) {
      fetch("/api/v1/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: sampleCorr.word,
          ipa: sampleCorr.ipa,
          phoneme: sampleCorr.phoneme,
          errorPattern: sampleCorr.errorPattern,
          heardAs: sampleCorr.detailText,
          sourceMode: `Roleplay: ${scenario.title}`,
          status: sampleCorr.status,
        }),
      }).catch(() => {});
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
  }, [currentNode, selectedHint, correctionMode, stepIndex, scenario]);

  const rightPanel = (
    <>
      <div className="grid justify-items-center gap-2 rounded-[18px] bg-[var(--tile-coral)] p-4 text-center">
        <svg
          viewBox="0 0 120 80"
          width="124"
          role="img"
          aria-label="Ilustrasi skenario roleplay"
        >
          <ellipse cx="54" cy="70" rx="40" ry="6" fill="#D4C8B7" />
          <path
            d="M22 30h64v18a26 26 0 0 1-26 26h-12a26 26 0 0 1-26-26z"
            fill="#F7F5EE"
            stroke="#1E3E45"
            strokeWidth="3"
          />
          <path
            d="M86 36h6a10 10 0 0 1 0 20h-8"
            fill="none"
            stroke="#1E3E45"
            strokeWidth="3"
          />
          <path
            d="M30 30h48"
            stroke="#B5523B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M42 8c-4 6 4 8 0 14M56 6c-4 6 4 8 0 14M70 8c-4 6 4 8 0 14"
            stroke="#3B6A78"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-sm text-[var(--text)]">{scenario.description}</p>
      </div>

      <section aria-labelledby="missions-heading">
        <h2 id="missions-heading" className="font-display text-lg font-bold">
          Misimu (3 tugas)
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
      prototypeNote={`Aktif sebagai ${user.name} · Skenario roleplay menyesuaikan tujuan belajar (${scenario.category}).`}
    >
      {/* Topbar */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--tile-coral)] text-[var(--tile-coral-fg)]">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-2)]">
              Roleplay · {scenario.category}
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
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="navigation"
        aria-label="Pilih skenario roleplay"
      >
        {allScenarios.map((sc) => {
          const active = sc.slug === scenario.slug;
          return (
            <Button
              key={sc.slug}
              asChild
              variant={active ? "default" : "surface"}
              size="sm"
              className="min-h-[36px] rounded-pill px-3.5 text-xs"
            >
              <Link href={`/roleplay?slug=${sc.slug}`}>
                {sc.title} ({sc.characterName})
              </Link>
            </Button>
          );
        })}
      </div>

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
                  "max-w-[34rem]",
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
              Simpan hasil sesi ini ke database Laragon untuk menambah +5 menit
              bicaramu hari ini dan melihat kata yang masuk Bank Kesalahan.
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
          <MicRecorder
            compact
            state={micState}
            onStateChange={setMicState}
            onFinishRecording={submitTurn}
            onSimulateWithoutMic={submitTurn}
            idleLabel={
              selectedHint
                ? `Sekarang ucapkan: "${selectedHint}"`
                : "Ketuk untuk menjawab"
            }
          />
        </Card>
      )}
    </AppShell>
  );
}
