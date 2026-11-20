# Architecture — Ucapin

> Status: **Aktif (Next.js Fullstack + shadcn/ui + Prisma ORM + Laragon PostgreSQL `127.0.0.1:5432`)**, dikonfirmasi pengguna pada 2026-11-20.

## 1. Tahapan produk
| Tahap | Isi | AI yang dipakai |
|---|---|---|
| **MVP (Aktif)** | Pronunciation Drill, Shadowing (rekam & bandingkan), **Roleplay berskrip** (dialog bercabang, audio TTS), Mistake Bank otomatis dari skor fonem ke PostgreSQL Laragon, Session Result, onboarding, streak/target harian | Hanya **penilaian pengucapan** (Azure / simulasi terstruktur). Tanpa LLM. |
| **v1.5** | AI Roleplay bebas (turn-based STT → LLM → TTS), Speaking Test gaya IELTS | + STT, LLM, TTS |
| **v2** | Percakapan real-time (full duplex), aplikasi mobile | + LiveKit + model speech-to-speech |

## 2. Stack Produksi & Lokal (Laragon)
| Lapisan | Pilihan yang Dipakai | Catatan |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + React 19 + TypeScript** | Styling dengan Tailwind CSS + CSS Variables dari `design.md` |
| UI Component System | **shadcn/ui** (`src/components/ui/`) + **Reusable Domain Components** (`src/components/shared/`) | Semua komponen domain wajib modular dan reusable lintas halaman |
| Backend API | **Next.js Route Handlers (`/api/v1/*`) + Repository Layer (`src/server/repositories/`)** | Satu codebase TypeScript end-to-end |
| Database Lokal | **Laragon PostgreSQL 14.5 (`127.0.0.1:5432`, database `ucapin`)** via **Prisma ORM** | Skema di `prisma/schema.prisma`, seed di `prisma/seed.ts` |
| Audio di browser | `getUserMedia` + Web Audio `AnalyserNode` (`<MicRecorder />`) | Jangan pakai Web Speech API untuk penilaian karena mengoreksi otomatis kesalahan pelajar |
| Penilaian ucapan | **Azure AI Speech – Pronunciation Assessment** (en-US, granularitas fonem, IPA) | ~US$1/jam audio, free tier 5 jam/bulan |
| TTS | Browser `speechSynthesis` (`en-US`, normal 1.0x & pelan 0.7x di `<AudioTtsButton />`) / Azure Neural TTS | |

