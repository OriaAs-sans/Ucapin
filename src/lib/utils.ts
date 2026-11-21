import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let currentAudio: HTMLAudioElement | null = null;

function speakWithBrowserVoice(text: string, rate: number): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const usVoice = window.speechSynthesis
    .getVoices()
    .find((v) => v.lang && v.lang.startsWith("en-US"));
  if (usVoice) utterance.voice = usVoice;
  window.speechSynthesis.speak(utterance);
  return true;
}

/**
 * Memutar contoh ucapan bahasa Inggris. Utamanya suara ElevenLabs lewat
 * /api/v1/speech/tts; bila layanan gagal, jatuh ke suara bawaan browser.
 * Mengembalikan false hanya bila browser sama sekali tidak bisa memutar suara.
 */
export function speakEnglish(text: string, rate = 1): boolean {
  if (typeof window === "undefined") return false;
  currentAudio?.pause();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  const params = new URLSearchParams({ text: text.slice(0, 300) });
  if (rate < 1) params.set("slow", "1");
  const audio = new Audio(`/api/v1/speech/tts?${params.toString()}`);
  currentAudio = audio;
  audio.play().catch(() => {
    if (currentAudio === audio) speakWithBrowserVoice(text, rate);
  });
  return typeof Audio !== "undefined" || "speechSynthesis" in window;
}

export interface MicErrorInfo {
  title: string;
  body: string;
  isBlocked: boolean;
}

export function mapMicError(err: unknown): MicErrorInfo {
  const name = err instanceof Error ? err.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        title: "Mikrofon diblokir",
        body: "Browser menolak akses mikrofon. Buka ikon gembok di samping alamat situs, pilih Izin situs, lalu ubah Mikrofon menjadi Izinkan. Setelah itu muat ulang halaman.",
        isBlocked: true,
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return {
        title: "Mikrofon tidak ditemukan",
        body: "Tidak ada mikrofon yang tersambung. Colokkan headset atau mikrofon, lalu coba lagi.",
        isBlocked: false,
      };
    case "NotReadableError":
      return {
        title: "Mikrofon sedang dipakai aplikasi lain",
        body: "Tutup aplikasi lain yang memakai mikrofon (misalnya Zoom atau Google Meet), lalu coba lagi.",
        isBlocked: false,
      };
    case "NotSupportedError":
      return {
        title: "Browser belum mendukung",
        body: "Browser ini tidak bisa merekam suara. Gunakan Chrome, Edge, atau Firefox versi terbaru.",
        isBlocked: false,
      };
    default:
      return {
        title: "Mikrofon belum bisa dipakai",
        body: "Terjadi kendala saat menyalakan mikrofon. Coba lagi sebentar lagi.",
        isBlocked: false,
      };
  }
}

// Alat bantu pengujian (lewati tes mic, ketik transkrip) hanya tampil saat `next dev`.
export const isDevBuild = process.env.NODE_ENV !== "production";
