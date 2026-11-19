import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Award,
  Brain,
  CheckCircle2,
  Crown,
  Flame,
  Heart,
  Lock,
  Shuffle,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  BadgeIconKey,
  BadgeTone,
  EvaluatedBadge,
  evaluateBadges,
  getPlayerRank,
} from '../game/achievements';
import { sound } from '../game/sound';
import { ProgressStore } from '../game/types';

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
  }
}

interface ProfileBadgesCardProps {
  progress: ProgressStore;
}

export const ProfileBadgesCard: React.FC<ProfileBadgesCardProps> = ({ progress }) => {
  const badges = evaluateBadges(progress);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const rank = getPlayerRank(progress);
  const [selectedBadge, setSelectedBadge] = useState<EvaluatedBadge | null>(null);

  const completedStages = Object.keys(progress.completed).length;

  return (
    <section
      aria-label="Profil dan Badge Pencapaian"
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
          <span className="px-2.5 py-1 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309]">
            {progress.stats.flawlessStageIds.length} Tanpa Salah
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C]">
            {progress.stats.retryCount}× Ulang
          </span>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {badges.map((badge) => {
          const style = TONE_STYLES[badge.tone];
          const isSelected = selectedBadge?.id === badge.id;

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => {
                sound.playPickup();
                setSelectedBadge(isSelected ? null : badge);
              }}
              className={`group relative rounded-2xl p-3 text-left border-2 transition-all active:scale-[0.97] cursor-pointer flex flex-col justify-between gap-2 ${
                badge.unlocked
                  ? `${style.unlockedBg} shadow-sm ${isSelected ? 'ring-2 ring-[#0284C7]' : ''}`
                  : `bg-[#F8FAFC]/90 border-dashed border-[#CBD5E1] text-[#64748B] hover:border-[#7DD3FC] ${
                      isSelected ? 'ring-2 ring-[#38BDF8]' : ''
                    }`
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    badge.unlocked ? style.iconBg : 'bg-[#E2E8F0] text-[#94A3B8]'
                  }`}
                >
                  {renderBadgeIcon(badge.icon, 'w-5 h-5')}
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
                <p className="mt-0.5 text-[10px] leading-snug text-[#475569] line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold tabular-nums mb-1">
                  <span className={badge.unlocked ? 'text-[#059669]' : 'text-[#64748B]'}>
                    {badge.unlocked ? 'Tercapai!' : 'Progres'}
                  </span>
                  <span className={badge.unlocked ? style.titleColor : 'text-[#475569]'}>
                    {badge.current}/{badge.target}
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

      {/* Interactive Badge Detail Strip when tapped */}
      {selectedBadge && (
        <div className="rounded-2xl bg-[#EBF8FF] border border-[#7DD3FC] px-3.5 py-2.5 flex items-center justify-between gap-3 animate-pop-in">
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-[#0284C7]">
              {selectedBadge.title} ·{' '}
              {selectedBadge.unlocked
                ? 'Sudah Terbuka!'
                : `Butuh ${selectedBadge.target - selectedBadge.current} lagi`}
            </div>
            <p className="text-xs text-[#1E4E68] mt-0.5 leading-snug">
              {selectedBadge.unlocked
                ? `Kibo: “${selectedBadge.kiboPraise}”`
                : `Cara mendapatkannya: ${selectedBadge.description}.`}
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
    </section>
  );
};
