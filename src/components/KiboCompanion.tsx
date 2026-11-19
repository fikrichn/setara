import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Crown, Hand, Heart, RotateCcw, Star } from 'lucide-react';
import { sound } from '../game/sound';
import { BossConfig, TutorialStep } from '../game/types';

export const KIBO_AVATAR_SRC = '/src/assets/images/avatar_hiu_gemoy_1795080569317.jpg';
export const KIBO_CELEBRATION_SRC = '/src/assets/images/kibo_boss_celebration_1795087054242.jpg';

export const KiboAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; animate?: boolean }> = ({
  size = 'md',
  animate = true,
}) => {
  const [failed, setFailed] = useState(false);
  const dim =
    size === 'sm'
      ? 'w-11 h-11 rounded-xl'
      : size === 'lg'
        ? 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl'
        : 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl';

  return (
    <div
      className={`${dim} shrink-0 overflow-hidden bg-[#D5F5EB] border-2 border-[#F5C156]/80 shadow-md flex items-center justify-center ${
        animate ? 'animate-kibo-waddle' : ''
      }`}
    >
      {!failed ? (
        <img
          src={KIBO_AVATAR_SRC}
          alt="Kibo, avatar hiu imut berkaki dan gemoy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-display font-extrabold text-xs text-[#0B3B2E]">Kibo</span>
      )}
    </div>
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
  if (!step) return null;
  const isLast = currentIndex >= steps.length - 1;

  return (
    <div
      role="region"
      aria-label="Tutorial Kibo si Hiu Gemoy"
      className="rounded-2xl bg-[#13382D] border-2 border-[#F5C156] p-3.5 sm:p-4 shadow-xl animate-pop-in"
    >
      <div className="flex items-start gap-3.5">
        <KiboAvatar size="md" animate />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#FDE68A]">
              Kibo si Hiu Gemoy · Panduan {currentIndex + 1}/{steps.length}
            </span>
            {!isLast && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-semibold text-[#9EC2B5] hover:text-white cursor-pointer"
              >
                Lewati
              </button>
            )}
          </div>

          <h3 className="mt-0.5 font-display font-bold text-base text-white">{step.title}</h3>
          <p className="mt-1 text-sm text-[#D6EAE2] leading-relaxed">{step.message}</p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onNext}
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
  phaseIndex: number;
  isHit: boolean;
  dialogue: string;
}

export const BossArenaBanner: React.FC<BossArenaBannerProps> = ({
  boss,
  phaseIndex,
  isHit,
  dialogue,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const totalHp = boss.phases.length;
  const currentHp = Math.max(0, totalHp - phaseIndex);
  const currentPhase = boss.phases[Math.min(phaseIndex, totalHp - 1)];

  return (
    <div
      className={`rounded-2xl bg-[#102620] text-white border-2 border-[#D4A853]/70 p-3 sm:p-3.5 flex items-center gap-3.5 shadow-lg transition-colors ${
        isHit ? 'animate-boss-shake bg-[#4A1419] border-[#F87171]' : ''
      }`}
    >
      <div className="w-15 h-15 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-[#1D3B31] border-2 border-[#F5C156] shrink-0 flex items-center justify-center">
        {!imgFailed ? (
          <img
            src={boss.artwork}
            alt={boss.name}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Crown className="w-8 h-8 text-[#F5A623]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FDE68A] min-w-0">
            <Crown className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" aria-hidden="true" />
            <span className="truncate">{boss.name}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#A7C4B9] font-semibold truncate">{currentPhase?.label}</span>
          </div>

          <div
            className="flex items-center gap-1.5 shrink-0"
            aria-label={`Nyawa Bos ${currentHp} dari ${totalHp}`}
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: totalHp }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-transform duration-200 ${
                    i < currentHp
                      ? 'text-[#EF4444] fill-[#EF4444] scale-100'
                      : 'text-[#3F5E53] fill-transparent scale-75'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-[#FDE68A] tabular-nums">
              HP {currentHp}/{totalHp}
            </span>
          </div>
        </div>

        <p className="mt-1 text-xs sm:text-sm text-[#E2EFEA] leading-snug">“{dialogue}”</p>
      </div>
    </div>
  );
};

// =========================================================================
// BOSS VICTORY CELEBRATION: KIBO HIGH-FIVE & CHEERING ANIMATION!
// =========================================================================

const CONFETTI_PIECES = [
  { left: '8%', color: '#FBBF24', drift: '28px', dur: '1.7s', delay: '0s' },
  { left: '16%', color: '#34D399', drift: '-22px', dur: '1.9s', delay: '0.15s' },
  { left: '24%', color: '#F472B6', drift: '30px', dur: '1.6s', delay: '0.3s' },
  { left: '34%', color: '#FDE68A', drift: '-18px', dur: '2.0s', delay: '0.1s' },
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
  hasNextLevel,
  onNextLevel,
  onReplay,
  onExit,
}) => {
  const [highFived, setHighFived] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const handleHighFive = () => {
    sound.playHighFive();
    setHighFived(true);
    setBurstKey((k) => k + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#061510]/85 backdrop-blur-sm p-4 overflow-y-auto"
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
        className="relative w-full max-w-md rounded-3xl game-panel border-2 border-[#F5C156] p-6 sm:p-7 text-center text-white overflow-hidden"
      >
        {/* Top Victory Crown Label */}
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-[#FDE68A]">
          <Crown className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
          <span>BOS BAB {chapterId} TAKLUK · {totalMoves} LANGKAH</span>
        </div>

        <h2
          id="boss-victory-title"
          className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-white"
        >
          {highFived ? 'TOS!! JUARA SEJATI!' : `${boss.name} Kalah!`}
        </h2>

        {/* Interactive Kibo High-Five Stage */}
        <div className="relative mt-4 flex flex-col items-center">
          {burstKey > 0 && (
            <div
              key={burstKey}
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-4 border-[#FDE68A] animate-shockwave"
            />
          )}

          <motion.button
            type="button"
            onClick={handleHighFive}
            animate={
              highFived
                ? { y: [0, -18, 0, -10, 0], scale: [1, 1.12, 0.98, 1.06, 1], rotate: [0, -4, 4, 0] }
                : { y: [0, -6, 0] }
            }
            transition={
              highFived
                ? { duration: 0.55, ease: 'easeOut' }
                : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            }
            aria-label="Ketuk Kibo untuk tos perayaan kemenangan"
            className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-3 border-[#FDE68A] shadow-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FBBF24]"
          >
            {!imgFailed ? (
              <img
                src={KIBO_CELEBRATION_SRC}
                alt="Kibo si Hiu Gemoy melompat senang sambil mengangkat sirip untuk tos"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#145343] flex items-center justify-center font-display font-extrabold text-2xl text-[#FDE68A]">
                Kibo Tos!
              </div>
            )}

            {highFived && (
              <motion.div
                key={`badge-${burstKey}`}
                initial={{ opacity: 0, scale: 0.4, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute top-2.5 right-2.5 rounded-xl bg-[#FBBF24] text-[#11241E] font-display font-extrabold text-sm px-2.5 py-1 shadow-lg"
              >
                TOS!
              </motion.div>
            )}
          </motion.button>

          {/* Interactive High-Five Button */}
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
                    ? 'text-[#FBBF24] fill-[#FBBF24] drop-shadow'
                    : 'text-[#315549] fill-[#17352B]'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Kibo Positive Reinforcement Speech */}
        <div className="mt-3 rounded-2xl bg-[#0C231C]/85 border border-[#2C5B4B] px-4 py-3 text-sm text-[#DDF0E8] leading-snug">
          {highFived ? (
            <span>
              <strong className="text-[#FDE68A]">Kibo:</strong> “YEAY! TOS MANTAP! Kamu hebat banget
              bisa ngalahin {boss.name}! Hasil akhir <strong className="font-mono text-[#5EEAD4]">{displayResult}</strong>!”
            </span>
          ) : (
            <span>
              <strong className="text-[#FDE68A]">Kibo:</strong> “Horeee! {boss.name} berhasil kamu
              kalahkan! Ayo ketuk siripku buat tos dulu!”
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
