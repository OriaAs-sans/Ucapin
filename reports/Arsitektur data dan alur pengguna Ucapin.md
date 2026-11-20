# Arsitektur data dan alur pengguna Ucapin

Dokumen ini merangkum hasil riset struktur data yang dibutuhkan agar Ucapin dapat diuji secara penuh dari awal (Login atau Daftar Akun Baru) hingga akhir (Onboarding Tujuan, Cek Mikrofon, Latihan Ucapan, Roleplay Berskrip, Hasil Sesi, Bank Kesalahan, dan pembaruan progres di Beranda) di atas PostgreSQL Laragon (`127.0.0.1:5432`).

## 1. Alur pengujian end-to-end (dua jalur pengguna)

Untuk memvalidasi pengalaman pengguna pertama kali (*first-run onboarding*) sekaligus pengalaman pengguna harian (*habit loop*), database menyediakan dua profil pengujian utama ditambah fitur pendaftaran akun baru:

| Profil | Email & Sandi | Kondisi Awal di Database | Alur yang Diuji |
|---|---|---|---|
| **Pelajar Baru (Budi Santoso, A2)** | `baru@ucapin.id` / `ucapin123` | `onboardingCompleted: false`, `spokenTodayMinutes: 0`, `streakDays: 0`, `MistakeItem: 0` | `/masuk` -> `/mulai` (pilih tujuan & target menit) -> `/cek-mikrofon` (izin mic & UU PDP) -> `/latihan-ucapan` (kalimat sesuai tujuan) -> `/hasil` (sesi pertama tercatat) -> `/bank-kesalahan` (kata pertama masuk) -> `/` (Beranda terisi) |
| **Pelajar Aktif (Alya Putri, B1)** | `alya@ucapin.id` / `ucapin123` | `onboardingCompleted: true`, `spokenTodayMinutes: 9/15`, `streakDays: 12`, `MistakeItem: 5 kata` | `/masuk` -> `/` (Beranda) -> `/roleplay` atau `/latihan-ucapan?source=bank` -> `/hasil` -> `/bank-kesalahan` |

## 2. Pemetaan tujuan belajar ke kurikulum (`goalTag`)

Pilihan tujuan belajar pengguna pada langkah `/mulai` (`kerja`, `jalan`, `ielts`, `harian`) disimpan di kolom `User.goals` dan `User.activeScenarioSlug`, lalu dipakai secara langsung untuk memfilter kalimat `DrillSentence` serta skenario `Scenario`:

| Kode Tujuan (`goalTag`) | Kategori Kurikulum | Skenario Roleplay Aktif | Fokus Fonem Khas Indonesia |
|---|---|---|---|
| `kerja` | Wawancara & karier | `wawancara-startup` (bersama Rina, HR Lead · B1) | Akhiran `-ed` (*worked, solved*), `/θ/` (*think, monthly*), `/v/` (*available, version*) |
| `jalan` | Bandara, hotel, arah kota | `checkin-hotel-singapura` (bersama Liam, Resepsionis · A2) | `/ʃ/` (*shuttle, station*), `-d` akhir (*card*), `/θ/` & `/ð/` (*through, third, there*) |
| `ielts` | IELTS Speaking Part 1-3 | `simulasi-ielts-part1` (bersama Dr. Claire, Penguji · B1/B2) | `/θ/` (*both, methods, thinking*), `-vd` akhir (*lived, moved*), `/v/` (*several, invest*) |
| `harian` | Obrolan ringan & kafe | `memesan-di-kafe` (bersama Sam, Barista · A2) | `/v/` (*very, visit*), `/ð/` (*this, they*), `/θ/` (*thank*), `/ʃ/` (*shop*), `-ed` (*closed*) |

## 3. Katalog panduan artikulasi fonem (`PhonemeGuide`)

Berdasarkan literatur kesalahan fonologis penutur bahasa Indonesia (substitusi frikatif labiodental, frikatif dental, postalveolar, serta penghilangan konsonan akhir), tabel `PhonemeGuide` menyimpan 5 panduan artikulasi terstruktur beserta pasangan minimal (*minimal pairs*):

1. **`/v/ -> /f/`**: Sentuhkan gigi atas ke bibir bawah dan nyalakan getaran pita suara (*very/fairy, van/fan, vest/fest, save/safe*).
2. **`/θ/ -> /t/`**: Letakkan ujung lidah ringan di antara gigi atas dan bawah lalu hembuskan udara tanpa suara (*think/tink, thank/tank, three/tree, both/boat*).
3. **`/ð/ -> /d/`**: Sentuhkan ujung lidah ke tepi gigi atas sambil menggetarkan pita suara (*this/dis, they/day, then/den, breathe/breed*).
4. **`/ʃ/ -> /s/`**: Tarik ujung lidah sedikit ke belakang langit-langit depan dan bulatkan bibir sedikit (*shop/sop, she/see, wash/was, shuttle/subtle*).
5. **`Konsonan akhir (-ed, -d, -t)`**: Tutup kata dengan sentuhan lidah ke langit-langit depan agar penanda bentuk lampau (*past tense*) dan arti kata tidak berubah (*worked/work, closed/close, card/car, lived/live*).

## 4. Transisi data saat sesi selesai (`POST /api/v1/sessions`)

Setiap kali pelajar menuntaskan Latihan Ucapan atau menyelesaikan ketiga misi di Roleplay:
1. **Pencatatan Sesi (`SpeakingSession` & `Utterance`):** Menyimpan skor kejelasan, pengucapan, kelancaran, tata bahasa, kosakata, durasi detik, dan daftar kalimat yang diucapkan.
2. **Penutupan Loop Bank Kesalahan (`MistakeItem`):** Kata-kata yang mendapat status `work` atau `almost` di-upsert ke tabel `MistakeItem` milik pengguna aktif dan dijadwalkan untuk latihan ulang (`hari ini`).
3. **Pembaruan Habit & Usaha (`User`, `DailyActivity`, `LeagueEntry`):** Menambah `spokenTodayMinutes` dan `totalSpokenMinutes`, menaikkan `streakDays` jika baru pertama kali bicara hari itu, menambah batang menit hari ini (`isToday: true`) pada grafik mingguan, serta memperbarui menit bicara di Liga Mingguan.
