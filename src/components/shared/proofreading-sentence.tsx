"use client";

import * as React from "react";
import { Check, RotateCcw, X, Languages } from "lucide-react";
import { AudioTtsButton } from "@/components/shared/audio-tts-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PhonemeStatus, WordMark } from "@/types/ucapin";
import { cn, speakEnglish } from "@/lib/utils";

export interface ProofreadingSentenceProps {
  promptLabel?: string;
  sentence: string;
  ipa: string;
  translation: string;
  marks?: Record<string, WordMark>;
  showMarks?: boolean;
  onWordSelect?: (word: string, mark: WordMark) => void;
  className?: string;
}

/**
 * Reusable Editorial Proofreading Sentence Component.
 * Replaces tilted floating AI sticker pills with structured, aligned
 * dictionary proofreading underlines + straight interlinear annotations,
 * and separates Audio Controls from Reference Text Toggles.
 */
export function ProofreadingSentence({
  promptLabel = "Baca kalimat ini dengan suara keras",
  sentence,
  ipa,
  translation,
  marks = {},
  showMarks = false,
  onWordSelect,
  className,
}: ProofreadingSentenceProps) {
  const [showIpa, setShowIpa] = React.useState(false);
  const [showTranslation, setShowTranslation] = React.useState(false);

  const tokens = React.useMemo(() => {
    return sentence.split(" ").map((raw, index) => {
      const cleanKey = raw.replace(/[^A-Za-z']/g, "");
      const mark = marks[cleanKey] ?? marks[cleanKey.toLowerCase()];
      const status: PhonemeStatus = mark ? mark.status : "ok";
      return {
        index,
        raw,
        cleanKey,
        mark,
        status,
      };
    });
  }, [sentence, marks]);

  const flaggedTokens = React.useMemo(
    () => tokens.filter((t) => t.mark && t.status !== "ok"),
    [tokens]
  );

  return (
    <Card className={cn("p-0 overflow-hidden", className)}>
      {/* Top Notebook Header: Prompt & Reference Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface-2)]/45 px-6 py-3.5">
        <h2 className="font-ui text-sm font-bold text-[var(--text)]">
          {promptLabel}
        </h2>
        <div
          className="inline-flex items-center gap-1.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] p-1"
          role="group"
          aria-label="Tampilan bantuan teks"
        >
          <Button
            type="button"
            variant={showIpa ? "default" : "quiet"}
            size="sm"
            aria-pressed={showIpa}
            onClick={() => setShowIpa((v) => !v)}
            className="min-h-[34px] rounded-[9px] px-3 py-1 text-xs no-underline"
          >
            <span className="font-ipa text-sm">/aɪ/</span>
            <span>IPA</span>
          </Button>
          <Button
            type="button"
            variant={showTranslation ? "default" : "quiet"}
            size="sm"
            aria-pressed={showTranslation}
            onClick={() => setShowTranslation((v) => !v)}
            className="min-h-[34px] rounded-[9px] px-3 py-1 text-xs no-underline"
          >
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Arti</span>
          </Button>
        </div>
      </div>

      {/* Main Ruled Phonetic Canvas */}
      <div className="px-6 py-8 md:px-10 md:py-10">
        <div
          lang="en"
          className="flex flex-wrap items-baseline justify-center gap-x-3.5 gap-y-6 text-center"
        >
          {tokens.map((token) => {
            const hasFlag = showMarks && token.mark && token.status !== "ok";
            const isWork = token.status === "work";

            return (
              <span
                key={token.index}
                className="inline-flex flex-col items-center"
              >
                <button
                  type="button"
                  onClick={() => {
                    speakEnglish(token.cleanKey, 0.85);
                    if (token.mark && onWordSelect) {
                      onWordSelect(token.cleanKey, token.mark);
                    }
                  }}
                  title={`Klik untuk dengar kata "${token.cleanKey}"`}
                  className={cn(
                    "font-display text-3xl md:text-[2.35rem] font-bold tracking-tight leading-tight transition-colors rounded-[6px] px-1 hover:bg-[var(--surface-2)]/60",
                    showMarks && token.status === "ok" && "mk mk-ok",
                    showMarks && token.status === "almost" && "mk mk-almost text-[var(--almost-text)]",
                    showMarks && token.status === "work" && "mk mk-work text-[var(--work-text)]"
                  )}
                >
                  {token.raw}
                </button>

                {/* Straight Interlinear Proofreading Marginalia (zero rotation) */}
                {hasFlag && token.mark && (
                  <span className="mt-2 inline-flex flex-col items-center">
                    <i
                      aria-hidden="true"
                      className={cn(
                        "block h-2.5 w-[1.5px]",
                        isWork ? "bg-[var(--work)]" : "bg-[var(--almost)]"
                      )}
                    />
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 text-xs font-bold leading-none shadow-none",
                        isWork
                          ? "border-[var(--work)] bg-[var(--work-wash)] text-[var(--work-text)]"
                          : "border-[var(--almost)] bg-[var(--almost-wash)] text-[var(--almost-text)]"
                      )}
                    >
                      {isWork ? (
                        <X className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
                      ) : (
                        <RotateCcw
                          className="h-3 w-3 stroke-[2.5]"
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        {isWork ? "Ulang" : "Hampir"} · {token.mark.note}
                      </span>
                    </span>
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Optional Interlinear Reference Lines (IPA & Indonesian Translation) */}
        {(showIpa || showTranslation) && (
          <div className="mt-7 grid gap-2.5 border-t border-dashed border-[var(--line)] pt-5 text-center">
            {showIpa && (
              <p
                lang="en"
                className="font-ipa text-lg text-[var(--text-2)] tracking-normal"
              >
                {ipa}
              </p>
            )}
            {showTranslation && (
              <p className="mx-auto max-w-xl rounded-control bg-[var(--surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--text)]">
                {translation}
              </p>
            )}
          </div>
        )}

        {/* Summary of Flagged Words in a Structured Footnote Bar */}
        {showMarks && flaggedTokens.length > 0 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--line)] pt-4 text-xs text-[var(--text-2)]">
            <span className="font-bold text-[var(--text)]">
              Catatan koreksi:
            </span>
            {flaggedTokens.map((t) => (
              <span
                key={t.index}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1"
              >
                <strong lang="en" className="text-[var(--text)]">
                  {t.cleanKey}
                </strong>
                {t.mark?.ipa && (
                  <span lang="en" className="font-ipa text-[var(--text-2)]">
                    {t.mark.ipa}
                  </span>
                )}
                <span>({t.mark?.note})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Audio Playback Toolbar & Proofreading Mark Key */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] bg-[var(--bg)]/55 px-6 py-3.5">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Pemutar suara contoh"
        >
          <AudioTtsButton text={sentence} rate={1} label="Dengar contoh" />
          <AudioTtsButton text={sentence} rate={0.7} label="Pelan 0,7x" />
        </div>

        <div
          className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-2)]"
          aria-label="Legenda tanda garis bawah"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-[var(--ok)]" aria-hidden="true" />
            <strong className="mk mk-ok text-[var(--text)]">jelas</strong>
            <span>garis lurus</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw
              className="h-3.5 w-3.5 text-[var(--almost-text)]"
              aria-hidden="true"
            />
            <strong className="mk mk-almost text-[var(--text)]">hampir</strong>
            <span>garis titik</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <X
              className="h-3.5 w-3.5 text-[var(--work-text)]"
              aria-hidden="true"
            />
            <strong className="mk mk-work text-[var(--text)]">ulang</strong>
            <span>garis gelombang</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
