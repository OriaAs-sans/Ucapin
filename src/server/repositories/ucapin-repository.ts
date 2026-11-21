import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import {
  burnPasswordCheck,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  verifyPassword,
} from "@/server/password";
import { readSessionToken, SESSION_COOKIE_NAME } from "@/server/session";
import { TEST_ACCOUNT_IDS } from "@/server/test-accounts";
import {
  advanceAfterSuccess,
  isDue,
  resetAfterMistake,
  scheduleLabelFor,
} from "@/lib/spaced-repetition";
import { getArticulationGuideForWord } from "@/lib/speech-assessor";
import { getActivityStats, getWeeklyLeague, type ActivityStats } from "@/server/activity";
import {
  buildChapterPaths,
  chapterStatusFor,
  drillChapterKey,
  GOAL_LABELS,
  levelName,
  parseLevel,
  roleplayChapterKey,
  type ChapterInput,
  type ChapterPath,
  type ChapterSummary,
} from "@/lib/chapters";
import type {
  DailyActivityDTO,
  DrillSentenceDTO,
  MistakeItemDTO,
  PhonemeGuideDTO,
  PhonemeStatus,
  ScenarioDTO,
  SpeakingSessionDTO,
  UserProfileDTO,
} from "@/types/ucapin";

export { SESSION_COOKIE_NAME };

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 401 | 409
  ) {
    super(message);
  }
}

const GOAL_TO_SCENARIO: Record<string, string> = {
  kerja: "wawancara-startup",
  jalan: "checkin-hotel-singapura",
  ielts: "simulasi-ielts-part1",
  harian: "memesan-di-kafe",
};

const EMPTY_STATS = { spokenTodayMinutes: 0, totalSpokenMinutes: 0, streakDays: 0 };

function mapUser(u: {
  id: string;
  email: string;
  name: string;
  initials: string;
  roleLabel: string;
  cefrLevel: string;
  cefrProgressLabel: string;
  cefrProgressPct: number;
  goals: string[];
  dailyTargetMinutes: number;
  clarityAvg: number;
  streakFreezes: number;
  correctionPref: string;
  saveAudioOptIn: boolean;
  onboardingCompleted: boolean;
  micChecked: boolean;
  activeScenarioSlug: string;
  leagueOptIn: boolean;
  leagueNickname: string | null;
}, stats: Omit<ActivityStats, "weeklyActivities"> = EMPTY_STATS): UserProfileDTO {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    initials: u.initials,
    roleLabel: u.roleLabel ?? "Pelajar",
    cefrLevel: u.cefrLevel,
    cefrProgressLabel: u.cefrProgressLabel,
    cefrProgressPct: u.cefrProgressPct,
    goals: Array.isArray(u.goals) ? u.goals : [],
    dailyTargetMinutes: u.dailyTargetMinutes,
    spokenTodayMinutes: stats.spokenTodayMinutes,
    totalSpokenMinutes: stats.totalSpokenMinutes,
    clarityAvg: u.clarityAvg,
    streakDays: stats.streakDays,
    streakFreezes: u.streakFreezes,
    correctionPref: u.correctionPref,
    saveAudioOptIn: u.saveAudioOptIn,
    onboardingCompleted: u.onboardingCompleted ?? false,
    micChecked: u.micChecked ?? false,
    activeScenarioSlug: u.activeScenarioSlug || "wawancara-startup",
    leagueOptIn: u.leagueOptIn,
    leagueNickname: u.leagueNickname,
  };
}

type MistakeRow = {
  id: string;
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  heardAs: string;
  sourceMode: string;
  occurrenceCount: number;
  status: string;
  nextReviewAt: Date;
  reviewStage: number;
  masteredAt: Date | null;
};

function mapMistake(m: MistakeRow, now = new Date()): MistakeItemDTO {
  return {
    id: m.id,
    word: m.word,
    ipa: m.ipa,
    phoneme: m.phoneme,
    errorPattern: m.errorPattern,
    heardAs: m.heardAs,
    sourceMode: m.sourceMode,
    occurrenceCount: m.occurrenceCount,
    status: m.status as PhonemeStatus,
    scheduleLabel: scheduleLabelFor(m, now),
    reviewStage: m.reviewStage,
    isDue: isDue(m, now),
    isMastered: Boolean(m.masteredAt),
  };
}

