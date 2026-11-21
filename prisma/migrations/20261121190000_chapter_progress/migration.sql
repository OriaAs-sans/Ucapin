-- Progres bab: bab berikutnya terbuka setelah bab sebelumnya selesai.
ALTER TABLE "SpeakingSession" ADD COLUMN "chapterKey" TEXT;

CREATE TABLE "ChapterProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterKey" TEXT NOT NULL,
    "bestClarity" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChapterProgress_userId_chapterKey_key" ON "ChapterProgress"("userId", "chapterKey");
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
