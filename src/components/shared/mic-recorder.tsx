"use client";

import * as React from "react";
import Link from "next/link";
import { Keyboard, Mic, RotateCcw, Square, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SpokenWord } from "@/lib/speech-assessor";
import { cn, isDevBuild, mapMicError, type MicErrorInfo } from "@/lib/utils";

export type MicState = "idle" | "recording" | "processing" | "done";

export interface RecordedSpeechResult {
  transcript: string;
  words: SpokenWord[];
  durationMs: number;
  audioUrl: string | null;
}

export interface MicRecorderProps {
  state: MicState;
  referenceText?: string;
  onStateChange: (next: MicState) => void;
  onFinishRecording: (result: RecordedSpeechResult) => void;
  compact?: boolean;
  idleLabel?: string;
  idleHint?: string;
  className?: string;
}

const MAX_RECORDING_MS = 30_000;
const MIN_RECORDING_MS = 600;
const BAR_COUNT = 12;

interface RecorderIssue {
  title: string;
  body: string;
  showMicCheck: boolean;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

export function MicRecorder({
  state,
  referenceText = "",
  onStateChange,
  onFinishRecording,
  compact = false,
  idleLabel = "Ketuk mikrofon untuk mulai bicara",
  idleHint = "Ketuk lagi saat selesai bicara",
  className,
}: MicRecorderProps) {
  const [levels, setLevels] = React.useState<number[]>(() => Array(BAR_COUNT).fill(6));
  const [issue, setIssue] = React.useState<RecorderIssue | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = React.useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = React.useState(0);
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualText, setManualText] = React.useState("");

  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startTimeRef = React.useRef(0);
  const rafRef = React.useRef(0);
  const timerRef = React.useRef<number>(0);
  const lastBlobRef = React.useRef<{ blob: Blob; durationMs: number } | null>(null);

