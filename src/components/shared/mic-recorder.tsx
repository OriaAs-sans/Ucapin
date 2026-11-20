"use client";

import * as React from "react";
import Link from "next/link";
import { Mic, Square, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapMicError, type MicErrorInfo, cn } from "@/lib/utils";

export type MicState = "idle" | "recording" | "processing" | "done";

export interface MicRecorderProps {
  state: MicState;
  onStateChange: (next: MicState) => void;
  onFinishRecording: () => void;
  onSimulateWithoutMic?: () => void;
  compact?: boolean;
  idleLabel?: string;
  idleHint?: string;
  className?: string;
}

export function MicRecorder({
  state,
  onStateChange,
  onFinishRecording,
  onSimulateWithoutMic,
  compact = false,
  idleLabel = "Ketuk untuk bicara",
  idleHint = "Ketuk lagi kalau sudah selesai (atau tekan Spasi)",
  className,
}: MicRecorderProps) {
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array.from({ length: 12 }, () => 6)
  );
  const [micError, setMicError] = React.useState<MicErrorInfo | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const rafRef = React.useRef<number>(0);

  const stopHardwareMic = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setLevels(Array.from({ length: 12 }, () => 6));
  }, []);

  React.useEffect(() => {
    return () => stopHardwareMic();
  }, [stopHardwareMic]);

  const startHardwareMic = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      const e = new Error("unsupported");
      e.name = "NotSupportedError";
      throw e;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const buffer = new Uint8Array(analyser.fftSize);

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
        Array.from({ length: 12 }, (_, idx) => {
          const wobble = 0.55 + 0.45 * Math.abs(Math.sin(idx * 1.7 + now / 140));
          return Math.max(6, Math.round(level * (compact ? 28 : 44) * wobble));
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const handleToggle = async () => {
    if (state === "processing") return;
    if (state === "recording") {
      stopHardwareMic();
      onFinishRecording();
      return;
    }
    setMicError(null);
    try {
      await startHardwareMic();
      onStateChange("recording");
    } catch (err) {
      stopHardwareMic();
      setMicError(mapMicError(err));
      onStateChange("idle");
    }
  };

  const statusLabels: Record<MicState, [string, string]> = {
    idle: [idleLabel, idleHint],
    recording: ["Mendengarkan...", "Ketuk untuk berhenti"],
    processing: ["Menilai ucapanmu...", "Sebentar, sekitar 1 detik"],
    done: ["Coba lagi", "Ketuk untuk merekam ulang"],
  };

  const [mainText, subText] = statusLabels[state];

  if (compact) {
    return (
      <div className={cn("grid gap-3", className)}>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            data-state={state}
            onClick={handleToggle}
            aria-label={mainText}
            className="mic-btn !h-[74px] !w-[74px] shrink-0"
          >
            {state === "recording" ? (
              <Square className="h-7 w-7 fill-current" aria-hidden="true" />
            ) : (
              <Mic className="h-7 w-7" aria-hidden="true" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="font-display text-base font-bold"
              aria-live="polite"
            >
              {mainText}
            </p>
            <div
              className="mt-1.5 flex h-8 items-center gap-1"
              aria-hidden="true"
            >
              {levels.map((h, i) => (
                <i
                  key={i}
                  style={{ height: `${h}px` }}
                  className={cn(
                    "block w-[5px] rounded-[3px] transition-all duration-75",
                    state === "recording"
                      ? "bg-[var(--coral)]"
                      : "bg-[var(--line)]"
                  )}
                />
              ))}
            </div>
          </div>
          {onSimulateWithoutMic && (
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={() => {
                setMicError(null);
                onSimulateWithoutMic();
              }}
            >
              Jawab tanpa mikrofon
            </Button>
          )}
        </div>

        {micError && (
          <div
            role="alert"
            className="rounded-card border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] p-4 text-sm"
          >
            <h3 className="flex items-center gap-2 font-display font-bold text-[var(--work-text)]">
              <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>{micError.title}</span>
            </h3>
            <p className="mt-1 text-[var(--text)]">{micError.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="surface" size="sm">
                <Link href="/cek-mikrofon">Buka cek mikrofon</Link>
              </Button>
              {onSimulateWithoutMic && (
                <Button
                  type="button"
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setMicError(null);
                    onSimulateWithoutMic();
                  }}
                >
                  Simulasikan jawaban
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid justify-items-center", className)}>
      <div className="flex items-center justify-center gap-6 py-3">
        <div
          className="hidden sm:flex h-12 items-center justify-end gap-1"
          aria-hidden="true"
        >
          {levels.map((h, i) => (
            <i
              key={i}
              style={{ height: `${h}px` }}
              className={cn(
                "block w-[5px] rounded-[3px] transition-all duration-75",
                state === "recording" ? "bg-[var(--coral)]" : "bg-[var(--line)]"
              )}
            />
          ))}
        </div>

        <button
          type="button"
          data-state={state}
          onClick={handleToggle}
          aria-label={mainText}
          className="mic-btn"
        >
          {state === "recording" ? (
            <Square className="h-9 w-9 fill-current" aria-hidden="true" />
          ) : (
            <Mic className="h-9 w-9" aria-hidden="true" />
          )}
        </button>

        <div
          className="hidden sm:flex h-12 items-center gap-1"
          aria-hidden="true"
        >
          {levels.map((h, i) => (
            <i
              key={i}
              style={{ height: `${h}px` }}
              className={cn(
                "block w-[5px] rounded-[3px] transition-all duration-75",
                state === "recording" ? "bg-[var(--coral)]" : "bg-[var(--line)]"
              )}
            />
          ))}
        </div>
      </div>

      <p
        className="mt-2 text-center font-display text-lg font-bold"
        aria-live="polite"
      >
        {mainText}
      </p>
      <p className="text-center text-sm text-[var(--text-2)]">{subText}</p>

      {onSimulateWithoutMic && state === "idle" && !micError && (
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={onSimulateWithoutMic}
          className="mt-1 text-xs"
        >
          Lihat contoh hasil tanpa mikrofon
        </Button>
      )}

      {micError && (
        <div
          role="alert"
          className="mt-5 w-full rounded-card border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] p-5"
        >
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-[var(--work-text)]">
            <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{micError.title}</span>
          </h3>
          <p className="mt-1.5 text-sm text-[var(--text)]">{micError.body}</p>
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <Button asChild variant="surface" size="sm">
              <Link href="/cek-mikrofon">Buka cek mikrofon</Link>
            </Button>
            {onSimulateWithoutMic && (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                onClick={() => {
                  setMicError(null);
                  onSimulateWithoutMic();
                }}
              >
                Lihat contoh hasil tanpa mikrofon
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
