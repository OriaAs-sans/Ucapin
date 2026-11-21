import { prisma } from "@/server/db";
import type { DailyActivityDTO, LeagueEntryDTO } from "@/types/ucapin";

// Semua statistik waktu dihitung dari sesi bertanggal dalam zona WIB (UTC+7, tanpa DST),
// jadi "hari ini" berganti otomatis saat tengah malam tanpa job terjadwal.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const STREAK_LOOKBACK_DAYS = 400;

/** Kunci hari WIB, misalnya "2026-11-21". */
export function wibDayKey(date: Date): string {
  return new Date(date.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

/** Awal hari WIB (00.00) sebagai waktu UTC. */
export function startOfWibDay(date: Date): Date {
  return new Date(Date.parse(`${wibDayKey(date)}T00:00:00Z`) - WIB_OFFSET_MS);
}

/** Senin 00.00 WIB minggu berjalan. */
export function startOfWibWeek(date: Date): Date {
  const dayStart = startOfWibDay(date);
  const weekday = (new Date(dayStart.getTime() + WIB_OFFSET_MS).getUTCDay() + 6) % 7; // 0 = Senin
  return new Date(dayStart.getTime() - weekday * DAY_MS);
}

export interface ActivityStats {
  spokenTodayMinutes: number;
  totalSpokenMinutes: number;
  streakDays: number;
  weeklyActivities: DailyActivityDTO[];
}

// Menit bicara berasal dari durasi audio yang dinilai server (SpeechAttempt),
// bukan angka kiriman browser, sehingga target harian dan liga tidak bisa dipalsukan.
const toMinutes = (seconds: number) => Math.round(seconds / 60);

export async function getActivityStats(userId: string, now = new Date()): Promise<ActivityStats> {
  const [recent, total] = await Promise.all([
    prisma.speechAttempt.findMany({
      where: { userId, createdAt: { gte: new Date(now.getTime() - STREAK_LOOKBACK_DAYS * DAY_MS) } },
      select: { createdAt: true, audioSec: true },
    }),
    prisma.speechAttempt.aggregate({ where: { userId }, _sum: { audioSec: true } }),
  ]);

  const secondsByDay = new Map<string, number>();
  for (const a of recent) {
    const key = wibDayKey(a.createdAt);
    secondsByDay.set(key, (secondsByDay.get(key) ?? 0) + a.audioSec);
  }
  const minutesByDay = new Map([...secondsByDay].map(([k, v]) => [k, toMinutes(v)]));

  const todayKey = wibDayKey(now);
  const weekStart = startOfWibWeek(now);
  const weeklyActivities: DailyActivityDTO[] = DAY_LABELS.map((label, i) => {
    const key = wibDayKey(new Date(weekStart.getTime() + i * DAY_MS));
    return {
      id: key,
      dayOrder: i + 1,
      dayLabel: label,
      minutesSpoken: minutesByDay.get(key) ?? 0,
      isToday: key === todayKey,
    };
  });

  // Streak: hari berturut-turut dengan latihan. Bila hari ini belum latihan, streak dihitung
  // sampai kemarin (masih bisa diselamatkan hari ini).
  let streakDays = 0;
  let cursor = startOfWibDay(now);
  if (!minutesByDay.has(todayKey)) cursor = new Date(cursor.getTime() - DAY_MS);
  while (minutesByDay.has(wibDayKey(cursor)) && streakDays < STREAK_LOOKBACK_DAYS) {
    streakDays++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return {
    spokenTodayMinutes: minutesByDay.get(todayKey) ?? 0,
    totalSpokenMinutes: toMinutes(total._sum.audioSec ?? 0),
    streakDays,
    weeklyActivities,
  };
}

const LEAGUE_SIZE = 10;

/** Liga minggu ini: hanya pengguna yang ikut atas pilihan sendiri, nama panggilan saja. */
export async function getWeeklyLeague(currentUserId: string, now = new Date()): Promise<LeagueEntryDTO[]> {
  const members = await prisma.user.findMany({
    where: { leagueOptIn: true },
    select: { id: true, leagueNickname: true },
  });
  if (members.length === 0) return [];

  const sums = await prisma.speechAttempt.groupBy({
    by: ["userId"],
    where: {
      userId: { in: members.map((m) => m.id) },
      createdAt: { gte: startOfWibWeek(now) },
    },
    _sum: { audioSec: true },
  });
  const minutes = new Map(sums.map((s) => [s.userId, toMinutes(s._sum.audioSec ?? 0)]));

  const ranked = members
    .map((m) => {
      const nickname = m.leagueNickname?.trim() || "Pelajar";
      return {
        id: m.id,
        name: nickname,
        initials: nickname.slice(0, 2).toUpperCase(),
        minutesSpoken: minutes.get(m.id) ?? 0,
        isCurrentUser: m.id === currentUserId,
      };
    })
    .sort((a, b) => b.minutesSpoken - a.minutesSpoken || a.name.localeCompare(b.name))
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const top = ranked.slice(0, LEAGUE_SIZE);
  const me = ranked.find((e) => e.isCurrentUser);
  if (me && !top.includes(me)) top.push(me);
  return top;
}

const STT_PER_MINUTE = 20;
const STT_PER_DAY = 400;

/** Kuota pengenal suara per pengguna, dihitung dari database agar berlaku di semua instance. */
export async function checkSpeechQuota(userId: string, now = new Date()): Promise<string | null> {
  const [lastMinute, today] = await Promise.all([
    prisma.speechAttempt.count({
      where: { userId, createdAt: { gte: new Date(now.getTime() - 60_000) } },
    }),
    prisma.speechAttempt.count({ where: { userId, createdAt: { gte: startOfWibDay(now) } } }),
  ]);
  if (lastMinute >= STT_PER_MINUTE) {
    return "Terlalu banyak rekaman dalam semenit. Istirahat sebentar lalu coba lagi.";
  }
  if (today >= STT_PER_DAY) {
    return "Batas rekaman hari ini sudah tercapai. Lanjutkan besok, ya.";
  }
  return null;
}
