# Graph Report - Ucapin  (2026-11-21)

## Corpus Check
- 118 files · ~73,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 897 nodes · 1717 edges · 105 communities (55 shown, 50 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI shell & shared components
- Riset strategi produk
- API speech & Beranda
- Seed materi latihan
- Logika bab (chapters)
- Prinsip produk PRODUCT.md
- Shadowing
- Prototipe app.js
- Ikon prototipe
- Roleplay & peta bab
- Konfigurasi TypeScript
- Konfigurasi shadcn
- Script npm
- Tes E2E & env
- Dev dependencies
- Dependencies runtime
- Migrasi awal skema
- Riset kompetitor
- Riset ELSA & Speak
- Onboarding & cek mikrofon
- API Beranda & Bank Kesalahan
- Layar prototipe Bank Kesalahan
- Riset stack AI suara
- Login
- Riset roleplay & privasi
- Registrasi & sesi
- Siklus Bank Kesalahan
- Riset UX & gamifikasi
- Arsitektur & deploy
- Komponen desain
- Aturan antislop & rules
- package.json
- Riset Speak & ulang berjarak
- Seed Prisma
- Simpan sesi & review
- Stack & alur rekam
- Migrasi SpeechAttempt & bab
- Latihan Ucapan
- Pengulangan berjarak
- Deploy Vercel
- Bab, statistik & kuota
- Hash sandi
- Hak data akun
- Reset & akun testing
- Hasil Sesi
- Konfigurasi ESLint
- Riset metrik pelafalan
- Riset umpan balik korektif
- Privasi & keamanan
- Header keamanan
- Tailwind
- Prototipe panel profil
- Prototipe form tujuan
- Root layout
- Halaman privasi
- CLAUDE.md (Ucapin)
- postcss.config.mjs
- 20261121150000_activity_from_sessions/mi
- Ulas jawabanmu (3 giliran, versi lebih n
- session-result/route.ts
- @radix-ui/react-separator@^1.1.2
- @radix-ui/react-slot@^1.1.2
- @radix-ui/react-tabs@^1.1.3
- react-dom@^19.0.0
- tailwind-merge@^3.0.2
- Pilihan waktu koreksi (setiap selesai bi
- Alur izin mikrofon setelah penjelasan (#
- Stepper Langkah 4 dari 4
- Kartu lanjutkan roleplay (Memesan di kaf
- Perekam mic tap-to-talk + level (#mic, #
- assets/fonts/bricolage-grotesque-latin.w
- Opt-in simpan rekaman (switch, default m
- Tombol 'Mulai latihan pertama' (aria-dis
- Lencana baru (Jagoan Kafe, 13 Hari, 10 O
- Cek percaya diri 1-5 (#confidence-out)
- Perkiraan level A2+ menuju B1
- Hero ring Kejelasan 84 + stiker '3 misi 
- Tren kejelasan 7 sesi (62 ke 84)
- Topbar sapaan 'Halo, Alya!'
- Kartu mode latihan (Latihan Ucapan, Role
- Label data contoh prototype (proto-note)
- Skip link 'Langsung ke konten' (#main)
- Theme toggle (data-theme-toggle, ucapin-
- Header latihan + progres 'Kalimat 4 dari
- Alert error mikrofon + simulasi tanpa mi
- Kartu kalimat (Dengar, Pelan 0,7x, IPA, 
- Tombol Lewati / Kalimat berikutnya
- Ilustrasi SVG cangkir kopi
- Alert error mic (#rp-error) dan selesai 
- Petunjuk jawaban (#hints)
- Frasa berguna (to go, for here, Can I pa
- Header skenario kafe + timer + Akhiri
- Statistik sesi (46 kata, 1:48, 2 koreksi
- CEFR Companion Volume 2020 (intelligibil
- Fluency metrics (speech rate r=0.76, mea
- Leaderboard motivation risk (Hanus & Fox
- WCAG 1.4.1 Use of Color
- AssemblyAI Universal STT

## God Nodes (most connected - your core abstractions)
1. `cn()` - 54 edges
2. `next` - 48 edges
3. `react` - 33 edges
4. `Button` - 31 edges
5. `getActiveUser()` - 24 edges
6. `lucide-react` - 23 edges
7. `assets/icons.svg` - 18 edges
8. `scripts` - 18 edges
9. `compilerOptions` - 16 edges
10. `UserProfileDTO` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Pemetaan goalTag ke kurikulum dan skenario` --shares_data_with--> `Rute layar Next.js dan prototipe`  [INFERRED]
  reports/Arsitektur data dan alur pengguna Ucapin.md → design.md
- `Transisi data saat sesi selesai (POST /api/v1/sessions)` --shares_data_with--> `Closed Loop Bank Kesalahan`  [INFERRED]
  reports/Arsitektur data dan alur pengguna Ucapin.md → architecture.md
- `main()` --calls--> `seedUcapinDatabase()`  [EXTRACTED]
  prisma/seed.ts → src/server/seed-data.ts
- `MicRecorder` --shares_data_with--> `ElevenLabs Scribe STT and TTS`  [INFERRED]
  design.md → architecture.md
- `PhoneticSpecimenCard` --references--> `Struktur Folder Baku`  [INFERRED]
  design.md → architecture.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MVP Turn-Based Speaking Pipeline (capture, STT, tutor LLM, TTS, pronunciation assessment)** — research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_browser_audio_capture, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_openai_transcribe, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_claude_tutor_llm, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_neural_tts, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_pronunciation_assessment [EXTRACTED 1.00]
- **Komponen shared domain Ucapin** — design_phonetic_specimen_card, design_proofreading_sentence, design_phonetic_word_row, design_audio_tts_button, design_mic_recorder, design_score_metric_card, design_clarity_ring [EXTRACTED 1.00]
- **Dokumen sumber kebenaran proyek** — rules, design, architecture [EXTRACTED 1.00]
- **Error-to-Practice Feedback Loop** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_prompt_retry_feedback_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_retry_flow, research_notes_konsep_website_speaking_bahasa_inggris_competitors_mistake_driven_drill_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_pronunciation_feedback_display [INFERRED 0.75]
- **Low-Anxiety Speaking Design** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_anxiety_reduction_levers, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_graded_exposure_path, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_learner_feedback_settings, research_notes_konsep_website_speaking_bahasa_inggris_competitors_duolingo_video_call, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_privacy_by_default_audio [INFERRED 0.75]
- **Komponen tangkap suara mikrofon** — prototype_latihan_ucapan_mic_recorder, prototype_roleplay_composer, prototype_cek_mikrofon_sound_test, prototype_cek_mikrofon_mic_permission_flow, prototype_assets_app [INFERRED 0.75]
- **Mistake Bank closed loop** — product_mistake_bank, product_principle_close_the_loop, product_indonesian_sound_errors [INFERRED 0.85]
- **Siklus bicara -> feedback -> Bank Kesalahan -> latihan** — prototype_index_bank_kesalahan_card [INFERRED 0.85]
- **Alur onboarding: tujuan -> cek mikrofon -> latihan pertama** — prototype_mulai_onboarding_goal_form, prototype_cek_mikrofon_mic_permission_flow [INFERRED 0.85]
- **Pipeline penilaian ucapan** — architecture_mic_recorder_flow, architecture_elevenlabs_scribe, architecture_speech_assessor, architecture_scoring_model, architecture_mistake_bank_loop [EXTRACTED 0.90]
- **Progres terverifikasi server dari SpeechAttempt** — architecture_speech_attempt, architecture_activity_stats, architecture_verify_chapter_completion, architecture_weekly_league [EXTRACTED 0.90]
- **Kepatuhan UU PDP** — architecture_privacy_uu_pdp, architecture_account_data_rights, architecture_privacy_page, architecture_security_headers [INFERRED 0.75]

## Communities (105 total, 50 thin omitted)

### Community 0 - "UI shell & shared components"
Cohesion: 0.06
Nodes (83): lucide-react, react, AppShell(), AppShellProps, mainNavItems, SidebarNav(), ThemeToggle(), ThemeToggleProps (+75 more)

### Community 1 - "Riset strategi produk"
Cohesion: 0.07
Nodes (32): Four modes as anxiety ladder (Shadowing, Drill, AI Roleplay, Speaking Test), ASR pronunciation meta-analysis (ReCALL 2024, g = 0.69), Azure Pronunciation Assessment (report), Cakap, Chatbots reduce speaking anxiety (systematic review) vs Replika counter-evidence, Three competitor archetypes (scored drill, task roleplay, open call), Cost US$2.5-3.7 per active user per month, Daily 5-10 minute loop and user flow (+24 more)

### Community 2 - "API speech & Beranda"
Cohesion: 0.12
Nodes (27): dynamic, POST(), dynamic, GET(), dynamic, HomePage(), ActivityStats, checkSpeechQuota() (+19 more)

### Community 3 - "Seed materi latihan"
Cohesion: 0.06
Nodes (31): CorrectionSeed, DRILL_SENTENCES, DrillSeed, HARIAN_SEEDS, IELTS_SEEDS, JALAN_SEEDS, KERJA_SEEDS, Mark (+23 more)

### Community 4 - "Logika bab (chapters)"
Cohesion: 0.14
Nodes (26): buildChapterPaths(), ChapterInput, ChapterKind, ChapterStatus, chapterStatusFor(), ChapterSummary, drillChapterKey(), GOAL_LABELS (+18 more)

### Community 5 - "Prinsip produk PRODUCT.md"
Cohesion: 0.10
Nodes (14): User-supplied teal-beige palette, Voice: warm, short, encouraging, never judging, Daily short session flow, Indonesian learners A2-B1, Indonesian speaker sound errors (/v/ /θ/ /ð/ /ʃ/, final consonants), MVP: Azure pronunciation assessment, scripted roleplay, no LLM, Production target: Next.js App Router + TypeScript, Open: product name, pricing, database, hosting (+6 more)

### Community 6 - "Shadowing"
Cohesion: 0.11
Nodes (23): dynamic, metadata, ShadowingPage(), compareTempo(), ShadowingWorkspace(), ShadowResult, AlignedPair, alignWords() (+15 more)

### Community 7 - "Prototipe app.js"
Cohesion: 0.14
Nodes (16): drawBars(), initDrill(), finishRecording(), render(), setState(), showResult(), initMicCheck(), begin() (+8 more)

### Community 8 - "Ikon prototipe"
Cohesion: 0.10
Nodes (22): assets/icons.svg, Icon: again, Icon: back, Icon: book, Icon: chat, Icon: check, Icon: clock, Icon: cross (+14 more)

### Community 9 - "Roleplay & peta bab"
Cohesion: 0.19
Nodes (13): next, dynamic, metadata, RoleplayPage(), ChapterMap(), ChapterMapProps, DrillChapterMap(), RoleplayChapterMap() (+5 more)

### Community 10 - "Konfigurasi TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Konfigurasi shadcn"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 12 - "Script npm"
Cohesion: 0.11
Nodes (18): scripts, build, db:generate, db:migrate, db:migrate:dev, db:push, db:reset, db:seed (+10 more)

### Community 13 - "Tes E2E & env"
Cohesion: 0.20
Nodes (8): env, FAKE_MIC_META, FAKE_MIC_WAV, FIXTURE_DIR, readLocalEnv(), env, @playwright/test@^1.65.1, @playwright/test

### Community 14 - "Dev dependencies"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer@^10.4.21, eslint@^9.39.5, eslint-config-next@15.5.29, prisma@^6.5.0, @types/node@^22.13.10, @types/react@^19.0.10, @types/react-dom@^19.0.4 (+9 more)

### Community 15 - "Dependencies runtime"
Cohesion: 0.12
Nodes (16): dependencies, clsx@^2.1.1, lucide-react@^0.487.0, motion@^14.14.0, next@^15.2.4, @radix-ui/react-progress@^1.1.2, @radix-ui/react-radio-group@^1.2.3, @radix-ui/react-switch@^1.1.3 (+8 more)

### Community 16 - "Migrasi awal skema"
Cohesion: 0.21
Nodes (15): "DailyActivity", "DrillSentence", "LeagueEntry", "MistakeItem", MistakeItem_userId_word_key, "PhonemeGuide", PhonemeGuide_phoneme_key, "PhonemeScore" (+7 more)

### Community 17 - "Riset kompetitor"
Cohesion: 0.14
Nodes (12): Competitor English-Speaking-Practice Products Research, Cakap, Cambly, Freemium Daily-Minute Caps, Gliglish, LanguaTalk Reviews, Loora, Praktika (+4 more)

### Community 18 - "Riset ELSA & Speak"
Cohesion: 0.15
Nodes (11): ELSA AI Four-Part Roleplay Report (Overall/Pronunciation/Vocabulary/Grammar), ELSA Speak, ELSA Speech Analyzer, Speak 'Made for You' mistake-based lessons, Tech Stack for English Speaking-Practice Website, Azure AI Speech Pronunciation Assessment, ELSA Developer API (unclear availability), Speechace (+3 more)

### Community 19 - "Onboarding & cek mikrofon"
Cohesion: 0.19
Nodes (12): dynamic, GET(), PATCH(), CekMikrofonPage(), dynamic, metadata, dynamic, metadata (+4 more)

### Community 20 - "API Beranda & Bank Kesalahan"
Cohesion: 0.20
Nodes (11): GET(), GET(), POST(), text(), VALID_STATUS, BankKesalahanPage(), dynamic, metadata (+3 more)

### Community 21 - "Layar prototipe Bank Kesalahan"
Cohesion: 0.15
Nodes (13): Kartu '3 kata masuk Bank Kesalahan' + CTA coral, 4 kartu skor (Pengucapan, Kelancaran, Tata bahasa, Kosakata), Tampilan kosong Bank Kesalahan (#bank-empty, ?kosong=1), Kartu Bank Kesalahan (#bank), Daftar Bank Kesalahan (very v->f, think th->t, worked -ed), Sidebar navigasi utama (Beranda, Latihan Ucapan, Roleplay, Bank Kesalahan, Segera hadir), Panel catatan pelatih (tersembunyi sampai dibuka), Pasangan minimal very/fairy, van/fan, vest/fest (+5 more)

### Community 22 - "Riset stack AI suara"
Cohesion: 0.17
Nodes (12): Azure Neural TTS (model pronunciation), Cascaded STT-LLM-TTS Pipeline, Claude Haiku/Sonnet as Tutor LLM, Deepgram (Nova-3, Flux, Aura-2, Voice Agent), ElevenLabs (Agents, TTS, Scribe), Gemini Live, LiveKit Agents / Pipecat, MVP Reference Architecture (Next.js + Azure Speech + Cascade + Postgres) (+4 more)

### Community 23 - "Login"
Cohesion: 0.27
Nodes (11): POST(), dynamic, MasukPage(), metadata, LoginWorkspace(), authenticateUser(), getAllTestingUsers(), getUserById() (+3 more)

### Community 24 - "Riset roleplay & privasi"
Cohesion: 0.17
Nodes (6): Duolingo Video Call (Lily), GR 33/2026 PDP Implementing Regulation, Indonesian UU PDP (Law 27/2022), AI Chatbot Speaking Practice Evidence, Foreign Language Speaking Anxiety (FLSA) Reduction, Polizzi et al. Critical Review (incl. Replika anxiety increase)

### Community 25 - "Registrasi & sesi"
Cohesion: 0.29
Nodes (9): POST(), AuthError, registerNewUser(), createSessionToken(), getSessionSecret(), readSessionToken(), SESSION_MAX_AGE_SECONDS, setSessionCookie() (+1 more)

### Community 26 - "Siklus Bank Kesalahan"
Cohesion: 0.22
Nodes (11): Closed Loop Bank Kesalahan, Skor Kejelasan, Ketepatan kata, Kelancaran, Kelengkapan, Pengulangan berjarak 1, 3, 7, 14 hari, speech-assessor (assessSpokenUtterance), Bank Kesalahan (pembeda produk), ScoreMetricCard, Arsitektur data dan alur pengguna Ucapin, Pemetaan goalTag ke kurikulum dan skenario (+3 more)

### Community 27 - "Riset UX & gamifikasi"
Cohesion: 0.25
Nodes (9): Browser Audio Capture (getUserMedia, MediaRecorder, AnalyserNode, AudioWorklet), UX, Speaking Pedagogy and Gamification Research, Duolingo Streak Design (freezes, daily goal separation), Hanus & Fox (2015) Gamification Undermines Motivation, Mekler et al. (2017) Points/Levels/Leaderboards, In-Context Mic Permission Onboarding, Ngo, Chen & Lai (2024) ASR Pronunciation Meta-analysis (ReCALL), Recording States and Error States (+1 more)

### Community 28 - "Arsitektur & deploy"
Cohesion: 0.27
Nodes (10): Architecture - Ucapin, Autentikasi: scrypt + cookie sesi HMAC, Deploy Supabase + Vercel, Tahapan produk (MVP, v1.5, v2), seedContent vs seedTestAccounts, Akun testing dari env (dev only), MicRecorder, Rute layar Next.js dan prototipe (+2 more)

### Community 29 - "Komponen desain"
Cohesion: 0.22
Nodes (8): Design - Ucapin, AudioTtsButton, ClarityRing, Motion dial 2 (mk-reveal, leader-draw), PhoneticWordRow, ProofreadingSentence, Status Jelas/Hampir/Ulang (garis bawah + warna + ikon), Token warna dan tipografi (teal-beige + coral)

### Community 30 - "Aturan antislop & rules"
Cohesion: 0.20
Nodes (5): Editorial Phonetic Notebook (gaya visual), PhoneticSpecimenCard, Rules Ucapin, Skill desain tersedia (impeccable, taste-skill), Model routing scout/verifier/implementer

### Community 31 - "package.json"
Cohesion: 0.20
Nodes (9): class-variance-authority@^0.7.1, postcss@^8.5.3, tsx@^4.19.3, name, private, version, class-variance-authority, postcss (+1 more)

### Community 32 - "Riset Speak & ulang berjarak"
Cohesion: 0.20
Nodes (6): Speak (speak.com), Speak Smart Review (spaced repetition drills), Web Speech API (SpeechRecognition), Spaced Productive Retrieval of Formulaic Sequences, Push-to-Talk vs Voice Activity Detection, Task Repetition

### Community 33 - "Seed Prisma"
Cohesion: 0.28
Nodes (7): @prisma/client@^6.5.0, prisma, main(), prisma, @prisma/client, seedContent(), seedUcapinDatabase()

### Community 34 - "Simpan sesi & review"
Cohesion: 0.28
Nodes (7): POST(), VALID_STATUS, POST(), PhoneticWordRowProps, completeSpeakingSession(), recordBankPractice(), PhonemeStatus

### Community 35 - "Stack & alur rekam"
Cohesion: 0.39
Nodes (7): API Route Handlers /api/v1, ElevenLabs Scribe STT and TTS, Struktur Folder Baku, Alur rekam MicRecorder ke transkripsi, middleware.ts (gerbang sesi), Stack Next.js + shadcn/ui + Prisma + Laragon PostgreSQL, ucapin-repository (Prisma data layer)

### Community 36 - "Migrasi SpeechAttempt & bab"
Cohesion: 0.32
Nodes (5): "SpeechAttempt", SpeechAttempt_userId_createdAt_idx, "TtsCache", "ChapterProgress", ChapterProgress_userId_chapterKey_key

### Community 37 - "Latihan Ucapan"
Cohesion: 0.39
Nodes (7): dynamic, LatihanUcapanPage(), metadata, DrillWorkspace(), getArticulationGuideForWord(), getDrillChapterMap(), getDrillSentences()

### Community 38 - "Pengulangan berjarak"
Cohesion: 0.25
Nodes (7): advanceAfterSuccess(), isDue(), MASTERY_STAGE, resetAfterMistake(), REVIEW_INTERVAL_DAYS, ReviewState, scheduleLabelFor()

### Community 39 - "Deploy Vercel"
Cohesion: 0.25
Nodes (7): buildCommand, functions, src/app/api/v1/speech/transcribe/route.ts, installCommand, regions, $schema, maxDuration

### Community 40 - "Bab, statistik & kuota"
Cohesion: 0.29
Nodes (7): Statistik dari data bertanggal (src/server/activity.ts), ChapterProgress, Bab (chapters) Latihan Ucapan dan Roleplay, Kuota dan TtsCache, SpeechAttempt, verifyChapterCompletion, Liga mingguan opt-in

### Community 41 - "Hash sandi"
Cohesion: 0.48
Nodes (5): burnPasswordCheck(), deriveKey(), hashPassword(), MIN_PASSWORD_LENGTH, verifyPassword()

### Community 42 - "Hak data akun"
Cohesion: 0.38
Nodes (6): DELETE(), dynamic, GET(), deleteActiveUser(), exportActiveUserData(), SESSION_COOKIE_NAME

### Community 43 - "Reset & akun testing"
Cohesion: 0.38
Nodes (5): POST(), seedTestAccounts(), ALL_TEST_ACCOUNT_IDS, readTestAccountCredentials(), TEST_ACCOUNT_IDS

### Community 44 - "Hasil Sesi"
Cohesion: 0.38
Nodes (6): dynamic, HasilSesiPage(), metadata, SessionResultWorkspace(), getLatestSessionResult(), mapMistake()

### Community 45 - "Konfigurasi ESLint"
Cohesion: 0.33
Nodes (3): compat, @eslint/eslintrc@^3.3.7, @eslint/eslintrc

### Community 46 - "Riset metrik pelafalan"
Cohesion: 0.33
Nodes (3): Indonesian Learner Pronunciation Errors (/v/,/θ/,/ð/,/ʃ/, final consonants), SpeakShark, Fluency Metrics (speech rate, mean length of run, pause frequency)

### Community 47 - "Riset umpan balik korektif"
Cohesion: 0.33
Nodes (4): Ammar & Spada (2006) Recasts vs Prompts, Brown (2016) Teacher CF Meta-analysis, Corrective Feedback: Prompts over Recasts, Lyster & Saito (2010) CF Meta-analysis

### Community 48 - "Privasi & keamanan"
Cohesion: 0.40
Nodes (4): Hak data akun GET/DELETE /api/v1/account, Halaman /privasi (draf kebijakan privasi), Privasi UU PDP 27/2022 (saveAudioOptIn), Header keamanan next.config.ts

### Community 49 - "Header keamanan"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 50 - "Tailwind"
Cohesion: 0.50
Nodes (3): tailwindcss@^3.4.17, tailwindcss, config

### Community 51 - "Prototipe panel profil"
Cohesion: 0.50
Nodes (4): Liga mingguan berdasarkan menit bicara, Panel profil (Alya Putri, Level B1), Stat streak/menit/kejelasan, Grafik bicara minggu ini

### Community 52 - "Prototipe form tujuan"
Cohesion: 0.50
Nodes (4): Target bicara per hari (5/10/15/20 menit, 2 jatah libur), Pilihan tujuan (kerja, jalan-jalan, IELTS, harian) + validasi #goal-error, Pilihan level A1-C1, Form tujuan onboarding (#goal-form)

### Community 54 - "Halaman privasi"
Cohesion: 0.67
Nodes (3): metadata, Placeholder(), PrivasiPage()

### Community 58 - "Ulas jawabanmu (3 giliran, versi lebih n"
Cohesion: 0.67
Nodes (3): Ulas jawabanmu (3 giliran, versi lebih natural), Kartu chat dialog berskrip dengan Sam (Putar/Pelan/Arti), Koreksi inline 'Hampir! Ada 2 hal kecil' (a->an, ice->iced)

## Knowledge Gaps
- **125 isolated node(s):** `AudioTtsButton`, `ClarityRing`, `PhoneticWordRow`, `ScoreMetricCard`, `Token warna dan tipografi (teal-beige + coral)` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 353 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Roleplay & peta bab` to `UI shell & shared components`, `API speech & Beranda`, `Logika bab (chapters)`, `Shadowing`, `Dependencies runtime`, `Onboarding & cek mikrofon`, `API Beranda & Bank Kesalahan`, `Login`, `Registrasi & sesi`, `package.json`, `Simpan sesi & review`, `Latihan Ucapan`, `Hak data akun`, `Reset & akun testing`, `Hasil Sesi`, `Header keamanan`, `Root layout`, `Halaman privasi`, `logout/route.ts`, `session-result/route.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `AudioTtsButton`, `ClarityRing`, `PhoneticWordRow` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI shell & shared components` be split into smaller, more focused modules?**
  _Cohesion score 0.06475445458496305 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `Seed Prisma` to `API speech & Beranda`, `Seed materi latihan`, `Tes E2E & env`, `package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Should `Riset strategi produk` be split into smaller, more focused modules?**
  _Cohesion score 0.06507936507936508 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `Script npm` to `package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `API speech & Beranda` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._