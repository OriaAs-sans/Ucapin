import { prisma } from "@/server/db";
import type {
  DailyActivityDTO,
  DrillSentenceDTO,
  LeagueEntryDTO,
  MistakeItemDTO,
  PhonemeStatus,
  ScenarioDTO,
  SpeakingSessionDTO,
  UserProfileDTO,
} from "@/types/ucapin";

const DEFAULT_USER_ID = "learner-alya";

function mapUser(u: {
  id: string;
  name: string;
  initials: string;
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
}): UserProfileDTO {
  return {
    id: u.id,
    name: u.name,
    initials: u.initials,
    cefrLevel: u.cefrLevel,
    cefrProgressLabel: u.cefrProgressLabel,
    cefrProgressPct: u.cefrProgressPct,
    goals: u.goals,
    dailyTargetMinutes: u.dailyTargetMinutes,
    spokenTodayMinutes: u.spokenTodayMinutes,
    totalSpokenMinutes: u.totalSpokenMinutes,
    clarityAvg: u.clarityAvg,
    streakDays: u.streakDays,
    streakFreezes: u.streakFreezes,
    correctionPref: u.correctionPref,
    saveAudioOptIn: u.saveAudioOptIn,
  };
}

export async function getActiveUser(): Promise<UserProfileDTO> {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  if (!user) {
    const first = await prisma.user.findFirst();
    if (!first) {
      throw new Error("Database belum di-seed. Jalankan npm run db:seed");
    }
    return mapUser(first);
  }
  return mapUser(user);
}

export async function getDashboardData() {
  const user = await getActiveUser();
  const [mistakes, activities, league, activeScenario] = await Promise.all([
    prisma.mistakeItem.findMany({
      where: { userId: user.id },
      orderBy: [{ occurrenceCount: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.dailyActivity.findMany({
      where: { userId: user.id },
      orderBy: { dayOrder: "asc" },
    }),
    prisma.leagueEntry.findMany({
      orderBy: { rank: "asc" },
    }),
    prisma.scenario.findFirst({
      include: { nodes: { orderBy: { stepIndex: "asc" } } },
    }),
  ]);

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

  const leagueDTOs: LeagueEntryDTO[] = league.map((l) => ({
    id: l.id,
    rank: l.rank,
    name: l.name,
    initials: l.initials,
    minutesSpoken: l.minutesSpoken,
    isCurrentUser: l.isCurrentUser,
  }));

  return {
    user,
    mistakes: mistakeDTOs,
    weeklyActivities: activityDTOs,
    league: leagueDTOs,
    activeScenario: activeScenario
      ? {
          slug: activeScenario.slug,
          title: activeScenario.title,
          characterName: activeScenario.characterName,
          characterRole: activeScenario.characterRole,
          cefrLevel: activeScenario.cefrLevel,
          lastPrompt:
            activeScenario.nodes[0]?.speakerLine ??
            "Sure! Anything to eat with that?",
          missions: JSON.parse(activeScenario.missionsJson) as string[],
        }
      : null,
  };
}

export async function getDrillSentences(): Promise<DrillSentenceDTO[]> {
  const rows = await prisma.drillSentence.findMany({
    orderBy: { orderIndex: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
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
}

export async function getRoleplayScenario(
  slug = "memesan-di-kafe"
): Promise<ScenarioDTO> {
  const row =
    (await prisma.scenario.findUnique({
      where: { slug },
      include: { nodes: { orderBy: { stepIndex: "asc" } } },
    })) ??
    (await prisma.scenario.findFirst({
      include: { nodes: { orderBy: { stepIndex: "asc" } } },
    }));

  if (!row) {
    throw new Error("Skenario roleplay tidak ditemukan di database Laragon.");
  }

  return {
    id: row.id,
    slug: row.slug,
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
  };
}

export async function getLatestSessionResult(): Promise<{
  user: UserProfileDTO;
  session: SpeakingSessionDTO;
  mistakes: MistakeItemDTO[];
}> {
  const user = await getActiveUser();
  const [session, mistakes] = await Promise.all([
    prisma.speakingSession.findFirst({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      include: { utterances: true },
    }),
    prisma.mistakeItem.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  if (!session) {
    throw new Error("Belum ada sesi di database Laragon.");
  }

  return {
    user,
    session: {
      id: session.id,
      mode: session.mode,
      scenarioTitle: session.scenarioTitle,
      durationSec: session.durationSec,
      clarityScore: session.clarityScore,
      pronunciationScore: session.pronunciationScore,
      fluencyScore: session.fluencyScore,
      grammarScore: session.grammarScore,
      vocabularyScore: session.vocabularyScore,
      wpm: session.wpm,
      confidenceRating: session.confidenceRating,
      utterances: session.utterances.map((u) => ({
        id: u.id,
        referenceText: u.referenceText,
        transcript: u.transcript,
        betterVersion: u.betterVersion,
        status: u.status as PhonemeStatus,
        note: u.note,
        clarityScore: u.clarityScore,
      })),
    },
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

export async function updateOnboardingProfile(input: {
  goals?: string[];
  cefrLevel?: string;
  dailyTargetMinutes?: number;
  correctionPref?: string;
  saveAudioOptIn?: boolean;
}) {
  const user = await getActiveUser();
  return prisma.user.update({
    where: { id: user.id },
    data: {
      ...(input.goals ? { goals: input.goals } : {}),
      ...(input.cefrLevel ? { cefrLevel: input.cefrLevel } : {}),
      ...(typeof input.dailyTargetMinutes === "number"
        ? { dailyTargetMinutes: input.dailyTargetMinutes }
        : {}),
      ...(input.correctionPref ? { correctionPref: input.correctionPref } : {}),
      ...(typeof input.saveAudioOptIn === "boolean"
        ? { saveAudioOptIn: input.saveAudioOptIn }
        : {}),
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
