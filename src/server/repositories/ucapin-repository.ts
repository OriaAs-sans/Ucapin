import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import type {
  DailyActivityDTO,
  DrillSentenceDTO,
  LeagueEntryDTO,
  MistakeItemDTO,
  PhonemeGuideDTO,
  PhonemeStatus,
  ScenarioDTO,
  SpeakingSessionDTO,
  UserProfileDTO,
} from "@/types/ucapin";

export const SESSION_COOKIE_NAME = "ucapin_user_id";
const DEFAULT_USER_ID = "learner-baru";

const GOAL_TO_SCENARIO: Record<string, string> = {
  kerja: "wawancara-startup",
  jalan: "checkin-hotel-singapura",
  ielts: "simulasi-ielts-part1",
  harian: "memesan-di-kafe",
};

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
  spokenTodayMinutes: number;
  totalSpokenMinutes: number;
  clarityAvg: number;
  streakDays: number;
  streakFreezes: number;
  correctionPref: string;
  saveAudioOptIn: boolean;
  onboardingCompleted: boolean;
  micChecked: boolean;
  activeScenarioSlug: string;
}): UserProfileDTO {
  return {
    id: u.id,
    email: u.email ?? "baru@ucapin.id",
    name: u.name,
    initials: u.initials,
    roleLabel: u.roleLabel ?? "Pelajar",
    cefrLevel: u.cefrLevel,
    cefrProgressLabel: u.cefrProgressLabel,
    cefrProgressPct: u.cefrProgressPct,
    goals: Array.isArray(u.goals) ? u.goals : [],
    dailyTargetMinutes: u.dailyTargetMinutes,
    spokenTodayMinutes: u.spokenTodayMinutes,
    totalSpokenMinutes: u.totalSpokenMinutes,
    clarityAvg: u.clarityAvg,
    streakDays: u.streakDays,
    streakFreezes: u.streakFreezes,
    correctionPref: u.correctionPref,
    saveAudioOptIn: u.saveAudioOptIn,
    onboardingCompleted: u.onboardingCompleted ?? false,
    micChecked: u.micChecked ?? false,
    activeScenarioSlug: u.activeScenarioSlug || "wawancara-startup",
  };
}

