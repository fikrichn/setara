import { DailyMissionProgress, ProgressStore } from './types';

export type DailyMissionMetric = 'transposes' | 'stages' | 'practice' | 'flawless';

export interface DailyMissionDef {
  id: string;
  title: string;
  description: string;
  metric: DailyMissionMetric;
  target: number;
  bonusPoints: number;
  badgeBoostLabel: string;
  badgeBoostKind: 'transpose' | 'practice' | 'flawless';
  badgeBoostAmount: number;
}

export interface EvaluatedDailyMission extends DailyMissionDef {
  current: number;
  completed: boolean;
  claimed: boolean;
  pct: number;
}

export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createFreshDailyProgress(
  prev?: Partial<DailyMissionProgress>,
  date = new Date()
): DailyMissionProgress {
  const today = getLocalDateKey(date);
  if (prev && prev.dateKey === today) {
    return {
      dateKey: today,
      transposesToday: typeof prev.transposesToday === 'number' ? prev.transposesToday : 0,
      stagesToday: typeof prev.stagesToday === 'number' ? prev.stagesToday : 0,
      practiceToday: typeof prev.practiceToday === 'number' ? prev.practiceToday : 0,
      flawlessToday: typeof prev.flawlessToday === 'number' ? prev.flawlessToday : 0,
      claimedIds: Array.isArray(prev.claimedIds) ? prev.claimedIds : [],
      bonusPoints: typeof prev.bonusPoints === 'number' ? prev.bonusPoints : 0,
      streakDays: typeof prev.streakDays === 'number' ? prev.streakDays : 0,
      lastCompletedDateKey: prev.lastCompletedDateKey ?? null,
      specialEndingUnlocked: Boolean(prev.specialEndingUnlocked),
      specialEndingSeen: Boolean(prev.specialEndingSeen),
    };
  }

  // New day -> preserve lifetime bonus points & streak if yesterday was completed
  const yesterdayDate = new Date(date);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterdayDate);
  const keepStreak =
    prev?.lastCompletedDateKey === today || prev?.lastCompletedDateKey === yesterdayKey
      ? prev?.streakDays ?? 0
      : 0;

  return {
    dateKey: today,
    transposesToday: 0,
    stagesToday: 0,
    practiceToday: 0,
    flawlessToday: 0,
    claimedIds: [],
    bonusPoints: typeof prev?.bonusPoints === 'number' ? prev.bonusPoints : 0,
    streakDays: keepStreak,
    lastCompletedDateKey: prev?.lastCompletedDateKey ?? null,
    specialEndingUnlocked: Boolean(prev?.specialEndingUnlocked),
    specialEndingSeen: Boolean(prev?.specialEndingSeen),
  };
}

function hashDateSeed(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i++) {
    h = (h * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getDailyMissionsForDate(dateKey: string): DailyMissionDef[] {
  const seed = hashDateSeed(dateKey);
  const transposeTargets = [8, 10, 12];
  const stageTargets = [2, 3, 4];

  const tTarget = transposeTargets[seed % transposeTargets.length];
  const sTarget = stageTargets[(seed >> 2) % stageTargets.length];
  const thirdVariant = (seed >> 4) % 2;

  const thirdMission: DailyMissionDef =
    thirdVariant === 0
      ? {
          id: 'daily_practice',
          title: 'Latihan Kilat',
          description: 'Selesaikan 2 soal di Arena Latihan Acak hari ini',
          metric: 'practice',
          target: 2,
          bonusPoints: 5,
          badgeBoostLabel: '+2 progres Badge Rajin Berlatih',
          badgeBoostKind: 'practice',
          badgeBoostAmount: 2,
        }
      : {
          id: 'daily_flawless',
          title: 'Langkah Sempurna',
          description: 'Tuntaskan 1 stage tanpa salah langkah hari ini',
          metric: 'flawless',
          target: 1,
          bonusPoints: 5,
          badgeBoostLabel: '+3 progres Badge Pindah Ruas',
          badgeBoostKind: 'transpose',
          badgeBoostAmount: 3,
        };

  return [
    {
      id: 'daily_transpose',
      title: 'Penyeberang Jembatan',
      description: `Pindahkan ${tTarget} kartu melintasi tanda = hari ini`,
      metric: 'transposes',
      target: tTarget,
      bonusPoints: 5,
      badgeBoostLabel: '+3 progres Badge Ahli Pindah Ruas',
      badgeBoostKind: 'transpose',
      badgeBoostAmount: 3,
    },
    {
      id: 'daily_stages',
      title: 'Penjelajah Harian',
      description: `Selesaikan ${sTarget} stage atau soal latihan hari ini`,
      metric: 'stages',
      target: sTarget,
      bonusPoints: 5,
      badgeBoostLabel: '+1 progres Badge Rajin Berlatih',
      badgeBoostKind: 'practice',
      badgeBoostAmount: 1,
    },
    thirdMission,
  ];
}

export function evaluateDailyMissions(
  progress: ProgressStore,
  date = new Date()
): EvaluatedDailyMission[] {
  const daily = createFreshDailyProgress(progress.daily, date);
  const defs = getDailyMissionsForDate(daily.dateKey);

  return defs.map((def) => {
    const raw =
      def.metric === 'transposes'
        ? daily.transposesToday
        : def.metric === 'stages'
          ? daily.stagesToday
          : def.metric === 'practice'
            ? daily.practiceToday
            : daily.flawlessToday;

    const current = Math.min(def.target, Math.max(0, raw));
    const completed = raw >= def.target;
    const claimed = daily.claimedIds.includes(def.id);
    const pct = Math.round((current / Math.max(1, def.target)) * 100);

    return {
      ...def,
      current,
      completed,
      claimed,
      pct,
    };
  });
}