## 3. Struktur Folder Baku
```text
c:\My things\Project\Ucapin\
├── prisma/
│   ├── schema.prisma               # Skema PostgreSQL Laragon (User, DrillSentence, Scenario, ScenarioNode, SpeakingSession, Utterance, PhonemeScore, MistakeItem, DailyActivity, LeagueEntry)
│   └── seed.ts                     # Seeder data awal ke Laragon PostgreSQL
├── public/
│   ├── fonts/                      # Self-hosted WOFF2 (Bricolage Grotesque, Atkinson Hyperlegible Next, Charis SIL)
│   └── icons.svg                   # Sprite SVG untuk prototipe
├── src/
│   ├── app/                        # Next.js App Router (HANYA routing & API endpoints)
│   │   ├── api/v1/
│   │   │   ├── dashboard/route.ts  # GET data Beranda dari PostgreSQL
│   │   │   ├── mistakes/route.ts   # GET & POST item Bank Kesalahan (auto-upsert)
│   │   │   ├── onboarding/route.ts # PATCH tujuan, CEFR, target menit, koreksi, opt-in UU PDP
│   │   │   └── session-result/route.ts # POST rating kepercayaan diri 1-5
│   │   ├── bank-kesalahan/page.tsx # Halaman penuh Bank Kesalahan
│   │   ├── cek-mikrofon/page.tsx   # Onboarding tes izin & level mikrofon
│   │   ├── hasil/page.tsx          # Hasil Sesi (Session Result)
│   │   ├── latihan-ucapan/page.tsx # Pronunciation Drill
│   │   ├── mulai/page.tsx          # Onboarding tujuan & level CEFR
│   │   ├── roleplay/page.tsx       # Scripted Roleplay (Memesan di kafe)
│   │   ├── globals.css             # CSS Variables tema terang/gelap & @font-face
│   │   ├── layout.tsx              # Root layout Bahasa Indonesia (lang="id")
│   │   └── page.tsx                # Beranda (Dashboard)
│   ├── components/
│   │   ├── ui/                     # Primitif shadcn/ui (button, card, badge, progress, switch, separator)
│   │   ├── layout/                 # Kerangka halaman (app-shell, sidebar-nav, theme-toggle)
│   │   └── shared/                 # Komponen domain reusable (bisa dipakai di mana saja):
│   │       ├── audio-tts-button.tsx       # Tombol putar suara normal 1.0x & pelan 0.7x
│   │       ├── clarity-ring.tsx           # Ring SVG skor Kejelasan
│   │       ├── mic-recorder.tsx           # Tap-to-talk + AnalyserNode waveform + 5 state error mic
│   │       ├── phonetic-specimen-card.tsx # Kartu spesimen catatan fonetik harian + tally menit
│   │       ├── phonetic-word-row.tsx      # Baris kata + IPA + audio + status badge
│   │       ├── proofreading-sentence.tsx  # Kalimat latihan + garis bawah koreksi + anotasi interlinear lurus
│   │       └── score-metric-card.tsx      # Kartu skor + meterbar semantik
│   ├── features/                   # Workspace & state interaksi per fitur
│   │   ├── dashboard/dashboard-workspace.tsx
│   │   ├── drill/drill-workspace.tsx
│   │   ├── mistake-bank/mistake-bank-workspace.tsx
│   │   ├── onboarding/onboarding-goal-form.tsx
│   │   ├── onboarding/mic-check-workspace.tsx
│   │   ├── roleplay/roleplay-workspace.tsx
│   │   └── session-result/session-result-workspace.tsx
│   ├── lib/utils.ts                # Helper cn(), speakEnglish(), mapMicError()
│   ├── server/
│   │   ├── db.ts                   # Singleton PrismaClient
│   │   └── repositories/ucapin-repository.ts # Query & mutasi terpusat ke Laragon PostgreSQL
│   └── types/ucapin.ts             # Kontrak DTO TypeScript
└── prototype/                      # Prototipe statis HTML/CSS/JS awal
```

## 4. Alur sistem & Closed Loop Bank Kesalahan
1. **Pronunciation Drill (`/latihan-ucapan`)**:
   - Server mengambil daftar kalimat dari tabel `DrillSentence` di PostgreSQL Laragon.
   - Pengguna merekam suara dengan `<MicRecorder />` dan melihat hasil koreksi naskah pada `<ProofreadingSentence />`.
   - Kata dengan status `work` (mis. `very` `/v/ → /f/` atau `Thank` `/θ/ → /t/`) otomatis dikirim ke `POST /api/v1/mistakes` dan di-upsert ke tabel `MistakeItem` di PostgreSQL Laragon.
2. **Roleplay Berskrip (`/roleplay`)**:
   - Server mengambil skenario & node dialog dari tabel `Scenario` dan `ScenarioNode`.
   - Saat giliran pengguna memicu koreksi fonem (mis. konsonan akhir `/d/` pada `card`), sistem mengirim `POST /api/v1/mistakes` sehingga kata tersebut langsung bertambah di `MistakeItem`.
3. **Bank Kesalahan (`/bank-kesalahan` & kartu di `/`)**:
   - Menampilkan seluruh kata yang tersimpan di tabel `MistakeItem` diurutkan berdasarkan frekuensi kemunculan (`occurrenceCount`), lengkap dengan filter status dan tombol latihan ulang.

## 5. Privasi & kepatuhan (UU PDP 27/2022)
- Rekaman suara = data pribadi. Default `saveAudioOptIn = false` di tabel `User`: audio diproses di memori dan tidak disimpan.
- Pengguna dapat mengubah preferensi `saveAudioOptIn` dan `correctionPref` (`giliran` vs `akhir`) di `/cek-mikrofon`, yang langsung disimpan ke tabel `User` lewat `PATCH /api/v1/onboarding`.
