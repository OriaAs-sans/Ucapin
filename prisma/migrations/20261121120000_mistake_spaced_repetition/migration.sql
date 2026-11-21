-- Pengulangan berjarak untuk Bank Kesalahan (1, 3, 7, 14 hari).
ALTER TABLE "MistakeItem" ADD COLUMN "reviewStage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MistakeItem" ADD COLUMN "lastPracticedAt" TIMESTAMP(3);
ALTER TABLE "MistakeItem" ADD COLUMN "masteredAt" TIMESTAMP(3);
