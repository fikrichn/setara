import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Clock,
  Crown,
  Hand,
  Heart,
  RotateCcw,
  Snowflake,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { sound } from '../game/sound';
import { BossConfig, TutorialStep } from '../game/types';
import {
  AnimatedBoss,
  BossAnimState,
  getBossVariantForChapter,
} from './AnimatedBoss';
import { AnimatedKibo, KiboMood, KiboReaction } from './AnimatedKibo';

export type { KiboMood, KiboReaction };

type ActiveKiboReaction = Exclude<KiboReaction, 'none' | 'fainted'>;

const CHAPTER_REACTION_POOLS: Record<number, ActiveKiboReaction[]> = {
  0: ['bubble_blow', 'happy_dance', 'treasure_sparkle', 'thinking_pose', 'cheer_jump'],
  1: ['pirate_salute', 'surfer_wave', 'happy_dance', 'thinking_pose', 'cheer_jump'],
  2: ['treasure_sparkle', 'thinking_pose', 'happy_dance', 'cheer_jump', 'bubble_blow'],
  3: ['thinking_pose', 'bubble_blow', 'surfer_wave', 'happy_dance', 'cheer_jump'],
  4: ['surfer_wave', 'pirate_salute', 'thinking_pose', 'cheer_jump', 'happy_dance'],
  5: ['cosmic_float', 'thinking_pose', 'cheer_jump', 'happy_dance', 'treasure_sparkle'],
};

const DEFAULT_REACTION_POOL: ActiveKiboReaction[] = [
  'happy_dance',
  'thinking_pose',
  'cheer_jump',
  'bubble_blow',
  'surfer_wave',
  'treasure_sparkle',
];

const CHAPTER_QUIPS: Record<number, string[]> = {
  0: [
    'Blub-blub! Di Bab 0 kita main simbol pantai tanpa angka, seru kan!',
    'Ayo buat Peti Pusaka sendirian di satu ruas timbangan!',
    'Pasangan simbol asli dan lawan kalau digabung langsung lenyap!',
  ],
  1: [
    'Siap kapten! Di Bab 1 ingat ya: + pindah ruas jadi −, − jadi +!',
    'Wiuuu! Ombak Bab 1 makin asyik buat pindah ruas angka!',
    'Kalau angka berlawanan bertemu di ruas yang sama, langsung jadi 0!',
  ],
  2: [
    'Kilau emas Bab 2! Gabungkan angka sejenis biar papan makin rapi!',
    'Hmm... angka negatif dan positif kalau pas bakal saling hapus!',
    'Hiu-hiu! Harta karun aljabar Bab 2 menunggumu!',
  ],
  3: [
    'Awas Bab 3! Pengali di depan x kalau pindah ruas berubah jadi bagi!',
    'Pecahan pembagi / kalau menyeberangi = langsung berubah jadi kali!',
    'Tenang dan teliti ya, Kibo selalu joget menyemangatimu!',
  ],
  4: [
    'Keren! Di Bab 4 kumpulkan semua x di satu ruas dan angka di ruas lain!',
    'Lawan ombak Bab 4 dengan tenang — satu kartu tiap langkah!',
    'Siap hormat kapten! Variabel di dua sisi pasti bisa kamu rapikan!',
  ],
  5: [
    'Wuuush! Melayang di dimensi kosmik Bab 5! Buka kurung atau pindah faktor dulu!',
    'Bab terakhir penuh tantangan seru — Kibo percaya kamu bisa!',
    'Tanda kurung di Bab 5 bukan penghalang buat jagoan pindah ruas!',
  ],
};

const DEFAULT_AFK_MS = 60_000;

