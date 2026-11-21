// Struktur bab: materi dikelompokkan per tujuan belajar menjadi jalur berurutan.
// Bab pertama tiap jalur terbuka; bab berikutnya terbuka setelah bab sebelumnya selesai.

export type ChapterKind = "drill" | "roleplay";
export type ChapterStatus = "locked" | "open" | "done";

export const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const GOAL_LABELS: Record<string, string> = {
  kerja: "Wawancara & Kerja",
  jalan: "Jalan-jalan",
  ielts: "IELTS & Kuliah",
  harian: "Sehari-hari",
};

const LEVEL_NAMES: Record<string, string> = {
  A1: "Pemula",
  A2: "Dasar",
  B1: "Menengah",
  B2: "Mahir",
  C1: "Lanjut",
  C2: "Lanjut",
};

export const levelName = (level: string) => LEVEL_NAMES[level] ?? level;

/** Level pertama yang muncul di teks, misalnya "B1 · Menengah" menjadi "B1". */
export function parseLevel(raw: string): string {
  return LEVEL_ORDER.find((l) => raw.toUpperCase().includes(l)) ?? "B1";
}

export const drillChapterKey = (goalTag: string, level: string) => `drill:${goalTag}:${level}`;
export const roleplayChapterKey = (slug: string) => `roleplay:${slug}`;

export interface ChapterInput {
  key: string;
  goalTag: string;
  level: string;
  title: string;
  subtitle: string;
  itemCount: number;
  href: string;
}

export interface ChapterSummary extends ChapterInput {
  order: number;
  status: ChapterStatus;
  bestClarity: number | null;
}

export interface ChapterPath {
  goalTag: string;
  label: string;
  chapters: ChapterSummary[];
  doneCount: number;
}

/**
 * Menyusun jalur bab per tujuan, diurutkan per level, lalu memberi status:
 * selesai bila ada di `completed`; terbuka bila bab pertama atau bab sebelumnya selesai.
 */
export function buildChapterPaths(
  items: ChapterInput[],
  completed: Map<string, number>,
  goalOrder: string[]
): ChapterPath[] {
  const goals = [...new Set(items.map((i) => i.goalTag))].sort((a, b) => {
    const ia = goalOrder.indexOf(a);
    const ib = goalOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });

  return goals.map((goalTag) => {
    // Urut per level; untuk level yang sama, ikuti urutan materi (urutan masukan).
    const sorted = items
      .map((item, inputIndex) => ({ item, inputIndex }))
      .filter(({ item }) => item.goalTag === goalTag)
      .sort(
        (a, b) =>
          LEVEL_ORDER.indexOf(a.item.level) - LEVEL_ORDER.indexOf(b.item.level) ||
          a.inputIndex - b.inputIndex
      )
      .map(({ item }) => item);
    let previousDone = true;
    const chapters = sorted.map((item, idx) => {
      const isDone = completed.has(item.key);
      const status: ChapterStatus = isDone ? "done" : previousDone ? "open" : "locked";
      previousDone = isDone;
      return {
        ...item,
        order: idx + 1,
        status,
        bestClarity: isDone ? completed.get(item.key) ?? null : null,
      };
    });
    return {
      goalTag,
      label: GOAL_LABELS[goalTag] ?? goalTag,
      chapters,
      doneCount: chapters.filter((c) => c.status === "done").length,
    };
  });
}

/** Status satu bab menurut jalurnya. */
export function chapterStatusFor(paths: ChapterPath[], key: string): ChapterSummary | null {
  for (const path of paths) {
    const found = path.chapters.find((c) => c.key === key);
    if (found) return found;
  }
  return null;
}
