-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'ucapin123',
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "roleLabel" TEXT NOT NULL DEFAULT 'Pelajar',
    "cefrLevel" TEXT NOT NULL DEFAULT 'B1',
    "cefrProgressLabel" TEXT NOT NULL DEFAULT 'A2+ menuju B1',
    "cefrProgressPct" INTEGER NOT NULL DEFAULT 70,
    "goals" TEXT[] DEFAULT ARRAY['kerja', 'harian']::TEXT[],
    "dailyTargetMinutes" INTEGER NOT NULL DEFAULT 15,
    "spokenTodayMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalSpokenMinutes" INTEGER NOT NULL DEFAULT 0,
    "clarityAvg" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "streakFreezes" INTEGER NOT NULL DEFAULT 2,
    "correctionPref" TEXT NOT NULL DEFAULT 'giliran',
    "saveAudioOptIn" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "micChecked" BOOLEAN NOT NULL DEFAULT false,
    "activeScenarioSlug" TEXT NOT NULL DEFAULT 'memesan-di-kafe',
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhonemeGuide" (
    "id" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "errorPattern" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "articulationStepsJson" TEXT NOT NULL,
    "minimalPairsJson" TEXT NOT NULL,

    CONSTRAINT "PhonemeGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillSentence" (
    "id" TEXT NOT NULL,
    "goalTag" TEXT NOT NULL DEFAULT 'harian',
    "cefrLevel" TEXT NOT NULL DEFAULT 'B1',
    "category" TEXT NOT NULL,
    "focusPhonemes" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "targetMarksJson" TEXT NOT NULL,
    "sampleScoresJson" TEXT NOT NULL,
    "coachWord" TEXT NOT NULL,
    "coachIpa" TEXT NOT NULL,
    "coachNote" TEXT NOT NULL,
    "coachStepsJson" TEXT NOT NULL,
    "phonemeBreakdownJson" TEXT NOT NULL,
    "minimalPairsJson" TEXT NOT NULL,

    CONSTRAINT "DrillSentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "goalTag" TEXT NOT NULL DEFAULT 'harian',
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cefrLevel" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "characterRole" TEXT NOT NULL,
    "characterTrait" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "missionsJson" TEXT NOT NULL,
    "usefulPhrasesJson" TEXT NOT NULL,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioNode" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "speaker" TEXT NOT NULL,
    "speakerLine" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "hintsJson" TEXT NOT NULL,
    "targetMission" INTEGER NOT NULL,
    "sampleCorrectionJson" TEXT,

    CONSTRAINT "ScenarioNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "scenarioTitle" TEXT,
    "durationSec" INTEGER NOT NULL,
    "clarityScore" INTEGER NOT NULL,
    "pronunciationScore" INTEGER NOT NULL,
    "fluencyScore" INTEGER NOT NULL,
    "grammarScore" INTEGER NOT NULL,
    "vocabularyScore" INTEGER NOT NULL,
    "wpm" INTEGER NOT NULL DEFAULT 118,
    "confidenceRating" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utterance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "referenceText" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "betterVersion" TEXT,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "clarityScore" INTEGER NOT NULL,
    "audioUrl" TEXT,

    CONSTRAINT "Utterance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhonemeScore" (
    "id" TEXT NOT NULL,
    "utteranceId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "errorPattern" TEXT,

    CONSTRAINT "PhonemeScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "errorPattern" TEXT NOT NULL,
    "heardAs" TEXT NOT NULL,
    "sourceMode" TEXT NOT NULL,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'work',
    "scheduleLabel" TEXT NOT NULL DEFAULT 'hari ini',
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MistakeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "dayLabel" TEXT NOT NULL,
    "minutesSpoken" INTEGER NOT NULL,
    "isToday" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueEntry" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "minutesSpoken" INTEGER NOT NULL,
    "isCurrentUser" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LeagueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PhonemeGuide_phoneme_key" ON "PhonemeGuide"("phoneme");

-- CreateIndex
CREATE UNIQUE INDEX "Scenario_slug_key" ON "Scenario"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MistakeItem_userId_word_key" ON "MistakeItem"("userId", "word");

-- AddForeignKey
ALTER TABLE "ScenarioNode" ADD CONSTRAINT "ScenarioNode_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSession" ADD CONSTRAINT "SpeakingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Utterance" ADD CONSTRAINT "Utterance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "SpeakingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhonemeScore" ADD CONSTRAINT "PhonemeScore_utteranceId_fkey" FOREIGN KEY ("utteranceId") REFERENCES "Utterance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeItem" ADD CONSTRAINT "MistakeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
