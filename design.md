# Design — Ucapin

> Website latihan **speaking** bahasa Inggris untuk pelajar Indonesia (rata-rata Gen Z). Konteks produk: [PRODUCT.md](PRODUCT.md).
> **Implementasi utama:** Next.js App Router + `shadcn/ui` di `src/` (terhubung ke Laragon PostgreSQL) dan prototipe statis di `prototype/`.
> Gaya visual: **Editorial Phonetic Notebook** dalam **palet teal-beige + coral**, mendukung mode terang dan gelap.

Dial antislop: **ENERGY 2 · RHYTHM 2 · MOTION 2** (aplikasi latihan berbasis tugas, mode Operate).

## 1. Inti produk (yang harus terasa di setiap layar)
**Siklus:** bicara → feedback → kesalahan masuk **Bank Kesalahan** → jadi latihan besok → kembali ke Beranda.
- Bank Kesalahan adalah pembeda utama: kartu di Beranda, halaman khusus `/bank-kesalahan`, dan CTA utama (coral) di Hasil Sesi.
- Fokus kesalahan khas penutur Indonesia: `/v/→/f/`, `/θ/→/t/`, `/ð/→/d/`, `/ʃ/→/s/`, konsonan akhir hilang (`-ed`, `-s`, `-t`, `-d`).

## 2. Prinsip UX (berbasis riset — jangan dilanggar tanpa diskusi)
1. **Kejelasan, bukan aksen.** Skor utama = "Kejelasan". Tidak ada skor aksen. (CEFR 2020)
2. **Jangan hanya warna.** Status selalu **gaya garis bawah + warna + ikon + label** (WCAG 1.4.1).
3. **Prompt, bukan recast.** Saat salah, minta pengguna mencoba lagi dulu ("Coba ucapkan lagi kata … saja"); catatan pelatih tersembunyi sampai dibuka.
4. **Tap-to-talk** sebagai default.
5. **Izin mikrofon setelah dijelaskan**; setiap error mikrofon punya pesan dan jalan keluar.
6. **Tekanan rendah:** pengguna memilih kapan dikoreksi; petunjuk jawaban tetap harus diucapkan.
7. **Gamifikasi mengukur usaha.** Target menit harian, streak dengan 2 jatah libur/bulan, liga mingguan berdasarkan **menit bicara** (bukan skor).
8. **UI dalam Bahasa Indonesia.** Bahasa Inggris hanya untuk materi belajar, ditandai `lang="en"`.
9. **Data contoh selalu diberi label** ("Prototype terhubung ke Laragon PostgreSQL: … contoh data").

## 3. Gaya Visual: Editorial Phonetic Notebook (Anti-AI Slop)
Untuk menghindari tampilan generik buatan AI:
- **Dilarang balon chat melayang yang bertumpuk di atas ikon mikrofon (eks `.mic-art`).** Diganti dengan **`<PhoneticSpecimenCard />`**: kartu spesimen buku catatan fonetik fungsional yang menampilkan kata prioritas hari ini (`very · /ˈvɛri/`), aturan substitusi bunyi (`/v/ → /f/`), tombol audio langsung, tip posisi mulut, dan mistar takaran 15 menit harian.
- **Dilarang stiker kapsul miring (`rotate(-4deg)`) yang melayang di atas kata kalimat latihan.** Diganti dengan **Anotasi Koreksi Naskah Interlinear Lurus (`<ProofreadingSentence />`)**:
  - Kata tetap menggunakan tanda koreksi garis bawah semantik (lurus/titik-titik/gelombang).
  - Kata yang perlu koreksi menampilkan garis penunjuk vertikal `1.5px` lurus ke bawah menuju tag catatan persegi (`rounded-[8px]`, `0deg` tanpa rotasi miring) berisi ikon status dan kode fonem (`Ulang · /v/ jadi /f/`).
  - **Pemisahan hirarki kontrol:** Toggle bantuan teks (`IPA`, `Arti`) berada di header kanan kartu kalimat, sedangkan pemutar suara (`Dengar contoh`, `Pelan 0,7x`) dan legenda tanda baca berada di footer kartu.

| Status | Garis bawah | Warna (terang / gelap) | Ikon & label |
|---|---|---|---|
| Jelas | lurus (`solid`) | `--ok` #2F6B4F / #7CC7A0 | check, "Jelas" |
| Hampir | titik-titik (`dotted`) | `--almost` #9A7124 (teks #7A5A1A) / #E3B95E | rotate-ccw, "Hampir" |
| Ulang / perlu latihan | gelombang (`wavy`) | `--work` #B5523B (teks #9A4330) / #F2937C | x, "Ulang" |