// Urutan Bank Kesalahan: yang jatuh tempo dulu, lalu yang paling sering muncul; yang dikuasai paling akhir.
function sortMistakes(items: MistakeItemDTO[]): MistakeItemDTO[] {
  const rank = (m: MistakeItemDTO) => (m.isMastered ? 2 : m.isDue ? 0 : 1);
  return [...items].sort(
    (a, b) => rank(a) - rank(b) || b.occurrenceCount - a.occurrenceCount
  );
}

// Mengembalikan id pengguna dari cookie sesi yang tanda tangannya valid, atau null.
export async function getSessionUserId(): Promise<string | null> {
  try {
    const store = await cookies();
    return readSessionToken(store.get(SESSION_COOKIE_NAME)?.value);
  } catch {
    return null;
  }
}

export async function getActiveUser(): Promise<UserProfileDTO> {
  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;

  if (!user) {
    redirect("/masuk");
  }
  return mapUser(user, await getActivityStats(user.id));
}

export async function getAllTestingUsers(): Promise<UserProfileDTO[]> {
  const rows = await prisma.user.findMany({
    where: { id: { in: Object.values(TEST_ACCOUNT_IDS) } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => mapUser(r));
}

export async function getUserById(id: string): Promise<UserProfileDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? mapUser(user) : null;
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}): Promise<UserProfileDTO | null> {
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
  });
  if (!user) {
    await burnPasswordCheck(input.password);
    return null;
  }
  const valid = await verifyPassword(input.password, user.passwordHash);
  return valid ? mapUser(user) : null;
}

export async function registerNewUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserProfileDTO> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError(
      `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`,
      400
    );
  }

  const cleanEmail = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existing) {
    throw new AuthError(
      "Email ini sudah terdaftar. Masuk dengan email itu atau pakai email lain.",
      409
    );
  }

  const parts = input.name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : input.name.slice(0, 2).toUpperCase();

  const created = await prisma.user.create({
    data: {
      email: cleanEmail,
      passwordHash: await hashPassword(input.password),
      name: input.name.trim(),
      initials,
      roleLabel: "Pelajar Baru",
      cefrLevel: "A2",
      cefrProgressLabel: "Belum ada sesi",
      cefrProgressPct: 0,
      goals: [],
      dailyTargetMinutes: 10,
      clarityAvg: 0,
      streakFreezes: 2,
      correctionPref: "giliran",
      saveAudioOptIn: false,
      onboardingCompleted: false,
      micChecked: false,
      activeScenarioSlug: "wawancara-startup",
    },
  });


  return mapUser(created);
}

export async function getPhonemeGuides(): Promise<PhonemeGuideDTO[]> {
  const rows = await prisma.phonemeGuide.findMany();
  return rows.map((r) => ({
    id: r.id,
    phoneme: r.phoneme,
    errorPattern: r.errorPattern,
    title: r.title,
    description: r.description,
    articulationSteps: JSON.parse(r.articulationStepsJson),
    minimalPairs: JSON.parse(r.minimalPairsJson),
  }));
}

