# Architecture — Ucapin

> Status: **Aktif (Next.js Fullstack + shadcn/ui + Prisma ORM + Laragon PostgreSQL `127.0.0.1:5432`)**, dikonfirmasi pengguna pada 2026-11-20.

## 1. Tahapan produk
| Tahap | Isi | AI yang dipakai |
|---|---|---|
| **MVP (Aktif)** | Pronunciation Drill, Shadowing (dengar, tirukan, bandingkan tempo), **Roleplay berskrip** (6 giliran, 8 skenario), Bank Kesalahan dengan pengulangan berjarak, Session Result, onboarding, streak/target harian | **Pengenal suara ElevenLabs Scribe** (kata + keyakinan + waktu) dan **TTS ElevenLabs**. Tanpa LLM. |
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
| Penilaian ucapan | **ElevenLabs Scribe** (`scribe_v1`) lewat `POST /api/v1/speech/transcribe`; penyejajaran kata + pola salah ucap Indonesia di `src/lib/speech-assessor.ts` | Penilaian per kata, bukan per fonem. Azure Pronunciation Assessment tetap opsi untuk skor fonem di masa depan |
| TTS | **ElevenLabs** (`eleven_flash_v2_5`) lewat `GET /api/v1/speech/tts` dengan cache memori; cadangan otomatis ke `speechSynthesis` browser | Normal 1.0x dan pelan 0,75x |

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
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts    # POST email + sandi (wajib), atau 1-klik akun testing khusus mode development
│   │   │   │   ├── register/route.ts # POST daftar akun baru; sandi min. 8 karakter, email terdaftar ditolak (409)
│   │   │   │   ├── logout/route.ts   # POST hapus session cookie
│   │   │   │   └── reset/route.ts    # POST reset data testing; 404 di luar mode development
│   │   │   ├── dashboard/route.ts  # GET data Beranda dari PostgreSQL
│   │   │   ├── mistakes/route.ts   # GET & POST item Bank Kesalahan (kesalahan baru: jadwal kembali ke tahap 0)
│   │   │   ├── mistakes/review/route.ts # POST hasil latihan per kata: kata bank yang jelas naik tahap jadwal
│   │   │   ├── speech/transcribe/route.ts # POST audio rekaman -> ElevenLabs Scribe (wajib sesi, dibatasi 20/menit, audio tidak disimpan)
│   │   │   ├── speech/tts/route.ts  # GET suara contoh ElevenLabs (wajib sesi, cache memori)
│   │   │   ├── onboarding/route.ts # PATCH tujuan, CEFR, target menit, koreksi, opt-in UU PDP
│   │   │   ├── sessions/route.ts   # POST simpan sesi latihan/roleplay baru, tambah menit harian, update liga & Bank Kesalahan
│   │   │   └── session-result/route.ts # POST rating kepercayaan diri 1-5
│   │   ├── bank-kesalahan/page.tsx # Halaman penuh Bank Kesalahan
│   │   ├── cek-mikrofon/page.tsx   # Onboarding tes izin & level mikrofon
│   │   ├── hasil/page.tsx          # Hasil Sesi (Session Result)
│   │   ├── latihan-ucapan/page.tsx # Pronunciation Drill (filter per tujuan belajar atau Bank Kesalahan)
│   │   ├── masuk/page.tsx          # Login, Daftar Akun Baru, & Pintasan Testing E2E
│   │   ├── mulai/page.tsx          # Onboarding tujuan & level CEFR
│   │   ├── roleplay/page.tsx       # Scripted Roleplay (8 skenario, 6 giliran)
│   │   ├── shadowing/page.tsx      # Shadowing: dengar contoh, tirukan, bandingkan tempo
│   │   ├── loading.tsx / error.tsx / not-found.tsx # State muat, gagal, dan 404 global
│   │   ├── globals.css             # CSS Variables tema terang/gelap & @font-face
│   │   ├── layout.tsx              # Root layout Bahasa Indonesia (lang="id")
│   │   └── page.tsx                # Beranda (Dashboard)
│   ├── components/
│   │   ├── ui/                     # Primitif shadcn/ui (button, card, badge, progress, switch, separator, input, label)
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
│   │   ├── shadowing/shadowing-workspace.tsx
│   │   └── session-result/session-result-workspace.tsx
│   ├── lib/utils.ts                # Helper cn(), speakEnglish() (TTS ElevenLabs + cadangan browser), mapMicError(), isDevBuild
│   ├── lib/speech-assessor.ts      # Penilai: penyejajaran kata, pola L1 Indonesia, skor Kejelasan/Ketepatan kata/Kelancaran/Kelengkapan
│   ├── lib/speech-assessor.test.ts # Unit test penilai dengan transkrip buatan (npm test, node:test lewat tsx)
│   ├── lib/spaced-repetition.ts    # Jadwal Bank Kesalahan 1, 3, 7, 14 hari
│   ├── middleware.ts               # Tanpa cookie sesi: halaman → /masuk, API → 401
│   ├── server/
│   │   ├── db.ts                   # Singleton PrismaClient
│   │   ├── password.ts             # Hash sandi scrypt (node:crypto) + verifikasi timing-safe
│   │   ├── session.ts              # Cookie sesi bertanda tangan HMAC (SESSION_SECRET), kedaluwarsa 30 hari
│   │   ├── test-accounts.ts        # Id akun testing + baca email/sandi testing dari env
│   │   ├── speech-mock.ts          # Pengenal suara tiruan (SPEECH_MOCK, hanya di luar production) + speech-mock.test.ts
│   │   ├── seed-data.ts            # Isi data awal (dipakai seed & reset)
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

