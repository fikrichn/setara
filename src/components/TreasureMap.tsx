import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HelpCircle, ArrowRight, Compass, Crown, Lock, Navigation, Sparkles, Star } from 'lucide-react';
import { formatEquation } from '../game/algebraEngine';
import { ALL_LEVELS } from '../game/levels';
import { sound } from '../game/sound';
import { ChapterDef, LevelDef, ProgressStore } from '../game/types';
import { AnimatedBoss, KiboSilhouetteBoss } from './AnimatedBoss';
import { AnimatedKibo } from './AnimatedKibo';
import { BeachEasterEggs } from './BeachEasterEggs';

interface TreasureMapProps {
  chapters: ChapterDef[];
  activeChapter: ChapterDef;
  selectedChapterId?: number;
  progress: ProgressStore;
  onSelectChapter: (chapterId: number) => void;
  onSelectLevel: (level: LevelDef) => void;
  onGoArcade?: () => void;
}

const CHAPTER_FISH_COLORS: Record<number, { body: string; fin: string; stripe: string }> = {
  0: { body: '#FB7185', fin: '#F43F5E', stripe: '#FFF1F2' },
  1: { body: '#F59E0B', fin: '#D97706', stripe: '#FEF3C7' },
  2: { body: '#14B8A6', fin: '#0F766E', stripe: '#CCFBF1' },
  3: { body: '#38BDF8', fin: '#0284C7', stripe: '#E0F2FE' },
  4: { body: '#A855F7', fin: '#7E22CE', stripe: '#F3E8FF' },
  5: { body: '#F97316', fin: '#C2410C', stripe: '#FFEDD5' },
};

const SwimmingFishIcon: React.FC<{
  chapterId: number;
  active?: boolean;
  flipped?: boolean;
  className?: string;
}> = ({ chapterId, active = false, flipped = false, className = 'w-7 h-5' }) => {
  const colors = CHAPTER_FISH_COLORS[chapterId] || CHAPTER_FISH_COLORS[0];
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${
        active ? 'anime-fish-swim-fast' : ''
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 36 24"
        className={`${className} ${flipped ? '-scale-x-100' : ''}`}
        fill="none"
      >
        {/* Animated Wagging Tail only when active for low-end mobile smoothness */}
        <g className={active ? 'anime-fish-tail' : ''}>
          <path
            d="M 10 12 L 2 6 L 4 12 L 2 18 Z"
            fill={colors.fin}
            stroke="#0D354C"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
        {/* Top Dorsal Fin */}
        <path
          d="M 15 6 C 18 2, 23 2, 25 6 Z"
          fill={colors.fin}
          stroke="#0D354C"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Plump Fish Body */}
        <path
          d="M 9 12 C 12 5, 25 4, 32 12 C 25 20, 12 19, 9 12 Z"
          fill={colors.body}
          stroke="#0D354C"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Cute Tropical Stripe */}
        <path
          d="M 18 6.5 Q 16 12 18 17.5"
          stroke={colors.stripe}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Eye */}
        <circle cx="26.5" cy="10.5" r="1.8" fill="#0D354C" />
        <circle cx="27" cy="10" r="0.65" fill="#FFFFFF" />
        {/* Tiny Bubbles when active */}
        {active && (
          <circle cx="34" cy="6" r="1.4" fill="#E0F2FE" stroke="#0284C7" strokeWidth="0.7" />
        )}
      </svg>
    </span>
  );
};

// Coordinates on a 1000x860 treasure-map SVG grid for 20 stages in a 5-row winding S-trail!
const TRAIL_COORDS: Array<{ x: number; y: number }> = [
  // Row 1 (Stages 1 -> 4): Left to Right
  { x: 125, y: 86 },
  { x: 375, y: 86 },
  { x: 625, y: 86 },
  { x: 875, y: 86 },
  // Row 2 (Stages 5 -> 8): Right to Left
  { x: 875, y: 258 },
  { x: 625, y: 258 },
  { x: 375, y: 258 },
  { x: 125, y: 258 },
  // Row 3 (Stages 9 -> 12): Left to Right
  { x: 125, y: 430 },
  { x: 375, y: 430 },
  { x: 625, y: 430 },
  { x: 875, y: 430 },
  // Row 4 (Stages 13 -> 16): Right to Left
  { x: 875, y: 602 },
  { x: 625, y: 602 },
  { x: 375, y: 602 },
  { x: 125, y: 602 },
  // Row 5 (Stages 17 -> 20 Boss X): Left to Right
  { x: 125, y: 774 },
  { x: 375, y: 774 },
  { x: 625, y: 774 },
  { x: 875, y: 774 },
];