  const releaseHardware = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    window.clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevels(Array(BAR_COUNT).fill(6));
  }, []);

  React.useEffect(() => () => releaseHardware(), [releaseHardware]);

  React.useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  const sendForAssessment = React.useCallback(
    async (blob: Blob, durationMs: number) => {
      onStateChange("processing");
      setIssue(null);
      try {
        const form = new FormData();
        form.append("audio", blob, "ucapan.webm");
        const res = await fetch("/api/v1/speech/transcribe", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setIssue({
            title: "Rekaman belum bisa dinilai",
            body: data.error ?? "Server tidak merespons. Coba kirim ulang rekamanmu.",
            showMicCheck: false,
          });
          onStateChange("idle");
          return;
        }
        const words: SpokenWord[] = Array.isArray(data.words) ? data.words : [];
        if (words.length === 0) {
          setIssue({
            title: "Suaramu tidak terdengar",
            body: "Rekaman masuk, tapi tidak ada kata yang tertangkap. Dekatkan mikrofon, bicara sedikit lebih keras, lalu coba lagi.",
            showMicCheck: true,
          });
          onStateChange("idle");
          return;
        }
        lastBlobRef.current = null;
        onFinishRecording({
          transcript: data.transcript ?? words.map((w) => w.text).join(" "),
          words,
          durationMs,
          audioUrl: URL.createObjectURL(blob),
        });
      } catch {
        setIssue({
          title: "Koneksi terputus",
          body: "Rekamanmu masih tersimpan di halaman ini. Periksa internet lalu kirim ulang.",
          showMicCheck: false,
        });
        onStateChange("idle");
      }
    },
    [onFinishRecording, onStateChange]
  );

  const stopRecording = React.useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  }, []);

  const startRecording = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      const e = new Error("unsupported");
      e.name = "NotSupportedError";
      throw e;
    }
    if (typeof MediaRecorder === "undefined") {
      const e = new Error("unsupported");
      e.name = "NotSupportedError";
      throw e;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    streamRef.current = stream;
    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onstop = () => {
      const durationMs = performance.now() - startTimeRef.current;
      releaseHardware();
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(URL.createObjectURL(blob));
      if (durationMs < MIN_RECORDING_MS) {
        setIssue({
          title: "Rekaman terlalu singkat",
          body: "Ketuk sekali untuk mulai, ucapkan kalimatnya, lalu ketuk lagi untuk selesai.",
          showMicCheck: false,
        });
        onStateChange("idle");
        return;
      }
      lastBlobRef.current = { blob, durationMs };
      void sendForAssessment(blob, durationMs);
    };

    recorder.start();
    startTimeRef.current = performance.now();
    setElapsedSec(0);
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      setElapsedSec(Math.floor(elapsed / 1000));
      if (elapsed >= MAX_RECORDING_MS) stopRecording();
    }, 250);

    // Meter level dari AnalyserNode: memberi tanda bahwa suara benar-benar masuk.
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buffer = new Uint8Array(analyser.fftSize);
    const maxHeight = compact ? 28 : 44;
    const tick = () => {
      analyser.getByteTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) {
        const v = (buffer[i] - 128) / 128;
        sum += v * v;
      }
      const level = Math.min(1, Math.sqrt(sum / buffer.length) * 4);
      const now = performance.now();
      setLevels(
        Array.from({ length: BAR_COUNT }, (_, idx) => {
          const wobble = 0.55 + 0.45 * Math.abs(Math.sin(idx * 1.7 + now / 140));
          return Math.max(6, Math.round(level * maxHeight * wobble));
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const handleToggle = async () => {
    if (state === "processing") return;
    if (state === "recording") {
      stopRecording();
      return;
    }
    setIssue(null);
    try {
      await startRecording();
      onStateChange("recording");
    } catch (err) {
      releaseHardware();
      const info: MicErrorInfo = mapMicError(err);
      setIssue({ title: info.title, body: info.body, showMicCheck: true });
      onStateChange("idle");
    }
  };

  const retrySend = () => {
    const last = lastBlobRef.current;
    if (last) void sendForAssessment(last.blob, last.durationMs);
  };

  // Hanya untuk pengembangan: menguji alur penilaian tanpa mikrofon.
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokens = manualText.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return;
    onFinishRecording({
      transcript: manualText.trim(),
      words: tokens.map((text, i) => ({ text, confidence: 0.95, start: i * 0.42, end: i * 0.42 + 0.32 })),
      durationMs: tokens.length * 420,
      audioUrl: null,
    });
  };

  const playOwnRecording = () => {
    if (recordedAudioUrl) new Audio(recordedAudioUrl).play().catch(() => {});
  };

  const statusLabels: Record<MicState, [string, string]> = {
    idle: [idleLabel, idleHint],
    recording: [
      `Merekam... ${elapsedSec} detik`,
      "Ketuk tombol lagi saat selesai bicara",
    ],
    processing: ["Menilai ucapanmu...", "Mencocokkan setiap kata dengan kalimat acuan"],
    done: ["Ketuk mikrofon untuk merekam ulang", "Ucapkan lagi untuk memperbaiki skor"],
  };
  const [mainText, subText] = statusLabels[state];

  const levelBars = (
    <>
      {levels.map((h, i) => (
        <i
          key={i}
          style={{ height: `${h}px` }}
          className={cn(
            "block w-[5px] rounded-[3px] transition-[height] duration-75",
            state === "recording" ? "bg-[var(--coral)]" : "bg-[var(--line)]"
          )}
        />
      ))}
    </>
  );

  const issuePanel = issue && (
    <div
      role="alert"
      className={cn(
        "w-full rounded-card border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] text-sm",
        compact ? "p-4" : "mt-5 p-5"
      )}
    >
      <h3 className="flex items-center gap-2 font-display text-base font-bold text-[var(--work-text)]">
        <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{issue.title}</span>
      </h3>
      <p className="mt-1.5 text-[var(--text)]">{issue.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {lastBlobRef.current && !issue.showMicCheck && (
          <Button type="button" size="sm" onClick={retrySend}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Kirim ulang rekaman</span>
          </Button>
        )}
        {issue.showMicCheck && (
          <Button asChild variant="surface" size="sm">
            <Link href="/cek-mikrofon">Buka cek mikrofon</Link>
          </Button>
        )}
      </div>
    </div>
  );

  const devManualForm = isDevBuild && manualOpen && (
    <form
      onSubmit={handleManualSubmit}
      className="flex w-full max-w-2xl flex-wrap items-center gap-2 rounded-control border border-dashed border-[var(--line)] bg-[var(--bg)] p-3"
    >
      <Input
        value={manualText}
        onChange={(e) => setManualText(e.target.value)}
        aria-label="Transkrip uji (mode pengembangan)"
        className="min-h-[40px] flex-1 text-sm"
      />
      <Button type="submit" size="sm">
        Nilai transkrip ini
      </Button>
    </form>
  );

  const devManualToggle = isDevBuild && (
    <Button
      type="button"
      variant="quiet"
      size="sm"
      onClick={() => {
        setManualOpen((v) => !v);
        if (!manualText) setManualText(referenceText);
      }}
      className="text-xs"
    >
      <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{manualOpen ? "Tutup uji transkrip" : "Uji tanpa mic (mode pengembangan)"}</span>
    </Button>
  );

  const micButton = (
    <button
      type="button"
      data-state={state}
      onClick={handleToggle}
      disabled={state === "processing"}
      aria-label={
        state === "recording" ? "Berhenti merekam dan nilai ucapan" : "Mulai merekam ucapan"
      }
      style={
        {
          "--mic-level":
            state === "recording"
              ? Math.min(1, levels.reduce((sum, h) => sum + h, 0) / levels.length / (compact ? 20 : 30))
              : 0,
        } as React.CSSProperties
      }
      className={cn("mic-btn", compact && "!h-[74px] !w-[74px] shrink-0")}
    >
      {state === "recording" ? (
        <Square className={cn("fill-current", compact ? "h-7 w-7" : "h-9 w-9")} aria-hidden="true" />
      ) : state === "processing" ? (
        <span
          className={cn(
            "animate-spin rounded-full border-[3px] border-current border-t-transparent motion-reduce:animate-none",
            compact ? "h-7 w-7" : "h-9 w-9"
          )}
          aria-hidden="true"
        />
      ) : (
        <Mic className={compact ? "h-7 w-7" : "h-9 w-9"} aria-hidden="true" />
      )}
    </button>
  );

  if (compact) {
    return (
      <div className={cn("grid gap-3", className)}>
        <div className="flex flex-wrap items-center gap-4">
          {micButton}
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold" aria-live="polite">
              {mainText}
            </p>
            <div className="mt-1.5 flex h-8 items-center gap-1" aria-hidden="true">
              {levelBars}
            </div>
          </div>
          {devManualToggle}
        </div>
        {devManualForm}
        {issuePanel}
      </div>
    );
  }

  return (
    <div className={cn("grid justify-items-center", className)}>
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="hidden h-12 items-center justify-end gap-1 sm:flex" aria-hidden="true">
          {levelBars}
        </div>
        {micButton}
        <div className="hidden h-12 items-center gap-1 sm:flex" aria-hidden="true">
          {levelBars}
        </div>
      </div>

      <p className="mt-2 max-w-xl text-center font-display text-lg font-bold" aria-live="polite">
        {mainText}
      </p>
      <p className="text-center text-sm text-[var(--text-2)]">{subText}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        {recordedAudioUrl && state !== "recording" && (
          <Button type="button" variant="surface" size="sm" onClick={playOwnRecording}>
            <Volume2 className="h-4 w-4 text-[var(--coral)]" aria-hidden="true" />
            <span>Putar rekamanmu</span>
          </Button>
        )}
        {devManualToggle}
      </div>
      {devManualForm && <div className="mt-3 flex w-full justify-center">{devManualForm}</div>}
      {issuePanel}
    </div>
  );
}