## 4b. Penilaian ucapan & Bank Kesalahan (diperbarui 2026-11-21)
- **Alur rekam:** `<MicRecorder />` merekam dengan `MediaRecorder` (maks. 30 detik), mengirim audio ke `/api/v1/speech/transcribe`, lalu ElevenLabs Scribe mengembalikan kata, keyakinan (dari logprob), dan waktu. Web Speech API tidak dipakai. Rekaman kosong atau diam ditolak dengan pesan, tidak pernah dianggap benar.
- **Mode uji tanpa kuota (diperbarui 2026-11-21):** bila `SPEECH_MOCK` berisi `jelas` atau `salah-ucap` dan bukan production, route transcribe membuat transkrip dari kalimat acuan (dikirim `MicRecorder` sebagai field `reference`) tanpa memanggil ElevenLabs. `SpeechAttempt` tetap dicatat, jadi kuota, menit, dan verifikasi bab tetap teruji; respons membawa `mock` dan `MicRecorder` menampilkan label "Mode uji". Tes E2E menjalankan server sendiri di port 3100 (`.next-e2e`) dengan `SPEECH_MOCK="salah-ucap"`, dan audio mikrofon palsu dibuat lokal (tanpa TTS).
- **Pola L1 yang dikenali:** aturan bunyi lebih dulu (`/v/` jadi `/f/`, `/b/`, `/p/`; `th` di posisi mana pun jadi `/t/`, `/d/`, `/s/`, `/z/` dengan pembeda `/θ/` dan `/ð/`; `/ʃ/` jadi `/s/`; posisi "akhir" ikut dilabeli), lalu kamus 67 kata dari materi latihan, lalu konsonan akhir yang hilang.
- **Penilai** (`assessSpokenUtterance`): kata acuan disejajarkan dengan kata terucap (edit distance tingkat kata). Status per kata: cocok + yakin = jelas, cocok + kurang yakin = hampir, tertukar/terlewat = ulang. Pola L1 dikenali dari pasangan kata (`/v/ jadi /f/`, `/θ/ jadi /t/`, `/ð/ jadi /d/`, `/ʃ/ jadi /s/`, konsonan akhir hilang).
- **Skor:** Kejelasan (kata dipahami), Ketepatan kata (rata-rata keyakinan), Kelancaran (tempo 110 sampai 170 kata/menit dan jeda panjang), Kelengkapan. Tata bahasa dan kosakata **tidak dinilai** dan tidak ditampilkan; kolomnya disimpan 0.
- **Bank Kesalahan:** hanya kata dengan masalah bunyi nyata yang masuk (bukan kata fungsi yang terlewat, bukan saat kalimat yang diucapkan berbeda). Jadwal: tahap 0 ulang hari ini; setiap kali kata jatuh tempo terdengar jelas, naik ke jarak 1, 3, 7, 14 hari; berhasil di tahap 4 = dikuasai. Salah lagi = kembali ke tahap 0. Kolom: `reviewStage`, `nextReviewAt`, `lastPracticedAt`, `masteredAt` (migrasi `20261121120000_mistake_spaced_repetition`).
- **Menit bicara** untuk target harian dan liga dihitung dari lama rekaman, bukan lama halaman terbuka.