const TREASURE_PATH_D = [
  // Row 1: 1 -> 4
  'M 125 86 L 875 86',
  // Curve down on right: 4 -> 5
  'C 965 86, 965 258, 875 258',
  // Row 2: 5 -> 8
  'L 125 258',
  // Curve down on left: 8 -> 9
  'C 35 258, 35 430, 125 430',
  // Row 3: 9 -> 12
  'L 875 430',
  // Curve down on right: 12 -> 13
  'C 965 430, 965 602, 875 602',
  // Row 4: 13 -> 16
  'L 125 602',
  // Curve down on left: 16 -> 17
  'C 35 602, 35 774, 125 774',
  // Row 5: 17 -> 20 Boss Treasure X
  'L 875 774',
].join(' ');

export const TreasureMap: React.FC<TreasureMapProps> = ({
  chapters,
  activeChapter,
  selectedChapterId,
  progress,
  onSelectChapter,
  onSelectLevel,
  onGoArcade,
}) => {
  const isBab6ComingSoon = selectedChapterId === 6;
  const effectiveChapterId = isBab6ComingSoon ? 6 : activeChapter.id;
  const [kiboMapQuip, setKiboMapQuip] = useState<string | null>(null);
  const [lockedSuggestion, setLockedSuggestion] = useState<{
    clicked: LevelDef;
    required: LevelDef;
  } | null>(null);
  const [islandSailBanner, setIslandSailBanner] = useState<string | null>(null);
  const [sailDirection, setSailDirection] = useState<'next' | 'prev'>('next');
  const prevChapterRef = useRef<number>(effectiveChapterId);
  const sailTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevChapterRef.current !== effectiveChapterId) {
      setSailDirection(effectiveChapterId > prevChapterRef.current ? 'next' : 'prev');
      prevChapterRef.current = effectiveChapterId;
      setIslandSailBanner(
        isBab6ComingSoon
          ? 'Meneropong Cakrawala Bab 6 · Segera Hadir!'
          : `Berlayar ke Pulau Bab ${activeChapter.id} · ${activeChapter.title}`
      );
      if (sailTimerRef.current) window.clearTimeout(sailTimerRef.current);
      sailTimerRef.current = window.setTimeout(() => setIslandSailBanner(null), 1150);
    }
  }, [effectiveChapterId, isBab6ComingSoon, activeChapter.id, activeChapter.title]);

  useEffect(() => {
    return () => {
      if (sailTimerRef.current) window.clearTimeout(sailTimerRef.current);
    };
  }, []);

  // Sequential unlock across all 120 stages:
  // Stage 0 (Bab 0 Stage 1) is always unlocked; stage i unlocks once stage i-1 is completed.
  const unlockedLevelIds = useMemo(() => {
    const unlocked = new Set<string>();
    for (let i = 0; i < ALL_LEVELS.length; i++) {
      const lvl = ALL_LEVELS[i];
      if (i === 0 || progress.completed[ALL_LEVELS[i - 1].id] || progress.completed[lvl.id]) {
        unlocked.add(lvl.id);
      }
    }
    return unlocked;
  }, [progress.completed]);

  const globalNextLevel = useMemo(
    () => ALL_LEVELS.find((l) => !progress.completed[l.id]) ?? ALL_LEVELS[0],
    [progress.completed]
  );

  // Determine the next uncompleted stage in the current chapter so Kibo stands right there if unlocked!
  const nextStageIndex = useMemo(() => {
    const idx = activeChapter.levels.findIndex((l) => !progress.completed[l.id]);
    return idx === -1 ? activeChapter.levels.length - 1 : idx;
  }, [activeChapter, progress.completed]);

  const nextLevel = activeChapter.levels[nextStageIndex];
  const isChapterNextUnlocked = nextLevel ? unlockedLevelIds.has(nextLevel.id) : false;
  const headerActionLevel = isChapterNextUnlocked && nextLevel ? nextLevel : globalNextLevel;

  // Build 5 visual rows of 4 stages, reversing rows 2 and 4 so CSS grid matches the S-curve trail!
  const visualRows = useMemo(() => {
    const rows: Array<{ rowIdx: number; reversed: boolean; items: Array<{ level: LevelDef; idx: number }> }> = [];
    for (let r = 0; r < 5; r++) {
      const slice = activeChapter.levels
        .slice(r * 4, r * 4 + 4)
        .map((level, offset) => ({ level, idx: r * 4 + offset }));
      const reversed = r % 2 === 1;
      rows.push({
        rowIdx: r,
        reversed,
        items: reversed ? [...slice].reverse() : slice,
      });
    }
    return rows;
  }, [activeChapter.levels]);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* CHAPTER SELECTOR WITH LIVELY SWIMMING FISH ICONS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
        {chapters.map((ch) => {
          const isActive = !isBab6ComingSoon && ch.id === activeChapter.id;
          const done = ch.levels.filter((l) => progress.completed[l.id]).length;
          const bossWon = ch.levels.some((l) => l.isBoss && progress.completed[l.id]);
          const chUnlocked = ch.levels.length > 0 && unlockedLevelIds.has(ch.levels[0].id);
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                sound.playPickup();
                setKiboMapQuip(null);
                setLockedSuggestion(null);
                onSelectChapter(ch.id);
              }}
              className={`min-h-[58px] px-3.5 rounded-2xl flex items-center gap-2.5 shrink-0 transition-all cursor-pointer ${
                isActive ? 'game-btn-gold' : 'game-btn-wood'
              } ${!chUnlocked ? 'opacity-80' : ''}`}
            >
              <SwimmingFishIcon chapterId={ch.id} active={isActive} />
              <div className="flex flex-col items-start justify-center">
                <div className="flex items-center gap-1 font-display font-extrabold text-sm whitespace-nowrap">
                  <span>Bab {ch.id}</span>
                  {bossWon ? (
                    <Crown className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
                  ) : !chUnlocked ? (
                    <Lock className="w-3 h-3 text-[#64748B]" aria-label="Terkunci" />
                  ) : null}
                </div>
                <span
                  className={`text-[11px] font-mono font-bold tabular-nums ${
                    isActive ? 'text-[#291802]/80' : 'text-[#35637A]'
                  }`}
                >
                  {done}/{ch.levels.length} stage
                </span>
              </div>
            </button>
          );
        })}

        {/* BAB 6 COMING SOON TAB */}
        <button
          type="button"
          onClick={() => {
            sound.playPickup();
            setKiboMapQuip(null);
            setLockedSuggestion(null);
            onSelectChapter(6);
          }}
          className={`min-h-[58px] px-3.5 rounded-2xl flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
            isBab6ComingSoon
              ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A] text-[#67E8F9] border-2 border-[#22D3EE] shadow-lg'
              : 'game-btn-wood opacity-90'
          }`}
        >
          <div className="w-7 h-7 rounded-lg bg-[#0F172A] border border-[#22D3EE]/70 flex items-center justify-center shrink-0 text-[#67E8F9] font-display font-extrabold text-sm">
            ?
          </div>
          <div className="flex flex-col items-start justify-center">
            <div className="font-display font-extrabold text-sm whitespace-nowrap">
              Bab 6
            </div>
            <span
              className={`text-[10px] font-extrabold whitespace-nowrap ${
                isBab6ComingSoon ? 'text-[#BAE6FD]' : 'text-[#7C2D12]'
              }`}
            >
              Segera Hadir
            </span>
          </div>
        </button>
      </div>

      {/* ISLAND-HOPPING TRANSITION TOAST */}
      {islandSailBanner && (
        <div
          key={`sail-${effectiveChapterId}`}
          role="status"
          aria-live="polite"
          className="pointer-events-none flex items-center justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-2xl bg-[#0D4A6B]/95 border-2 border-[#FEF08A] text-[#FEF9C3] px-4 py-1.5 text-xs sm:text-sm font-display font-extrabold shadow-lg animate-pop-in">
            <Navigation className="w-4 h-4 text-[#FDE047] shrink-0" aria-hidden="true" />
            <span>{islandSailBanner}</span>
          </div>
        </div>
      )}

      {/* BAB 6 COMING SOON MYSTERIOUS SHARK RIVAL PANEL */}
      {isBab6ComingSoon ? (
        <section
          key="bab-6-coming-soon"
          data-tour="map-trail"
          className={`relative rounded-3xl overflow-hidden p-5 sm:p-8 bg-gradient-to-br from-[#0B172A] via-[#13294B] to-[#081C2E] border-3 border-[#22D3EE]/70 text-white shadow-2xl ${
            sailDirection === 'next' ? 'island-sail-next' : 'island-sail-prev'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <KiboSilhouetteBoss
                size="xl"
                interactive
                onTap={() =>
                  setKiboMapQuip(
                    'Hii?! Siluet itu gerak! Siripnya tajam sekali... jangan-jangan dia hiu penantang di Bab 6 nanti!'
                  )
                }
              />
              <span className="font-mono text-xs font-extrabold tracking-widest uppercase text-[#67E8F9]">
                Bos ??? · Ketuk Siluet
              </span>
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FEF08A]">
                <HelpCircle className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                <span>Bab 6 · Segera Hadir di Update Berikutnya</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Palung Bayangan · Siapa Hiu Misterius Ini?
              </h1>

              <div className="flex items-start gap-3 text-left">
                <AnimatedKibo
                  size="sm"
                  mood="thinking"
                  interactive
                  onInteract={(q) => setKiboMapQuip(q)}
                  className="shrink-0 border-2 border-[#38BDF8]"
                />
                <div className="relative flex-1 rounded-2xl bg-[#0F2A44]/95 border-2 border-[#38BDF8]/70 px-3.5 py-2.5 text-xs sm:text-sm text-[#E0F2FE] speech-bubble-pop">
                  <span
                    aria-hidden="true"
                    className="absolute -left-2 top-3 w-3 h-3 rotate-45 bg-[#0F2A44] border-l-2 border-b-2 border-[#38BDF8]/70"
                  />
                  <span className="relative z-10 font-semibold">
                    <strong className="text-[#38BDF8]">Kibo:</strong> “
                    {kiboMapQuip ??
                      'Aduh, siluet di peta itu mirip sekali dengan Kibo! Siapkan jurus pindah ruasmu untuk Bab 6 yang segera hadir nanti ya!'}
                    ”
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-left">
                <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                  <div className="text-xs font-extrabold text-[#67E8F9] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>20 Stage Petualangan Baru</span>
                  </div>
                  <p className="text-[11px] text-[#BAE6FD] mt-1">
                    Teka-teki aljabar tingkat lanjut di kedalaman laut misterius.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/15 p-3">
                  <div className="text-xs font-extrabold text-[#FEF08A] flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Rival Bayangan Mirip Kibo</span>
                  </div>
                  <p className="text-[11px] text-[#BAE6FD] mt-1">
                    Bos baru dengan mekanik penuh kejutan menanti di Stage 20!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    onSelectChapter(5);
                  }}
                  className="game-btn-wood min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
                >
                  Kembali ke Bab 5
                </button>
                {onGoArcade && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      onGoArcade();
                    }}
                    className="game-btn-gold min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
                  >
                    Latihan Acak Sambil Menunggu
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
      /* ANTIQUE TREASURE MAP PARCHMENT PAPER WITH ISLAND-HOPPING TRANSITION */
      <section
        key={activeChapter.id}
        data-tour="map-trail"
        className={`relative rounded-3xl treasure-parchment overflow-hidden p-4 sm:p-6 ${
          sailDirection === 'next' ? 'island-sail-next' : 'island-sail-prev'
        }`}
      >
        {/* Decorative Antique Map Watermarks: Compass Rose & Swimming Patrol Fish */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Vintage Compass Rose Watermark (Top-Right) */}
          <svg
            viewBox="0 0 120 120"
            className="absolute -right-4 -top-4 w-32 h-32 sm:w-40 sm:h-40 text-[#92400E] opacity-15"
            fill="none"
          >
            <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 5" />
            <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="60,8 68,52 60,60 52,52" fill="currentColor" />
            <polygon points="60,112 68,68 60,60 52,68" fill="currentColor" opacity="0.5" />
            <polygon points="8,60 52,52 60,60 52,68" fill="currentColor" opacity="0.5" />
            <polygon points="112,60 68,52 60,60 68,68" fill="currentColor" />
          </svg>

          {/* Subtle Ocean Wave Doodles */}
          <svg
            viewBox="0 0 220 26"
            className="absolute left-5 bottom-3 w-40 text-[#0284C7] opacity-20"
            fill="none"
          >
            <path
              d="M 4 14 Q 20 4 36 14 T 68 14 T 100 14 T 132 14 T 164 14 T 196 14"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* Animated Swimming Fish Patrol on the Parchment Sea Margins */}
          <div className="absolute right-8 bottom-3.5 anime-fish-patrol opacity-75">
            <SwimmingFishIcon chapterId={activeChapter.id} active className="w-9 h-6" />
          </div>
          <div
            className="hidden sm:block absolute left-1/2 top-3 anime-fish-patrol opacity-65"
            style={{ animationDelay: '1.8s' }}
          >
            <SwimmingFishIcon
              chapterId={(activeChapter.id + 2) % 6}
              flipped
              className="w-8 h-5"
            />
          </div>
        </div>

        {/* INTERACTIVE BEACH OBJECTS EMBEDDED DIRECTLY ON THE MAP PARCHMENT (BELOW CARDS) */}
        <BeachEasterEggs
          variant="map"
          chapterId={activeChapter.id}
          onTriggerKibo={(quip) => {
            setLockedSuggestion(null);
            setKiboMapQuip(quip);
          }}
        />

        {/* TREASURE MAP HEADER WITH EXPLORER KIBO */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b-2 border-dashed border-[#B47B38]/50">
          <div className="flex items-center gap-3.5">
            <AnimatedKibo
              size="md"
              mood={lockedSuggestion ? 'thinking' : kiboMapQuip ? 'excited' : 'happy'}
              interactive
              onInteract={(quip) => {
                setLockedSuggestion(null);
                setKiboMapQuip(quip);
              }}
              className="border-2 border-[#B47B38] shadow-md shrink-0"
            />
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#9A3412]">
                <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Peta Harta Karun · {activeChapter.focusRule}</span>
              </div>
              <h1 className="mt-0.5 font-display text-xl sm:text-2xl font-extrabold text-[#451A03] leading-tight">
                {activeChapter.title}
              </h1>
              {(() => {
                const maskSecretName = (lvl: LevelDef) =>
                  lvl.isBoss && lvl.chapterId === 5 ? 'Bos ???' : lvl.boss?.name ?? 'Stage Bos';
                const mapMsg = lockedSuggestion
                  ? `Kibo: “Eits, ${
                      lockedSuggestion.clicked.isBoss
                        ? maskSecretName(lockedSuggestion.clicked)
                        : `Stage ${lockedSuggestion.clicked.levelNumber}`
                    } masih terkunci! Yuk selesaikan dulu Bab ${lockedSuggestion.required.chapterId} · ${
                      lockedSuggestion.required.isBoss
                        ? maskSecretName(lockedSuggestion.required)
                        : `Stage ${lockedSuggestion.required.levelNumber}`
                    }!”`
                  : kiboMapQuip
                    ? `Kibo: “${kiboMapQuip}”`
                    : headerActionLevel
                      ? `Kibo: “Ikuti garis merah putus-putus menuju ${
                          headerActionLevel.isBoss
                            ? maskSecretName(headerActionLevel)
                            : `Bab ${headerActionLevel.chapterId} Stage ${headerActionLevel.levelNumber}`
                        }!”`
                      : activeChapter.subtitle;
                return (
                  <div
                    key={mapMsg}
                    className="relative mt-1.5 ml-1.5 rounded-2xl bg-[#FFFDF4]/95 border-2 border-[#B47B38]/55 px-3 py-1.5 text-xs sm:text-sm text-[#78350F] font-semibold shadow-sm speech-bubble-pop"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-2 top-3 w-3 h-3 rotate-45 bg-[#FFFDF4] border-l-2 border-b-2 border-[#B47B38]/55"
                    />
                    <span className="relative z-10">{mapMsg}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (headerActionLevel) {
                sound.playPickup();
                onSelectChapter(headerActionLevel.chapterId);
                onSelectLevel(headerActionLevel);
              }
            }}
            className="game-btn-gold self-start sm:self-center inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              {headerActionLevel?.isBoss
                ? headerActionLevel.chapterId === 5
                  ? 'Lawan Bos ???'
                  : `Lawan ${headerActionLevel.boss?.name}`
                : isChapterNextUnlocked
                  ? `Lanjut Stage ${headerActionLevel?.levelNumber ?? 1}`
                  : `Selesaikan Bab ${headerActionLevel.chapterId} Stage ${headerActionLevel.levelNumber}`}
            </span>
          </button>
        </div>

        {/* KIBO LOCKED STAGE SUGGESTION BANNER */}
        {lockedSuggestion && (
          <div className="relative z-10 mt-4 rounded-2xl bg-[#FFFBEB] border-2 border-[#F59E0B] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-pop-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/50 flex items-center justify-center shrink-0 text-[#B45309]">
                <Lock className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-[#B45309]">
                  Saran Kibo · Stage Masih Terkunci
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#451A03] leading-snug">
                  Selesaikan dulu{' '}
                  <span className="text-[#C2410C]">
                    Bab {lockedSuggestion.required.chapterId} ·{' '}
                    {lockedSuggestion.required.isBoss
                      ? lockedSuggestion.required.chapterId === 5
                        ? 'Bos ???'
                        : lockedSuggestion.required.boss?.name ?? 'Bos'
                      : `Stage ${lockedSuggestion.required.levelNumber} (${lockedSuggestion.required.title})`}
                  </span>{' '}
                  untuk membuka jalan berikutnya!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                onSelectChapter(lockedSuggestion.required.chapterId);
                onSelectLevel(lockedSuggestion.required);
              }}
              className="game-btn-gold inline-flex items-center justify-center gap-1.5 min-h-[42px] px-4 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Selesaikan Ini Dulu</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* WINDING 20-STAGE TREASURE TRAIL WITH RED DASHED PATH & KIBO MARKER */}
        <div className="relative z-10 mt-5 sm:mt-6">
          {/* Desktop & Tablet Winding Red Dashed SVG Route (4 cols x 5 rows S-curve) */}
          <svg
            viewBox="0 0 1000 860"
            preserveAspectRatio="none"
            className="hidden sm:block pointer-events-none absolute inset-0 w-full h-full z-0"
            aria-hidden="true"
          >
            {/* Subtle warm shadow behind red ink trail */}
            <path
              d={TREASURE_PATH_D}
              fill="none"
              stroke="#92400E"
              strokeWidth="8"
              strokeDasharray="14 11"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.18"
            />
            {/* Bold Red Dashed Treasure Map Trail */}
            <path
              d={TREASURE_PATH_D}
              fill="none"
              stroke="#DC2626"
              strokeWidth="5.5"
              strokeDasharray="14 11"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
            />
            {/* Red Treasure "X" Marks the Spot Behind Stage 20 Boss! */}
            <g stroke="#DC2626" strokeWidth="8" strokeLinecap="round" opacity="0.32">
              <line x1="825" y1="734" x2="925" y2="814" />
              <line x1="925" y1="734" x2="825" y2="814" />
            </g>
            {/* Small red ink waypoint dots at each stage coordinate */}
            {TRAIL_COORDS.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="7" fill="#DC2626" opacity="0.28" />
            ))}
          </svg>

          {/* Mobile 2-Column Vertical Red Dashed Spine */}
          <div
            className="sm:hidden pointer-events-none absolute left-1/2 top-8 bottom-8 -translate-x-1/2 border-l-4 border-dashed border-[#DC2626]/75 z-0"
            aria-hidden="true"
          />

          {/* 5 WINDING ROWS OF TREASURE STAGE NODES */}
          <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
            {visualRows.map((row) => (
              <div
                key={row.rowIdx}
                className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
              >
                {row.items.map(({ level: lvl, idx }) => {
                  const stat = progress.completed[lvl.id];
                  const isBoss = !!lvl.isBoss;
                  const isStage1 = lvl.levelNumber === 1;
                  const isUnlocked = unlockedLevelIds.has(lvl.id);
                  const isKiboHere = isUnlocked && idx === nextStageIndex;

                  return (
                    <div key={lvl.id} className="relative flex flex-col items-stretch">
                      {/* KIBO STANDING RIGHT ON THE CURRENT UNLOCKED STAGE OF THE TREASURE MAP! */}
                      {isKiboHere && (
                        <div className="pointer-events-none absolute -top-6 right-1.5 z-20 flex items-center gap-1">
                          <span className="rounded-lg bg-[#DC2626] text-[#FEF9C3] font-display font-extrabold text-[10px] px-2 py-0.5 shadow-md whitespace-nowrap border border-[#FEF08A]">
                            Kibo di sini!
                          </span>
                          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#FEF08A] bg-[#E0F2FE] shadow-md animate-kibo-waddle">
                            <AnimatedKibo size="sm" mood="excited" interactive={false} className="!w-9 !h-9 !rounded-full !border-0" />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!isUnlocked) {
                            sound.playNudge();
                            setKiboMapQuip(null);
                            setLockedSuggestion({ clicked: lvl, required: globalNextLevel });
                            return;
                          }
                          sound.playPickup();
                          setLockedSuggestion(null);
                          onSelectLevel(lvl);
                        }}
                        aria-label={
                          isUnlocked
                            ? isBoss
                              ? activeChapter.id === 5
                                ? 'Lawan Bos ???'
                                : `Lawan ${lvl.boss?.name ?? lvl.title}`
                              : `Mainkan Stage ${lvl.levelNumber}: ${lvl.title}`
                            : `Stage ${lvl.levelNumber} terkunci`
                        }
                        className={`group relative rounded-2xl p-2.5 sm:p-3 text-left flex flex-col justify-between gap-1.5 min-h-[112px] sm:min-h-[126px] transition-transform active:scale-[0.97] cursor-pointer ${
                          !isUnlocked
                            ? 'bg-[#EADAC0]/75 border-2 border-dashed border-[#A68B66]/70 text-[#7C6547] opacity-80 hover:opacity-95'
                            : isBoss
                              ? `bg-gradient-to-br from-[#451A03] via-[#7C2D12] to-[#991B1B] border-2 border-[#FBBF24] text-white shadow-xl ring-2 ring-[#DC2626]/40 ${
                                  stat ? 'stage-completed-card' : 'hover:-translate-y-0.5'
                                }`
                              : isKiboHere
                                ? 'bg-[#FFFBEB] border-3 border-[#DC2626] text-[#451A03] shadow-lg'
                                : stat
                                  ? 'stage-completed-card bg-[#FFFDF4]/95 border-2 border-[#D97706] text-[#451A03] shadow-md'
                                  : 'bg-[#FEF7E0]/95 border-2 border-dashed border-[#B47B38] text-[#451A03] hover:border-solid hover:border-[#DC2626]'
                        }`}
                      >
                        {/* Completed Stage Hover Badge */}
                        {!!stat && isUnlocked && !isKiboHere && (
                          <span
                            className="completed-pill pointer-events-none opacity-0 group-hover:opacity-100 absolute -top-2.5 right-2 z-20 rounded-md bg-[#FDE68A] border border-[#D97706] text-[#78350F] font-display font-extrabold text-[10px] px-1.5 py-0.5 shadow-sm whitespace-nowrap transition-opacity duration-150"
                            aria-hidden="true"
                          >
                            {isBoss ? 'Bos Takluk' : 'Tuntas ★'}
                          </span>
                        )}

                        {/* Red X Seal on Unlocked Stage 20 Boss */}
                        {isBoss && isUnlocked && (
                          <span
                            className="pointer-events-none absolute -top-2.5 -left-2 w-7 h-7 rounded-full bg-[#DC2626] border-2 border-[#FEF08A] text-[#FEF08A] font-display font-extrabold text-sm flex items-center justify-center shadow-md"
                            aria-hidden="true"
                          >
                            X
                          </span>
                        )}

                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-display font-extrabold text-xs sm:text-sm flex items-center gap-1 ${
                              !isUnlocked
                                ? 'text-[#786144]'
                                : isBoss
                                  ? 'text-[#FEF08A]'
                                  : 'text-[#7C2D12]'
                            }`}
                          >
                            {isBoss ? (
                              <>
                                <Crown
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isUnlocked ? 'text-[#FBBF24]' : 'text-[#9A805F]'
                                  }`}
                                  aria-hidden="true"
                                />
                                <span>BOS 20</span>
                              </>
                            ) : (
                              <span>Stage {lvl.levelNumber}</span>
                            )}
                          </span>

                          {!isUnlocked ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#7C6547]">
                              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            </span>
                          ) : (
                            <div className="flex items-center gap-0.5" aria-hidden="true">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  style={stat && s <= stat.stars ? { transitionDelay: `${(s - 1) * 45}ms` } : undefined}
                                  className={`w-3.5 h-3.5 ${
                                    stat && s <= stat.stars
                                      ? 'completed-star-icon text-[#F59E0B] fill-[#FBBF24]'
                                      : isBoss
                                        ? 'text-[#78350F]'
                                        : 'text-[#D6B88D]'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className={isBoss ? 'flex items-center gap-2' : ''}>
                          {isBoss && (
                            <div className={!isUnlocked ? 'grayscale opacity-65' : ''}>
                              {activeChapter.id === 5 ? (
                                <div
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E1B4B] via-[#4C1D95] to-[#0F172A] border-2 border-[#E879F9]/85 flex items-center justify-center shadow-[0_0_16px_rgba(232,121,249,0.55)] shrink-0"
                                  aria-hidden="true"
                                >
                                  <span className="font-display font-extrabold text-2xl text-[#F0ABFC] drop-shadow-[0_0_8px_rgba(232,121,249,0.9)] animate-pulse">
                                    ?
                                  </span>
                                </div>
                              ) : (
                                <AnimatedBoss
                                  chapterId={activeChapter.id}
                                  state="idle"
                                  phonkPlaying={false}
                                  size="sm"
                                  interactive={false}
                                />
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              className={`font-display font-bold text-xs leading-snug line-clamp-2 ${
                                !isUnlocked
                                  ? 'text-[#6B563C]'
                                  : isBoss
                                    ? 'text-white'
                                    : 'text-[#451A03]'
                              }`}
                            >
                              {isBoss
                                ? activeChapter.id === 5
                                  ? '???'
                                  : lvl.boss?.name ?? lvl.title
                                : lvl.title}
                            </div>
                            <div
                              className={`mt-1 font-mono text-[10px] font-bold truncate ${
                                !isUnlocked
                                  ? 'text-[#8C7354]'
                                  : isBoss
                                    ? 'text-[#FDE68A]'
                                    : 'text-[#92400E]'
                              }`}
                            >
                              {!isUnlocked
                                ? 'Terkunci'
                                : isBoss
                                  ? activeChapter.id === 5
                                    ? 'Misteri Kosmik · ???'
                                    : (() => {
                                        const hp =
                                          lvl.boss?.gimmick === 'heal_once'
                                            ? 5
                                            : lvl.boss?.phases.length ?? 3;
                                        const sec = lvl.boss?.timeLimitSeconds ?? 120;
                                        const durStr =
                                          sec % 60 === 0
                                            ? `${sec / 60} Menit`
                                            : `${Math.floor(sec / 60)}m ${sec % 60}d`;
                                        return `${hp} HP · ${durStr}`;
                                      })()
                                  : isStage1
                                    ? 'Panduan Kibo'
                                    : formatEquation(
                                        lvl.initial,
                                        lvl.defaultVisual === 'pure_symbols'
                                      )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      )}
    </div>
  );
};
