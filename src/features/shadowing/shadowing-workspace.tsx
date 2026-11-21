"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Headphones, Volume2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import {
  MicRecorder,
  type MicState,
  type RecordedSpeechResult,
} from "@/components/shared/mic-recorder";
import { ProofreadingSentence } from "@/components/shared/proofreading-sentence";
import { ScoreMetricCard } from "@/components/shared/score-metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  assessSpokenUtterance,
  type UtteranceAssessmentResult,
} from "@/lib/speech-assessor";
import type { DrillSentenceDTO, UserProfileDTO } from "@/types/ucapin";
import { cn } from "@/lib/utils";

interface ShadowResult {
  referenceText: string;
  assessment: UtteranceAssessmentResult;
  tempoScore: number;
  tempoNote: string;
  speechSec: number;
}

// Kemiripan tempo: rentang bicara pelajar dibandingkan durasi audio contoh.
function compareTempo(modelSec: number | null, learnerSpanSec: number) {
  if (!modelSec || learnerSpanSec <= 0) {
    return { score: 0, note: "Durasi contoh belum terukur. Putar contoh dulu, lalu rekam lagi." };
  }
  const ratio = learnerSpanSec / modelSec;
  const score = Math.max(0, Math.min(100, Math.round(100 - Math.abs(1 - ratio) * 120)));
  const pct = Math.round(Math.abs(1 - ratio) * 100);
  const note =
    pct <= 10
      ? "Tempomu hampir sama dengan contoh"
      : ratio > 1
      ? `Tempomu ${pct}% lebih lambat dari contoh`
      : `Tempomu ${pct}% lebih cepat dari contoh`;
  return { score, note };
}