export async function getSessionCookieValue(): Promise<string | null> {
  try {
    const store = await cookies();
    return store.get(SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string> {
  const val = await getSessionCookieValue();
  return val ?? DEFAULT_USER_ID;
}

export async function getActiveUser(): Promise<UserProfileDTO> {
  const targetId = await getSessionUserId();
  const user =
    (await prisma.user.findUnique({ where: { id: targetId } })) ??
    (await prisma.user.findUnique({ where: { id: DEFAULT_USER_ID } })) ??
    (await prisma.user.findFirst());

  if (!user) {
    throw new Error("Database belum di-seed. Jalankan npm run db:seed");
  }
  return mapUser(user);
}

export async function getAllTestingUsers(): Promise<UserProfileDTO[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapUser);
}

export async function authenticateUser(input: {
  email?: string;
  password?: string;
  userId?: string;
}): Promise<UserProfileDTO | null> {
  if (input.userId) {
    const byId = await prisma.user.findUnique({ where: { id: input.userId } });
    return byId ? mapUser(byId) : null;
  }
  if (!input.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
  });
  if (!user) return null;
  if (input.password && user.password !== input.password) {
    return null;
  }
  return mapUser(user);
}

export async function registerNewUser(input: {
  name: string;
  email: string;
  password?: string;
}): Promise<UserProfileDTO> {
  const cleanEmail = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });
  if (existing) {
    return mapUser(existing);
  }

  const parts = input.name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : input.name.slice(0, 2).toUpperCase();

  const created = await prisma.user.create({
    data: {
      email: cleanEmail,
      password: input.password || "ucapin123",
      name: input.name.trim(),
      initials,
      roleLabel: "Pelajar Baru",
      cefrLevel: "A2",
      cefrProgressLabel: "Belum ada sesi",
      cefrProgressPct: 0,
      goals: [],
      dailyTargetMinutes: 10,
      spokenTodayMinutes: 0,
      totalSpokenMinutes: 0,
      clarityAvg: 0,
      streakDays: 0,
      streakFreezes: 2,
      correctionPref: "giliran",
      saveAudioOptIn: false,
      onboardingCompleted: false,
      micChecked: false,
      activeScenarioSlug: "wawancara-startup",
    },
  });

  await prisma.dailyActivity.createMany({
    data: [
      { userId: created.id, dayOrder: 1, dayLabel: "Sen", minutesSpoken: 0, isToday: false },
      { userId: created.id, dayOrder: 2, dayLabel: "Sel", minutesSpoken: 0, isToday: false },
      { userId: created.id, dayOrder: 3, dayLabel: "Rab", minutesSpoken: 0, isToday: false },
      { userId: created.id, dayOrder: 4, dayLabel: "Kam", minutesSpoken: 0, isToday: false },
      { userId: created.id, dayOrder: 5, dayLabel: "Jum", minutesSpoken: 0, isToday: true },
      { userId: created.id, dayOrder: 6, dayLabel: "Sab", minutesSpoken: 0, isToday: false },
      { userId: created.id, dayOrder: 7, dayLabel: "Min", minutesSpoken: 0, isToday: false },
    ],
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
    activities,
    allUsers,
    allScenarios,
    allDrillSentences,
    userSessions,
  ] = await Promise.all([
    prisma.mistakeItem.findMany({
      where: { userId: user.id },
      orderBy: [{ occurrenceCount: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.dailyActivity.findMany({
      where: { userId: user.id },
      orderBy: { dayOrder: "asc" },
    }),
    prisma.user.findMany({
      orderBy: [{ totalSpokenMinutes: "desc" }, { createdAt: "asc" }],
    }),
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

  const mistakeDTOs: MistakeItemDTO[] = mistakes.map((m) => ({
    id: m.id,
    word: m.word,
    ipa: m.ipa,
    phoneme: m.phoneme,
    errorPattern: m.errorPattern,
    heardAs: m.heardAs,
    sourceMode: m.sourceMode,
    occurrenceCount: m.occurrenceCount,
    status: m.status as PhonemeStatus,
    scheduleLabel: m.scheduleLabel,
  }));

  const activityDTOs: DailyActivityDTO[] = activities.map((a) => ({
    id: a.id,
    dayOrder: a.dayOrder,
    dayLabel: a.dayLabel,
    minutesSpoken: a.minutesSpoken,
    isToday: a.isToday,
  }));

  // Compute Weekly League directly from actual User rows in PostgreSQL
  const leagueDTOs: LeagueEntryDTO[] = allUsers.map((u, idx) => ({
    id: u.id,
    rank: idx + 1,
    name: u.id === user.id ? `${u.name} (kamu)` : u.name,
    initials: u.initials,
    minutesSpoken: u.totalSpokenMinutes,
    isCurrentUser: u.id === user.id,
  }));

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

  const allMapped: DrillSentenceDTO[] = allRows.map((r) => ({
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
  }));

  if (options?.source === "bank") {
    const userMistakes = await prisma.mistakeItem.findMany({
      where: { userId: user.id },
    });
    const mistakeWords = new Set(userMistakes.map((m) => m.word.toLowerCase()));
    const matched = allMapped.filter(
      (s) =>
        mistakeWords.has(s.coachWord.toLowerCase()) ||
        Object.keys(s.targetMarks).some((k) =>
          mistakeWords.has(k.toLowerCase())
        )
    );
    if (matched.length > 0) {
      return { user, sentences: matched, activeGoal: "bank" };
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

  return {
    user,
    sentences: filtered.length > 0 ? filtered : allMapped,
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
    mistakes: mistakes.map((m) => ({
      id: m.id,
      word: m.word,
      ipa: m.ipa,
      phoneme: m.phoneme,
      errorPattern: m.errorPattern,
      heardAs: m.heardAs,
      sourceMode: m.sourceMode,
      occurrenceCount: m.occurrenceCount,
      status: m.status as PhonemeStatus,
      scheduleLabel: m.scheduleLabel,
    })),
  };
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
      scheduleLabel: "hari ini",
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
  scenarioTitle: string;
  durationSec: number;
  addedMinutes: number;
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
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
      clarityScore: input.clarityScore,
      pronunciationScore: input.pronunciationScore,
      fluencyScore: input.fluencyScore,
      grammarScore: input.grammarScore,
      vocabularyScore: input.vocabularyScore,
      wpm: 118,
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
          scheduleLabel: "hari ini",
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

  const isFirstSessionToday = user.spokenTodayMinutes === 0;
  const newClarityAvg =
    user.clarityAvg === 0
      ? input.clarityScore
      : Math.round((user.clarityAvg + input.clarityScore) / 2);
  const newProgressPct = Math.min(100, user.cefrProgressPct + 15);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      spokenTodayMinutes: { increment: input.addedMinutes },
      totalSpokenMinutes: { increment: input.addedMinutes },
      clarityAvg: newClarityAvg,
      cefrProgressPct: newProgressPct,
      cefrProgressLabel: `${user.cefrLevel} (${newProgressPct}% menuju level berikutnya)`,
      ...(isFirstSessionToday ? { streakDays: { increment: 1 } } : {}),
    },
  });

  await prisma.dailyActivity.updateMany({
    where: { userId: user.id, isToday: true },
    data: { minutesSpoken: { increment: input.addedMinutes } },
  });

  return createdSession;
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
            cefrProgressLabel:
              user.totalSpokenMinutes > 0
                ? `${input.cefrLevel} menuju level berikutnya`
                : `Level awal ${input.cefrLevel}`,
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
