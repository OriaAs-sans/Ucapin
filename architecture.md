# Architecture — Ucapin

> Status: **usulan** dari riset (lihat `reports/`). Belum ada kode. Setiap keputusan bertanda ❓ perlu didiskusikan dengan pengguna sebelum dikunci.

## 1. Tahapan produk
| Tahap | Isi | AI yang dipakai |
|---|---|---|
| **MVP** | Pronunciation Drill, Shadowing (rekam & bandingkan), **Roleplay berskrip** (dialog bercabang, audio pra-rekam/TTS cache), Mistake Bank otomatis dari skor fonem, Session Result, onboarding, streak/target harian | Hanya **penilaian pengucapan** (Azure). Tanpa LLM. |
| **v1.5** | AI Roleplay bebas (turn-based STT → LLM → TTS), Speaking Test gaya IELTS | + STT, LLM, TTS |
| **v2** | Percakapan real-time (full duplex), aplikasi mobile | + LiveKit + model speech-to-speech |

❓ Konfirmasi: MVP tanpa LLM seperti di atas?

## 2. Stack
| Lapisan | Pilihan | Catatan |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript** | ❓ styling: Tailwind CSS dengan token dari design.md |
| Audio di browser | `getUserMedia` + `MediaRecorder`, waveform via Web Audio `AnalyserNode` | Jangan pakai Web Speech API untuk penilaian (mengoreksi otomatis kesalahan pelajar, dukungan browser tidak merata) |
| Penilaian ucapan | **Azure AI Speech – Pronunciation Assessment** (en-US, granularitas fonem, IPA) | ~US$1/jam audio, free tier 5 jam/bulan. Prosody/skor konten hanya en-US |
| STT percakapan (v1.5) | gpt-4o-mini-transcribe atau Deepgram Nova-3 | ~US$0,003–0,005/menit |
| LLM tutor (v1.5) | Claude Haiku (default) / Sonnet, dengan prompt caching | Persona per skenario, keluaran terstruktur (balasan + koreksi + status misi) |
| TTS | Azure Neural TTS; audio pelajaran statis di-cache di CDN | Kecepatan lambat (0.7×) dilakukan di browser (playbackRate) |
| Backend | Next.js Route Handlers / server actions | ❓ atau backend terpisah |
| Database & auth | ❓ Postgres (mis. Supabase: auth + DB + storage) | |
| Storage audio | Hanya jika pengguna opt-in, dengan TTL | |
| Hosting | ❓ Vercel / sejenis | |

## 3. Alur sistem
### Pronunciation Drill (MVP)
1. Browser minta **token Azure jangka pendek** dari backend (`/api/speech-token`); key Azure tidak pernah ke browser.
2. Azure Speech JS SDK merekam & mengirim audio dengan teks acuan (scripted assessment).
3. Hasil: Accuracy, Fluency, Completeness, (Prosody), miscue per kata, skor per fonem.
4. Backend menyimpan **ringkasan** (bukan audio): skor per kata/fonem → aturan Mistake Bank.

### Mistake Bank
- Aturan deteksi: fonem target (mis. /v/, /θ/, /ð/, /ʃ/, konsonan akhir) dengan skor < ambang (❓ mis. 60) → buat/naikkan item `{kata, fonem, contoh salah, sumber sesi}`.
- Penjadwalan ulang: spaced repetition sederhana (mis. 1 → 3 → 7 → 14 hari); item "dikuasai" setelah N kali lulus berturut-turut.
- Drill dibuat dari: kata itu sendiri, minimal pairs (very/fery), kalimat pendek berisi fonem yang sama.

### Roleplay berskrip (MVP)
- Skenario = graf dialog (node AI → pilihan/kalimat target pengguna → node berikutnya), 3 misi per skenario.
- Ucapan pengguna dinilai Azure terhadap kalimat target terdekat; kesalahan masuk Mistake Bank.

### AI Roleplay bebas (v1.5)
Rekam (tap-to-talk) → STT → LLM (persona + misi + level CEFR) → koreksi dalam bentuk *prompt* → TTS balasan. Giliran pengguna juga dinilai Azure (transkrip dipakai sebagai teks acuan) untuk mengisi Mistake Bank.

## 4. Model data (sketsa)
- `users` (level CEFR, tujuan, target menit harian, preferensi koreksi, opt-in simpan audio, persetujuan & tanggal)
- `sessions` (mode, skenario, durasi bicara, skor agregat, mulai/selesai)
- `utterances` (sesi, teks acuan, transkrip, skor, `audio_url` nullable)
- `phoneme_scores` (utterance, kata, fonem, skor)
- `mistakes` (user, kata, fonem, jenis, jumlah_muncul, next_review_at, status)
- `streaks` / `daily_goals` (tanggal, menit, freeze terpakai)
- `scenarios`, `scenario_nodes` (konten roleplay)

## 5. Privasi & kepatuhan (UU PDP 27/2022)
- Rekaman suara = data pribadi; data anak = data spesifik → **persetujuan eksplisit tercatat**, alur persetujuan orang tua untuk pengguna di bawah umur.
- Default: audio **tidak disimpan** (diproses lalu dibuang); simpan hanya jika opt-in, dengan masa simpan terbatas.
- Transfer ke luar negeri (Azure/OpenAI/Anthropic) → minta persetujuan pengguna, sebutkan di kebijakan privasi.
- Siapkan DPIA dan prosedur notifikasi kebocoran 72 jam. Status PP 33/2026 ❓ perlu konfirmasi konsultan hukum.
- Jangan pakai free tier Gemini untuk data pengguna nyata.

## 6. Biaya (estimasi, perlu diukur di prototipe)
Asumsi 200 menit latihan/pengguna aktif/bulan:
| Konfigurasi | ~US$/pengguna/bulan |
|---|---|
| MVP (hanya Azure pronunciation, TTS di-cache) | < 1 (perkiraan, belum dihitung rinci) |
| Turn-based STT→LLM→TTS | ~2,5 |
| + penilaian Azure tiap giliran | ~3,7 |
| Real-time speech-to-speech | 2,6–15 |

Harga langganan Rp 50–100 ribu → margin tipis untuk v1.5; perlu batas menit harian per paket.

## 7. Risiko terbuka
- Belum ada benchmark akurasi ASR untuk aksen Indonesia → uji 20–50 klip pelajar asli sebelum mengunci vendor.
- Belum terbukti rasa percaya diri dari latihan AI terbawa ke percakapan dengan manusia.
- Kemauan bayar pelajar Indonesia belum diteliti.