export function ShadowingWorkspace({
  user,
  sentences,
}: {
  user: UserProfileDTO;
  sentences: DrillSentenceDTO[];
}) {
  const router = useRouter();
  const [index, setIndex] = React.useState(0);
  const [micState, setMicState] = React.useState<MicState>("idle");
  const [hideText, setHideText] = React.useState(false);
  const [listened, setListened] = React.useState(false);
  const [modelSec, setModelSec] = React.useState<number | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [result, setResult] = React.useState<ShadowResult | null>(null);
  const [history, setHistory] = React.useState<ShadowResult[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const current = sentences[index];

  React.useEffect(() => () => audioRef.current?.pause(), []);

  const playModel = (slow = false) => {
    if (!current) return;
    audioRef.current?.pause();
    const params = new URLSearchParams({ text: current.text });
    if (slow) params.set("slow", "1");
    const audio = new Audio(`/api/v1/speech/tts?${params.toString()}`);
    audioRef.current = audio;
    audio.onloadedmetadata = () => {
      // Durasi tempo normal yang dipakai sebagai pembanding; versi pelan tidak dihitung.
      if (!slow && Number.isFinite(audio.duration)) setModelSec(audio.duration);
    };
    audio.onplay = () => setPlaying(true);
    audio.onended = () => {
      setPlaying(false);
      setListened(true);
    };
    audio.onerror = () => setPlaying(false);
    audio.play().catch(() => setPlaying(false));
  };

  const goTo = (nextIdx: number) => {
    audioRef.current?.pause();
    setIndex(nextIdx);
    setMicState("idle");
    setListened(false);
    setModelSec(null);
    setResult(null);
  };

  const handleRecorded = React.useCallback(
    (rec: RecordedSpeechResult) => {
      if (!current) return;
      const assessment = assessSpokenUtterance({
        referenceText: current.text,
        spokenWords: rec.words,
        defaultTargetMarks: current.targetMarks,
      });
      const words = rec.words;
      const span = words.length >= 2 ? words[words.length - 1].end - words[0].start : 0;
      const tempo = compareTempo(modelSec, span);
      const shadow: ShadowResult = {
        referenceText: current.text,
        assessment,
        tempoScore: tempo.score,
        tempoNote: tempo.note,
        speechSec: rec.durationMs / 1000,
      };
      setResult(shadow);
      setHistory((h) => [...h, shadow]);
      setMicState("done");

      for (const m of assessment.flaggedMistakes) {
        fetch("/api/v1/mistakes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...m, sourceMode: `Shadowing: ${current.category}` }),
        }).catch(() => {});
      }
      fetch("/api/v1/mistakes/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          results: Object.values(assessment.wordDetails).map((d) => ({ word: d.word, status: d.status })),
        }),
      }).catch(() => {});
    },
    [current, modelSec]
  );

  const finishSession = async () => {
    if (history.length === 0) return;
    setSaving(true);
    setSaveError(null);
    const avg = (pick: (r: ShadowResult) => number) =>
      Math.round(history.reduce((acc, r) => acc + pick(r), 0) / history.length);
    const speechSec = history.reduce((acc, r) => acc + r.speechSec, 0);
    try {
      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "drill",
          scenarioTitle: `Shadowing: ${current?.category ?? "Latihan"}`,
          durationSec: Math.round(speechSec),
          addedMinutes: Math.max(1, Math.round(speechSec / 60)),
          clarityScore: avg((r) => r.assessment.scores[0]?.score ?? 0),
          pronunciationScore: avg((r) => r.assessment.scores[1]?.score ?? 0),
          fluencyScore: avg((r) => r.tempoScore),
          wpm: avg((r) => r.assessment.wordsPerMinute),
          utterances: history.map((r) => ({
            referenceText: r.referenceText,
            transcript: r.assessment.spokenTranscript,
            betterVersion: null,
            status: r.assessment.flaggedMistakes.length === 0 ? "ok" : "almost",
            note: r.tempoNote,
            clarityScore: r.assessment.scores[0]?.score ?? 0,
          })),
          mistakes: [],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data.error ?? "Sesi gagal disimpan.");
        return;
      }
      router.push(data.redirectTo ?? "/hasil");
      router.refresh();
    } catch {
      setSaveError("Tidak bisa terhubung ke server. Coba simpan lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!current) {
    return (
      <AppShell>
        <Card className="p-6">
          <h1 className="font-display text-2xl font-bold">Belum ada kalimat untuk shadowing</h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Pilih tujuan belajar dulu supaya kalimat latihannya muncul.
          </p>
          <Button asChild className="mt-4">
            <Link href="/mulai">Pilih tujuan belajar</Link>
          </Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="surface" size="icon">
            <Link href="/" aria-label="Kembali ke Beranda">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-extrabold">Shadowing</h1>
            <p className="text-sm text-[var(--text-2)]">
              Dengarkan, lalu tirukan tempo dan iramanya · {current.category} · kalimat{" "}
              {index + 1} dari {sentences.length}
            </p>
          </div>
        </div>
        <Badge variant="teal">Level {current.cefrLevel}</Badge>
      </header>

      <ol className="grid gap-2 text-sm sm:grid-cols-3" aria-label="Langkah shadowing">
        {[
          { label: "Dengarkan contoh", done: listened },
          { label: "Tirukan sambil merekam", done: Boolean(result) },
          { label: "Bandingkan tempomu", done: Boolean(result) },
        ].map((step, i) => (
          <li
            key={step.label}
            className={cn(
              "flex items-center gap-2 rounded-control border-[1.5px] px-3 py-2",
              step.done ? "border-[var(--ok)] text-[var(--ok)]" : "border-[var(--line)] text-[var(--text-2)]"
            )}
          >
            {step.done ? (
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <span className="grid h-4 w-4 shrink-0 place-items-center text-xs font-bold">{i + 1}</span>
            )}
            <span className="font-semibold">{step.label}</span>
          </li>
        ))}
      </ol>

      <Card className="grid gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button type="button" variant="accent" onClick={() => playModel(false)} disabled={playing}>
            <Headphones className="h-5 w-5" aria-hidden="true" />
            <span>{playing ? "Memutar contoh..." : listened ? "Dengar lagi" : "Dengar contoh"}</span>
          </Button>
          <Button type="button" variant="surface" onClick={() => playModel(true)} disabled={playing}>
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>Pelan</span>
          </Button>
          <Button
            type="button"
            variant="quiet"
            aria-pressed={hideText}
            onClick={() => setHideText((v) => !v)}
          >
            {hideText ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
            <span>{hideText ? "Tampilkan teks" : "Tantangan: sembunyikan teks"}</span>
          </Button>
        </div>

        {hideText && !result ? (
          <p className="rounded-card border-[1.5px] border-dashed border-[var(--line)] p-8 text-center text-sm text-[var(--text-2)]">
            Teks disembunyikan. Tirukan dari apa yang kamu dengar.
          </p>
        ) : (
          <ProofreadingSentence
            sentence={current.text}
            ipa={current.ipa}
            translation={current.translation}
            marks={result ? result.assessment.marks : {}}
            showMarks={Boolean(result)}
            revealKey={history.length}
            hideAudioControls
            promptLabel="Tirukan kalimat ini, ikuti tempo contohnya"
          />
        )}
      </Card>

      <MicRecorder
        state={micState}
        referenceText={current.text}
        onStateChange={setMicState}
        onFinishRecording={handleRecorded}
        idleLabel={listened ? "Sekarang tirukan kalimatnya" : "Dengar contoh dulu, lalu ketuk mikrofon"}
        idleHint="Ikuti tempo dan jeda seperti contoh"
      />

      {result && (
        <section key={history.length} className="enter-rise grid gap-4" aria-live="polite">
          <h2 className="font-display text-xl font-bold">Hasil shadowing</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ScoreMetricCard
              label="Kejelasan"
              score={result.assessment.scores[0]?.score ?? 0}
              description={result.assessment.scores[0]?.desc ?? ""}
            />
            <ScoreMetricCard
              label="Kemiripan tempo"
              score={result.tempoScore}
              description={result.tempoNote}
            />
          </div>
        </section>
      )}

      {saveError && (
        <p role="alert" className="rounded-control border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] px-4 py-3 text-sm font-bold text-[var(--work-text)]">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5">
        <Button
          type="button"
          variant="quiet"
          disabled={index === 0}
          onClick={() => goTo(Math.max(0, index - 1))}
        >
          Kalimat sebelumnya
        </Button>
        <div className="flex flex-wrap gap-3">
          {history.length > 0 && (
            <Button type="button" variant="accent" disabled={saving} onClick={finishSession}>
              <Check className="h-4 w-4" aria-hidden="true" />
              <span>{saving ? "Menyimpan..." : `Selesai (${history.length} rekaman)`}</span>
            </Button>
          )}
          <Button
            type="button"
            disabled={index >= sentences.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <span>Kalimat berikutnya</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-[var(--text-2)]">
        Menit bicara dihitung dari lama rekamanmu, {user.name.split(" ")[0]}, bukan dari lama halaman
        ini terbuka.
      </p>
    </AppShell>
  );
}