## 4c. Bab, statistik, dan privasi (diperbarui 2026-11-21)
- **Bab:** Latihan Ucapan dibagi per tujuan x level (5 kalimat per bab, kunci `drill:<tujuan>:<level>`); Roleplay per skenario (`roleplay:<slug>`), diurutkan per level lalu urutan materi. Bab pertama tiap jalur terbuka, berikutnya terbuka setelah bab sebelumnya selesai (`ChapterProgress`). Logika murni di `src/lib/chapters.ts`; peta bab memakai `<ChapterMap />` (`src/components/shared/chapter-map.tsx`).
- **Verifikasi bab di server** (`verifyChapterCompletion`): bab terbuka, sesi memuat semua kalimat/giliran, dan ada rekaman yang dinilai server (`SpeechAttempt`) sebanyak isi bab dalam 3 jam terakhir. Bab terkunci yang dibuka lewat URL dialihkan ke peta dengan pesan.
- **Statistik dari data bertanggal (WIB):** menit hari ini, total, streak, grafik minggu ini, dan liga dihitung di `src/server/activity.ts` dari `SpeechAttempt` (durasi audio yang dinilai server, tanpa audio dan transkrip). Tidak ada penghitung tersimpan, jadi pergantian hari otomatis dan menit tidak bisa dipalsukan dari browser. Tabel `DailyActivity` dan `LeagueEntry` dihapus.
- **Liga mingguan** opt-in dengan nama panggilan (`leagueOptIn`, `leagueNickname`), reset tiap Senin 00.00 WIB, 10 teratas + posisi sendiri.
- **Kuota dan biaya:** pengenal suara 20 rekaman/menit dan 400/hari per pengguna (dihitung dari database). TTS hanya untuk teks materi (`isKnownLearningText`) dan di-cache di tabel `TtsCache`.
- **Hak data (UU PDP):** `GET /api/v1/account` unduh semua data (JSON), `DELETE /api/v1/account` hapus akun + semua data (konfirmasi teks "HAPUS"); panel di halaman Tujuan & Target. Kebijakan privasi di `/privasi` (draf; bagian `[ISI: ...]` wajib dilengkapi pemilik).
- **Header keamanan** di `next.config.ts`: CSP (tanpa `unsafe-eval` di production), HSTS, X-Frame-Options DENY, Permissions-Policy mikrofon hanya untuk situs sendiri. Input API dibatasi panjang dan formatnya.
- **Seed:** `seedContent` (materi saja, aman untuk production: `npm run db:seed:content`) dan `seedTestAccounts` (khusus dev, hanya dua akun testing).

## 6. Deploy (Supabase + Vercel)
- Database: Postgres Supabase region Tokyo (ap-northeast-1). `DATABASE_URL` = pooler transaction (port 6543, `?pgbouncer=true`), `DIRECT_URL` = koneksi langsung untuk migrasi.
- Vercel region `hnd1` Tokyo, sama dengan database Supabase (`vercel.json`); build `npm run vercel-build` = `prisma migrate deploy && next build`; `postinstall` menjalankan `prisma generate`.
- Variabel lingkungan di Vercel: `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET` (sampai Supabase Auth aktif), `ELEVENLABS_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. `ENABLE_TEST_ACCOUNTS` tidak diisi.
- Setelah deploy pertama: jalankan `npm run db:seed:content` sekali ke database production.

## 5. Autentikasi & kredensial
- **Tidak ada email/sandi di kode, seed, default schema, atau teks UI.** Akun testing dibaca dari env: `TEST_ACCOUNT_NEW_EMAIL`, `TEST_ACCOUNT_ACTIVE_EMAIL`, `TEST_ACCOUNT_PASSWORD`. Seed berhenti sebelum menghapus data jika salah satunya kosong.
- Sandi disimpan di kolom `User.passwordHash` (scrypt + salt acak). Migrasi `20261121090000_hash_user_passwords` mengosongkan sandi teks lama, jadi database lama perlu `npm run db:reset`.
- Sesi: cookie HTTP-only `ucapin_session` berisi `userId.kedaluwarsa.tandaTangan` (HMAC-SHA256 dengan `SESSION_SECRET`). Cookie tanpa tanda tangan valid diperlakukan sebagai belum masuk; tidak ada lagi fallback ke akun default.
- Pintasan 1-klik dan `POST /api/v1/auth/reset` hanya aktif bila `NODE_ENV !== "production"` dan `ENABLE_TEST_ACCOUNTS="true"`, dan hanya untuk id akun testing.
- File env: Next.js membaca `.env` lalu `.env.local`; Prisma CLI hanya `.env`; script `db:seed`/`db:reset`/`db:setup` membaca keduanya lewat `tsx --env-file-if-exists`. Rahasia ditaruh di `.env.local`; contoh kosong di `.env.example`.

## 7. Privasi & kepatuhan (UU PDP 27/2022)
- Rekaman suara = data pribadi. Default `saveAudioOptIn = false` di tabel `User`: audio diproses di memori dan tidak disimpan.
- Audio rekaman dikirim ke ElevenLabs hanya untuk ditranskrip dan tidak disimpan Ucapin; ini disebut terbuka di persetujuan saat daftar.
- Pengguna dapat mengubah preferensi `saveAudioOptIn` dan `correctionPref` (`giliran` vs `akhir`) di `/cek-mikrofon`, yang langsung disimpan ke tabel `User` lewat `PATCH /api/v1/onboarding`.
