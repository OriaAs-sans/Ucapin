-- Rekaman yang dinilai server (durasi saja, tanpa audio/transkrip) dan cache audio contoh.
CREATE TABLE "SpeechAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "audioSec" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpeechAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SpeechAttempt_userId_createdAt_idx" ON "SpeechAttempt"("userId", "createdAt");
ALTER TABLE "SpeechAttempt" ADD CONSTRAINT "SpeechAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "TtsCache" (
    "key" TEXT NOT NULL,
    "audio" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TtsCache_pkey" PRIMARY KEY ("key")
);