export async function getDashboardData() {
  const user = await getActiveUser();
  const primaryGoal = user.goals[0] ?? "kerja";
  const targetSlug =
    user.activeScenarioSlug ||
    GOAL_TO_SCENARIO[primaryGoal] ||
    "wawancara-startup";

  const [
    mistakes,
    stats,
    leagueDTOs,
    allScenarios,
    allDrillSentences,
    userSessions,
  ] = await Promise.all([
    prisma.mistakeItem.findMany({
      where: { userId: user.id },
      orderBy: [{ occurrenceCount: "desc" }, { updatedAt: "desc" }],
    }),
    getActivityStats(user.id),
    getWeeklyLeague(user.id),
    prisma.scenario.findMany({
      include: { nodes: { orderBy: { stepIndex: "asc" } } },
    }),
    prisma.drillSentence.findMany(),
    prisma.speakingSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const resolvedScenario =
    allScenarios.find((s) => s.slug === targetSlug) ??
    allScenarios.find((s) => user.goals.includes(s.goalTag)) ??
    allScenarios[0] ??
    null;

  const matchingDrillCount =
    user.goals.length > 0
      ? allDrillSentences.filter((d) => user.goals.includes(d.goalTag)).length
      : allDrillSentences.length;

  const hasCompletedResolvedScenario = resolvedScenario
    ? userSessions.some(
        (sess) =>
          sess.mode === "roleplay" &&
          sess.scenarioTitle === resolvedScenario.title
      )
    : false;

  const mistakeDTOs: MistakeItemDTO[] = sortMistakes(mistakes.map((m) => mapMistake(m)));

  const activityDTOs: DailyActivityDTO[] = stats.weeklyActivities;

  return {
    user,
    mistakes: mistakeDTOs,
    weeklyActivities: activityDTOs,
    league: leagueDTOs,
    drillSentenceCount: matchingDrillCount,
    scenarioCount: allScenarios.length,
    completedSessionCount: userSessions.length,
    activeScenario: resolvedScenario
      ? {
          slug: resolvedScenario.slug,
          goalTag: resolvedScenario.goalTag,
          title: resolvedScenario.title,
          characterName: resolvedScenario.characterName,
          characterRole: resolvedScenario.characterRole,
          cefrLevel: resolvedScenario.cefrLevel,
          lastPrompt:
            resolvedScenario.nodes[0]?.speakerLine ??
            "Welcome! Ready to begin?",
          missions: JSON.parse(resolvedScenario.missionsJson) as string[],
          completedMissionsCount: hasCompletedResolvedScenario ? 3 : 0,
        }
      : null,
  };
}

type DrillRow = Awaited<ReturnType<typeof prisma.drillSentence.findMany>>[number];

function mapDrillRow(r: DrillRow): DrillSentenceDTO {
  return {
    id: r.id,
    goalTag: r.goalTag ?? "harian",
    cefrLevel: r.cefrLevel ?? "B1",
    category: r.category,
    focusPhonemes: r.focusPhonemes,
    text: r.text,
    ipa: r.ipa,
    translation: r.translation,
    orderIndex: r.orderIndex,
    targetMarks: JSON.parse(r.targetMarksJson),
    sampleScores: JSON.parse(r.sampleScoresJson),
    coachWord: r.coachWord,
    coachIpa: r.coachIpa,
    coachNote: r.coachNote,
    coachSteps: JSON.parse(r.coachStepsJson),
    phonemeBreakdown: JSON.parse(r.phonemeBreakdownJson),
    minimalPairs: JSON.parse(r.minimalPairsJson),
  };
}

async function getCompletedChapters(userId: string): Promise<Map<string, number>> {
  const rows = await prisma.chapterProgress.findMany({ where: { userId } });
  return new Map(rows.map((r) => [r.chapterKey, r.bestClarity]));
}

/** Urutan jalur: tujuan pilihan pelajar dulu, lalu sisanya. */
function goalOrderFor(user: UserProfileDTO): string[] {
  return [...user.goals, ...Object.keys(GOAL_LABELS).filter((g) => !user.goals.includes(g))];
}

async function buildDrillPaths(user: UserProfileDTO): Promise<ChapterPath[]> {
  const rows = await prisma.drillSentence.findMany({
    select: { goalTag: true, cefrLevel: true, focusPhonemes: true },
    orderBy: { orderIndex: "asc" },
  });
  const groups = new Map<string, { goalTag: string; level: string; focus: string[]; count: number }>();
  for (const r of rows) {
    const key = drillChapterKey(r.goalTag, r.cefrLevel);
    const g = groups.get(key) ?? { goalTag: r.goalTag, level: r.cefrLevel, focus: [], count: 0 };
    g.count++;
    if (!g.focus.includes(r.focusPhonemes)) g.focus.push(r.focusPhonemes);
    groups.set(key, g);
  }
  const items: ChapterInput[] = [...groups.entries()].map(([key, g]) => ({
    key,
    goalTag: g.goalTag,
    level: g.level,
    title: `${g.level} · ${levelName(g.level)}`,
    subtitle: `Fokus: ${g.focus.slice(0, 2).join(", ")}`,
    itemCount: g.count,
    href: `/latihan-ucapan?bab=${g.goalTag}-${g.level}`,
  }));
  return buildChapterPaths(items, await getCompletedChapters(user.id), goalOrderFor(user));
}

async function buildRoleplayPaths(user: UserProfileDTO): Promise<ChapterPath[]> {
  const scenarios = await prisma.scenario.findMany({
    select: {
      slug: true,
      goalTag: true,
      title: true,
      cefrLevel: true,
      characterName: true,
      _count: { select: { nodes: true } },
    },
    // id cuid berurutan menurut waktu pembuatan, jadi ini mengikuti urutan materi di seed.
    orderBy: { id: "asc" },
  });
  const items: ChapterInput[] = scenarios.map((sc) => ({
    key: roleplayChapterKey(sc.slug),
    goalTag: sc.goalTag,
    level: parseLevel(sc.cefrLevel),
    title: sc.title,
    subtitle: `Bersama ${sc.characterName}`,
    itemCount: sc._count.nodes,
    href: `/roleplay?slug=${sc.slug}`,
  }));
  return buildChapterPaths(items, await getCompletedChapters(user.id), goalOrderFor(user));
}

export async function getDrillChapterMap() {
  const user = await getActiveUser();
  return { user, paths: await buildDrillPaths(user) };
}

export async function getRoleplayChapterMap() {
  const user = await getActiveUser();
  return { user, paths: await buildRoleplayPaths(user) };
}

/** Satu bab Latihan Ucapan. `chapter.status === "locked"` berarti pemanggil harus menolak. */
export async function getDrillChapter(goalTag: string, level: string): Promise<{
  user: UserProfileDTO;
  chapter: ChapterSummary;
  pathLabel: string;
  sentences: DrillSentenceDTO[];
} | null> {
  const user = await getActiveUser();
  const paths = await buildDrillPaths(user);
  const chapter = chapterStatusFor(paths, drillChapterKey(goalTag, level));
  if (!chapter) return null;
  const rows = await prisma.drillSentence.findMany({
    where: { goalTag, cefrLevel: level },
    orderBy: { orderIndex: "asc" },
  });
  return {
    user,
    chapter,
    pathLabel: GOAL_LABELS[goalTag] ?? goalTag,
    sentences: rows.map(mapDrillRow),
  };
}

/** Status bab roleplay untuk satu skenario (null bila skenario tidak ada). */
export async function getRoleplayChapterStatus(slug: string): Promise<ChapterSummary | null> {
  const user = await getActiveUser();
  return chapterStatusFor(await buildRoleplayPaths(user), roleplayChapterKey(slug));
}

const CHAPTER_EVIDENCE_WINDOW_MS = 3 * 60 * 60 * 1000;

/**
 * Bab dianggap selesai hanya bila (1) bab terbuka untuk pengguna, (2) sesi memuat semua
 * kalimat bab (drill) atau semua giliran (roleplay), dan (3) server benar-benar menilai
 * rekaman sebanyak isi bab dalam 3 jam terakhir. Teks dari browser saja tidak cukup.
 */
async function verifyChapterCompletion(
  user: UserProfileDTO,
  chapterKey: string,
  referenceTexts: string[]
): Promise<boolean> {
  const [kind, ...rest] = chapterKey.split(":");
  let requiredCount = 0;
  let status: ChapterSummary | null = null;

  if (kind === "drill" && rest.length === 2) {
    const [goalTag, level] = rest;
    status = chapterStatusFor(await buildDrillPaths(user), chapterKey);
    const sentences = await prisma.drillSentence.findMany({
      where: { goalTag, cefrLevel: level },
      select: { text: true },
    });
    const spoken = new Set(referenceTexts);
    if (sentences.length === 0 || !sentences.every((s) => spoken.has(s.text))) return false;
    requiredCount = sentences.length;
  } else if (kind === "roleplay" && rest.length === 1) {
    status = chapterStatusFor(await buildRoleplayPaths(user), chapterKey);
    const nodes = await prisma.scenarioNode.count({ where: { scenario: { slug: rest[0] } } });
    if (nodes === 0 || referenceTexts.length < nodes) return false;
    requiredCount = nodes;
  } else {
    return false;
  }

  if (!status || status.status === "locked") return false;
  const recentAttempts = await prisma.speechAttempt.count({
    where: {
      userId: user.id,
      audioSec: { gt: 0 },
      createdAt: { gte: new Date(Date.now() - CHAPTER_EVIDENCE_WINDOW_MS) },
    },
  });
  return recentAttempts >= requiredCount;
}

export async function getDrillSentences(options?: {
  goalTag?: string;
  source?: string;
}): Promise<{
  user: UserProfileDTO;
  sentences: DrillSentenceDTO[];
  activeGoal: string;
}> {
  const user = await getActiveUser();
  const allRows = await prisma.drillSentence.findMany({
    orderBy: { orderIndex: "asc" },
  });

  const allMapped: DrillSentenceDTO[] = allRows.map(mapDrillRow);

  if (options?.source === "bank") {
    const now = new Date();
    const dueMistakes = await prisma.mistakeItem.findMany({
      where: { userId: user.id, masteredAt: null, nextReviewAt: { lte: now } },
      orderBy: [{ occurrenceCount: "desc" }, { nextReviewAt: "asc" }],
      take: 12,
    });
    const dueWords = new Set(dueMistakes.map((m) => m.word.toLowerCase()));
    const sentenceWords = (s: DrillSentenceDTO) =>
      s.text.toLowerCase().split(/\s+/).map((t) => t.replace(/[^a-z']/g, ""));
    const matched = allMapped.filter((s) => sentenceWords(s).some((w) => dueWords.has(w)));
    const covered = new Set(matched.flatMap(sentenceWords));

    // Kata dari roleplay yang tidak ada di kalimat drill mana pun tetap bisa dilatih sebagai satu kata.
    const wordCards: DrillSentenceDTO[] = dueMistakes
      .filter((m) => !covered.has(m.word.toLowerCase()))
      .map((m, i) => {
        const guide = getArticulationGuideForWord(m.word, m.errorPattern);
        return {
          id: `bank-word-${m.id}`,
          goalTag: "bank",
          cefrLevel: user.cefrLevel,
          category: "Bank Kesalahan",
          focusPhonemes: m.errorPattern,
          text: m.word,
          ipa: m.ipa,
          translation: `Dari ${m.sourceMode}`,
          orderIndex: 1000 + i,
          targetMarks: { [m.word]: { status: "work", note: m.errorPattern, ipa: m.ipa } },
          sampleScores: [],
          coachWord: m.word,
          coachIpa: m.ipa,
          coachNote: guide.title,
          coachSteps: guide.steps,
          phonemeBreakdown: [],
          minimalPairs: guide.minimalPairs,
        };
      });

    if (matched.length > 0 || wordCards.length > 0) {
      return { user, sentences: [...matched, ...wordCards], activeGoal: "bank" };
    }
  }

  const targetGoal = options?.goalTag || user.goals[0] || "kerja";
  const filtered = allMapped.filter((s) =>
    options?.goalTag
      ? s.goalTag === options.goalTag
      : user.goals.length > 0
      ? user.goals.includes(s.goalTag)
      : s.goalTag === targetGoal
  );

  // Kalimat di level pelajar tampil lebih dulu, lalu level terdekat.
  const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const userLevelIdx = Math.max(0, LEVELS.indexOf(user.cefrLevel));
  const levelDistance = (s: DrillSentenceDTO) =>
    Math.abs(Math.max(0, LEVELS.indexOf(s.cefrLevel)) - userLevelIdx);
  const pool = filtered.length > 0 ? filtered : allMapped;
  const ordered = [...pool].sort(
    (a, b) => levelDistance(a) - levelDistance(b) || a.orderIndex - b.orderIndex
  );

  return {
    user,
    sentences: ordered,
    activeGoal: targetGoal,
  };
}

export async function getRoleplayScenario(slug?: string): Promise<{
  user: UserProfileDTO;
  scenario: ScenarioDTO;
  allScenarios: Pick<
    ScenarioDTO,
    "slug" | "goalTag" | "title" | "category" | "cefrLevel" | "characterName"
  >[];
}> {
  const user = await getActiveUser();
  const allRows = await prisma.scenario.findMany({
    include: { nodes: { orderBy: { stepIndex: "asc" } } },
    orderBy: { title: "asc" },
  });

  if (allRows.length === 0) {
    throw new Error("Skenario roleplay tidak ditemukan di database Laragon.");
  }

  const targetSlug =
    slug ||
    user.activeScenarioSlug ||
    GOAL_TO_SCENARIO[user.goals[0] ?? "kerja"] ||
    "wawancara-startup";

  const row =
    allRows.find((r) => r.slug === targetSlug) ??
    allRows.find((r) => user.goals.includes(r.goalTag)) ??
    allRows[0];

  return {
    user,
    scenario: {
      id: row.id,
      slug: row.slug,
      goalTag: row.goalTag,
      title: row.title,
      category: row.category,
      cefrLevel: row.cefrLevel,
      characterName: row.characterName,
      characterRole: row.characterRole,
      characterTrait: row.characterTrait,
      description: row.description,
      missions: JSON.parse(row.missionsJson),
      usefulPhrases: JSON.parse(row.usefulPhrasesJson),
      nodes: row.nodes.map((n) => ({
        id: n.id,
        stepIndex: n.stepIndex,
        speaker: n.speaker,
        speakerLine: n.speakerLine,
        translation: n.translation,
        hints: JSON.parse(n.hintsJson),
        targetMission: n.targetMission,
        sampleCorrection: n.sampleCorrectionJson
          ? JSON.parse(n.sampleCorrectionJson)
          : null,
      })),
    },
    allScenarios: allRows.map((r) => ({
      slug: r.slug,
      goalTag: r.goalTag,
      title: r.title,
      category: r.category,
      cefrLevel: r.cefrLevel,
      characterName: r.characterName,
    })),
  };
}

export async function getLatestSessionResult(sessionId?: string): Promise<{
  user: UserProfileDTO;
  session: SpeakingSessionDTO | null;
  sessionHistory: {
    id: string;
    clarityScore: number;
    mode: string;
    scenarioTitle: string | null;
  }[];
  mistakes: MistakeItemDTO[];
}> {
  const user = await getActiveUser();

  const [sessionRow, allUserSessions, mistakes] = await Promise.all([
    sessionId
      ? prisma.speakingSession.findFirst({
          where: { id: sessionId, userId: user.id },
          include: { utterances: true },
        })
      : prisma.speakingSession.findFirst({
          where: { userId: user.id },
          orderBy: { startedAt: "desc" },
          include: { utterances: true },
        }),
    prisma.speakingSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "asc" },
      take: 7,
    }),
    prisma.mistakeItem.findMany({
      where: { userId: user.id },
      orderBy: [{ updatedAt: "desc" }, { occurrenceCount: "desc" }],
      take: 6,
    }),
  ]);

  return {
    user,
    session: sessionRow
      ? {
          id: sessionRow.id,
          mode: sessionRow.mode,
          scenarioTitle: sessionRow.scenarioTitle,
          durationSec: sessionRow.durationSec,
          clarityScore: sessionRow.clarityScore,
          pronunciationScore: sessionRow.pronunciationScore,
          fluencyScore: sessionRow.fluencyScore,
          grammarScore: sessionRow.grammarScore,
          vocabularyScore: sessionRow.vocabularyScore,
          wpm: sessionRow.wpm,
          confidenceRating: sessionRow.confidenceRating,
          utterances: sessionRow.utterances.map((u) => ({
            id: u.id,
            referenceText: u.referenceText,
            transcript: u.transcript,
            betterVersion: u.betterVersion,
            status: u.status as PhonemeStatus,
            note: u.note,
            clarityScore: u.clarityScore,
          })),
        }
      : null,
    sessionHistory: allUserSessions.map((s) => ({
      id: s.id,
      clarityScore: s.clarityScore,
      mode: s.mode,
      scenarioTitle: s.scenarioTitle,
    })),
    mistakes: mistakes.map((m) => mapMistake(m)),
  };
}

/**
 * Mencatat hasil latihan kata yang sudah ada di Bank Kesalahan.
 * Kata yang terdengar jelas naik tahap (jadwal makin jauh); kata lain diabaikan di sini
 * karena kesalahannya sudah dicatat lewat recordMistakeInBank.
 */
export async function recordBankPractice(results: { word: string; status: PhonemeStatus }[]) {
  const user = await getActiveUser();
  const okWords = [
    ...new Set(results.filter((r) => r.status === "ok").map((r) => r.word.toLowerCase())),
  ];
  if (okWords.length === 0) return { advanced: [] as string[] };

  const now = new Date();
  const items = await prisma.mistakeItem.findMany({
    where: { userId: user.id, word: { in: okWords }, masteredAt: null },
  });
  const advanced: string[] = [];
  for (const item of items) {
    // Hanya kata yang memang sedang jatuh tempo yang naik tahap: mengucapkan kata yang sama
    // berkali-kali dalam satu hari tidak mempercepat jadwal.
    if (!isDue(item, now)) continue;
    const next = advanceAfterSuccess(item, now);
    await prisma.mistakeItem.update({
      where: { id: item.id },
      data: {
        ...next,
        lastPracticedAt: now,
        status: next.masteredAt ? "ok" : item.status,
      },
    });
    advanced.push(item.word);
  }
  return { advanced };
}

export async function recordMistakeInBank(input: {
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  heardAs: string;
  sourceMode: string;
  status: PhonemeStatus;
}) {
  const user = await getActiveUser();
  return prisma.mistakeItem.upsert({
    where: {
      userId_word: {
        userId: user.id,
        word: input.word.toLowerCase(),
      },
    },
    update: {
      occurrenceCount: { increment: 1 },
      status: input.status,
      heardAs: input.heardAs,
      sourceMode: input.sourceMode,
      ...resetAfterMistake(),
    },
    create: {
      userId: user.id,
      word: input.word.toLowerCase(),
      ipa: input.ipa,
      phoneme: input.phoneme,
      errorPattern: input.errorPattern,
      heardAs: input.heardAs,
      sourceMode: input.sourceMode,
      status: input.status,
      occurrenceCount: 1,
      scheduleLabel: "hari ini",
    },
  });
}

export async function completeSpeakingSession(input: {
  mode: "drill" | "roleplay";
  chapterKey?: string | null;
  scenarioTitle: string;
  durationSec: number;
  addedMinutes: number;
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  wpm: number;
  utterances: {
    referenceText: string;
    transcript: string;
    betterVersion?: string | null;
    status: PhonemeStatus;
    note?: string | null;
    clarityScore: number;
  }[];
  mistakes?: {
    word: string;
    ipa: string;
    phoneme: string;
    errorPattern: string;
    heardAs: string;
    status: PhonemeStatus;
  }[];
}) {
  const user = await getActiveUser();

  const createdSession = await prisma.speakingSession.create({
    data: {
      userId: user.id,
      mode: input.mode,
      scenarioTitle: input.scenarioTitle,
      durationSec: input.durationSec,
      spokenMinutes: input.addedMinutes,
      chapterKey: input.chapterKey ?? null,
      clarityScore: input.clarityScore,
      pronunciationScore: input.pronunciationScore,
      fluencyScore: input.fluencyScore,
      grammarScore: input.grammarScore,
      vocabularyScore: input.vocabularyScore,
      wpm: input.wpm,
      utterances: {
        create: input.utterances.map((u) => ({
          referenceText: u.referenceText,
          transcript: u.transcript,
          betterVersion: u.betterVersion ?? null,
          status: u.status,
          note: u.note ?? null,
          clarityScore: u.clarityScore,
        })),
      },
    },
  });

  if (input.mistakes && input.mistakes.length > 0) {
    for (const m of input.mistakes) {
      await prisma.mistakeItem.upsert({
        where: {
          userId_word: {
            userId: user.id,
            word: m.word.toLowerCase(),
          },
        },
        update: {
          occurrenceCount: { increment: 1 },
          status: m.status,
          heardAs: m.heardAs,
          sourceMode: input.scenarioTitle,
          ...resetAfterMistake(),
        },
        create: {
          userId: user.id,
          word: m.word.toLowerCase(),
          ipa: m.ipa,
          phoneme: m.phoneme,
          errorPattern: m.errorPattern,
          heardAs: m.heardAs,
          sourceMode: input.scenarioTitle,
          status: m.status,
          occurrenceCount: 1,
          scheduleLabel: "hari ini",
        },
      });
    }
  }

  const newClarityAvg =
    user.clarityAvg === 0
      ? input.clarityScore
      : Math.round((user.clarityAvg + input.clarityScore) / 2);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      clarityAvg: newClarityAvg,
    },
  });

  let chapterCompleted = false;
  if (input.chapterKey) {
    chapterCompleted = await verifyChapterCompletion(
      user,
      input.chapterKey,
      input.utterances.map((u) => u.referenceText)
    );
    if (chapterCompleted) {
      const existing = await prisma.chapterProgress.findUnique({
        where: { userId_chapterKey: { userId: user.id, chapterKey: input.chapterKey } },
      });
      await prisma.chapterProgress.upsert({
        where: { userId_chapterKey: { userId: user.id, chapterKey: input.chapterKey } },
        update: { bestClarity: Math.max(existing?.bestClarity ?? 0, input.clarityScore) },
        create: { userId: user.id, chapterKey: input.chapterKey, bestClarity: input.clarityScore },
      });
    }
  }

  return { ...createdSession, chapterCompleted };
}

