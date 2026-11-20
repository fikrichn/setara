import React from 'react';
import { CalendarCheck2, CheckCircle2, Crown, Flame, Gift, Sparkles } from 'lucide-react';
import { EvaluatedDailyMission, evaluateDailyMissions } from '../game/dailyMissions';
import { ProgressStore } from '../game/types';

interface DailyMissionsCardProps {
  progress: ProgressStore;
  onClaimMission: (mission: EvaluatedDailyMission) => void;
  onWatchSpecialEnding?: () => void;
  compact?: boolean;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  progress,
  onClaimMission,
  onWatchSpecialEnding,
  compact = false,
}) => {
  const missions = evaluateDailyMissions(progress);
  const completedCount = missions.filter((m) => m.completed).length;
  const streakDays = progress.daily?.streakDays ?? 0;
  const specialUnlocked = Boolean(progress.daily?.specialEndingUnlocked || streakDays >= 7);

  return (
    <section
      aria-label="Misi Harian"
      className={`rounded-3xl game-panel ${compact ? 'p-4' : 'p-4 sm:p-5'} space-y-3`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#BAE6FD]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shadow-sm shrink-0">
            <CalendarCheck2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm sm:text-base text-[#0D354C] leading-tight">
              Misi Harian ({completedCount}/{missions.length})
            </h2>
            <p className="text-[11px] font-semibold text-[#35637A]">
              +5 Poin/misi · Tuntaskan 7 hari beruntun untuk Ending Spesial Kibo &amp; Badge!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-extrabold tabular-nums">
          <span className="inline-flex items-center gap-1 text-[#D97706]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            {progress.daily?.bonusPoints ?? 0} Poin
          </span>
          <span
            className={`inline-flex items-center gap-0.5 ${
              streakDays > 0 ? 'text-[#E11D48]' : 'text-[#64748B]'
            }`}
            title="Beruntun harian menuju 7 hari Ending Spesial Kibo"
          >
            <Flame className="w-3.5 h-3.5" aria-hidden="true" />
            {Math.min(7, streakDays)}/7 Hari
          </span>
        </div>
      </div>

      {/* 7-Day Consecutive Streak Bar */}
      <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-extrabold text-[#92400E] mr-1">
            Streak 7 Hari:
          </span>
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const filled = specialUnlocked || streakDays >= day;
            return (
              <span
                key={day}
                className={`w-5 h-5 rounded-md font-mono text-[10px] font-extrabold inline-flex items-center justify-center border ${
                  filled
                    ? 'bg-[#F59E0B] border-[#B45309] text-white'
                    : 'bg-white border-[#FCD34D] text-[#92400E]/60'
                }`}
              >
                {day === 7 ? '★' : day}
              </span>
            );
          })}
        </div>

        {specialUnlocked && onWatchSpecialEnding ? (
          <button
            type="button"
            onClick={onWatchSpecialEnding}
            className="game-btn-gold inline-flex items-center gap-1 min-h-[30px] px-2.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Tonton Ending Spesial Kibo</span>
          </button>
        ) : (
          <span className="text-[10px] font-bold text-[#78350F]">
            Hadiah hari ke-7: Ending Spesial + Badge
          </span>
        )}
      </div>

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`rounded-2xl border-2 p-3 flex flex-col justify-between gap-2 transition-colors ${
              mission.claimed
                ? 'bg-[#ECFDF5] border-[#6EE7B7]'
                : mission.completed
                  ? 'bg-[#FFFBEB] border-[#F59E0B]'
                  : 'bg-[#F0F9FF] border-[#BAE6FD]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-display font-extrabold text-xs sm:text-sm text-[#0D354C]">
                  {mission.title}
                </div>
                <p className="text-[11px] text-[#35637A] leading-snug mt-0.5">
                  {mission.description}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-extrabold text-[#0284C7] tabular-nums">
                {mission.current}/{mission.target}
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-black/10 overflow-hidden">
              <div
                style={{ width: `${mission.pct}%` }}
                className={`h-full rounded-full transition-all duration-300 ${
                  mission.claimed
                    ? 'bg-[#10B981]'
                    : mission.completed
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#0284C7]'
                }`}
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[10px] font-bold text-[#92400E] truncate">
                +{mission.bonusPoints} Poin · {mission.badgeBoostLabel}
              </span>

              {mission.claimed ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#059669] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Diklaim
                </span>
              ) : mission.completed ? (
                <button
                  type="button"
                  onClick={() => onClaimMission(mission)}
                  className="game-btn-gold inline-flex items-center gap-1 min-h-[34px] px-3 rounded-xl text-[11px] font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Klaim</span>
                </button>
              ) : (
                <span className="text-[10px] font-bold text-[#4B7A91] shrink-0">Berjalan</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