## 4. Token (sumber: `src/app/globals.css`)
### Palet pengguna
`#1E3E45` (teal-900) · `#274C56` (teal-800) · `#3B6A78` (teal-600) · `#D4C8B7` (sand) · `#E5E1CD` (beige) · `#E8E5D7` (canvas) · turunan `#F7F5EE` (paper).
**Aksen coral `#FF7A59`**: tombol fokus (`variant="accent"`), tombol rekam aktif, streak, avatar, progress. Teks di atas coral = `#13292E` (5,9:1).

### Tipografi (self-hosted di `public/fonts/`)
- **Bricolage Grotesque** (judul, angka, kata latihan, logo).
- **Atkinson Hyperlegible Next** (teks UI).
- **Charis SIL** (hanya transkripsi IPA).

## 5. Katalog Reusable Component (`shadcn/ui` + Shared Domain)
| Layer | Komponen | Lokasi File | Fungsi & Tempat Pakai |
|---|---|---|---|
| Primitif `shadcn/ui` | `Button`, `Card`, `Badge`, `Progress`, `Switch`, `Separator` | `src/components/ui/*` | Primitif dasar dengan token warna & radius Ucapin |
| Layout | `AppShell`, `SidebarNav`, `ThemeToggle` | `src/components/layout/*` | Kerangka 3 kolom (`248px | 1fr | 330px`) & tema terang/gelap |
| Shared Domain | `PhoneticSpecimenCard` | `src/components/shared/phonetic-specimen-card.tsx` | Spesimen kamus fonetik + mistar menit di Beranda & Onboarding |
| Shared Domain | `ProofreadingSentence` | `src/components/shared/proofreading-sentence.tsx` | Kartu kalimat latihan dengan garis bawah koreksi, anotasi interlinear lurus, toggle IPA/Arti, dan toolbar audio |
| Shared Domain | `PhoneticWordRow` | `src/components/shared/phonetic-word-row.tsx` | Baris kata + IPA + tombol dengar + badge status (dipakai di Beranda, Bank Kesalahan, dan Frasa Roleplay) |
| Shared Domain | `AudioTtsButton` | `src/components/shared/audio-tts-button.tsx` | Tombol pemutar suara `en-US` normal (`1.0x`) atau lambat (`0.7x`) di semua layar |
| Shared Domain | `MicRecorder` | `src/components/shared/mic-recorder.tsx` | Tombol rekam tap-to-talk + waveform `AnalyserNode` + penanganan 5 error mikrofon di Latihan Ucapan & Roleplay |
| Shared Domain | `ScoreMetricCard` | `src/components/shared/score-metric-card.tsx` | Kartu skor + progress bar semantik di Latihan Ucapan & Hasil Sesi |
| Shared Domain | `ClarityRing` | `src/components/shared/clarity-ring.tsx` | Ring SVG skor Kejelasan di Hasil Sesi |

## 6. Rute Layar (Next.js App Router ↔ Prototype)
| Rute Next.js | File Prototype | Isi kunci |
|---|---|---|
| `/` | `index.html` | Beranda: banner target harian + `PhoneticSpecimenCard`, 4 kartu mode, kartu Bank Kesalahan, lanjutkan roleplay, panel profil & liga menit |
| `/latihan-ucapan` | `latihan-ucapan.html` | Pronunciation Drill: `ProofreadingSentence`, `MicRecorder`, prompt ulang sebelum recast, 4 `ScoreMetricCard`, panel catatan pelatih |
| `/roleplay` | `roleplay.html` | Roleplay berskrip: chat dengan koreksi inline/akhir, petunjuk ucapan, composer `MicRecorder compact`, panel misi & frasa |
| `/hasil` | `hasil.html` | Session Result: `ClarityRing`, 4 `ScoreMetricCard`, ulasan jawaban, CTA Bank Kesalahan, cek percaya diri 1-5 (tersimpan ke DB) |
| `/bank-kesalahan` | — | Halaman penuh Bank Kesalahan: filter status kata (`work`/`almost`), frekuensi kemunculan, sumber sesi |
| `/mulai` | `mulai.html` | Onboarding tujuan, level CEFR A1-C1, target menit harian (tersimpan ke DB Laragon) |
| `/cek-mikrofon` | `cek-mikrofon.html` | Izin mikrofon setelah penjelasan, live meter 28 bar, pilihan waktu koreksi, opt-in simpan rekaman (UU PDP) |
