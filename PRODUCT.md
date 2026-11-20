# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Prototype: plain static HTML/CSS/JS in `prototype/` (user chose "prototype" on 2026-11-20). Production target per architecture.md: Next.js (App Router) + TypeScript, still open for discussion.

## Users

Indonesian learners, from high-school students to young professionals, roughly CEFR A2 to B1. They want the courage to speak English for work, job interviews, study, or everyday situations. They practise 5 to 15 minutes a day on a laptop or phone, often in a shared or noisy room, and many are anxious about being judged for their accent.

## Product Purpose

Ucapin is a speaking-first English practice website. The learner speaks, gets feedback on what was hard to understand, and the mistakes automatically become tomorrow's practice. Success means the learner speaks more minutes each week and the same sound errors stop coming back.

## Positioning

Mistake Bank: errors made while speaking (in drills and roleplays) are turned into targeted drills automatically, focused on sounds Indonesian speakers commonly struggle with (/v/ to /f/, /θ/ to /t/, /ð/ to /d/, /ʃ/ to /s/, dropped final consonants). Competitors either drill or converse; they rarely close this loop for Indonesian learners.

## Operating Context

- Daily short session: Dashboard, pick a mode (Pronunciation Drill, Roleplay, Shadowing, Speaking Test), speak with tap-to-talk, read feedback, review in Session Result, drill saved mistakes.
- Microphone in the browser, permission explained before the browser prompt.
- **Interface language is Bahasa Indonesia.** English appears only in learning content: practice sentences, roleplay dialogue, model answers, useful phrases, and IPA. This lets learners who cannot read English yet still navigate.

## Capabilities and Constraints

- MVP: pronunciation assessment only (Azure), scripted roleplay, no LLM. Free AI roleplay is v1.5 (see architecture.md).
- Scores describe clarity (being understood), never accent.
- Audio is not stored by default; saving recordings is opt-in (UU PDP).
- Open: final product name ("Ucapin" is a working name), pricing, database and hosting choices.

## Brand Commitments

- Palette supplied by the user (2026-11-20): #1E3E45, #274C56, #3B6A78, #D4C8B7, #E5E1CD, #E8E5D7. Approved additions for status only: terracotta #B5523B, ochre #9A7124, dark green #2F6B4F.
- Voice: warm, short, encouraging, never judging.

## Evidence on Hand

- Research: `reports/` and `research_notes/` (competitors, pedagogy, tech stack), with cited sources.
- No real users, testimonials, statistics, logos, or photos exist yet. All learner data in mockups is sample data and must be labelled as such.

## Product Principles

1. Close the loop: every spoken mistake has a path back into practice.
2. Low pressure first: the learner chooses when to be corrected; hints still require speaking.
3. Prompt before recast: ask the learner to try again before showing the correct version.
4. Reward effort, not accent: streaks and leagues count minutes spoken, never pronunciation scores.
5. Indonesian guides, English is practised.

## Accessibility & Inclusion

WCAG 2.2 AA contrast; feedback never relies on color alone (color plus icon plus label); full keyboard operation with visible focus; tap targets at least 44px; works on mid-range phones.
