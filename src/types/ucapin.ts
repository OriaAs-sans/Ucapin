export type PhonemeStatus = "ok" | "almost" | "work";

export interface WordMark {
  status: PhonemeStatus;
  note: string;
  ipa?: string;
}

export interface ScoreBreakdownItem {
  label: string;
  score: number;
  desc: string;
}

export interface PhonemeBreakdownItem {
  phoneme: string;
  score: number;
  status: PhonemeStatus;
}

export interface PhonemeGuideDTO {
  id: string;
  phoneme: string;
  errorPattern: string;
  title: string;
  description: string;
  articulationSteps: string[];
  minimalPairs: string[];
}

export interface DrillSentenceDTO {
  id: string;
  goalTag: string;
  cefrLevel: string;
  category: string;
  focusPhonemes: string;
  text: string;
  ipa: string;
  translation: string;
  orderIndex: number;
  targetMarks: Record<string, WordMark>;
  sampleScores: ScoreBreakdownItem[];
  coachWord: string;
  coachIpa: string;
  coachNote: string;
  coachSteps: string[];
  phonemeBreakdown: PhonemeBreakdownItem[];
  minimalPairs: string[];
}

export interface MistakeItemDTO {
  id: string;
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  heardAs: string;
  sourceMode: string;
  occurrenceCount: number;
  status: PhonemeStatus;
  scheduleLabel: string;
  /** 0 = baru salah; 1..4 = sudah berhasil diulang sebanyak itu (jarak 1, 3, 7, 14 hari). */
  reviewStage: number;
  isDue: boolean;
  isMastered: boolean;
}

export interface DailyActivityDTO {
  id: string;
  dayOrder: number;
  dayLabel: string;
  minutesSpoken: number;
  isToday: boolean;
}

export interface LeagueEntryDTO {
  id: string;
  rank: number;
  name: string;
  initials: string;
  minutesSpoken: number;
  isCurrentUser: boolean;
}

export interface UsefulPhraseDTO {
  phrase: string;
  meaning: string;
}

export interface SampleCorrectionDTO {
  word: string;
  ipa: string;
  phoneme: string;
  errorPattern: string;
  status: PhonemeStatus;
  promptText: string;
  detailText: string;
}

export interface ScenarioNodeDTO {
  id: string;
  stepIndex: number;
  speaker: string;
  speakerLine: string;
  translation: string;
  hints: string[];
  targetMission: number;
  sampleCorrection: SampleCorrectionDTO | null;
}

export interface ScenarioDTO {
  id: string;
  slug: string;
  goalTag: string;
  title: string;
  category: string;
  cefrLevel: string;
  characterName: string;
  characterRole: string;
  characterTrait: string;
  description: string;
  missions: string[];
  usefulPhrases: UsefulPhraseDTO[];
  nodes: ScenarioNodeDTO[];
}

export interface UtteranceDTO {
  id: string;
  referenceText: string;
  transcript: string;
  betterVersion: string | null;
  status: PhonemeStatus;
  note: string | null;
  clarityScore: number;
}

export interface SpeakingSessionDTO {
  id: string;
  mode: string;
  scenarioTitle: string | null;
  durationSec: number;
  clarityScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  wpm: number;
  confidenceRating: number | null;
  utterances: UtteranceDTO[];
}

export interface UserProfileDTO {
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
}
