import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Crown,
  Film,
  Flame,
  Heart,
  Lock,
  Play,
  Shuffle,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import {
  BadgeIconKey,
  BadgeTone,
  EvaluatedBadge,
  evaluateBadges,
  getPlayerRank,
} from '../game/achievements';
import { ALL_LEVELS } from '../game/levels';
import { sound } from '../game/sound';
import { ProgressStore } from '../game/types';
import { AnimatedBoss } from './AnimatedBoss';
import { AnimatedKibo } from './AnimatedKibo';
import { StatsD3Charts } from './StatsD3Charts';

export type CutsceneId =
  | 'intro'
  | 'boss_0'
  | 'boss_1'
  | 'boss_2'
  | 'boss_3'
  | 'boss_4'
  | 'boss_5'
  | 'outro_bab5'
  | 'secret_7d';

type ProfileTab = 'badges' | 'stats' | 'cutscene';

const TONE_STYLES: Record<
  BadgeTone,
  { unlockedBg: string; iconBg: string; barFill: string; titleColor: string }
> = {
  gold: {
    unlockedBg: 'bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-[#F59E0B]',
    iconBg: 'bg-gradient-to-br from-[#FDE047] to-[#D97706] text-[#451A03]',
    barFill: 'bg-[#F59E0B]',
    titleColor: 'text-[#92400E]',
  },
  coral: {
    unlockedBg: 'bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6] border-[#FB7185]',
    iconBg: 'bg-gradient-to-br from-[#FB7185] to-[#E11D48] text-white',
    barFill: 'bg-[#FB7185]',
    titleColor: 'text-[#9F1239]',
  },
  teal: {
    unlockedBg: 'bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1] border-[#14B8A6]',
    iconBg: 'bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] text-white',
    barFill: 'bg-[#14B8A6]',
    titleColor: 'text-[#115E59]',
  },
  violet: {
    unlockedBg: 'bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF] border-[#A855F7]',
    iconBg: 'bg-gradient-to-br from-[#C084FC] to-[#7E22CE] text-white',
    barFill: 'bg-[#A855F7]',
    titleColor: 'text-[#581C87]',
  },
  sky: {
    unlockedBg: 'bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border-[#38BDF8]',
    iconBg: 'bg-gradient-to-br from-[#38BDF8] to-[#0284C7] text-white',
    barFill: 'bg-[#0284C7]',
    titleColor: 'text-[#075985]',
  },
  emerald: {
    unlockedBg: 'bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border-[#10B981]',
    iconBg: 'bg-gradient-to-br from-[#34D399] to-[#059669] text-white',
    barFill: 'bg-[#10B981]',
    titleColor: 'text-[#065F46]',
  },
};

function renderBadgeIcon(icon: BadgeIconKey, className = 'w-5 h-5') {
  switch (icon) {
    case 'brain':
      return <Brain className={className} aria-hidden="true" />;
    case 'flame':
      return <Flame className={className} aria-hidden="true" />;
    case 'crown':
      return <Crown className={className} aria-hidden="true" />;
    case 'sparkles':
      return <Sparkles className={className} aria-hidden="true" />;
    case 'arrow':
      return <ArrowRightLeft className={className} aria-hidden="true" />;
    case 'shuffle':
      return <Shuffle className={className} aria-hidden="true" />;
    case 'star':
      return <Star className={className} aria-hidden="true" />;
    case 'heart':
      return <Heart className={className} aria-hidden="true" />;
    case 'zap':
      return <Zap className={className} aria-hidden="true" />;
  }
}

interface ProfileBadgesCardProps {
  progress: ProgressStore;
  onPlayCutscene: (id: CutsceneId) => void;
}

