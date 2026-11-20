# Design — Ucapin

> Website latihan **speaking** bahasa Inggris untuk pelajar Indonesia (rata-rata Gen Z). Konteks produk: [PRODUCT.md](PRODUCT.md).
> **Sumber desain terbaru: prototype HTML di `prototype/`** (2026-11-20): **layout Figma** (kartu, banner, panel kanan) dalam **palet teal-beige + coral**, dengan mode terang dan gelap.
> Figma (https://www.figma.com/design/V546npJwhf9ZiKLApX2P1H) = acuan **struktur** layar; warnanya masih versi lama ungu dan belum disinkronkan.
> Nama "Ucapin" masih nama kerja.

Dial antislop: **ENERGY 2 · RHYTHM 2 · MOTION 2** (aplikasi latihan yang modern dan "fun", mode Operate).

## 1. Inti produk (yang harus terasa di setiap layar)
**Siklus:** bicara → feedback → kesalahan masuk **Bank Kesalahan** → jadi latihan besok → kembali ke Beranda.
- Bank Kesalahan adalah pembeda utama: kartu besar di Beranda (setelah banner target harian) dan CTA utama (coral) di Hasil Sesi.
- Fokus kesalahan khas penutur Indonesia: /v/→/f/, /θ/→/t/, /ð/→/d/, /ʃ/→/s/, konsonan akhir hilang (-ed, -s, -t, -d).

## 2. Prinsip UX (berbasis riset — jangan dilanggar tanpa diskusi)
1. **Kejelasan, bukan aksen.** Skor utama = "Kejelasan". Tidak ada skor aksen. (CEFR 2020)
2. **Jangan hanya warna.** Status selalu **gaya garis bawah + warna + ikon + label** (WCAG 1.4.1).
3. **Prompt, bukan recast.** Saat salah, minta pengguna mencoba lagi dulu ("Coba ucapkan lagi kata … saja"); catatan pelatih tersembunyi sampai dibuka.
4. **Tap-to-talk** sebagai default.
5. **Izin mikrofon setelah dijelaskan**; setiap error mikrofon punya pesan dan jalan keluar.
6. **Tekanan rendah:** pengguna memilih kapan dikoreksi; petunjuk jawaban tetap harus diucapkan.
7. **Gamifikasi mengukur usaha.** Target menit harian, streak dengan 2 jatah libur/bulan, liga mingguan berdasarkan **menit bicara** (bukan skor).
8. **UI dalam Bahasa Indonesia.** Bahasa Inggris hanya untuk materi belajar, ditandai `lang="en"`.
9. **Data contoh selalu diberi label** ("Prototype: … contoh data").

## 3. Gaya visual
- **Kartu Figma:** kartu `--surface` radius 22px dengan bayangan lembut (terang) atau garis tipis (gelap), tile ikon berwarna lembut, chip pill, panel profil/progres di kanan.
- **Satu banner hero per halaman** (Beranda: target harian; Hasil Sesi: ring Kejelasan) dengan gradient teal tonal. Alasan: memberi kedalaman pada satu fokus layar, bukan dekorasi.
- **Ilustrasi mikrofon + gelembung ucapan** (HTML/CSS, bukan gambar) di banner Beranda dan panel onboarding; ilustrasi SVG cangkir (roleplay kafe) dan mulut (cara mengucapkan /v/).
- **Stiker koreksi:** label miring "Ulang yuk", "Hampir!", "Jelas!" muncul di atas kata dengan animasi pop.
- **Tanda koreksi naskah** tetap dipakai: lurus = Jelas, titik-titik = Hampir, gelombang = Ulang.

| Status | Garis bawah | Warna (terang / gelap) | Ikon & label |
|---|---|---|---|
| Jelas | lurus | `--ok` #2F6B4F / #7CC7A0 | check, "Jelas" |
| Hampir | titik-titik | `--almost` #9A7124 (teks #7A5A1A) / #E3B95E | again, "Hampir!" |
| Ulang / perlu latihan | gelombang | `--work` #B5523B (teks #9A4330) / #F2937C | cross, "Ulang yuk" |

## 4. Token (sumber: `prototype/assets/styles.css` + `prototype/assets/ui.css`)
### Palet pengguna
#1E3E45 (teal-900) · #274C56 (teal-800) · #3B6A78 (teal-600) · #D4C8B7 (sand) · #E5E1CD (beige) · #E8E5D7 (canvas) · turunan #F7F5EE (paper).
**Aksen coral #FF7A59** (disetujui): tombol fokus (`.btn-accent`), tombol rekam aktif, streak, avatar, progress, selebrasi. Teks di atas coral = #13292E (5,9:1). Coral tidak dipakai sebagai warna teks di tema terang.

### Token semantik (berubah per tema)
| Token | Terang | Gelap |
|---|---|---|
| `--bg` | #E8E5D7 | #13292E |
| `--surface` | #F7F5EE | #1B353B |
| `--surface-2` | #E5E1CD | #22414A |
| `--text` / `--text-2` | #1E3E45 / #3B6A78 | #E8E5D7 / #B9C9CC |
| `--btn-bg` / `--btn-fg` | #274C56 / #F7F5EE | #E5E1CD / #1E3E45 |
| `--side-bg` | #1E3E45 | #0E2125 |
| Tile (teal/coral/green/ochre) | #DCE8EA, #FFE2D8, #DDEEE3, #F6EBCF | rgba 14–16% dari warna terang |

Tema gelap mengikuti setelan sistem, bisa diganti lewat tombol "Mode gelap/terang" (disimpan di `localStorage` `ucapin-theme`, atau `?theme=light|dark` di URL).

### Kontras terukur (WCAG AA)
Terang: ink/canvas 9,08 · teal-600/canvas 4,72 · status-ink ≥ 4,96. Gelap: teks 12,0 · teks-2 8,9 · status ≥ 6,6 · coral 5,9. Chip di dalam alert memakai latar `--surface` agar tetap ≥ 4,5:1.

### Tipografi (self-hosted di `prototype/assets/fonts/`)
- **Bricolage Grotesque** (judul, angka, kata latihan, logo): sans tebal dan modern, karakter Gen Z tanpa kehilangan keterbacaan.
- **Atkinson Hyperlegible Next** (teks UI): huruf mirip mudah dibedakan.
- **Charis SIL** (hanya IPA): cakupan simbol fonetik lengkap.
- Skala: body 16 · h3 17,6 · h2 22 · h1 36 (HP 30) · kata entri 68 · kalimat latihan 38 (HP 30).

### Radius, spacing, motion
- Radius: kartu 22 · kontrol 14 · hero 28 · pill 999.
- Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48.
- Motion (MOTION 2): hover kartu naik 2px, tombol tekan, mic berdenyut (ripple coral) saat merekam, stiker pop, chat bergeser masuk, tally/progress mengisi, ring skor berputar, gelembung melayang pelan, satu ledakan titik di Hasil Sesi. Easing spring ringan `cubic-bezier(0.3, 1.25, 0.6, 1)`. Semua mati di `prefers-reduced-motion`.

## 5. Komponen
| Komponen | Kelas |
|---|---|
| Kartu, kartu tautan | `.card`, `.card-link` (+ `a.stretch`) |
| Tile ikon, chip | `.tile .t-teal/.t-coral/.t-green/.t-ochre`, `.chip-*` |
| Banner hero, ilustrasi mic | `.hero`, `.mic-art` (`.ring`, `.core`, `.bubble`) |
| Tombol | `.btn`, `.btn-primary`, `.btn-accent` (coral), `.btn-quiet`, `.icon-btn`, `.theme-toggle` |
| Status, stiker, tanda | `.status-*`, `.sticker`, `.mk-ok/-almost/-work` |
| Baris item (Bank Kesalahan, frasa) | `.item` |
| Kartu skor, meter | `.score-card`, `.meterbar .mb-*`, `.ring-score` |
| Panel kanan | `.panel`, `.profile`, `.avatar`, `.stat`, `.league`, `.badge-tile` |
| Mikrofon | `.mic[data-state]`, `.levels`, `.meter` |
| Roleplay | `.turn-char/.turn-me`, `.tool`, `.hint`, `.mission`, `.scene` |
| Form | `.choice`, `.choice.goal`, `.switch`, `.stepper` |

## 6. Layout
- ≥1280px: **Sidebar 248 | Main | Panel kanan 330** (`.app.has-panel`). Kartu mode 2×2 di bawah 1600px.
- 900–1280px: panel kanan turun ke bawah konten.
- <900px: sidebar jadi bar atas dengan navigasi geser; semua grid jadi satu kolom; ilustrasi hero disembunyikan.
- Onboarding: split panel teal (ilustrasi mic + fakta) | form.

## 7. Layar (prototype ↔ Figma)
| File | Figma | Isi kunci |
|---|---|---|
| `index.html` | 01 Dashboard | sapaan, banner target harian + ilustrasi, 4 kartu mode, kartu Bank Kesalahan (+ tampilan kosong `?kosong=1`), kartu lanjutkan roleplay; panel: profil, 3 stat, grafik minggu, liga (menit) |
| `latihan-ucapan.html` | 02 Pronunciation Drill | header + progres, kartu kalimat (Dengar/Pelan/IPA/Arti, legenda), mic + level, error mic, stiker koreksi, prompt ulang, 4 kartu skor; panel catatan pelatih (rincian bunyi, ilustrasi mulut, pasangan minimal) |
| `roleplay.html` | 03 AI Roleplay (MVP: berskrip) | header skenario + timer, kartu chat dengan koreksi inline, petunjuk, composer mic; panel: ilustrasi kafe, misi, frasa, pilihan koreksi, statistik |
| `hasil.html` | 04 Session Result | hero ring Kejelasan + stiker + selebrasi, 4 kartu skor, ulas jawaban, kartu Bank Kesalahan + CTA coral, cek percaya diri; panel: tren, level, lencana |
| `mulai.html` | 05 Onboarding goal | tujuan dengan tile, level A1–C1, target menit, validasi |
| `cek-mikrofon.html` | 06 / 06b Mic check + blocked | izin setelah penjelasan, semua state error mikrofon, meter level, preferensi koreksi, opt-in simpan rekaman |

**Belum didesain:** halaman Bank Kesalahan penuh, Shadowing, Speaking Test, Progres, Pengaturan/privasi, harga, landing page, sinkron warna ke Figma, state koneksi putus.

## 8. Suara copy
Bahasa Indonesia santai-sopan, singkat, menyemangati. Contoh: "Obrolan yang mantap, Alya!", "Hampir! Ada 2 hal kecil, coba ucapkan lagi.", "Bolos sehari tidak menghapus progres." CTA menyebut aksi spesifik. Tanpa em dash, tanpa buzzword.
