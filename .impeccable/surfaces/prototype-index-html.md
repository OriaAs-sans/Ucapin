---
version: 1
slug: "prototype-index-html"
primary_target: "prototype/index.html"
related_targets: ["prototype/latihan-ucapan.html","prototype/roleplay.html","prototype/hasil.html","prototype/mulai.html","prototype/cek-mikrofon.html"]
---

## Scope

Ucapin app prototype, all core screens (Beranda, Latihan Ucapan, Roleplay, Hasil Sesi, onboarding Tujuan, onboarding Cek Mikrofon). Mode: Operate. Code-led (static HTML/CSS/JS in prototype/). Structures follow the existing Figma screens (Sidebar | Main | Panel kanan; onboarding split); the visual world is replaced.

Audience, task: Indonesian A2-B1 learners doing a 5-15 minute daily speaking session. UI copy in Bahasa Indonesia; English only for learning content.

Constraints: palette pinned by user; status colours terracotta/ochre/dark green approved; sample data labelled; no LLM in MVP (roleplay is scripted).

## Direction contract

THESIS: Every word you practise is a dictionary entry in your own phonetic notebook, corrected with proofreading marks. Refuses the category default of pastel gradient cards, percentage rings and sparkle badges.

OWN-WORLD: Deep teal #1E3E45 field owns the navigation and dark panels; paper #F7F5EE entries on a #E8E5D7 ground ruled by #D4C8B7 hairlines. Practice words set in Charis SIL with IPA beneath; UI in Atkinson Hyperlegible Next. Feedback is drawn as proofreading marks: solid green underline (Jelas), dotted ochre underline (Hampir), wavy terracotta underline (Perlu latihan), each with icon and label. No gradients, no drop shadows except the floating mic.

STORY: The learner sees today's minutes and the words that tripped them yesterday, speaks one entry, sees exactly which sound slipped, retries, and that word joins Bank Kesalahan.

FIRST VIEWPORT: Beranda: teal sidebar left; main column opens with a large dictionary-entry card of the first Bank Kesalahan word (word, IPA, margin note, Latih sekarang primary button) beside a compact minutes-today meter; modes listed as a ruled index below. Primary action: Latih sekarang.

FORM: Phonetic notebook / dictionary entry, position 1 of 1. seed: none (pinned) "Prototype tapi lihat yang ada di design figma juga" plus the user-supplied palette.

Signature interaction: tap-to-talk mic; on result the proofreading underlines draw in left to right (200ms each), state conveyed by motion once.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
