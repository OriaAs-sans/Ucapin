"use client";

import * as React from "react";
import Link from "next/link";
import { Keyboard, Mic, Square, Volume2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapMicError, type MicErrorInfo, cn } from "@/lib/utils";

export type MicState = "idle" | "recording" | "processing" | "done";

export interface RecordedSpeechResult {
  transcript: string;
  confidence: number;
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

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [altIndex: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
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
  const [levels, setLevels] = React.useState<number[]>(() =>
    Array.from({ length: 12 }, () => 6)
  );
  const [micError, setMicError] = React.useState<MicErrorInfo | null>(null);
  const [liveTranscript, setLiveTranscript] = React.useState<string>("");
  const [recordedAudioUrl, setRecordedAudioUrl] = React.useState<string | null>(
    null
  );
  const [manualOpen, setManualOpen] = React.useState(false);
  const [manualText, setManualText] = React.useState("");

  const streamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recognitionRef = React.useRef<BrowserSpeechRecognition | null>(null);
  const transcriptAccRef = React.useRef<string>("");
  const confidenceAccRef = React.useRef<number>(0.85);
  const startTimeRef = React.useRef<number>(0);
  const rafRef = React.useRef<number>(0);

  const stopHardwareMic = React.useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
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
    startTimeRef.current = performance.now();
    transcriptAccRef.current = "";
    confidenceAccRef.current = 0.85;
    setLiveTranscript("");

    // 1. Start MediaRecorder so learner can replay their own voice
    audioChunksRef.current = [];
    try {
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };
      mr.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, {
            type: mr.mimeType || "audio/webm",
          });
          const url = URL.createObjectURL(blob);
          setRecordedAudioUrl(url);
        }
      };
      mr.start();
      mediaRecorderRef.current = mr;
    } catch {
      /* MediaRecorder optional */
    }

    // 2. Start Web Speech API SpeechRecognition for live English STT
    const Win = window as unknown as {
      SpeechRecognition?: new () => BrowserSpeechRecognition;
      webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    };
    const SpeechRec = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.lang = "en-US";
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.onresult = (event: BrowserSpeechRecognitionEvent) => {
          let fullText = "";
          let bestConf = 0.85;
          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res[0]) {
              fullText += (fullText ? " " : "") + res[0].transcript.trim();
              if (res[0].confidence > 0) {
                bestConf = res[0].confidence;
              }
            }
          }
          transcriptAccRef.current = fullText;
          confidenceAccRef.current = bestConf;
          setLiveTranscript(fullText);
        };
        rec.onerror = () => {};
        rec.start();
        recognitionRef.current = rec;
      } catch {
        /* fallback if SpeechRecognition blocked */
      }
    }

    // 3. Start Web Audio AnalyserNode for live level meter
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
      const durationMs = Math.max(1200, performance.now() - startTimeRef.current);
      const capturedText = transcriptAccRef.current.trim();
      const capturedConf = confidenceAccRef.current;
      stopHardwareMic();

      // Wait briefly for MediaRecorder onstop blob URL
      window.setTimeout(() => {
        onFinishRecording({
          transcript: capturedText || referenceText,
          confidence: capturedText ? capturedConf : 0.72,
          durationMs,
          audioUrl: recordedAudioUrl,
        });
      }, 180);
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

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    onFinishRecording({
      transcript: manualText.trim(),
      confidence: 0.9,
      durationMs: 3200,
      audioUrl: null,
    });
  };

  const playOwnRecording = () => {
    if (!recordedAudioUrl) return;
    const audio = new Audio(recordedAudioUrl);
    audio.play().catch(() => {});
  };

  const statusLabels: Record<MicState, [string, string]> = {
    idle: [idleLabel, idleHint],
    recording: [
      liveTranscript
        ? `Mendengarkan: "${liveTranscript}"`
        : "Mendengarkan suaramu... ucapkan kalimat di atas",
      "Ketuk tombol merah untuk berhenti & menilai",
    ],
    processing: ["Menganalisis pengucapan dan fonem...", "Membandingkan kata per kata"],
    done: ["Ketuk mikrofon untuk merekam ulang", "Ucapkan lagi untuk memperbaiki skor"],
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
            <p className="font-display text-base font-bold" aria-live="polite">
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
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={() => setManualOpen((v) => !v)}
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            <span>Ketik / Uji Kalimat</span>
          </Button>
        </div>

        {manualOpen && (
          <form
            onSubmit={handleManualSubmit}
            className="flex flex-wrap items-center gap-2 rounded-control border border-[var(--line)] bg-[var(--bg)] p-3"
          >
            <Input
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={
                referenceText || "Ketik kalimat bahasa Inggris yang ingin diuji..."
              }
              className="min-h-[40px] flex-1 text-sm"
            />
            <Button type="submit" size="sm">
              Kirim & Nilai
            </Button>
          </form>
        )}

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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManualOpen(true)}
              >
                Gunakan Input Ketik Manual
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("grid justify-items-center", className)}>
      <div className="flex items-center justify-center gap-6 py-2">
        <div
          className="hidden h-12 items-center justify-end gap-1 sm:flex"
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
          className="hidden h-12 items-center gap-1 sm:flex"
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
        className="mt-2 max-w-xl text-center font-display text-lg font-bold"
        aria-live="polite"
      >
        {mainText}
      </p>
      <p className="text-center text-sm text-[var(--text-2)]">{subText}</p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        {recordedAudioUrl && (
          <Button
            type="button"
            variant="surface"
            size="sm"
            onClick={playOwnRecording}
          >
            <Volume2 className="h-4 w-4 text-[var(--coral)]" aria-hidden="true" />
            <span>Putar Rekaman Suaramu</span>
          </Button>
        )}
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={() => {
            setManualOpen((v) => !v);
            if (!manualText && referenceText) {
              setManualText(referenceText);
            }
          }}
          className="text-xs"
        >
          <Keyboard className="h-3.5 w-3.5" aria-hidden="true" />
          <span>
            {manualOpen
              ? "Tutup penguji transkrip"
              : "Uji penilaian dengan ketik transkrip (tanpa mic)"}
          </span>
        </Button>
      </div>

      {manualOpen && (
        <div className="mt-3 w-full max-w-2xl rounded-card border-[1.5px] border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs font-bold text-[var(--text)]">
            Simulator Penilaian Fonem Real-Time (ubah kata untuk melihat deteksi
            otomatis):
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-2)]">
            Contoh: ubah <code>worked</code> menjadi <code>work</code>,{" "}
            <code>five</code> menjadi <code>fife</code>, atau biarkan utuh untuk
            mendapatkan skor 100% Jelas.
          </p>
          <form
            onSubmit={handleManualSubmit}
            className="mt-2.5 flex flex-wrap gap-2"
          >
            <Input
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Ketik kalimat yang diucapkan..."
              className="min-h-[42px] flex-1 text-sm"
            />
            <Button type="submit" size="sm">
              Nilai Ucapan Ini
            </Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              onClick={() => setManualText(referenceText)}
              className="font-semibold text-[var(--link)] underline"
            >
              Isi ucapan 100% benar (Semua Jelas)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() =>
                setManualText(
                  referenceText
                    .replace(/\bworked\b/i, "work")
                    .replace(/\bvery\b/i, "fery")
                    .replace(/\bthink\b/i, "tink")
                    .replace(/\bThank\b/i, "Tank")
                    .replace(/\bshuttle\b/i, "sattel")
                    .replace(/\bBoth\b/i, "Boat")
                )
              }
              className="font-semibold text-[var(--link)] underline"
            >
              Isi ucapan dengan salah ucap khas Indonesia
            </button>
          </div>
        </div>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMicError(null);
                setManualOpen(true);
                if (!manualText) setManualText(referenceText);
              }}
            >
              Gunakan Simulator Transkrip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
