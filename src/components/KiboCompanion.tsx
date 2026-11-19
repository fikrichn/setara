import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Crown, Hand, Heart, RotateCcw, Star } from 'lucide-react';
import { sound } from '../game/sound';
import { BossConfig, TutorialStep } from '../game/types';
import { AnimatedBoss, BossAnimState, BossVariant } from './AnimatedBoss';
import { AnimatedKibo, KiboMood } from './AnimatedKibo';

export type { KiboMood };

export const KiboAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  mood?: KiboMood;
  crown?: boolean;
  highFiveRaised?: boolean;
  interactive?: boolean;
  onInteract?: (quip: string) => void;
}> = ({
  size = 'md',
  animate = true,
  mood,
  crown = false,
  highFiveRaised = false,
  interactive = true,
  onInteract,
}) => {
  const resolvedMood: KiboMood = mood ?? (animate ? 'happy' : 'idle');
  return (
    <AnimatedKibo
      size={size}
      mood={resolvedMood}
      crown={crown}
      highFiveRaised={highFiveRaised}
      interactive={interactive}
      onInteract={onInteract}
    />
  );
};

interface KiboTutorialCardProps {
  steps: TutorialStep[];
  currentIndex: number;
  onNext: () => void;
  onSkip: () => void;
}

export const KiboTutorialCard: React.FC<KiboTutorialCardProps> = ({
  steps,
  currentIndex,
  onNext,
  onSkip,
}) => {
  const step = steps[currentIndex];
  const [tapQuip, setTapQuip] = useState<string | null>(null);
  if (!step) return null;
  const isLast = currentIndex >= steps.length - 1;

  return (
    <div
      role="region"
      aria-label="Tutorial Kibo si Hiu Gemoy"
      className="rounded-2xl bg-[#FFFDF4] border-2 border-[#F59E0B] p-3.5 sm:p-4 shadow-lg animate-pop-in text-[#0D354C]"
    >
      <div className="flex items-start gap-3.5">
        <KiboAvatar
          size="md"
          mood={isLast ? 'excited' : 'thinking'}
          interactive
          onInteract={(q) => setTapQuip(q)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#B45309]">
              Kibo si Hiu Gemoy · Panduan {currentIndex + 1}/{steps.length}
            </span>
            {!isLast && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-bold text-[#3B6D84] hover:text-[#0D354C] cursor-pointer"
              >
                Lewati
              </button>
            )}
          </div>

          <h3 className="mt-0.5 font-display font-extrabold text-base text-[#0D354C]">
            {step.title}
          </h3>
          <p className="mt-1 text-sm text-[#24536B] leading-relaxed">
            {tapQuip ? tapQuip : step.message}
          </p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setTapQuip(null);
                onNext();
              }}
              className="game-btn-gold inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold transition-transform whitespace-nowrap cursor-pointer"
            >
              <span>{step.buttonLabel || (isLast ? 'Ayo Coba!' : 'Lanjut')}</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BossArenaBannerProps {
  boss: BossConfig;
  chapterId: number;
  phaseIndex: number;
  isHit: boolean;
  dialogue: string;
  phonkActive: boolean;
  onBossTaunt: () => void;
}

const EQ_BARS = [
  { dur: '0.38s', delay: '0s' },
  { dur: '0.44s', delay: '0.12s' },
  { dur: '0.32s', delay: '0.22s' },
  { dur: '0.46s', delay: '0.07s' },
];

export const BossArenaBanner: React.FC<BossArenaBannerProps> = ({
  boss,
  chapterId,
  phaseIndex,
  isHit,
  dialogue,
  phonkActive,
  onBossTaunt,
}) => {
  const totalHp = boss.phases.length;
  const currentHp = Math.max(0, totalHp - phaseIndex);
  const currentPhase = boss.phases[Math.min(phaseIndex, totalHp - 1)];

  const variant: BossVariant = boss.artwork.includes('raja_timbangan') ? 'owl' : 'turtle';
  const bossState: BossAnimState =
    currentHp <= 0 ? 'defeated' : isHit ? 'hit' : currentHp === 1 ? 'enraged' : 'idle';

  return (
    <div
      className={`relative rounded-2xl text-white border-2 p-3 sm:p-3.5 flex items-center gap-3.5 shadow-lg transition-colors ${
        isHit
          ? 'animate-boss-shake bg-[#7F1D1D] border-[#FCA5A5]'
          : bossState === 'enraged'
            ? 'bg-gradient-to-r from-[#4C1D3D] to-[#701A3B] border-[#FB7185]'
            : 'bg-gradient-to-r from-[#0F3854] to-[#165378] border-[#FBBF24]'
      }`}
    >
      {/* Floating -1 HP Damage Number on Boss Hit */}
      {isHit && (
        <div
          key={`dmg-${phaseIndex}`}
          className="pointer-events-none absolute left-10 -top-2 z-30 font-display font-extrabold text-xl sm:text-2xl text-[#FEF08A] drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)] animate-damage-float"
        >
          -1 HP!
        </div>
      )}

      <AnimatedBoss
        variant={variant}
        chapterId={chapterId}
        state={bossState}
        phonkPlaying={phonkActive}
        onTaunt={onBossTaunt}
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FEF08A] min-w-0">
            <Crown className="w-3.5 h-3.5 shrink-0 text-[#FBBF24]" aria-hidden="true" />
            <span className="truncate">{boss.name}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#BAE6FD] font-semibold truncate">{currentPhase?.label}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live Non-Disableable Phonk Beat Indicator */}
            {phonkActive && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B1226]/80 border border-[#FB7185]/60 text-[11px] font-extrabold text-[#FEF08A]"
                aria-label="Musik Phonk Bos sedang diputar"
              >
                <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
                  {EQ_BARS.map((bar, idx) => (
                    <span
                      key={idx}
                      style={
                        {
                          '--bar-dur': bossState === 'enraged' ? '0.28s' : bar.dur,
                          '--bar-delay': bar.delay,
                        } as React.CSSProperties
                      }
                      className="w-[2.5px] h-full rounded-full bg-[#FB7185] phonk-eq-bar"
                    />
                  ))}
                </span>
                <span>PHONK</span>
              </div>
            )}

            {/* Boss HP Hearts */}
            <div
              className="flex items-center gap-1.5"
              aria-label={`Nyawa Bos ${currentHp} dari ${totalHp}`}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: totalHp }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-4 h-4 transition-transform duration-200 ${
                      i < currentHp
                        ? 'text-[#FB7185] fill-[#FB7185] scale-100'
                        : 'text-[#64748B] fill-transparent scale-75'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-[#FEF08A] tabular-nums">
                {currentHp}/{totalHp}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-1 text-xs sm:text-sm text-[#F0F9FF] leading-snug">“{dialogue}”</p>
      </div>
    </div>
  );
};

// =========================================================================
// BOSS VICTORY CELEBRATION: INTERACTIVE ANIME KIBO HIGH-FIVE & CHEERING!
// =========================================================================

const CONFETTI_PIECES = [
  { left: '8%', color: '#FBBF24', drift: '28px', dur: '1.7s', delay: '0s' },
  { left: '16%', color: '#38BDF8', drift: '-22px', dur: '1.9s', delay: '0.15s' },
  { left: '24%', color: '#FB7185', drift: '30px', dur: '1.6s', delay: '0.3s' },
  { left: '34%', color: '#FDE047', drift: '-18px', dur: '2.0s', delay: '0.1s' },
  { left: '46%', color: '#2DD4BF', drift: '24px', dur: '1.75s', delay: '0.25s' },
  { left: '56%', color: '#FB923C', drift: '-26px', dur: '1.85s', delay: '0.05s' },
  { left: '66%', color: '#FBBF24', drift: '20px', dur: '1.65s', delay: '0.35s' },
  { left: '76%', color: '#34D399', drift: '-28px', dur: '1.95s', delay: '0.2s' },
  { left: '86%', color: '#38BDF8', drift: '18px', dur: '1.8s', delay: '0.12s' },
  { left: '92%', color: '#FDE68A', drift: '-20px', dur: '1.7s', delay: '0.28s' },
];

interface KiboBossCelebrationProps {
  boss: BossConfig;
  chapterId: number;
  stars: number;
  totalMoves: number;
  displayResult: string;
  resultNode?: React.ReactNode;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onExit: () => void;
}

export const KiboBossCelebration: React.FC<KiboBossCelebrationProps> = ({
  boss,
  chapterId,
  stars,
  totalMoves,
  displayResult,
  resultNode,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onExit,
}) => {
  const [highFived, setHighFived] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const handleHighFive = () => {
    sound.playHighFive();
    setHighFived(true);
    setBurstKey((k) => k + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/70 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-victory-title"
    >
      {/* Celebratory Confetti Curtain */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {CONFETTI_PIECES.map((p, idx) => (
          <span
            key={idx}
            style={
              {
                left: p.left,
                top: '-8px',
                backgroundColor: p.color,
                '--drift': p.drift,
                '--dur': p.dur,
                '--delay': p.delay,
              } as React.CSSProperties
            }
            className="absolute w-3 h-3 rounded-xs animate-confetti"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.78, y: 36 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative w-full max-w-md rounded-3xl game-panel border-3 border-[#F59E0B] p-6 sm:p-7 text-center overflow-hidden shadow-2xl"
      >
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#B45309]">
          <Crown className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
          <span>BOS BAB {chapterId} TAKLUK · {totalMoves} LANGKAH</span>
        </div>

        <h2
          id="boss-victory-title"
          className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]"
        >
          {highFived ? 'TOS!! JUARA PANTAI!' : `${boss.name} Kalah!`}
        </h2>

        {/* Interactive Anime Kibo High-Five Stage */}
        <div className="relative mt-4 flex flex-col items-center">
          {burstKey > 0 && (
            <div
              key={burstKey}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-4 border-[#F59E0B] animate-shockwave"
            />
          )}

          <motion.button
            type="button"
            onClick={handleHighFive}
            animate={
              highFived
                ? {
                    y: [0, -22, 0, -12, 0],
                    scaleX: [1, 0.92, 1.12, 0.96, 1],
                    scaleY: [1, 1.14, 0.92, 1.06, 1],
                    rotate: [0, -5, 5, 0],
                  }
                : { y: [0, -7, 0] }
            }
            transition={
              highFived
                ? { duration: 0.58, ease: 'easeOut' }
                : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
            }
            aria-label="Tos perayaan kemenangan bersama Kibo"
            className="relative rounded-3xl cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F59E0B]"
          >
            <AnimatedKibo
              size="xl"
              crown
              highFiveRaised
              mood={highFived ? 'excited' : 'happy'}
              interactive={false}
              className="border-3 border-[#F59E0B] shadow-xl"
            />

            {highFived && (
              <motion.div
                key={`badge-${burstKey}`}
                initial={{ opacity: 0, scale: 0.4, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-2.5 right-2.5 rounded-xl bg-[#FBBF24] text-[#291802] font-display font-extrabold text-sm px-2.5 py-1 shadow-lg"
              >
                TOS!
              </motion.div>
            )}
          </motion.button>

          <button
            type="button"
            onClick={handleHighFive}
            className={`mt-4 inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
              highFived ? 'game-btn-emerald' : 'game-btn-gold'
            }`}
          >
            <Hand className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{highFived ? 'Tos Lagi Sama Kibo!' : 'Tos Sama Kibo!'}</span>
          </button>
        </div>

        {/* Stars Row */}
        <div
          className="mt-4 flex items-center justify-center gap-2"
          aria-label={`${stars} dari 3 bintang`}
        >
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.12 * n, type: 'spring', stiffness: 360, damping: 20 }}
            >
              <Star
                className={`w-8 h-8 ${
                  n <= stars
                    ? 'text-[#F59E0B] fill-[#FBBF24] drop-shadow'
                    : 'text-[#CBD5E1] fill-[#E2E8F0]'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Kibo Positive Reinforcement Speech */}
        <div className="mt-3 rounded-2xl bg-[#EBF8FF] border border-[#BAE6FD] px-4 py-3 text-sm text-[#1E4E68] leading-snug">
          {highFived ? (
            <div className="flex flex-col items-center gap-2">
              <span>
                <strong className="text-[#0284C7]">Kibo:</strong> “YEAY! TOS MANTAP! Kamu hebat banget
                bisa ngalahin {boss.name}!”
              </span>
              {resultNode ? (
                <div className="inline-flex items-center justify-center rounded-xl bg-white/85 border border-[#BAE6FD] px-3 py-1.5">
                  {resultNode}
                </div>
              ) : (
                <strong className="font-mono text-[#0D9488]">{displayResult}</strong>
              )}
            </div>
          ) : (
            <span>
              <strong className="text-[#0284C7]">Kibo:</strong> “Horeee! {boss.name} berhasil kamu
              kalahkan! Ayo tos sama siripku dulu!”
            </span>
          )}
        </div>

        {/* Chunky Game Navigation Buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onReplay}
            className="game-btn-wood flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Ulangi</span>
          </button>

          {hasNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
            >
              <span>Lanjut Bab Baru</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onExit}
              className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
            >
              <span>Kembali ke Peta</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