export async function updateOnboardingProfile(input: {
  goals?: string[];
  cefrLevel?: string;
  dailyTargetMinutes?: number;
  correctionPref?: string;
  saveAudioOptIn?: boolean;
  onboardingCompleted?: boolean;
  micChecked?: boolean;
  activeScenarioSlug?: string;
  leagueOptIn?: boolean;
  leagueNickname?: string | null;
}) {
  const user = await getActiveUser();
  const primaryGoal = input.goals?.[0] ?? user.goals[0] ?? "kerja";
  const mappedScenarioSlug =
    input.activeScenarioSlug ??
    (input.goals ? GOAL_TO_SCENARIO[primaryGoal] : undefined);

  return prisma.user.update({
    where: { id: user.id },
    data: {
      ...(input.goals ? { goals: input.goals } : {}),
      ...(input.cefrLevel
        ? {
            cefrLevel: input.cefrLevel,
            cefrProgressLabel: `Level ${input.cefrLevel}`,
          }
        : {}),
      ...(typeof input.dailyTargetMinutes === "number"
        ? { dailyTargetMinutes: input.dailyTargetMinutes }
        : {}),
      ...(input.correctionPref ? { correctionPref: input.correctionPref } : {}),
      ...(typeof input.saveAudioOptIn === "boolean"
        ? { saveAudioOptIn: input.saveAudioOptIn }
        : {}),
      ...(typeof input.onboardingCompleted === "boolean"
        ? { onboardingCompleted: input.onboardingCompleted }
        : {}),
      ...(typeof input.micChecked === "boolean"
        ? { micChecked: input.micChecked }
        : {}),
      ...(mappedScenarioSlug ? { activeScenarioSlug: mappedScenarioSlug } : {}),
      ...(typeof input.leagueOptIn === "boolean" ? { leagueOptIn: input.leagueOptIn } : {}),
      ...(input.leagueNickname !== undefined ? { leagueNickname: input.leagueNickname } : {}),
    },
  });
}

