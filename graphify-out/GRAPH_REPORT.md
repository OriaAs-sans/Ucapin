# Graph Report - Ucapin  (2026-11-21)

## Corpus Check
- 81 files · ~51,246 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .woff2 12, .css 3, .example 1)

## Summary
- 708 nodes · 1453 edges · 56 communities (43 shown, 13 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.83)
- Token cost: 243,257 input · 0 output

## Community Hubs (Navigation)
- lucide-react
- architecture.md (Architecture - Ucapin)
- CLAUDE.md (Ucapin)
- HTML prototype (prototype/)
- Accessibility: WCAG 2.2 AA, no colour-on
- app.js
- package.json
- tsconfig.json
- components.json
- .card / .card-link
- assets/icons.svg
- Kartu '3 kata masuk Bank Kesalahan' + CT
- dependencies
- DashboardWorkspaceProps
- .score-card / .meterbar / .ring-score
- migration.sql
- Competitor English-Speaking-Practice Pro
- ELSA AI Four-Part Roleplay Report (Overa
- Antislop dials ENERGY 2 / RHYTHM 2 / MOT
- Bank Kesalahan (Mistake Bank)
- Azure Neural TTS (model pronunciation)
- Right panel .panel/.profile/.avatar/.sta
- Duolingo Video Call (Lily)
- Buttons .btn, .btn-primary, .btn-accent,
- seed.ts
- Browser Audio Capture (getUserMedia, Med
- dashboard/route.ts
- Laragon PostgreSQL (127.0.0.1:5432, db: 
- next.config.ts
- ASR Leniency Tension / Strictness Settin
- login/route.ts
- mistakes/route.ts
- cek-mikrofon/page.tsx
- scripts
- Indonesian Learner Pronunciation Errors 
- Ammar & Spada (2006) Recasts vs Prompts
- masuk/page.tsx
- hasil/page.tsx
- latihan-ucapan/page.tsx
- roleplay/page.tsx
- @radix-ui/react-separator@^1.1.2
- tailwindcss@^3.4.17
- Target bicara per hari (5/10/15/20 menit
- Avoid Web Speech API for assessment
- postcss.config.mjs
- onboarding/route.ts
- 4 Kurikulum Tujuan Belajar (kerja, jalan
- clsx@^2.1.1
- @radix-ui/react-progress@^1.1.2
- react-dom@^19.0.0
- Next.js App Router + TypeScript frontend
- CEFR Companion Volume 2020 (intelligibil
- Fluency metrics (speech rate r=0.76, mea
- Leaderboard motivation risk (Hanus & Fox
- WCAG 1.4.1 Use of Color
- AssemblyAI Universal STT

## God Nodes (most connected - your core abstractions)
1. `cn()` - 53 edges
2. `latihan-ucapan.html (02 Pronunciation Drill)` - 34 edges
3. `index.html (01 Dashboard / Beranda)` - 33 edges
4. `next` - 32 edges
5. `hasil.html (04 Session Result)` - 31 edges
6. `roleplay.html (03 AI Roleplay, scripted MVP)` - 31 edges
7. `react` - 28 edges
8. `cek-mikrofon.html (06/06b Mic check + blocked)` - 27 edges
9. `Button` - 25 edges
10. `assets/icons.svg` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Open risks (ASR Indonesian accent, confidence transfer, willingness to pay)` --semantically_similar_to--> `Three open uncertainties (ASR accuracy, confidence transfer, unit economics)`  [INFERRED] [semantically similar]
  architecture.md → reports/Konsep website speaking bahasa Inggris.md
- `Cost estimate per active user per month` --semantically_similar_to--> `Cost US$2.5-3.7 per active user per month`  [INFERRED] [semantically similar]
  architecture.md → reports/Konsep website speaking bahasa Inggris.md
- `Azure AI Speech Pronunciation Assessment` --semantically_similar_to--> `Azure Pronunciation Assessment (report)`  [INFERRED] [semantically similar]
  architecture.md → reports/Konsep website speaking bahasa Inggris.md
- `Avoid Web Speech API for assessment` --semantically_similar_to--> `Avoid browser Web Speech API for assessment (report)`  [INFERRED] [semantically similar]
  architecture.md → reports/Konsep website speaking bahasa Inggris.md
- `Tombol 'Mulai latihan pertama' (aria-disabled sampai mic lulus)` --references--> `latihan-ucapan.html (02 Pronunciation Drill)`  [EXTRACTED]
  prototype/cek-mikrofon.html → design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Core loop across screens (drill -> result -> Bank Kesalahan -> Beranda)** — design_core_loop, prototype_latihan_ucapan_page, prototype_hasil_page, design_bank_kesalahan, prototype_index_page [EXTRACTED 1.00]
- **Three-font typography stack** — design_font_bricolage, design_font_atkinson, design_font_charis, design_typography [EXTRACTED 1.00]
- **Status encoding: marks + color + sticker/label (WCAG 1.4.1)** — design_principle_not_color_only, design_proofreading_marks, design_stickers, design_status_jelas, design_status_hampir, design_status_ulang [EXTRACTED 1.00]
- **MVP Turn-Based Speaking Pipeline (capture, STT, tutor LLM, TTS, pronunciation assessment)** — research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_browser_audio_capture, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_openai_transcribe, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_claude_tutor_llm, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_neural_tts, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_azure_pronunciation_assessment [EXTRACTED 1.00]
- **Turn-based STT -> LLM -> TTS roleplay pipeline** — architecture_free_ai_roleplay, architecture_conversation_stt, architecture_llm_tutor, architecture_azure_neural_tts, architecture_azure_pronunciation_assessment [EXTRACTED 1.00]
- **Mandatory Claude workflow rules for Ucapin** — rules_git_no_commit_push, rules_discuss_before_execute, rules_graphify_must_update, rules_antislop_wajib [EXTRACTED 1.00]
- **Model routing tiers** — rules_scout_haiku, rules_verifier_haiku, rules_implementer_sonnet, rules_main_model_responsibilities [EXTRACTED 1.00]
- **Error-to-Practice Feedback Loop** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_prompt_retry_feedback_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_retry_flow, research_notes_konsep_website_speaking_bahasa_inggris_competitors_mistake_driven_drill_loop, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_pronunciation_feedback_display [INFERRED 0.75]
- **Low-Anxiety Speaking Design** — research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_anxiety_reduction_levers, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_graded_exposure_path, research_notes_konsep_website_speaking_bahasa_inggris_ux_pedagogy_learner_feedback_settings, research_notes_konsep_website_speaking_bahasa_inggris_competitors_duolingo_video_call, research_notes_konsep_website_speaking_bahasa_inggris_tech_stack_privacy_by_default_audio [INFERRED 0.75]
- **Komponen tangkap suara mikrofon** — prototype_latihan_ucapan_mic_recorder, prototype_roleplay_composer, prototype_cek_mikrofon_sound_test, prototype_cek_mikrofon_mic_permission_flow, prototype_assets_app [INFERRED 0.75]
- **Design quality and anti-slop skills** — rules_antislop_skill, rules_design_taste_frontend_skill, rules_impeccable_skill [INFERRED 0.75]
- **Mistake Bank closed loop** — product_mistake_bank, product_principle_close_the_loop, design_core_loop, design_bank_kesalahan, product_indonesian_sound_errors [INFERRED 0.85]
- **Siklus bicara -> feedback -> Bank Kesalahan -> latihan** — prototype_latihan_ucapan_page, prototype_roleplay_page, prototype_hasil_page, prototype_index_bank_kesalahan_card, prototype_index_page [INFERRED 0.85]
- **Alur onboarding: tujuan -> cek mikrofon -> latihan pertama** — prototype_mulai_page, prototype_cek_mikrofon_page, prototype_latihan_ucapan_page, prototype_mulai_onboarding_goal_form, prototype_cek_mikrofon_mic_permission_flow [INFERRED 0.85]

## Communities (56 total, 13 thin omitted)

### Community 0 - "lucide-react"
Cohesion: 0.09
Nodes (66): lucide-react, react, AppShell(), AppShellProps, navItems, SidebarNav(), ThemeToggle(), ThemeToggleProps (+58 more)

### Community 1 - "architecture.md (Architecture - Ucapin)"
Cohesion: 0.05
Nodes (51): architecture.md (Architecture - Ucapin), Azure Neural TTS with CDN cache, Azure AI Speech Pronunciation Assessment, Backend: Next.js Route Handlers / server actions, Conversation STT (gpt-4o-mini-transcribe / Deepgram Nova-3), Cost estimate per active user per month, Data model sketch (users, sessions, utterances, phoneme_scores, mistakes, streaks, scenarios), Free AI Roleplay pipeline (STT -> LLM -> TTS) (+43 more)

### Community 2 - "CLAUDE.md (Ucapin)"
Cohesion: 0.10
Nodes (21): CLAUDE.md (Ucapin), Ucapin - English speaking practice website, Antislop Delivery Gate (PASS/FAIL), anthropic-skills:antislop skill, references/awesome-design-md/ (84 DESIGN.md examples), Available design skills, design-taste-frontend (taste-skill), Secrets in .env.local with .env.example (+13 more)

### Community 3 - "HTML prototype (prototype/)"
Cohesion: 0.13
Nodes (29): HTML prototype (prototype/), Screens table (prototype <-> Figma), prototype/assets/styles.css, prototype/assets/ui.css, Panel brand split (Suaramu, kendalimu.), Pilihan waktu koreksi (setiap selesai bicara / akhir sesi), Alur izin mikrofon setelah penjelasan (#allow, #perm-status, #blocked), cek-mikrofon.html (06/06b Mic check + blocked) (+21 more)

### Community 4 - "Accessibility: WCAG 2.2 AA, no colour-on"
Cohesion: 0.10
Nodes (14): User-supplied teal-beige palette, Voice: warm, short, encouraging, never judging, Daily short session flow, Indonesian learners A2-B1, Indonesian speaker sound errors (/v/ /θ/ /ð/ /ʃ/, final consonants), MVP: Azure pronunciation assessment, scripted roleplay, no LLM, Production target: Next.js App Router + TypeScript, Open: product name, pricing, database, hosting (+6 more)

### Community 5 - "app.js"
Cohesion: 0.14
Nodes (16): drawBars(), initDrill(), finishRecording(), render(), setState(), showResult(), initMicCheck(), begin() (+8 more)

### Community 6 - "package.json"
Cohesion: 0.13
Nodes (20): devDependencies, autoprefixer@^10.4.21, postcss@^8.5.3, prisma@^6.5.0, tsx@^4.19.3, @types/node@^22.13.10, @types/react@^19.0.10, @types/react-dom@^19.0.4 (+12 more)

### Community 7 - "tsconfig.json"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 9 - ".card / .card-link"
Cohesion: 0.17
Nodes (18): .card / .card-link, Form .choice/.choice.goal/.switch/.stepper, .hero / .mic-art, Roleplay .turn-char/.turn-me/.tool/.hint/.mission/.scene, .status-* / .sticker / .mk-ok/-almost/-work, .tile / .chip-*, Components, Figma cards (--surface, radius 22, soft shadow / thin border in dark) (+10 more)

### Community 10 - "assets/icons.svg"
Cohesion: 0.11
Nodes (18): assets/icons.svg, Icon: again, Icon: back, Icon: book, Icon: chat, Icon: check, Icon: clock, Icon: cross (+10 more)

### Community 11 - "Kartu '3 kata masuk Bank Kesalahan' + CT"
Cohesion: 0.14
Nodes (18): Kartu '3 kata masuk Bank Kesalahan' + CTA coral, Tampilan kosong Bank Kesalahan (#bank-empty, ?kosong=1), Kartu Bank Kesalahan (#bank), Daftar Bank Kesalahan (very v->f, think th->t, worked -ed), Kartu mode latihan (Latihan Ucapan, Roleplay, Shadowing, Speaking Test), Sidebar navigasi utama (Beranda, Latihan Ucapan, Roleplay, Bank Kesalahan, Segera hadir), Panel catatan pelatih (tersembunyi sampai dibuka), Header latihan + progres 'Kalimat 4 dari 12', fokus /v/ dan /ð/ (+10 more)

### Community 12 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority@^0.7.1, lucide-react@^0.487.0, next@^15.2.4, @prisma/client@^6.5.0, @radix-ui/react-radio-group@^1.2.3, @radix-ui/react-slot@^1.1.2, @radix-ui/react-switch@^1.1.3 (+9 more)

### Community 13 - "DashboardWorkspaceProps"
Cohesion: 0.17
Nodes (14): DashboardWorkspaceProps, GOAL_TO_SCENARIO, DailyActivityDTO, DrillSentenceDTO, LeagueEntryDTO, PhonemeBreakdownItem, PhonemeGuideDTO, SampleCorrectionDTO (+6 more)

### Community 14 - ".score-card / .meterbar / .ring-score"
Cohesion: 0.13
Nodes (16): .score-card / .meterbar / .ring-score, Kejelasan score, Kejelasan, bukan aksen (clarity score, no accent score), Lencana baru (Jagoan Kafe, 13 Hari, 10 Obrolan), Cek percaya diri 1-5 (#confidence-out), Perkiraan level A2+ menuju B1, hasil.html (04 Session Result), Hero ring Kejelasan 84 + stiker '3 misi beres!' + selebrasi (+8 more)

### Community 15 - "migration.sql"
Cohesion: 0.21
Nodes (15): "DailyActivity", "DrillSentence", "LeagueEntry", "MistakeItem", MistakeItem_userId_word_key, "PhonemeGuide", PhonemeGuide_phoneme_key, "PhonemeScore" (+7 more)

### Community 16 - "Competitor English-Speaking-Practice Pro"
Cohesion: 0.14
Nodes (12): Competitor English-Speaking-Practice Products Research, Cakap, Cambly, Freemium Daily-Minute Caps, Gliglish, LanguaTalk Reviews, Loora, Praktika (+4 more)

### Community 17 - "ELSA AI Four-Part Roleplay Report (Overa"
Cohesion: 0.15
Nodes (11): ELSA AI Four-Part Roleplay Report (Overall/Pronunciation/Vocabulary/Grammar), ELSA Speak, ELSA Speech Analyzer, Speak 'Made for You' mistake-based lessons, Tech Stack for English Speaking-Practice Website, Azure AI Speech Pronunciation Assessment, ELSA Developer API (unclear availability), Speechace (+3 more)

### Community 18 - "Antislop dials ENERGY 2 / RHYTHM 2 / MOT"
Cohesion: 0.17
Nodes (13): Antislop dials ENERGY 2 / RHYTHM 2 / MOTION 2, Coach notes panel (sound breakdown, mouth illustration, minimal pairs), .mic[data-state] / .levels / .meter, Copy voice: casual-polite Indonesian, short, encouraging; specific CTAs; no em dash, no buzzwords, Motion dial 2 (spring easing, off under prefers-reduced-motion), Low pressure: user chooses when corrected; hints must still be spoken, Mic permission after explanation; every mic error has a message and a way out, Prompt, bukan recast (+5 more)

### Community 19 - "Bank Kesalahan (Mistake Bank)"
Cohesion: 0.18
Nodes (13): Bank Kesalahan (Mistake Bank), .item row (Bank Kesalahan, phrases), Core loop: speak -> feedback -> Bank Kesalahan -> tomorrow's drill -> Beranda, design.md (Ucapin design system), Figma file V546npJwhf9ZiKLApX2P1H, Indonesian speaker error focus (/v/->/f/, /θ/->/t/, /ð/->/d/, /ʃ/->/s/, dropped final consonants), Layout breakpoints, <900px: top bar, single column, hero illustration hidden (+5 more)

### Community 20 - "Azure Neural TTS (model pronunciation)"
Cohesion: 0.17
Nodes (12): Azure Neural TTS (model pronunciation), Cascaded STT-LLM-TTS Pipeline, Claude Haiku/Sonnet as Tutor LLM, Deepgram (Nova-3, Flux, Aura-2, Voice Agent), ElevenLabs (Agents, TTS, Scribe), Gemini Live, LiveKit Agents / Pipecat, MVP Reference Architecture (Next.js + Azure Speech + Cascade + Postgres) (+4 more)

### Community 21 - "Right panel .panel/.profile/.avatar/.sta"
Cohesion: 0.23
Nodes (12): Right panel .panel/.profile/.avatar/.stat/.league/.badge-tile, >=1280px: Sidebar 248 | Main | Right panel 330, Weekly league by speaking minutes, Gamification measures effort, Streak with 2 freezes per month, assets/fonts/bricolage-grotesque-latin.woff2, Topbar sapaan 'Halo, Alya!', Liga mingguan berdasarkan menit bicara (+4 more)

### Community 22 - "Duolingo Video Call (Lily)"
Cohesion: 0.17
Nodes (6): Duolingo Video Call (Lily), GR 33/2026 PDP Implementing Regulation, Indonesian UU PDP (Law 27/2022), AI Chatbot Speaking Practice Evidence, Foreign Language Speaking Anxiety (FLSA) Reduction, Polizzi et al. Critical Review (incl. Replika anxiety increase)

### Community 23 - "Buttons .btn, .btn-primary, .btn-accent,"
Cohesion: 0.27
Nodes (11): Buttons .btn, .btn-primary, .btn-accent, .btn-quiet, .icon-btn, .theme-toggle, Measured contrast WCAG AA, Coral accent #FF7A59, Atkinson Hyperlegible Next, Bricolage Grotesque, Charis SIL (IPA only), Semantic tokens per theme (--bg, --surface, --surface-2, --text, --btn-bg, --side-bg, tiles), Light/dark theme (system default, toggle, localStorage ucapin-theme, ?theme=) (+3 more)

### Community 24 - "seed.ts"
Cohesion: 0.31
Nodes (7): main(), prisma, @prisma/client, POST(), globalForPrisma, prisma, seedUcapinDatabase()

### Community 25 - "Browser Audio Capture (getUserMedia, Med"
Cohesion: 0.25
Nodes (9): Browser Audio Capture (getUserMedia, MediaRecorder, AnalyserNode, AudioWorklet), UX, Speaking Pedagogy and Gamification Research, Duolingo Streak Design (freezes, daily goal separation), Hanus & Fox (2015) Gamification Undermines Motivation, Mekler et al. (2017) Points/Levels/Leaderboards, In-Context Mic Permission Onboarding, Ngo, Chen & Lai (2024) ASR Pronunciation Meta-analysis (ReCALL), Recording States and Error States (+1 more)

### Community 26 - "dashboard/route.ts"
Cohesion: 0.25
Nodes (8): GET(), BankKesalahanPage(), dynamic, metadata, dynamic, HomePage(), getDashboardData(), getSessionCookieValue()

### Community 27 - "Laragon PostgreSQL (127.0.0.1:5432, db: "
Cohesion: 0.22
Nodes (10): Laragon PostgreSQL (127.0.0.1:5432, db: ucapin), Next.js 15 App Router + TypeScript Fullstack (src/app/), Prisma ORM Schema & Seed (prisma/schema.prisma), Halaman Login, Daftar & 1-Klik Akun Testing (/masuk), PhoneticSpecimenCard (replaces AI-slop floating mic-art bubbles), ProofreadingSentence (straight interlinear annotations, zero tilted stickers), shadcn/ui Primitives Layer (src/components/ui/), Reusable Domain Components (src/components/shared/) (+2 more)

### Community 28 - "next.config.ts"
Cohesion: 0.22
Nodes (5): nextConfig, next, POST(), metadata, updateSessionConfidence()

### Community 29 - "ASR Leniency Tension / Strictness Settin"
Cohesion: 0.20
Nodes (6): Speak (speak.com), Speak Smart Review (spaced repetition drills), Web Speech API (SpeechRecognition), Spaced Productive Retrieval of Formulaic Sequences, Push-to-Talk vs Voice Activity Detection, Task Repetition

### Community 30 - "login/route.ts"
Cohesion: 0.27
Nodes (6): POST(), POST(), authenticateUser(), mapUser(), registerNewUser(), SESSION_COOKIE_NAME

### Community 31 - "mistakes/route.ts"
Cohesion: 0.28
Nodes (7): GET(), POST(), POST(), PhoneticWordRowProps, completeSpeakingSession(), recordMistakeInBank(), PhonemeStatus

### Community 32 - "cek-mikrofon/page.tsx"
Cohesion: 0.28
Nodes (7): CekMikrofonPage(), dynamic, metadata, dynamic, metadata, MulaiOnboardingPage(), getActiveUser()

### Community 33 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, build, db:push, db:seed, db:setup, dev, lint, start

### Community 34 - "Indonesian Learner Pronunciation Errors "
Cohesion: 0.33
Nodes (3): Indonesian Learner Pronunciation Errors (/v/,/θ/,/ð/,/ʃ/, final consonants), SpeakShark, Fluency Metrics (speech rate, mean length of run, pause frequency)

### Community 35 - "Ammar & Spada (2006) Recasts vs Prompts"
Cohesion: 0.33
Nodes (4): Ammar & Spada (2006) Recasts vs Prompts, Brown (2016) Teacher CF Meta-analysis, Corrective Feedback: Prompts over Recasts, Lyster & Saito (2010) CF Meta-analysis

### Community 36 - "masuk/page.tsx"
Cohesion: 0.47
Nodes (5): dynamic, MasukPage(), metadata, getAllTestingUsers(), getSessionUserId()

### Community 37 - "hasil/page.tsx"
Cohesion: 0.50
Nodes (4): dynamic, HasilSesiPage(), metadata, getLatestSessionResult()

### Community 38 - "latihan-ucapan/page.tsx"
Cohesion: 0.50
Nodes (4): dynamic, LatihanUcapanPage(), metadata, getDrillSentences()

### Community 39 - "roleplay/page.tsx"
Cohesion: 0.50
Nodes (4): dynamic, metadata, RoleplayPage(), getRoleplayScenario()

### Community 40 - "@radix-ui/react-separator@^1.1.2"
Cohesion: 0.33
Nodes (4): @radix-ui/react-separator@^1.1.2, tailwind-merge@^3.0.2, @radix-ui/react-separator, tailwind-merge

### Community 41 - "tailwindcss@^3.4.17"
Cohesion: 0.50
Nodes (3): tailwindcss@^3.4.17, tailwindcss, config

### Community 42 - "Target bicara per hari (5/10/15/20 menit"
Cohesion: 0.50
Nodes (4): Target bicara per hari (5/10/15/20 menit, 2 jatah libur), Pilihan tujuan (kerja, jalan-jalan, IELTS, harian) + validasi #goal-error, Pilihan level A1-C1, Form tujuan onboarding (#goal-form)

## Knowledge Gaps
- **109 isolated node(s):** `Indonesian speaker sound errors (/v/ /θ/ /ð/ /ʃ/, final consonants)`, `Production target: Next.js App Router + TypeScript`, `Practice modes (Pronunciation Drill, Roleplay, Shadowing, Speaking Test)`, `Prototype stack: static HTML/CSS/JS in prototype/`, `Research in reports/ and research_notes/` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 226 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `design.md (Ucapin design system)` connect `Bank Kesalahan (Mistake Bank)` to `CLAUDE.md (Ucapin)`, `HTML prototype (prototype/)`, `.card / .card-link`, `Antislop dials ENERGY 2 / RHYTHM 2 / MOT`, `Buttons .btn, .btn-primary, .btn-accent,`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `latihan-ucapan.html (02 Pronunciation Drill)` (e.g. with `Core loop: speak -> feedback -> Bank Kesalahan -> tomorrow's drill -> Beranda` and `Charis SIL (IPA only)`) actually correct?**
  _`latihan-ucapan.html (02 Pronunciation Drill)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Indonesian speaker sound errors (/v/ /θ/ /ð/ /ʃ/, final consonants)`, `Production target: Next.js App Router + TypeScript`, `Practice modes (Pronunciation Drill, Roleplay, Shadowing, Speaking Test)` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lucide-react` be split into smaller, more focused modules?**
  _Cohesion score 0.09280037400654512 - nodes in this community are weakly interconnected._
- **Why does `architecture.md (Architecture - Ucapin)` connect `architecture.md (Architecture - Ucapin)` to `CLAUDE.md (Ucapin)`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `architecture.md (Architecture - Ucapin)` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Why does `next` connect `next.config.ts` to `cek-mikrofon/page.tsx`, `lucide-react`, `masuk/page.tsx`, `hasil/page.tsx`, `package.json`, `latihan-ucapan/page.tsx`, `roleplay/page.tsx`, `dependencies`, `onboarding/route.ts`, `DashboardWorkspaceProps`, `seed.ts`, `dashboard/route.ts`, `login/route.ts`, `mistakes/route.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._