# Graph Report - Ucapin  (2026-11-21)

## Corpus Check
- 87 files · ~55,645 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 19 file(s) not represented in the graph (top: .woff2 12, .css 3, .example 1)

## Summary
- 659 nodes · 1263 edges · 76 communities (35 shown, 41 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 64 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Komponen UI & Workspace
- Repository, Auth & Sesi
- Laporan Konsep Produk
- Dokumen Aturan & Arsitektur
- Positioning Produk
- Logika Prototipe app.js
- Ikon & Panel Prototipe
- Dev Dependencies
- Konfigurasi TypeScript
- Konfigurasi shadcn
- Dependencies Runtime
- Skema Migrasi Awal
- Riset Kompetitor & Biaya
- Penilai Ucapan
- Riset Penilaian Pengucapan
- Routing Next & Middleware
- Script npm & Database
- Prototipe Bank Kesalahan
- Riset Pipeline Suara
- Riset Kecemasan Bicara
- Riset UX & Gamifikasi
- Dashboard & Bank Kesalahan API
- Riset Speak & Kelonggaran ASR
- Profil Onboarding
- Halaman Tujuan Belajar
- Kesalahan Ucap Penutur Indonesia
- Prompt vs Recast
- Halaman Hasil Sesi
- Halaman Latihan Ucapan
- Halaman Roleplay
- CVA & Radix Switch
- Konfigurasi Tailwind
- Panel Profil & Liga
- Form Onboarding Prototipe
- CLAUDE.md Project
- Konfigurasi PostCSS
- Prototipe Ulasan Roleplay
- Komunitas 37
- Komunitas 38
- Komunitas 39
- Komunitas 40
- Komunitas 41
- Komunitas 42
- Komunitas 43
- Komunitas 44
- Komunitas 46
- Komunitas 47
- Komunitas 48
- Komunitas 49
- Komunitas 50
- Komunitas 51
- Komunitas 52
- Komunitas 53
- Komunitas 54
- Komunitas 55
- Komunitas 56
- Komunitas 57
- Komunitas 58
- Komunitas 59
- Komunitas 60
- Komunitas 61
- Komunitas 62
- Komunitas 63
- Komunitas 64
- Komunitas 65
- Komunitas 66
- Komunitas 67
- Komunitas 68
- Komunitas 70
- Komunitas 71
- Komunitas 72
- Komunitas 73
- Komunitas 74

## God Nodes (most connected - your core abstractions)
1. `cn()` - 52 edges
2. `next` - 34 edges
3. `react` - 28 edges
4. `Button` - 24 edges
5. `Badge()` - 20 edges
6. `assets/icons.svg` - 18 edges
7. `Card` - 17 edges
8. `lucide-react` - 17 edges
9. `AudioTtsButton()` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Tahapan produk MVP, v1.5, v2` --references--> `Azure AI Speech Pronunciation Assessment`  [EXTRACTED]
  architecture.md → research_notes/Konsep website speaking bahasa Inggris/tech_stack.md
- `main()` --calls--> `seedUcapinDatabase()`  [EXTRACTED]
  prisma/seed.ts → src/server/seed-data.ts
- `assets/icons.svg` --references--> `Icon: again`  [EXTRACTED]
  prototype/index.html → prototype/assets/icons.svg
- `assets/icons.svg` --references--> `Icon: back`  [EXTRACTED]
  prototype/index.html → prototype/assets/icons.svg
- `assets/icons.svg` --references--> `Icon: book`  [EXTRACTED]
  prototype/index.html → prototype/assets/icons.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MVP Turn-Based Speaking Pipeline (capture, STT, tutor LLM, TTS, pronunciation assessment)** — research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_browser_audio_capture, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_openai_transcribe, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_claude_tutor_llm, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_neural_tts, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_pronunciation_assessment [EXTRACTED 1.00]
- **Error-to-Practice Feedback Loop** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_prompt_retry_feedback_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_retry_flow, research_notes_konsep_website_speaking_bahasa_inggris_competitors_mistake_driven_drill_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_pronunciation_feedback_display [INFERRED 0.75]
- **Low-Anxiety Speaking Design** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_anxiety_reduction_levers, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_graded_exposure_path, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_learner_feedback_settings, research_notes_konsep_website_speaking_bahasa_inggris_competitors_duolingo_video_call, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_privacy_by_default_audio [INFERRED 0.75]
- **Komponen tangkap suara mikrofon** — prototype_latihan_ucapan_mic_recorder, prototype_roleplay_composer, prototype_cek_mikrofon_sound_test, prototype_cek_mikrofon_mic_permission_flow, prototype_assets_app [INFERRED 0.75]
- **Mistake Bank closed loop** — product_mistake_bank, product_principle_close_the_loop, product_indonesian_sound_errors [INFERRED 0.85]
- **Siklus bicara -> feedback -> Bank Kesalahan -> latihan** — prototype_index_bank_kesalahan_card [INFERRED 0.85]
- **Alur onboarding: tujuan -> cek mikrofon -> latihan pertama** — prototype_mulai_onboarding_goal_form, prototype_cek_mikrofon_mic_permission_flow [INFERRED 0.85]
- **Komponen domain shared reusable Ucapin** — design_phoneticspecimencard, design_proofreadingsentence, design_phoneticwordrow, design_audiottsbutton, design_micrecorder, design_scoremetriccard, design_clarityring [EXTRACTED 1.00]
- **Dokumen sumber kebenaran proyek** — rules, design, architecture [EXTRACTED 1.00]
- **Alur data API, repository, Prisma** — architecture_api_v1_routes, architecture_ucapin_repository, architecture_prisma_schema [INFERRED 0.85]

## Communities (76 total, 41 thin omitted)

### Community 0 - "Komponen UI & Workspace"
Cohesion: 0.10
Nodes (60): lucide-react, react, AppShell(), AppShellProps, mainNavItems, SidebarNav(), ThemeToggle(), ThemeToggleProps (+52 more)

### Community 1 - "Repository, Auth & Sesi"
Cohesion: 0.06
Nodes (58): @prisma/client@^6.5.0, main(), prisma, @prisma/client, POST(), POST(), POST(), POST() (+50 more)

### Community 2 - "Laporan Konsep Produk"
Cohesion: 0.07
Nodes (32): Four modes as anxiety ladder (Shadowing, Drill, AI Roleplay, Speaking Test), ASR pronunciation meta-analysis (ReCALL 2024, g = 0.69), Azure Pronunciation Assessment (report), Cakap, Chatbots reduce speaking anxiety (systematic review) vs Replika counter-evidence, Three competitor archetypes (scored drill, task roleplay, open call), Cost US$2.5-3.7 per active user per month, Daily 5-10 minute loop and user flow (+24 more)

### Community 3 - "Dokumen Aturan & Arsitektur"
Cohesion: 0.09
Nodes (26): Architecture Ucapin, API Route Handlers /api/v1, Autentikasi, sesi HMAC, kredensial dari env, Struktur folder baku, middleware.ts (guard sesi), Prisma schema (User, MistakeItem, Scenario, etc.), Tahapan produk MVP, v1.5, v2, Stack Next.js 15 + shadcn/ui + Prisma + Laragon PostgreSQL (+18 more)

### Community 4 - "Positioning Produk"
Cohesion: 0.10
Nodes (14): User-supplied teal-beige palette, Voice: warm, short, encouraging, never judging, Daily short session flow, Indonesian learners A2-B1, Indonesian speaker sound errors (/v/ /θ/ /ð/ /ʃ/, final consonants), MVP: Azure pronunciation assessment, scripted roleplay, no LLM, Production target: Next.js App Router + TypeScript, Open: product name, pricing, database, hosting (+6 more)

### Community 5 - "Logika Prototipe app.js"
Cohesion: 0.14
Nodes (16): drawBars(), initDrill(), finishRecording(), render(), setState(), showResult(), initMicCheck(), begin() (+8 more)

### Community 6 - "Ikon & Panel Prototipe"
Cohesion: 0.10
Nodes (22): assets/icons.svg, Icon: again, Icon: back, Icon: book, Icon: chat, Icon: check, Icon: clock, Icon: cross (+14 more)

### Community 7 - "Dev Dependencies"
Cohesion: 0.13
Nodes (20): devDependencies, autoprefixer@^10.4.21, postcss@^8.5.3, prisma@^6.5.0, tsx@^4.19.3, @types/node@^22.13.10, @types/react@^19.0.10, @types/react-dom@^19.0.4 (+12 more)

### Community 8 - "Konfigurasi TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Konfigurasi shadcn"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 10 - "Dependencies Runtime"
Cohesion: 0.11
Nodes (18): dependencies, clsx@^2.1.1, lucide-react@^0.487.0, next@^15.2.4, @radix-ui/react-progress@^1.1.2, @radix-ui/react-separator@^1.1.2, @radix-ui/react-slot@^1.1.2, @radix-ui/react-tabs@^1.1.3 (+10 more)

### Community 11 - "Skema Migrasi Awal"
Cohesion: 0.21
Nodes (15): "DailyActivity", "DrillSentence", "LeagueEntry", "MistakeItem", MistakeItem_userId_word_key, "PhonemeGuide", PhonemeGuide_phoneme_key, "PhonemeScore" (+7 more)

### Community 12 - "Riset Kompetitor & Biaya"
Cohesion: 0.14
Nodes (12): Competitor English-Speaking-Practice Products Research, Cakap, Cambly, Freemium Daily-Minute Caps, Gliglish, LanguaTalk Reviews, Loora, Praktika (+4 more)

### Community 13 - "Penilai Ucapan"
Cohesion: 0.19
Nodes (15): PhoneticWordRowProps, ProofreadingSentenceProps, assessSpokenUtterance(), cleanToken(), getArticulationGuideForWord(), INDONESIAN_L1_SUBSTITUTIONS, inferPhonemeKeyFromNote(), PHONEME_GUIDES_MAP (+7 more)

### Community 14 - "Riset Penilaian Pengucapan"
Cohesion: 0.15
Nodes (11): ELSA AI Four-Part Roleplay Report (Overall/Pronunciation/Vocabulary/Grammar), ELSA Speak, ELSA Speech Analyzer, Speak 'Made for You' mistake-based lessons, Tech Stack for English Speaking-Practice Website, Azure AI Speech Pronunciation Assessment, ELSA Developer API (unclear availability), Speechace (+3 more)

### Community 15 - "Routing Next & Middleware"
Cohesion: 0.15
Nodes (4): nextConfig, next, metadata, config

### Community 16 - "Script npm & Database"
Cohesion: 0.15
Nodes (13): scripts, build, db:generate, db:migrate, db:migrate:dev, db:push, db:reset, db:seed (+5 more)

### Community 17 - "Prototipe Bank Kesalahan"
Cohesion: 0.15
Nodes (13): Kartu '3 kata masuk Bank Kesalahan' + CTA coral, 4 kartu skor (Pengucapan, Kelancaran, Tata bahasa, Kosakata), Tampilan kosong Bank Kesalahan (#bank-empty, ?kosong=1), Kartu Bank Kesalahan (#bank), Daftar Bank Kesalahan (very v->f, think th->t, worked -ed), Sidebar navigasi utama (Beranda, Latihan Ucapan, Roleplay, Bank Kesalahan, Segera hadir), Panel catatan pelatih (tersembunyi sampai dibuka), Pasangan minimal very/fairy, van/fan, vest/fest (+5 more)

### Community 18 - "Riset Pipeline Suara"
Cohesion: 0.17
Nodes (12): Azure Neural TTS (model pronunciation), Cascaded STT-LLM-TTS Pipeline, Claude Haiku/Sonnet as Tutor LLM, Deepgram (Nova-3, Flux, Aura-2, Voice Agent), ElevenLabs (Agents, TTS, Scribe), Gemini Live, LiveKit Agents / Pipecat, MVP Reference Architecture (Next.js + Azure Speech + Cascade + Postgres) (+4 more)

### Community 19 - "Riset Kecemasan Bicara"
Cohesion: 0.17
Nodes (6): Duolingo Video Call (Lily), GR 33/2026 PDP Implementing Regulation, Indonesian UU PDP (Law 27/2022), AI Chatbot Speaking Practice Evidence, Foreign Language Speaking Anxiety (FLSA) Reduction, Polizzi et al. Critical Review (incl. Replika anxiety increase)

### Community 20 - "Riset UX & Gamifikasi"
Cohesion: 0.25
Nodes (9): Browser Audio Capture (getUserMedia, MediaRecorder, AnalyserNode, AudioWorklet), UX, Speaking Pedagogy and Gamification Research, Duolingo Streak Design (freezes, daily goal separation), Hanus & Fox (2015) Gamification Undermines Motivation, Mekler et al. (2017) Points/Levels/Leaderboards, In-Context Mic Permission Onboarding, Ngo, Chen & Lai (2024) ASR Pronunciation Meta-analysis (ReCALL), Recording States and Error States (+1 more)

### Community 21 - "Dashboard & Bank Kesalahan API"
Cohesion: 0.25
Nodes (8): GET(), GET(), POST(), BankKesalahanPage(), dynamic, metadata, getDashboardData(), recordMistakeInBank()

### Community 22 - "Riset Speak & Kelonggaran ASR"
Cohesion: 0.20
Nodes (6): Speak (speak.com), Speak Smart Review (spaced repetition drills), Web Speech API (SpeechRecognition), Spaced Productive Retrieval of Formulaic Sequences, Push-to-Talk vs Voice Activity Detection, Task Repetition

### Community 23 - "Profil Onboarding"
Cohesion: 0.29
Nodes (8): dynamic, GET(), PATCH(), CekMikrofonPage(), dynamic, metadata, getActiveUser(), updateOnboardingProfile()

### Community 24 - "Halaman Tujuan Belajar"
Cohesion: 0.28
Nodes (7): dynamic, metadata, MulaiOnboardingPage(), GOAL_OPTIONS, LEVEL_OPTIONS, MINUTE_OPTIONS, OnboardingGoalForm()

### Community 25 - "Kesalahan Ucap Penutur Indonesia"
Cohesion: 0.33
Nodes (3): Indonesian Learner Pronunciation Errors (/v/,/θ/,/ð/,/ʃ/, final consonants), SpeakShark, Fluency Metrics (speech rate, mean length of run, pause frequency)

### Community 26 - "Prompt vs Recast"
Cohesion: 0.33
Nodes (4): Ammar & Spada (2006) Recasts vs Prompts, Brown (2016) Teacher CF Meta-analysis, Corrective Feedback: Prompts over Recasts, Lyster & Saito (2010) CF Meta-analysis

### Community 27 - "Halaman Hasil Sesi"
Cohesion: 0.50
Nodes (4): dynamic, HasilSesiPage(), metadata, getLatestSessionResult()

### Community 28 - "Halaman Latihan Ucapan"
Cohesion: 0.50
Nodes (4): dynamic, LatihanUcapanPage(), metadata, getDrillSentences()

### Community 29 - "Halaman Roleplay"
Cohesion: 0.50
Nodes (4): dynamic, metadata, RoleplayPage(), getRoleplayScenario()

### Community 30 - "CVA & Radix Switch"
Cohesion: 0.33
Nodes (4): class-variance-authority@^0.7.1, @radix-ui/react-switch@^1.1.3, class-variance-authority, @radix-ui/react-switch

### Community 31 - "Konfigurasi Tailwind"
Cohesion: 0.50
Nodes (3): tailwindcss@^3.4.17, tailwindcss, config

### Community 32 - "Panel Profil & Liga"
Cohesion: 0.50
Nodes (4): Liga mingguan berdasarkan menit bicara, Panel profil (Alya Putri, Level B1), Stat streak/menit/kejelasan, Grafik bicara minggu ini

### Community 33 - "Form Onboarding Prototipe"
Cohesion: 0.50
Nodes (4): Target bicara per hari (5/10/15/20 menit, 2 jatah libur), Pilihan tujuan (kerja, jalan-jalan, IELTS, harian) + validasi #goal-error, Pilihan level A1-C1, Form tujuan onboarding (#goal-form)

### Community 36 - "Prototipe Ulasan Roleplay"
Cohesion: 0.67
Nodes (3): Ulas jawabanmu (3 giliran, versi lebih natural), Kartu chat dialog berskrip dengan Sam (Putar/Pelan/Arti), Koreksi inline 'Hampir! Ada 2 hal kecil' (a->an, ice->iced)

## Knowledge Gaps
- **118 isolated node(s):** `Icon: again`, `Icon: back`, `Icon: book`, `Icon: chat`, `Icon: check` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 256 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Routing Next & Middleware` to `Komponen UI & Workspace`, `Repository, Auth & Sesi`, `Dev Dependencies`, `Dependencies Runtime`, `Dashboard & Bank Kesalahan API`, `Profil Onboarding`, `Halaman Tujuan Belajar`, `Halaman Hasil Sesi`, `Halaman Latihan Ucapan`, `Halaman Roleplay`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `Icon: again`, `Icon: back`, `Icon: book` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Komponen UI & Workspace` be split into smaller, more focused modules?**
  _Cohesion score 0.10068399452804377 - nodes in this community are weakly interconnected._
- **Why does `Azure AI Speech Pronunciation Assessment` connect `Riset Penilaian Pengucapan` to `Kesalahan Ucap Penutur Indonesia`, `Riset Pipeline Suara`, `Dokumen Aturan & Arsitektur`, `Riset UX & Gamifikasi`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Should `Repository, Auth & Sesi` be split into smaller, more focused modules?**
  _Cohesion score 0.058596491228070174 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Komponen UI & Workspace` to `Halaman Tujuan Belajar`, `Dependencies Runtime`, `Dev Dependencies`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `Laporan Konsep Produk` be split into smaller, more focused modules?**
  _Cohesion score 0.06507936507936508 - nodes in this community are weakly interconnected._