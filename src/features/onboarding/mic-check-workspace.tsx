"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mic,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { UserProfileDTO } from "@/types/ucapin";
import { mapMicError, type MicErrorInfo, cn, isDevBuild } from "@/lib/utils";

const GOAL_NAMES: Record<string, string> = {
  kerja: "Wawancara dan kerja",
  jalan: "Jalan-jalan ke luar negeri",
  ielts: "IELTS & Kuliah",
  harian: "Ngobrol sehari-hari",
};

export function MicCheckWorkspace({ user }: { user: UserProfileDTO }) {
  const router = useRouter();
  const [permissionState, setPermissionState] = React.useState<
    "idle" | "waiting" | "granted" | "error"
  >("idle");
  const [deviceLabel, setDeviceLabel] = React.useState("Mikrofon bawaan");
  const [errorInfo, setErrorInfo] = React.useState<MicErrorInfo | null>(null);
  const [activeBars, setActiveBars] = React.useState(0);
  const [verdict, setVerdict] = React.useState<"none" | "ok" | "quiet">("none");
  const [correctionPref, setCorrectionPref] = React.useState(
    user.correctionPref
  );
  const [saveAudio, setSaveAudio] = React.useState(user.saveAudioOptIn);
  const [startError, setStartError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const streamRef = React.useRef<MediaStream | null>(null);
  const ctxRef = React.useRef<AudioContext | null>(null);
  const rafRef = React.useRef<number>(0);

  const stopMic = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => stopMic();
  }, [stopMic]);

  const requestMic = async () => {
    setPermissionState("waiting");
    setErrorInfo(null);
    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        const e = new Error("unsupported");
        e.name = "NotSupportedError";
        throw e;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const track = stream.getAudioTracks()[0];
      if (track && track.label) {
        setDeviceLabel(track.label);
      }
      setPermissionState("granted");

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);

      let loudFrames = 0;
      let quietFrames = 0;
      let decided = false;

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const lvl = Math.min(1, Math.sqrt(sum / data.length) * 4);
        setActiveBars(Math.round(lvl * 28));

        if (!decided) {
          if (lvl > 0.12) loudFrames++;
          else quietFrames++;

          if (loudFrames > 35) {
            decided = true;
            setVerdict("ok");
            setStartError(false);
          } else if (quietFrames > 500 && loudFrames < 10) {
            setVerdict("quiet");
            quietFrames = 0;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      stopMic();
      setPermissionState("error");
      setErrorInfo(mapMicError(err));
    }
  };

  const handleFinish = async (destination: string) => {
    setSaving(true);
    try {
      await fetch("/api/v1/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctionPref,
          saveAudioOptIn: saveAudio,
          onboardingCompleted: true,
          micChecked: true,
        }),
      });
    } finally {
      setSaving(false);
      stopMic();
      router.push(destination);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* Left Brand Panel: Real Account & Device Privacy Summary (Zero random fake mistakes!) */}
      <aside className="flex flex-col justify-between gap-8 bg-[var(--side-bg)] p-7 text-[var(--side-text)] lg:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[#F7F5EE] no-underline">
            <span className="font-display text-3xl font-extrabold tracking-tight after:ml-1 after:inline-block after:h-2.5 after:w-2.5 after:rounded-full after:bg-[var(--coral)]">
              Ucapin
            </span>
          </Link>
          <Badge variant="teal">Langkah 2 / 3</Badge>
        </div>

        <div className="rounded-[18px] border border-[rgba(212,200,183,0.32)] bg-[rgba(19,41,46,0.55)] p-5 text-[#F7F5EE]">
          <div className="flex items-center justify-between border-b border-[rgba(212,200,183,0.22)] pb-3">
            <div>
              <p className="text-xs font-bold text-[#D4C8B7]">
                Profil belajarmu
              </p>
              <p className="font-display text-lg font-bold text-[#F7F5EE]">
                {user.name}
              </p>
            </div>
            <span className="rounded-[8px] bg-[rgba(124,199,160,0.18)] px-2.5 py-1 text-xs font-bold text-[#7CC7A0]">
              Level {user.cefrLevel}
            </span>
          </div>

          <div className="mt-3.5 grid gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#D4C8B7]">Tujuan aktif:</span>
              <strong className="text-[#F7F5EE]">
                {user.goals.length > 0
                  ? user.goals.map((g) => GOAL_NAMES[g] ?? g).join(", ")
                  : "Umum"}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#D4C8B7]">Target harian:</span>
              <strong className="text-[#F7F5EE]">
                {user.spokenTodayMinutes} / {user.dailyTargetMinutes} menit
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#D4C8B7]">Status mikrofon:</span>
              <strong
                className={cn(
                  verdict === "ok" ? "text-[#7CC7A0]" : "text-[#E3B95E]"
                )}
              >
                {verdict === "ok"
                  ? "Siap digunakan"
                  : permissionState === "granted"
                  ? "Menunggu tes suara"
                  : "Belum diizinkan"}
              </strong>
            </div>
            <div className="mt-1 rounded-[10px] border border-[rgba(212,200,183,0.2)] bg-[rgba(247,245,238,0.06)] p-2.5 text-[#D4C8B7]">
              <p className="flex items-center gap-1.5 font-bold text-[#F7F5EE]">
                <ShieldCheck className="h-4 w-4 text-[#7CC7A0]" />
                <span>Jaminan Privasi UU PDP No. 27/2022</span>
              </p>
              <p className="mt-1">
                Audio hanya dipakai untuk mendeteksi kejelasan fonem dan{" "}
                <strong>
                  {saveAudio
                    ? "disimpan karena kamu memilih opt-in"
                    : "langsung dibuang setelah dinilai (default)"}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#F7F5EE]">
            Suaramu, kendalimu.
          </h2>
          <p className="mt-2 text-sm text-[var(--side-text)]">
            Kami minta izin mikrofon setelah kamu paham alasannya. Setelah ini
            kamu langsung masuk ke Langkah 3 (Latihan Pertama).
          </p>
        </div>
      </aside>

      {/* Right Mic Check Content: Step 2 of 3 */}
      <main
        id="main-content"
        className="flex max-w-4xl flex-col gap-6 p-6 sm:p-10"
      >
        <div className="flex items-center gap-4">
          <Button asChild variant="quiet" size="sm">
            <Link href="/mulai" aria-label="Kembali ke Langkah 1 (Tujuan)">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <ol
            aria-label="Langkah 2 dari 3"
            className="grid flex-1 grid-cols-3 gap-2"
          >
            <li className="h-2.5 rounded-full bg-[var(--coral)]" />
            <li className="h-2.5 rounded-full bg-[var(--coral)]" />
            <li className="h-2.5 rounded-full bg-[var(--line)]" />
          </ol>
          <span className="text-xs font-bold text-[var(--text)]">
            Langkah 2 dari 3 · Cek Mikrofon
          </span>
          <ThemeToggle onLightSurface />
        </div>

        <header>
          <h1 className="font-display text-3xl font-extrabold">
            Cek mikrofon dulu
          </h1>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            Sekitar 20 detik. Kita pastikan suaramu tertangkap jelas sebelum
            masuk ke latihan pertama.
          </p>
        </header>

        <Card>
          <h2 className="font-display text-xl font-bold">
            Kenapa kami butuh mikrofon
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
            <li>Untuk mendengar ucapanmu dan menandai bunyi yang meleset.</li>
            <li>Mikrofon hanya aktif saat tombol bicara menyala coral.</li>
            <li>
              Setelah kamu klik tombol di bawah, browser akan menampilkan
              pop-up izin.
            </li>
          </ul>

          {permissionState !== "granted" && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={permissionState === "waiting"}
                onClick={requestMic}
              >
                <Mic className="h-5 w-5" aria-hidden="true" />
                <span>
                  {permissionState === "waiting"
                    ? "Menunggu izin browser..."
                    : permissionState === "error"
                    ? "Coba izinkan lagi"
                    : "Izinkan mikrofon"}
                </span>
              </Button>
              {isDevBuild && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPermissionState("granted");
                    setVerdict("ok");
                    setStartError(false);
                  }}
                >
                  Lewati tes mikrofon (mode pengembangan)
                </Button>
              )}
            </div>
          )}

          {permissionState === "granted" && (
            <div
              role="status"
              className="mt-4 rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] p-4"
            >
              <h3 className="flex items-center gap-2 font-display font-bold text-[var(--ok)]">
                <Check className="h-5 w-5" aria-hidden="true" />
                <span>Akses mikrofon diizinkan</span>
              </h3>
              <p className="mt-1 text-sm">
                Kami hanya mendengarkan saat tombol mikrofon menyala.
              </p>
            </div>
          )}

          {permissionState === "error" && errorInfo && (
            <div
              role="alert"
              className="mt-4 rounded-card border-[1.5px] border-[var(--work)] bg-[var(--work-wash)] p-4"
            >
              <h3 className="flex items-center gap-2 font-display font-bold text-[var(--work-text)]">
                <XCircle className="h-5 w-5" aria-hidden="true" />
                <span>{errorInfo.title}</span>
              </h3>
              <p className="mt-1 text-sm">{errorInfo.body}</p>
              {errorInfo.isBlocked && (
                <div className="mt-3">
                  <h4 className="text-sm font-bold">Cara membuka blokir:</h4>
                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-xs">
                    <li>Klik ikon gembok di samping alamat situs.</li>
                    <li>Buka Izin situs, lalu cari Mikrofon.</li>
                    <li>Pilih Izinkan, lalu muat ulang halaman ini.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </Card>

        {permissionState === "granted" && (
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-lg font-bold">
                Baca kalimat ini dengan suara keras
              </h2>
              <span className="text-xs text-[var(--text-2)]">
                {deviceLabel}
              </span>
            </div>
            <p
              lang="en"
              className="mt-3 font-display text-2xl font-bold text-[var(--text)]"
            >
              “Hello! My name is {user.name.split(" ")[0]}, and I&apos;m ready
              to practise my English.”
            </p>
            <p className="mt-4 text-xs font-semibold text-[var(--text-2)]">
              Level suara
            </p>
            <div
              className="mt-1.5 grid h-10 grid-cols-[repeat(28,minmax(0,1fr))] items-end gap-1"
              aria-hidden="true"
            >
              {Array.from({ length: 28 }).map((_, i) => {
                const isOn = i < activeBars || verdict === "ok";
                const isHi = i >= 22 && isOn;
                return (
                  <i
                    key={i}
                    style={{
                      height: isOn ? `${10 + (i % 5) * 5}px` : "10px",
                    }}
                    className={cn(
                      "block rounded-[4px] transition-all",
                      !isOn && "bg-[var(--line)]",
                      isOn && !isHi && "bg-[var(--ok)]",
                      isHi && "bg-[var(--almost)]"
                    )}
                  />
                );
              })}
            </div>

            {verdict === "ok" && (
              <div
                role="status"
                className="mt-4 rounded-card border-[1.5px] border-[var(--ok)] bg-[var(--ok-wash)] p-4"
              >
                <h3 className="font-display font-bold text-[var(--ok)]">
                  Suaramu terdengar jelas
                </h3>
                <p className="mt-0.5 text-sm">
                  Mikrofon siap dipakai. Kamu bisa lanjut ke Langkah 3 (Latihan
                  Pertama).
                </p>
              </div>
            )}

            {verdict === "quiet" && (
              <div
                role="status"
                className="mt-4 rounded-card border-[1.5px] border-[var(--almost)] bg-[var(--almost-wash)] p-4"
              >
                <h3 className="font-display font-bold text-[var(--almost-text)]">
                  Suaramu terlalu pelan
                </h3>
                <p className="mt-0.5 text-sm">
                  Dekatkan mikrofon atau bicara sedikit lebih keras, lalu baca
                  kalimatnya sekali lagi.
                </p>
              </div>
            )}
          </Card>
        )}

        <fieldset>
          <legend className="mb-3 font-display text-lg font-bold">
            Kapan kamu mau dikoreksi?
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              {
                val: "giliran",
                title: "Setiap selesai bicara",
                desc: "Belajar lebih cepat, kesalahan langsung dibahas",
              },
              {
                val: "akhir",
                title: "Di akhir sesi",
                desc: "Lebih santai saat bicara",
              },
            ].map((opt) => (
              <label
                key={opt.val}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border-2 p-3.5 font-semibold transition-all",
                  correctionPref === opt.val
                    ? "border-[var(--btn-bg)] bg-[var(--surface-2)]"
                    : "border-[var(--line)] bg-[var(--surface)]"
                )}
              >
                <input
                  type="radio"
                  name="koreksi"
                  value={opt.val}
                  checked={correctionPref === opt.val}
                  onChange={() => setCorrectionPref(opt.val)}
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

        <label className="flex cursor-pointer items-center gap-3.5 py-1">
          <Switch checked={saveAudio} onCheckedChange={setSaveAudio} />
          <span className="text-sm font-medium">
            Simpan rekamanku supaya bisa kudengar lagi nanti (opsional sesuai UU
            PDP, bisa dimatikan kapan saja)
          </span>
        </label>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-[var(--line)] pt-5">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleFinish("/")}
            className="text-sm font-semibold text-[var(--link)] underline"
          >
            Lanjut ke Beranda tanpa mikrofon
          </button>
          <div className="grid justify-items-end gap-1.5">
            <Button
              type="button"
              disabled={saving}
              onClick={() => {
                if (verdict !== "ok") {
                  setStartError(true);
                  return;
                }
                handleFinish("/latihan-ucapan?onboarding=1");
              }}
            >
              <span>
                {saving
                  ? "Menyimpan..."
                  : "Mulai Latihan Pertama (Langkah 3/3)"}
              </span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
            {startError && (
              <p
                role="alert"
                className="text-xs font-bold text-[var(--work-text)]"
              >
                Izinkan mikrofon (atau klik tombol Simulasikan mikrofon siap)
                terlebih dahulu.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
