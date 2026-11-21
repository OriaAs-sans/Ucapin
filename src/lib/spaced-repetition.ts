// Jadwal pengulangan berjarak Bank Kesalahan (riset: reports/, ekspansi interval 1, 3, 7, 14 hari).
// Tahap 0 = baru saja salah, diulang hari ini. Berhasil di tahap 4 = dikuasai.
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;
export const MASTERY_STAGE = REVIEW_INTERVAL_DAYS.length;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReviewState {
  reviewStage: number;
  nextReviewAt: Date;
  masteredAt: Date | null;
}

/** Kata berhasil diucapkan jelas: naik satu tahap dan jadwalkan ulang lebih jauh. */
export function advanceAfterSuccess(state: ReviewState, now = new Date()): ReviewState {
  if (state.masteredAt) return state;
  const nextStage = state.reviewStage + 1;
  if (nextStage > MASTERY_STAGE) {
    return { reviewStage: MASTERY_STAGE, nextReviewAt: state.nextReviewAt, masteredAt: now };
  }
  return {
    reviewStage: nextStage,
    nextReviewAt: new Date(now.getTime() + REVIEW_INTERVAL_DAYS[nextStage - 1] * DAY_MS),
    masteredAt: null,
  };
}

/** Kata salah lagi: kembali ke awal, ulang hari ini. */
export function resetAfterMistake(now = new Date()): ReviewState {
  return { reviewStage: 0, nextReviewAt: now, masteredAt: null };
}

export function isDue(state: ReviewState, now = new Date()): boolean {
  return !state.masteredAt && state.nextReviewAt.getTime() <= now.getTime();
}

/** Label jadwal yang dibaca pelajar, dihitung dari data, bukan disimpan sebagai teks. */
export function scheduleLabelFor(state: ReviewState, now = new Date()): string {
  if (state.masteredAt) return "sudah dikuasai";
  const diffDays = Math.ceil((state.nextReviewAt.getTime() - now.getTime()) / DAY_MS);
  if (diffDays <= 0) return "ulang hari ini";
  if (diffDays === 1) return "ulang besok";
  return `ulang ${diffDays} hari lagi`;
}
