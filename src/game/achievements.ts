import { ALL_LEVELS } from './levels';
import { ProgressStore } from './types';

export type BadgeIconKey =
  | 'brain'
  | 'flame'
  | 'crown'
  | 'sparkles'
  | 'arrow'
  | 'shuffle'
  | 'star'
  | 'heart';

export type BadgeTone = 'gold' | 'coral' | 'teal' | 'violet' | 'sky' | 'emerald';

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  kiboPraise: string;
  icon: BadgeIconKey;
  tone: BadgeTone;
  target: number;
  getCurrent: (progress: ProgressStore) => number;
}

export interface EvaluatedBadge extends BadgeDef {
  current: number;
  unlocked: boolean;
  pct: number;
}

const BOSS_IDS = ALL_LEVELS.filter((l) => l.isBoss).map((l) => l.id);

export const ACHIEVEMENT_BADGES: BadgeDef[] = [
  {
    id: 'si_paling_pintar',
    title: 'Si Paling Pintar',
    description: 'Menangkan 10 stage tanpa salah langkah sama sekali',
    kiboPraise: 'Wih, otak encer! 10 stage beres mulus tanpa salah sedikit pun!',
    icon: 'brain',
    tone: 'gold',
    target: 10,
    getCurrent: (p) => p.stats.flawlessStageIds.length,
  },
  {
    id: 'si_pantang_menyerah',
    title: 'Si Pantang Menyerah',
    description: 'Mengulang stage sebanyak 5 kali demi hasil lebih baik',
    kiboPraise: 'Semangat juara sejati! Gagal bukan akhir, terus coba sampai jago!',
    icon: 'flame',
    tone: 'coral',
    target: 5,
    getCurrent: (p) => p.stats.retryCount,
  },
  {
    id: 'sahabat_kibo',
    title: 'Sahabat Kibo',
    description: 'Selesaikan stage pertamamu di Pantai Setara',
    kiboPraise: 'Yeay! Kita resmi jadi duo petualang pindah ruas di Pantai Setara!',
    icon: 'heart',
    tone: 'sky',
    target: 1,
    getCurrent: (p) => Object.keys(p.completed).length,
  },
  {
    id: 'ahli_pindah_ruas',
    title: 'Ahli Pindah Ruas',
    description: 'Terbangkan 25 angka/simbol melintasi jembatan =',
    kiboPraise: 'Lancar banget menyeberangi jembatan = dan membalik tandanya!',
    icon: 'arrow',
    tone: 'teal',
    target: 25,
    getCurrent: (p) => p.stats.totalTransposes,
  },
  {
    id: 'penakluk_bos',
    title: 'Penakluk Bos Laut',
    description: 'Kalahkan 3 Bos Penjaga di Peta Harta Karun',
    kiboPraise: 'Para bos laut mulai gemetar mendengar namamu!',
    icon: 'crown',
    tone: 'gold',
    target: 3,
    getCurrent: (p) => BOSS_IDS.filter((id) => Boolean(p.completed[id])).length,
  },
  {
    id: 'rajin_berlatih',
    title: 'Rajin Berlatih',
    description: 'Selesaikan 10 soal di mode Latihan Acak',
    kiboPraise: 'Rajin latihan bikin jurus pindah ruasmu makin cepat dan tajam!',
    icon: 'shuffle',
    tone: 'emerald',
    target: 10,
    getCurrent: (p) => p.practiceSolved,
  },
  {
    id: 'kolektor_bintang',
    title: 'Kolektor Bintang',
    description: 'Kumpulkan total 30 bintang dari seluruh bab',
    kiboPraise: 'Bintang-bintangmu berkilau lebih terang dari manik-manik Kepiting Emas!',
    icon: 'star',
    tone: 'gold',
    target: 30,
    getCurrent: (p) => Object.values(p.completed).reduce((sum, item) => sum + item.stars, 0),
  },
  {
    id: 'legenda_samudra',
    title: 'Legenda Samudra',
    description: 'Taklukkan semua 6 Bos Penjaga termasuk Cthulhu Kosmik',
    kiboPraise: 'LUAR BIASA! Kamu juara tertinggi seluruh Samudra Aljabar!',
    icon: 'sparkles',
    tone: 'violet',
    target: BOSS_IDS.length,
    getCurrent: (p) => BOSS_IDS.filter((id) => Boolean(p.completed[id])).length,
  },
];

export function evaluateBadges(progress: ProgressStore): EvaluatedBadge[] {
  return ACHIEVEMENT_BADGES.map((badge) => {
    const raw = badge.getCurrent(progress);
    const current = Math.min(badge.target, Math.max(0, raw));
    const unlocked = raw >= badge.target;
    const pct = Math.round((current / Math.max(1, badge.target)) * 100);
    return {
      ...badge,
      current,
      unlocked,
      pct,
    };
  });
}

export function getPlayerRank(progress: ProgressStore): { title: string; subtitle: string } {
  const done = Object.keys(progress.completed).length;
  const bosses = BOSS_IDS.filter((id) => Boolean(progress.completed[id])).length;
  if (bosses >= 6) {
    return { title: 'Legenda Samudra', subtitle: 'Penakluk Cthulhu & Seluruh 6 Bos' };
  }
  if (bosses >= 3 || done >= 40) {
    return { title: 'Kapten Aljabar', subtitle: 'Ahli Pindah Ruas Lautan Dalam' };
  }
  if (bosses >= 1 || done >= 15) {
    return { title: 'Jagoan Pindah Ruas', subtitle: 'Penjelajah Jembatan Setara' };
  }
  if (done >= 3) {
    return { title: 'Penjelajah Pantai', subtitle: 'Sahabat Setia Kibo si Hiu Gemoy' };
  }
  return { title: 'Pelaut Pemula', subtitle: 'Siap Berpetualang Bersama Kibo' };
}
