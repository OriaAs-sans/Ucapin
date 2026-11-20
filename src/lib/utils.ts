import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function speakEnglish(text: string, rate = 1): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find((v) => v.lang && v.lang.startsWith("en-US"));
  if (usVoice) {
    utterance.voice = usVoice;
  }
  window.speechSynthesis.speak(utterance);
  return true;
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