export async function updateSessionConfidence(
  sessionId: string,
  confidenceRating: number
) {
  return prisma.speakingSession.update({
    where: { id: sessionId },
    data: { confidenceRating },
  });
}

/**
 * Teks yang boleh dibacakan TTS: satu kata, atau teks yang memang ada di materi Ucapin
 * (kalimat drill, dialog dan petunjuk roleplay, frasa berguna). Mencegah endpoint TTS
 * dipakai untuk membacakan teks bebas yang menghabiskan kuota.
 */
export async function isKnownLearningText(text: string): Promise<boolean> {
  if (/^[A-Za-z'-]{1,24}$/.test(text)) return true;
  const jsonNeedle = JSON.stringify(text);
  const [drill, line, hint, phrase] = await Promise.all([
    prisma.drillSentence.count({ where: { text } }),
    prisma.scenarioNode.count({ where: { speakerLine: text } }),
    prisma.scenarioNode.count({ where: { hintsJson: { contains: jsonNeedle } } }),
    prisma.scenario.count({ where: { usefulPhrasesJson: { contains: jsonNeedle } } }),
  ]);
  return drill + line + hint + phrase > 0;
}

/** Semua data milik pengguna aktif dalam satu berkas (hak akses dan portabilitas data, UU PDP). */
export async function exportActiveUserData() {
  const user = await getActiveUser();
  const [profile, sessions, mistakes, attempts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        name: true,
        cefrLevel: true,
        goals: true,
        dailyTargetMinutes: true,
        correctionPref: true,
        saveAudioOptIn: true,
        leagueOptIn: true,
        leagueNickname: true,
        consentDate: true,
        createdAt: true,
      },
    }),
    prisma.speakingSession.findMany({
      where: { userId: user.id },
      include: { utterances: true },
      orderBy: { startedAt: "asc" },
    }),
    prisma.mistakeItem.findMany({ where: { userId: user.id } }),
    prisma.speechAttempt.findMany({
      where: { userId: user.id },
      select: { audioSec: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    catatan: "Ucapin tidak menyimpan audio rekaman. Yang tersimpan hanya durasi rekaman dan hasil penilaian.",
    profil: profile,
    sesiLatihan: sessions,
    bankKesalahan: mistakes,
    rekamanDinilai: attempts,
  };
}

/** Menghapus akun pengguna aktif beserta seluruh datanya (relasi onDelete: Cascade). */
export async function deleteActiveUser(): Promise<string> {
  const user = await getActiveUser();
  await prisma.user.delete({ where: { id: user.id } });
  return user.id;
}