export const ProfileBadgesCard: React.FC<ProfileBadgesCardProps> = ({
  progress,
  onPlayCutscene,
}) => {
  const badges = evaluateBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const rank = getPlayerRank(progress);
  const [activeTab, setActiveTab] = useState<ProfileTab>('badges');
  const [selectedBadge, setSelectedBadge] = useState<EvaluatedBadge | null>(null);

  const completedStages = Object.keys(progress.completed).length;

  const cutsceneEntries = useMemo(() => {
    const unlockedStageIds = new Set<string>();
    for (let i = 0; i < ALL_LEVELS.length; i++) {
      const lvl = ALL_LEVELS[i];
      if (i === 0 || progress.completed[ALL_LEVELS[i - 1].id] || progress.completed[lvl.id]) {
        unlockedStageIds.add(lvl.id);
      }
    }

    const bossLevels = ALL_LEVELS.filter((l) => l.isBoss && l.boss);
    const bossCutscenes = bossLevels.map((lvl) => {
      const unlocked = unlockedStageIds.has(lvl.id) || Boolean(progress.completed[lvl.id]);
      const defeated = Boolean(progress.completed[lvl.id]);
      const isSecretBab5 = lvl.chapterId === 5 && !defeated;
      return {
        id: `boss_${lvl.chapterId}` as CutsceneId,
        chapterId: lvl.chapterId,
        kind: 'boss' as const,
        title: isSecretBab5 ? 'Kemunculan Bos ???' : `Bos Bab ${lvl.chapterId}: ${lvl.boss!.name}`,
        subtitle: unlocked
          ? isSecretBab5
            ? 'Adegan kemunculan penguasa palung misterius Bab 5.'
            : `${lvl.boss!.role} · ${defeated ? 'Sudah Takluk!' : 'Siap Ditantang!'}`
          : `Buka Stage 20 di Bab ${lvl.chapterId} untuk membuka cutscene ini.`,
        unlocked,
      };
    });

    const outroUnlocked = Boolean(progress.completed['5-boss'] || progress.outroSeen);
    const secretUnlocked = Boolean(
      progress.daily?.specialEndingUnlocked || (progress.daily?.streakDays ?? 0) >= 7
    );

    return {
      intro: {
        id: 'intro' as CutsceneId,
        title: 'Intro: Pertemuan Pertama Kibo',
        subtitle: 'Kisah awal Kibo si Hiu Gemoy mengajakmu belajar pindah ruas di Pantai Setara.',
        unlocked: true,
      },
      bosses: bossCutscenes,
      outro: {
        id: 'outro_bab5' as CutsceneId,
        title: 'Outro Ending: Fajar Pantai Setara',
        subtitle: outroUnlocked
          ? 'Tamat Bab 5 beserta bocoran siluet misterius Bab 6!'
          : 'Kalahkan Bos Bab 5 untuk membuka adegan penutup.',
        unlocked: outroUnlocked,
      },
      secret: {
        id: 'secret_7d' as CutsceneId,
        title: 'Ending Spesial: Sahabat Abadi 7 Hari',
        subtitle: secretUnlocked
          ? 'Kenangan istimewa menyelesaikan Misi Harian 7 hari berturut-turut!'
          : 'Selesaikan Misi Harian 7 hari beruntun untuk membuka ending rahasia.',
        unlocked: secretUnlocked,
      },
    };
  }, [progress.completed, progress.outroSeen, progress.daily]);

  return (
    <section
      aria-label="Profil, Statistik, dan Cutscene Pencapaian"
      className="w-full rounded-3xl game-panel p-4 sm:p-5 space-y-4"
    >
      {/* Player Profile Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#BAE6FD]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FDE047] to-[#F59E0B] border-2 border-[#FEF9C3] flex items-center justify-center shadow-md shrink-0">
            <Award className="w-6 h-6 text-[#451A03]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-base sm:text-lg text-[#0D354C] leading-tight">
                Profil · {rank.title}
              </h2>
              <span className="px-2 py-0.5 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/50 font-mono text-[11px] font-extrabold text-[#92400E] tabular-nums">
                {unlockedCount}/{badges.length} Badge
              </span>
            </div>
            <p className="text-xs text-[#35637A] font-medium mt-0.5">{rank.subtitle}</p>
          </div>
        </div>

        {/* Compact Stat Strip */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold tabular-nums">
          <span className="px-2.5 py-1 rounded-xl bg-[#EBF8FF] border border-[#BAE6FD] text-[#0369A1]">
            {completedStages} Stage
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#FEF9C3] border border-[#FDE047] text-[#854D0E]">
            {progress.stats.speedsterCount} Speedster
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]">
            {progress.daily?.bonusPoints ?? 0} Poin Harian
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Badge | Stats | Cutscene */}
      <div
        role="tablist"
        aria-label="Submenu Badge Pencapaian"
        className="grid grid-cols-3 gap-2 rounded-2xl bg-[#E0F2FE]/80 p-1.5 border border-[#BAE6FD]"
      >
        {(
          [
            { id: 'badges' as ProfileTab, label: 'Badge', Icon: Award },
            { id: 'stats' as ProfileTab, label: 'Stats', Icon: BarChart3 },
            { id: 'cutscene' as ProfileTab, label: 'Cutscene', Icon: Film },
          ] as const
        ).map(({ id, label, Icon }) => {
          const isCurrent = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              onClick={() => {
                sound.playPickup();
                setActiveTab(id);
              }}
              className={`min-h-[42px] px-3 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#FEF08A] to-[#FBBF24] text-[#291802] shadow border border-[#F59E0B]/40'
                  : 'text-[#0D354C] hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACHIEVEMENT BADGES */}
      {activeTab === 'badges' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {badges.map((badge) => {
              const style = TONE_STYLES[badge.tone];
              const isSelected = selectedBadge?.id === badge.id;
              const isSuper = Boolean(badge.isSuper);

              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    setSelectedBadge(isSelected ? null : badge);
                  }}
                  className={`group relative rounded-2xl p-3 text-left border-2 transition-all active:scale-[0.97] cursor-pointer flex flex-col justify-between gap-2 ${
                    isSuper ? 'col-span-2 sm:col-span-3 lg:col-span-4' : ''
                  } ${
                    badge.unlocked
                      ? isSuper
                        ? 'bg-gradient-to-r from-[#FEF9C3] via-[#FDE68A] to-[#FEF08A] border-[#D97706] shadow-md'
                        : `${style.unlockedBg} shadow-sm`
                      : isSuper
                        ? 'bg-gradient-to-r from-[#FFFBEB]/90 to-[#F8FAFC]/90 border-dashed border-[#F59E0B]/70 text-[#64748B] hover:border-[#D97706]'
                        : `bg-[#F8FAFC]/90 border-dashed border-[#CBD5E1] text-[#64748B] hover:border-[#7DD3FC]`
                  } ${isSelected ? 'ring-2 ring-[#0284C7]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                          badge.unlocked ? style.iconBg : 'bg-[#E2E8F0] text-[#94A3B8]'
                        }`}
                      >
                        {renderBadgeIcon(badge.icon, 'w-5 h-5')}
                      </div>
                      {isSuper && (
                        <span className="rounded-md bg-[#78350F] text-[#FEF08A] px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase">
                          Super Badge
                        </span>
                      )}
                    </div>

                    {badge.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-label="Tercapai" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" aria-label="Belum terbuka" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`font-display font-extrabold text-xs sm:text-[13px] leading-snug ${
                        badge.unlocked ? style.titleColor : 'text-[#475569]'
                      }`}
                    >
                      {badge.title}
                    </div>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] leading-snug text-[#475569] line-clamp-2">
                      {badge.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold tabular-nums mb-1">
                      <span className={badge.unlocked ? 'text-[#059669]' : 'text-[#64748B]'}>
                        {badge.unlocked ? 'Tercapai!' : 'Progres'}
                      </span>
                      <span className={badge.unlocked ? style.titleColor : 'text-[#475569]'}>
                        {badge.current}/{badge.target} {isSuper ? 'Bab' : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
                      <div
                        style={{ width: `${badge.pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          badge.unlocked ? style.barFill : 'bg-[#38BDF8]'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedBadge && (
            <div
              key={selectedBadge.id}
              className="relative rounded-2xl bg-[#EBF8FF] border-2 border-[#7DD3FC] px-4 py-3 flex items-center justify-between gap-3 speech-bubble-pop"
            >
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#0284C7]">
                  {selectedBadge.title} ·{' '}
                  {selectedBadge.unlocked
                    ? 'Sudah Terbuka!'
                    : `Butuh ${selectedBadge.target - selectedBadge.current} lagi`}
                </div>
                <p className="text-xs text-[#1E4E68] mt-0.5 leading-snug font-medium">
                  {selectedBadge.unlocked
                    ? `Kibo: “${selectedBadge.kiboPraise}”`
                    : `Kibo: “${selectedBadge.description}. Semangat kejar ya!”`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="text-xs font-extrabold text-[#0369A1] hover:underline shrink-0 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: D3 LEARNING STATS */}
      {activeTab === 'stats' && <StatsD3Charts progress={progress} />}

      {/* TAB 3: CUTSCENE GALLERY */}
      {activeTab === 'cutscene' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Story Intro */}
            <div className="rounded-2xl bg-[#F0F9FF] border-2 border-[#7DD3FC] p-3.5 flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <AnimatedKibo size="sm" mood="happy" interactive={false} />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                    Adegan Pembuka
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-[#0D354C] leading-snug">
                    {cutsceneEntries.intro.title}
                  </h3>
                  <p className="text-[11px] text-[#35637A] mt-0.5 leading-snug">
                    {cutsceneEntries.intro.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playPickup();
                  onPlayCutscene(cutsceneEntries.intro.id);
                }}
                className="game-btn-gold w-full min-h-[40px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                <span>Tonton Intro</span>
              </button>
            </div>

            {/* Bab 5 Outro Ending */}
            <div
              className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between gap-3 ${
                cutsceneEntries.outro.unlocked
                  ? 'bg-[#FFFBEB] border-[#F59E0B]'
                  : 'bg-[#F8FAFC] border-dashed border-[#CBD5E1] opacity-85'
              }`}
            >
              <div className="flex items-start gap-3">
                <AnimatedKibo
                  size="sm"
                  crown={cutsceneEntries.outro.unlocked}
                  mood={cutsceneEntries.outro.unlocked ? 'excited' : 'thinking'}
                  interactive={false}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B45309]">
                    Adegan Penutup
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-[#0D354C] leading-snug">
                    {cutsceneEntries.outro.title}
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                    {cutsceneEntries.outro.subtitle}
                  </p>
                </div>
              </div>
              {cutsceneEntries.outro.unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    onPlayCutscene(cutsceneEntries.outro.id);
                  }}
                  className="game-btn-gold w-full min-h-[40px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Tonton Outro</span>
                </button>
              ) : (
                <div className="min-h-[40px] rounded-xl bg-[#E2E8F0] text-[#64748B] text-xs font-extrabold inline-flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Terkunci</span>
                </div>
              )}
            </div>

            {/* 7-Day Secret Ending */}
            <div
              className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between gap-3 ${
                cutsceneEntries.secret.unlocked
                  ? 'bg-[#FAF5FF] border-[#A855F7]'
                  : 'bg-[#F8FAFC] border-dashed border-[#CBD5E1] opacity-85'
              }`}
            >
              <div className="flex items-start gap-3">
                <AnimatedKibo
                  size="sm"
                  crown={cutsceneEntries.secret.unlocked}
                  highFiveRaised={cutsceneEntries.secret.unlocked}
                  mood={cutsceneEntries.secret.unlocked ? 'giggle' : 'idle'}
                  interactive={false}
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7E22CE]">
                    Ending Rahasia
                  </span>
                  <h3 className="font-display font-extrabold text-sm text-[#0D354C] leading-snug">
                    {cutsceneEntries.secret.title}
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-0.5 leading-snug">
                    {cutsceneEntries.secret.subtitle}
                  </p>
                </div>
              </div>
              {cutsceneEntries.secret.unlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    onPlayCutscene(cutsceneEntries.secret.id);
                  }}
                  className="game-btn-emerald w-full min-h-[40px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Putar Ending Spesial</span>
                </button>
              ) : (
                <div className="min-h-[40px] rounded-xl bg-[#E2E8F0] text-[#64748B] text-xs font-extrabold inline-flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Terkunci ({Math.min(7, progress.daily?.streakDays ?? 0)}/7 Hari)</span>
                </div>
              )}
            </div>
          </div>

          {/* Boss Encounter Cutscenes */}
          <div>
            <h3 className="font-display font-extrabold text-sm text-[#0D354C] mb-2">
              Kemunculan Para Bos Penjaga (Bab 0 – Bab 5)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {cutsceneEntries.bosses.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border-2 p-3 flex flex-col justify-between gap-2.5 ${
                    item.unlocked
                      ? 'bg-white/95 border-[#BAE6FD]'
                      : 'bg-[#F8FAFC]/90 border-dashed border-[#CBD5E1] opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.chapterId === 5 && !progress.completed['5-boss'] ? (
                      <div className="w-12 h-12 rounded-xl bg-[#1E1B4B] border-2 border-[#E879F9]/75 flex items-center justify-center shrink-0">
                        <span className="font-display font-extrabold text-2xl text-[#F0ABFC]">
                          ?
                        </span>
                      </div>
                    ) : (
                      <div className={!item.unlocked ? 'grayscale opacity-65' : ''}>
                        <AnimatedBoss
                          chapterId={item.chapterId}
                          state="idle"
                          phonkPlaying={false}
                          size="sm"
                          interactive={false}
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-display font-extrabold text-xs sm:text-sm text-[#0D354C] leading-snug">
                        {item.title}
                      </div>
                      <p className="text-[11px] text-[#475569] leading-snug line-clamp-2">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {item.unlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        sound.playPickup();
                        onPlayCutscene(item.id);
                      }}
                      className="game-btn-wood w-full min-h-[38px] rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#0284C7]" aria-hidden="true" />
                      <span>Tonton Kemunculan Bos</span>
                    </button>
                  ) : (
                    <div className="min-h-[38px] rounded-xl bg-[#E2E8F0] text-[#64748B] text-[11px] font-extrabold inline-flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Terkunci</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

