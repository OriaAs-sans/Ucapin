# Design — Ucapin

> Website latihan **speaking** bahasa Inggris untuk pelajar Indonesia.
> Sumber desain: **Figma** → https://www.figma.com/design/V546npJwhf9ZiKLApX2P1H (halaman `🎨 Foundations` dan `🖥 Screens`).
> Nama "Ucapin" masih nama kerja.

## 1. Inti produk (yang harus terasa di setiap layar)
**Siklus:** bicara → feedback → kesalahan masuk **Mistake Bank** → jadi drill besok → kembali ke Dashboard.
- Mistake Bank adalah pembeda utama; tampilkan sebagai elemen ke-2 paling menonjol di Dashboard (setelah target harian) dan sebagai CTA utama di Session Result.
- Fokus kesalahan khas penutur Indonesia: /v/→/f/, /θ/→/t/, /ð/→/d/, /ʃ/→/s/, konsonan akhir hilang (-ed, -s, -t).

## 2. Prinsip UX (berbasis riset — jangan dilanggar tanpa diskusi)
1. **Clarity, bukan aksen.** Skor utama = "Clarity" (seberapa mudah dipahami). Tidak ada "accent score". (CEFR 2020)
2. **Jangan hanya warna.** Status kata selalu warna **+ ikon + label** (✓ Clear, ↻ Almost, ✕ Needs work) dan garis bawah. (WCAG 1.4.1)
3. **Prompt, bukan recast.** Saat salah, minta pengguna mencoba lagi dulu ("Say it again"); versi benar baru ditampilkan setelahnya / atas permintaan.
4. **Tap-to-talk** sebagai default (tap mulai, tap kirim). Deteksi suara otomatis hanya opsional.
5. **Minta izin mic setelah dijelaskan** (pre-permission screen), baru pop-up browser.
6. **Tekanan rendah:** pengguna memilih kapan dikoreksi (setiap giliran / di akhir sesi); hint boleh dipakai tapi tetap harus diucapkan.
7. **Gamifikasi mengukur usaha, bukan kualitas ucapan.** Liga mingguan = menit bicara. Streak punya 2 freeze/bulan. Target harian terpisah dari streak.
8. **Bahasa:** UI bahasa Inggris sederhana (A2), bantuan/terjemahan Bahasa Indonesia tersedia (tombol "Arti (ID)" / "Translate").

## 3. Token (Figma variables: koleksi `Ucapin Tokens`, mode `Light`)
### Warna
| Token | Hex | Pakai untuk |
|---|---|---|
| `primary/700` | #5536D6 | teks di atas primary-100, gradient akhir |
| `primary/600` | #6C4CF1 | CTA, nav aktif, ikon aksen |
| `primary/500` | #8B6CFF | gradient awal, waveform |
| `primary/200` | #D9CFFF | bar chart non-aktif, border terpilih ringan |
| `primary/100` | #EEE9FF | tile ikon, tombol secondary |
| `primary/50` | #F7F4FF | latar kartu lembut, bubble AI |
| `bg/canvas` | #F4F3FA | latar halaman |
| `bg/surface` | #FFFFFF | kartu, sidebar, panel kanan |
| `text/primary` | #1E1B3A | teks utama |
| `text/secondary` | #6B6890 | teks pendukung, ikon nav |
| `text/muted` | #A09DBB | placeholder, label kecil |
| `text/on-primary` | #FFFFFF | teks di atas ungu |
| `border/default` | #ECEAF5 | garis & outline |
| `success/500` · `success/100` | #1FA463 · #E3F7EC | Clear, selesai |
| `warning/500` · `warning/100` | #E89A0C · #FFF3DB | Almost, koreksi |
| `danger/500` · `danger/100` | #E5484D · #FDE8E8 | Needs work, rekam aktif |
| `accent/pink` · `accent/pink-100` | #FF7AB6 · #FFE6F2 | aksen Roleplay |
| `accent/mint-100` | #DDF5EC | aksen Shadowing |
| `accent/sky-100` | #E1EEFF | aksen travel |
| `accent/peach-100` | #FFEADB | aksen Speaking Test / streak |
| `accent/yellow-100` | #FFF6D6 | aksen Mistake Bank |

**Gradient brand:** linear #8B6CFF → #5536D6 (hero, logo mark, tombol mic, bubble user).