function pickRandomReaction(
  pool: ActiveKiboReaction[],
  prev: KiboReaction
): ActiveKiboReaction {
  const candidates = pool.filter((r) => r !== prev);
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export const KiboAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  mood?: KiboMood;
  chapterId?: number;
  crown?: boolean;
  highFiveRaised?: boolean;
  interactive?: boolean;
  enableIdleReactions?: boolean;
  afkTimeoutMs?: number;
  customQuips?: string[];
  onInteract?: (quip: string) => void;
  onFaintChange?: (fainted: boolean) => void;
}> = ({
  size = 'md',
  animate = true,
  mood,
  chapterId,
  crown = false,
  highFiveRaised = false,
  interactive = true,
  enableIdleReactions = true,
  afkTimeoutMs = DEFAULT_AFK_MS,
  customQuips,
  onInteract,
  onFaintChange,
}) => {
  const [reaction, setReaction] = useState<KiboReaction>('none');
  const [isFainted, setIsFainted] = useState(false);

  const lastReactionRef = useRef<KiboReaction>('none');
  const reactionClearTimerRef = useRef<number | null>(null);
  const nextAutoTimerRef = useRef<number | null>(null);
  const afkTimerRef = useRef<number | null>(null);
  const lastActivityStampRef = useRef<number>(Date.now());
  const isFaintedRef = useRef(false);
  const onFaintChangeRef = useRef(onFaintChange);

  useEffect(() => {
    onFaintChangeRef.current = onFaintChange;
  }, [onFaintChange]);

  const reactionPool =
    typeof chapterId === 'number' && CHAPTER_REACTION_POOLS[chapterId]
      ? CHAPTER_REACTION_POOLS[chapterId]
      : DEFAULT_REACTION_POOL;

  const resolvedCustomQuips =
    customQuips && customQuips.length > 0
      ? customQuips
      : typeof chapterId === 'number' && CHAPTER_QUIPS[chapterId]
        ? CHAPTER_QUIPS[chapterId]
        : undefined;

  const triggerRandomReaction = useCallback(
    (durationMs = 2600) => {
      const picked = pickRandomReaction(reactionPool, lastReactionRef.current);
      lastReactionRef.current = picked;
      setReaction(picked);
      if (reactionClearTimerRef.current) window.clearTimeout(reactionClearTimerRef.current);
      reactionClearTimerRef.current = window.setTimeout(() => {
        setReaction((curr) => (curr === picked ? 'none' : curr));
      }, durationMs);
    },
    [reactionPool]
  );

  // Trigger a fresh chapter-themed reaction when entering a new chapter
  useEffect(() => {
    if (!enableIdleReactions || mood === 'crying' || typeof chapterId !== 'number') return;
    if (isFaintedRef.current) return;
    triggerRandomReaction(2400);
  }, [chapterId, enableIdleReactions, mood, triggerRandomReaction]);

  // Spontaneous randomized animated reactions based on current chapter
  useEffect(() => {
    if (!enableIdleReactions || !animate || mood === 'crying' || isFainted) {
      if (nextAutoTimerRef.current) window.clearTimeout(nextAutoTimerRef.current);
      return;
    }

    let cancelled = false;
    const scheduleNext = () => {
      const delay = 6500 + Math.floor(Math.random() * 4500);
      nextAutoTimerRef.current = window.setTimeout(() => {
        if (cancelled || isFaintedRef.current) return;
        triggerRandomReaction(2700);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      cancelled = true;
      if (nextAutoTimerRef.current) window.clearTimeout(nextAutoTimerRef.current);
    };
  }, [enableIdleReactions, animate, mood, isFainted, triggerRandomReaction]);

  // 1-minute AFK inactivity detector -> Kibo faints if player is AFK > 1 minute!
  useEffect(() => {
    if (!enableIdleReactions || mood === 'crying' || afkTimeoutMs <= 0) {
      if (afkTimerRef.current) window.clearTimeout(afkTimerRef.current);
      if (isFaintedRef.current) {
        isFaintedRef.current = false;
        setIsFainted(false);
        onFaintChangeRef.current?.(false);
      }
      return;
    }

    const armAfkTimer = () => {
      if (afkTimerRef.current) window.clearTimeout(afkTimerRef.current);
      afkTimerRef.current = window.setTimeout(() => {
        isFaintedRef.current = true;
        setIsFainted(true);
        setReaction('fainted');
        onFaintChangeRef.current?.(true);
      }, afkTimeoutMs);
    };

    const handleUserActivity = () => {
      const now = Date.now();
      if (isFaintedRef.current) {
        isFaintedRef.current = false;
        setIsFainted(false);
        onFaintChangeRef.current?.(false);
        triggerRandomReaction(2000);
        lastActivityStampRef.current = now;
        armAfkTimer();
        return;
      }
      // Throttle timer re-arming during rapid pointer movement
      if (now - lastActivityStampRef.current < 800) return;
      lastActivityStampRef.current = now;
      armAfkTimer();
    };

    armAfkTimer();
    window.addEventListener('pointerdown', handleUserActivity, { passive: true });
    window.addEventListener('pointermove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    return () => {
      if (afkTimerRef.current) window.clearTimeout(afkTimerRef.current);
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('pointermove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [enableIdleReactions, mood, afkTimeoutMs, triggerRandomReaction]);

  useEffect(() => {
    return () => {
      if (reactionClearTimerRef.current) window.clearTimeout(reactionClearTimerRef.current);
      if (nextAutoTimerRef.current) window.clearTimeout(nextAutoTimerRef.current);
      if (afkTimerRef.current) window.clearTimeout(afkTimerRef.current);
    };
  }, []);

  const resolvedMood: KiboMood =
    mood === 'crying' ? 'crying' : isFainted ? 'fainted' : mood ?? (animate ? 'happy' : 'idle');

  const resolvedReaction: KiboReaction =
    mood === 'crying'
      ? 'none'
      : isFainted
        ? 'fainted'
        : mood === 'thinking'
          ? 'thinking_pose'
          : mood === 'oops'
            ? 'none'
            : reaction;

  return (
    <AnimatedKibo
      size={size}
      mood={resolvedMood}
      reaction={resolvedReaction}
      crown={crown}
      highFiveRaised={highFiveRaised}
      interactive={interactive}
      customQuips={resolvedCustomQuips}
      onPet={() => {
        if (isFaintedRef.current) {
          isFaintedRef.current = false;
          setIsFainted(false);
          onFaintChangeRef.current?.(false);
        }
        triggerRandomReaction(2600);
      }}
      onInteract={onInteract}
    />
  );
};

interface KiboTutorialCardProps {
  steps: TutorialStep[];
  currentIndex: number;
  chapterId?: number;
  onNext: () => void;
  onSkip: () => void;
}

export const KiboTutorialCard: React.FC<KiboTutorialCardProps> = ({
  steps,
  currentIndex,
  chapterId,
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
          chapterId={chapterId}
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
  currentHp: number;
  maxHp: number;
  isHit: boolean;
  isHealAnim?: boolean;
  isSpeedUp?: boolean;
  timeSpeedMultiplier?: number;
  isTimeFrozen?: boolean;
  isBossSleeping?: boolean;
  cosmicMode?: boolean;
  mistakesUsed?: number;
  maxMistakes?: number;
  dialogue: string;
  phonkActive: boolean;
  timeLeftSeconds: number;
  totalTimeSeconds: number;
  timeBonusFlash?: boolean;
  timePenaltyFlash?: boolean;
  penaltyFlashText?: string;
  onBossTaunt: () => void;
}

const EQ_BARS = [
  { dur: '0.38s', delay: '0s' },
  { dur: '0.44s', delay: '0.12s' },
  { dur: '0.32s', delay: '0.22s' },
  { dur: '0.46s', delay: '0.07s' },
];

const STAGE_BOSS_THEMES: Record<
  number,
  {
    bgClass: string;
    borderClass: string;
    tagLabel: string;
    tagBg: string;
    accentColor: string;
  }
> = {
  0: {
    bgClass: 'bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#0E7490]',
    borderClass: 'border-[#F0ABFC]',
    tagLabel: 'BOS BAB 0 · CUMI CILIK',
    tagBg: 'bg-[#F0ABFC]/20 border-[#F0ABFC]/60 text-[#FDF4FF]',
    accentColor: '#F0ABFC',
  },
  1: {
    bgClass: 'bg-gradient-to-r from-[#0E7490] via-[#155E75] to-[#B45309]',
    borderClass: 'border-[#FDE047]',
    tagLabel: 'BOS BAB 1 · KAPTEN BUNTAL',
    tagBg: 'bg-[#FDE047]/20 border-[#FDE047]/60 text-[#FEF9C3]',
    accentColor: '#FDE047',
  },
  2: {
    bgClass: 'bg-gradient-to-r from-[#991B1B] via-[#C2410C] to-[#B45309]',
    borderClass: 'border-[#FBBF24]',
    tagLabel: 'BOS BAB 2 · KEPITING EMAS',
    tagBg: 'bg-[#FBBF24]/20 border-[#FBBF24]/60 text-[#FEF3C7]',
    accentColor: '#FBBF24',
  },
  3: {
    bgClass: 'bg-gradient-to-r from-[#115E59] via-[#0F766E] to-[#1E3A5F]',
    borderClass: 'border-[#5EEAD4]',
    tagLabel: 'BOS BAB 3 · KURA MERIAM',
    tagBg: 'bg-[#5EEAD4]/20 border-[#5EEAD4]/60 text-[#CCFBF1]',
    accentColor: '#5EEAD4',
  },
  4: {
    bgClass: 'bg-gradient-to-r from-[#0C4A6E] via-[#0F172A] to-[#0369A1]',
    borderClass: 'border-[#38BDF8]',
    tagLabel: 'BOS BAB 4 · KAPTEN ORCA',
    tagBg: 'bg-[#38BDF8]/20 border-[#38BDF8]/60 text-[#E0F2FE]',
    accentColor: '#38BDF8',
  },
  5: {
    bgClass: 'bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#115E59]',
    borderClass: 'border-[#E879F9]',
    tagLabel: 'BOS AKHIR · EVOLUSI BAB 0',
    tagBg: 'bg-[#E879F9]/25 border-[#E879F9]/70 text-[#FAF5FF]',
    accentColor: '#E879F9',
  },
};

function formatCountdown(sec: number): string {
  const clamped = Math.max(0, Math.floor(sec));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const BossArenaBanner: React.FC<BossArenaBannerProps> = React.memo(({
  boss,
  chapterId,
  phaseIndex,
  currentHp,
  maxHp,
  isHit,
  isHealAnim = false,
  isSpeedUp = false,
  timeSpeedMultiplier = 1,
  isTimeFrozen = false,
  isBossSleeping = false,
  cosmicMode = false,
  mistakesUsed = 0,
  maxMistakes = 0,
  dialogue,
  phonkActive,
  timeLeftSeconds,
  totalTimeSeconds,
  timeBonusFlash = false,
  timePenaltyFlash = false,
  penaltyFlashText,
  onBossTaunt,
}) => {
  const totalPhases = boss.phases.length;
  const currentPhase = boss.phases[Math.min(phaseIndex, totalPhases - 1)];

  const variant = getBossVariantForChapter(chapterId);
  const theme = STAGE_BOSS_THEMES[chapterId] ?? STAGE_BOSS_THEMES[0];
  const bossState: BossAnimState =
    currentHp <= 0
      ? 'defeated'
      : isHit
        ? 'hit'
        : currentHp === 1 || isHealAnim || cosmicMode
          ? 'enraged'
          : 'idle';
  const timePct = Math.max(0, Math.min(100, (timeLeftSeconds / Math.max(1, totalTimeSeconds)) * 100));
  const isTimeCritical = timeLeftSeconds <= 15 || (maxMistakes > 0 && mistakesUsed >= maxMistakes - 1);
  const isTimeWarn = !isTimeCritical && (timeLeftSeconds <= 30 || isSpeedUp);

  return (
    <div
      className={`relative rounded-2xl text-white border-2 p-3 sm:p-4 flex items-center gap-3.5 shadow-lg transition-colors overflow-hidden ${
        isHit
          ? 'animate-boss-shake bg-[#7F1D1D] border-[#FCA5A5]'
          : isHealAnim
            ? 'animate-boss-heal bg-gradient-to-r from-[#064E3B] via-[#0F766E] to-[#0C4A6E] border-[#34D399]'
            : cosmicMode
              ? 'bg-gradient-to-r from-[#1E1045] via-[#581C87] to-[#0E7490] border-[#E879F9] shadow-[0_0_28px_rgba(232,121,249,0.55)]'
              : `${theme.bgClass} ${bossState === 'enraged' ? 'border-[#FDE047]' : theme.borderClass}`
      }`}
    >
      {/* Dedicated Stage 0-5 Subtle Kid-Friendly Animated Backdrop Accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25" aria-hidden="true">
        {chapterId === 0 && (
          <>
            <span className="absolute right-8 top-2 w-4 h-4 rounded-full border-2 border-[#F0ABFC] anime-bubble-rise" />
            <span
              className="absolute right-20 bottom-2 w-3 h-3 rounded-full border-2 border-[#BAE6FD] anime-bubble-rise"
              style={{ animationDelay: '0.9s' }}
            />
          </>
        )}
        {chapterId === 1 && (
          <svg viewBox="0 0 240 40" className="absolute bottom-0 right-0 w-56 h-8 anime-wave-slow">
            <path d="M0 24 Q 30 8 60 24 T 120 24 T 180 24 T 240 24 L240 40 L0 40 Z" fill="#FDE047" />
          </svg>
        )}
        {chapterId === 2 && (
          <>
            <span className="absolute right-10 top-3 w-3 h-3 rounded-full bg-[#FEF08A] anime-gold-glint" />
            <span
              className="absolute right-24 top-6 w-2.5 h-2.5 rounded-full bg-[#FBBF24] anime-gold-glint"
              style={{ animationDelay: '0.5s' }}
            />
            <span
              className="absolute right-16 bottom-3 w-3 h-3 rounded-full bg-[#FEF08A] anime-gold-glint"
              style={{ animationDelay: '0.9s' }}
            />
          </>
        )}
        {chapterId === 3 && (
          <svg viewBox="0 0 240 40" className="absolute bottom-0 right-0 w-56 h-8 anime-wave-mid">
            <path d="M0 22 Q 40 6 80 22 T 160 22 T 240 22 L240 40 L0 40 Z" fill="#5EEAD4" />
          </svg>
        )}
        {chapterId === 4 && (
          <svg viewBox="0 0 240 40" className="absolute bottom-0 right-0 w-60 h-9 anime-wave-mid">
            <path d="M0 20 Q 30 4 60 20 T 120 20 T 180 20 T 240 20 L240 40 L0 40 Z" fill="#38BDF8" />
          </svg>
        )}
        {chapterId === 5 && (
          <svg
            viewBox="0 0 100 100"
            className={`absolute -right-6 -top-6 w-32 h-32 ${cosmicMode ? 'cosmic-vortex opacity-90' : 'anime-gear-cw'}`}
          >
            <circle cx="50" cy="50" r="38" fill="none" stroke="#E879F9" strokeWidth="3" strokeDasharray="8 8" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#22D3EE" strokeWidth="2.5" strokeDasharray="5 6" />
          </svg>
        )}
      </div>

      {/* Floating -1 HP Damage Number on Boss Hit */}
      {isHit && (
        <div
          key={`dmg-${phaseIndex}`}
          className="pointer-events-none absolute left-10 -top-2 z-30 font-display font-extrabold text-xl sm:text-2xl text-[#FEF08A] drop-shadow-[0_2px_8px_rgba(239,68,68,0.9)] animate-damage-float"
        >
          -1 HP!
        </div>
      )}

      {/* Floating HP FULL HEAL Banner for Bab 4 Orca */}
      {isHealAnim && (
        <div className="pointer-events-none absolute left-10 -top-1 z-30 font-display font-extrabold text-base sm:text-xl text-[#6EE7B7] drop-shadow-[0_2px_10px_rgba(16,185,129,0.95)] animate-damage-float whitespace-nowrap">
          HP PULIH PENUH!
        </div>
      )}

      <div className="relative z-10 shrink-0">
        <AnimatedBoss
          variant={variant}
          chapterId={chapterId}
          state={bossState}
          phonkPlaying={phonkActive}
          cosmicMode={cosmicMode}
          isSleeping={isBossSleeping}
          size="lg"
          onTaunt={onBossTaunt}
        />
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[#FEF08A] min-w-0">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold tracking-wide ${theme.tagBg}`}
            >
              <Crown className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{theme.tagLabel}</span>
            </span>
            {cosmicMode && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#A855F7]/80 border border-[#F0ABFC] text-[10px] font-extrabold text-white animate-pulse">
                <Sparkles className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span>COSMIC RUSH {timeSpeedMultiplier}×!</span>
              </span>
            )}
            <span className="text-[#E0F2FE] font-semibold truncate">{currentPhase?.label}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bab 3 Mistake Counter Badge (stays active whether sleeping or awake!) */}
            {maxMistakes > 0 && (
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-mono text-[11px] font-extrabold tabular-nums ${
                  mistakesUsed >= maxMistakes - 1
                    ? 'bg-[#991B1B]/90 border-[#FCA5A5] text-[#FEF08A] animate-pulse'
                    : 'bg-[#0C4A6E]/85 border-[#7DD3FC]/70 text-[#E0F2FE]'
                }`}
                aria-label={`Kesalahan ${mistakesUsed} dari ${maxMistakes}`}
              >
                <span>Salah {mistakesUsed}/{maxMistakes}</span>
              </div>
            )}

            {/* Boss Countdown Timer Badge */}
            <div
              className={`relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-mono text-xs font-extrabold tabular-nums transition-colors ${
                isTimeCritical
                  ? 'bg-[#991B1B]/90 border-[#FCA5A5] text-[#FEF08A] animate-pulse'
                  : isTimeFrozen
                    ? 'bg-[#0369A1]/90 border-[#7DD3FC] text-[#E0F2FE]'
                    : isSpeedUp
                      ? 'bg-[#9A3412]/92 border-[#FDE047] text-[#FEF08A] animate-pulse'
                      : isTimeWarn
                        ? 'bg-[#92400E]/85 border-[#FDE047] text-[#FEF9C3]'
                        : 'bg-[#082F49]/75 border-[#7DD3FC]/55 text-white'
              }`}
              aria-label={`Sisa waktu ${formatCountdown(timeLeftSeconds)}`}
            >
              {isTimeFrozen ? (
                <Snowflake className="w-3.5 h-3.5 shrink-0 text-[#BAE6FD]" aria-hidden="true" />
              ) : isSpeedUp ? (
                <Zap className="w-3.5 h-3.5 shrink-0 text-[#FDE047]" aria-hidden="true" />
              ) : (
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{formatCountdown(timeLeftSeconds)}</span>
              {isTimeFrozen && (
                <span className="ml-0.5 text-[10px] font-extrabold text-[#BAE6FD]">
                  {isBossSleeping ? 'TIDUR · BEKU' : 'BEKU'}
                </span>
              )}
              {isSpeedUp && (
                <span className="ml-0.5 text-[10px] font-extrabold text-[#FEF08A]">
                  {cosmicMode ? `${timeSpeedMultiplier}× COSMIC` : `${timeSpeedMultiplier}× CEPAT`}
                </span>
              )}
              {timeBonusFlash && (
                <span className="pointer-events-none absolute -top-5 right-0 text-[11px] font-extrabold text-[#86EFAC] drop-shadow animate-damage-float whitespace-nowrap">
                  +15 dtk!
                </span>
              )}
              {timePenaltyFlash && (
                <span className="pointer-events-none absolute -top-5 right-0 text-[11px] font-extrabold text-[#FCA5A5] drop-shadow animate-damage-float whitespace-nowrap">
                  {penaltyFlashText || `−${boss.penaltySeconds ?? 30} dtk!`}
                </span>
              )}
            </div>

            {/* Live Non-Disableable Phonk Beat Indicator */}
            {phonkActive && (
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2B1226]/80 border border-[#FB7185]/60 text-[11px] font-extrabold text-[#FEF08A]"
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
              className="flex items-center gap-1"
              aria-label={`Nyawa Bos ${currentHp} dari ${maxHp}`}
            >
              <div className="flex items-center gap-0.5 flex-wrap">
                {Array.from({ length: maxHp }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`${
                      maxHp > 6 ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                    } transition-transform duration-200 ${
                      i < currentHp
                        ? isHealAnim
                          ? 'text-[#34D399] fill-[#34D399] scale-115'
                          : 'text-[#FB7185] fill-[#FB7185] scale-100'
                        : 'text-[#64748B] fill-transparent scale-75'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-[#FEF08A] tabular-nums">
                {currentHp}/{maxHp}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-1 text-xs sm:text-sm text-[#F0F9FF] leading-snug">“{dialogue}”</p>

        {/* Boss Countdown Progress Bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-black/30 overflow-hidden">
          <div
            style={{ width: `${timePct}%` }}
            className={`h-full rounded-full transition-all duration-300 ${
              isTimeCritical
                ? 'bg-[#FB7185]'
                : isTimeFrozen
                  ? 'bg-[#38BDF8]'
                  : cosmicMode
                    ? 'bg-gradient-to-r from-[#E879F9] to-[#22D3EE]'
                    : isSpeedUp || isTimeWarn
                      ? 'bg-[#FBBF24]'
                      : 'bg-[#5EEAD4]'
            }`}
          />
        </div>
      </div>
    </div>
  );
});

BossArenaBanner.displayName = 'BossArenaBanner';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/82 p-4 overflow-y-auto"
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

        {/* Kibo Positive Reinforcement Speech (Unique Per Boss!) */}
        <div className="mt-3 rounded-2xl bg-[#EBF8FF] border border-[#BAE6FD] px-4 py-3 text-sm text-[#1E4E68] leading-snug">
          {highFived ? (
            <div className="flex flex-col items-center gap-2">
              <span>
                <strong className="text-[#0284C7]">Kibo:</strong> “{boss.kiboLines.victoryPostTos}”
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
              <strong className="text-[#0284C7]">Kibo:</strong> “{boss.kiboLines.victoryPreTos}”
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

// =========================================================================
// BOSS TIMEOUT DEFEAT MODAL (BOSS MOCKS THE PLAYER BY PERSONALITY!)
// =========================================================================

interface BossDefeatModalProps {
  boss: BossConfig;
  chapterId: number;
  reason?: 'timeout' | 'mistakes';
  onRetry: () => void;
  onExit: () => void;
}

export const BossDefeatModal: React.FC<BossDefeatModalProps> = ({
  boss,
  chapterId,
  reason = 'timeout',
  onRetry,
  onExit,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/84 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="boss-defeat-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative w-full max-w-md rounded-3xl game-panel border-3 border-[#FB7185] p-6 sm:p-7 text-center shadow-2xl"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-extrabold text-[#BE123C]">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>
            {reason === 'mistakes' ? '4× SALAH PINDAH · WAKTU HABIS!' : 'WAKTU HABIS · KALAH!'}
          </span>
        </div>

        <h2
          id="boss-defeat-title"
          className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]"
        >
          {boss.name} Mengejekmu!
        </h2>

        <div className="mt-4 flex justify-center">
          <AnimatedBoss
            chapterId={chapterId}
            state="mocking"
            phonkPlaying={false}
            size="xl"
            interactive={false}
          />
        </div>

        {/* Boss Mocking Speech */}
        <div className="mt-4 rounded-2xl bg-[#FFF1F2] border-2 border-[#FDA4AF] px-4 py-3 text-sm text-[#881337] leading-snug">
          <span className="block text-[11px] font-extrabold uppercase tracking-wide text-[#BE123C] mb-0.5">
            {boss.name}
          </span>
          <p className="font-semibold">“{boss.timeoutLine}”</p>
        </div>

        {/* Kibo Encouraging the Player (Unique Per Boss!) */}
        <div className="mt-3 rounded-2xl bg-[#EBF8FF] border border-[#BAE6FD] px-3.5 py-2.5 flex items-center gap-3 text-left">
          <AnimatedKibo size="sm" mood="oops" interactive={false} />
          <p className="text-xs sm:text-sm text-[#1E4E68] leading-snug">
            <strong className="text-[#0284C7]">Kibo:</strong> “{boss.kiboLines.defeatEncourage}”
          </p>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onExit}
            className="game-btn-wood flex-1 min-h-[48px] px-4 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
          >
            Kembali ke Peta
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Tantang Lagi!</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// =========================================================================
// KIBO AFK FAINT DEFEAT MODAL (> 1 MINUTE INACTIVE IN NON-BOSS STAGES)
// =========================================================================

interface KiboAfkDefeatModalProps {
  onRetry: () => void;
  onExit: () => void;
}

export const KiboAfkDefeatModal: React.FC<KiboAfkDefeatModalProps> = ({
  onRetry,
  onExit,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/84 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kibo-afk-defeat-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.84, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="relative w-full max-w-md rounded-3xl game-panel border-3 border-[#FB7185] p-6 sm:p-7 text-center shadow-2xl"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE4E6] border border-[#FDA4AF] text-xs font-extrabold text-[#BE123C]">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>AFK LEBIH DARI 1 MENIT · KALAH!</span>
        </div>

        <h2
          id="kibo-afk-defeat-title"
          className="mt-2.5 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]"
        >
          Kibo Pingsan!
        </h2>

        <div className="mt-4 flex justify-center">
          <AnimatedKibo
            size="xl"
            mood="fainted"
            reaction="fainted"
            interactive={false}
            className="border-3 border-[#FDA4AF] shadow-xl"
          />
        </div>

        <div className="mt-4 rounded-2xl bg-[#FFF1F2] border-2 border-[#FDA4AF] px-4 py-3 text-sm text-[#881337] leading-snug">
          <strong className="text-[#BE123C]">Kibo:</strong> “Uuu... pusing... kamu diam lebih dari 1
          menit sampai Kibo pingsan kehabisan tenaga di papan! Ayo coba ulangi stagenya ya!”
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onExit}
            className="game-btn-wood flex-1 min-h-[48px] px-4 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
          >
            Kembali ke Peta
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Coba Lagi!</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
