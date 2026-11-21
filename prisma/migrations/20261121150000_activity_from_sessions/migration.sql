-- Statistik (menit hari ini, streak, grafik mingguan, liga) kini dihitung dari sesi bertanggal.
-- Penghitung lama dan tabel berisi label hari tetap dihapus.
ALTER TABLE "SpeakingSession" ADD COLUMN "spokenMinutes" INTEGER NOT NULL DEFAULT 0;
UPDATE "SpeakingSession" SET "spokenMinutes" = GREATEST(1, ROUND("durationSec" / 60.0));
ALTER TABLE "SpeakingSession" ALTER COLUMN "wpm" SET DEFAULT 0;
CREATE INDEX "SpeakingSession_userId_startedAt_idx" ON "SpeakingSession"("userId", "startedAt");

ALTER TABLE "User" ADD COLUMN "leagueOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "leagueNickname" TEXT;
ALTER TABLE "User" DROP COLUMN "spokenTodayMinutes";
ALTER TABLE "User" DROP COLUMN "totalSpokenMinutes";
ALTER TABLE "User" DROP COLUMN "streakDays";

DROP TABLE "DailyActivity";
DROP TABLE "LeagueEntry";