### Tipografi — Plus Jakarta Sans
| Style | Size / Weight / Line-height |
|---|---|
| Display | 40 / ExtraBold / 120% |
| Heading/H1 | 28 / Bold / 125% |
| Heading/H2 | 22 / Bold / 130% |
| Heading/H3 | 18 / Bold / 135% |
| Body/Large | 16 / Medium / 150% |
| Body/Regular | 14 / Regular / 150% |
| Body/Medium | 14 / SemiBold / 150% |
| Caption | 12 / Medium / 140% |
| Overline | 11 / Bold / 130%, letter-spacing 8%, UPPERCASE |

Kata latihan di Pronunciation Drill: 34px ExtraBold.

### Radius & spacing
- Radius: `sm` 8 · `md` 12 (tombol, tile, chip kotak) · `lg` 20 (kartu) · `xl` 28 (hero, kartu utama) · pill 999.
- Spacing: 4 · 8 · 16 · 24 · 32. Padding kartu 20–24, padding main 36, jarak antar section 22–28.

### Efek
- `Shadow/Card`: y 8, blur 24, #2B1F7A @ 6%.
- `Shadow/Floating`: y 16, blur 40, #2B1F7A @ 16% (tombol mic, bubble melayang).

### Ikon
Gaya Lucide, stroke 2px, ujung bulat, ukuran 14/16/18/20/24. Komponen `icon/*` di Figma (32 ikon). Ikon di dalam **Icon Tile** (kotak radius md, latar warna -100, ikon warna -500/-600).

## 4. Komponen (Figma `🎨 Foundations → Components`)
| Komponen | Varian / properti |
|---|---|
| **Button** | `Variant` = Primary (ungu) / Secondary (ungu muda) / Outline (putih + border); prop `Label` |
| **Chip** | `Tone` = Purple / Green / Orange / Red; prop `Label` |
| **Nav Item** | `State` = Default / Active; prop `Label`, `Icon` (instance swap) |
| **Sidebar** | 264px; logo, menu (Dashboard, Speaking Lab, AI Roleplay, Shadowing, Lessons, Progress, Leaderboard), kartu Upgrade, Settings |

Pola yang berulang (belum jadi komponen, kandidat berikutnya): Icon Tile, Stat Card, Score Card (label + angka + bar + deskripsi), Mic Button (idle / recording / disabled), Word Feedback token, Chat Bubble (AI / User), Task row, Progress bar.

## 5. Layout
- Desktop 1440: **Sidebar 264 | Main (fluid, padding 36) | Panel kanan 340–360** (profil/coach/misi).
- Onboarding: split **panel brand 520 (gradient) | form (padding 80)**, stepper 4 langkah.
- Mobile: belum didesain (TODO).

## 6. Layar (Figma `🖥 Screens`)
| # | Layar | Isi kunci |
|---|---|---|
| — | User Flow | 7 langkah + loop Mistake Bank |
| 01 | Dashboard | sapaan, hero target menit harian, 4 mode, Mistake Bank, lanjutkan roleplay, profil+stat, grafik mingguan, liga (menit) |
| 02 | Pronunciation Drill | kalimat dengan feedback per kata, IPA, Listen/Slow/Arti, rekaman + mic, 4 skor (Clarity, Accuracy, Fluency, Complete), panel coach (fonem, cara ucap, minimal pairs) |
| 03 | AI Roleplay | header skenario + timer, partner AI, chat dengan koreksi inline (prompt), hint chip, composer suara, panel misi + frasa + statistik |
| 04 | Session Result | ring Clarity, reward, 4 skor, review jawaban (Yours / Model / Retry), simpan ke Mistake Bank, skenario berikutnya, tren, estimasi CEFR, badge |
| 05 | Onboarding · Set your goal | tujuan (multi), level A1–C1, target menit harian, info streak freeze |
| 06 | Onboarding · Mic check | izin mic (pre-permission), tes suara + level meter, kapan dikoreksi, toggle simpan rekaman |
| 06b | State · Mic blocked | cara membuka blokir, opsi latihan dengan mengetik |

**Belum didesain:** halaman Mistake Bank penuh, Shadowing, Speaking Test, Lessons, Progress, Leaderboard, Settings/privasi, pricing, state lain (no mic, terlalu bising, terlalu pelan, koneksi putus), versi mobile, ilustrasi final (saat ini placeholder emoji/bentuk).

## 7. State mikrofon (wajib ada di setiap layar latihan)
idle → meminta izin → siap → merekam (merah, tombol pause/stop, waveform) → memproses → hasil · error: diblokir / tidak ada mic / terlalu bising / terlalu pelan / koneksi putus.

## 8. Suara copy
Hangat, singkat, menyemangati, tidak menghakimi. Contoh: "Almost! Can you fix 2 small things?", "We heard you clearly!", "Missing a day won't reset your progress."
