import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Crown,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';
import { sound } from '../game/sound';
import { BossConfig } from '../game/types';
import { AnimatedBoss } from './AnimatedBoss';
import { AnimatedKibo } from './AnimatedKibo';

export type BossCinematicMode = 'encounter' | 'victory';

interface BossCinematicVideoProps {
  mode: BossCinematicMode;
  boss: BossConfig;
  chapterId: number;
  onFinish: () => void;
}

const TOTAL_DURATION_MS = 9600;
const SCENE_BREAKS_MS = [0, 3100, 6300, TOTAL_DURATION_MS] as const;

const ENCOUNTER_BG_SRC = '/src/assets/images/boss_arena_storm_1795103407975.jpg';
const VICTORY_BG_SRC = '/src/assets/images/boss_victory_sunrise_1795103407988.jpg';

const CHAPTER_CINEMATIC_THEME: Record<
  number,
  {
    accent: string;
    glow: string;
    grad: string;
    encounterOmen: string;
    finisherName: string;
    victoryTag: string;
  }
> = {
  0: {
    accent: '#F0ABFC',
    glow: 'rgba(240,171,252,0.55)',
    grad: 'from-[#3B0764] via-[#6D28D9] to-[#0E7490]',
    encounterOmen: 'Pusaran tinta ungu muncul dari balik ombak Pantai Simbol...',
    finisherName: 'GELOMBANG SIMBOL SETARA!',
    victoryTag: 'PENJAGA PANTAI SIMBOL TAKLUK!',
  },
  1: {
    accent: '#FDE047',
    glow: 'rgba(253,224,71,0.55)',
    grad: 'from-[#0E7490] via-[#155E75] to-[#B45309]',
    encounterOmen: 'Bendera bajak laut berkibar di tengah badai Pulau Angka...',
    finisherName: 'BADAI PINDAH TANDA + / −!',
    victoryTag: 'KAPTEN BAJAK LAUT BUNTAL KALAH!',
  },
  2: {
    accent: '#FBBF24',
    glow: 'rgba(251,191,36,0.55)',
    grad: 'from-[#7F1D1D] via-[#B45309] to-[#92400E]',
    encounterOmen: 'Kilauan harta karun emas bergemuruh di gua karang...',
    finisherName: 'CAHAYA GABUNGAN SUKU EMAS!',
    victoryTag: 'HARTA KEPITING EMAS BERHASIL DIREBUT!',
  },
  3: {
    accent: '#5EEAD4',
    glow: 'rgba(94,234,212,0.55)',
    grad: 'from-[#0F766E] via-[#115E59] to-[#1E3A5F]',
    encounterOmen: 'Tempurung meriam raksasa mengapung tenang di teluk berkabut...',
    finisherName: 'TEMBAKAN KALI & BAGI TELITI!',
    victoryTag: 'KURA MERIAM AKHIRNYA TUMBANG!',
  },
  4: {
    accent: '#38BDF8',
    glow: 'rgba(56,189,248,0.58)',
    grad: 'from-[#0C4A6E] via-[#0F172A] to-[#0369A1]',
    encounterOmen: 'Sirip hitam raksasa membelah samudra dalam dengan ganas...',
    finisherName: 'OMBAK PENYEIMBANG DUA RUAS!',
    victoryTag: 'KAPTEN ORCA PENGUASA PALUNG TAKLUK!',
  },
  5: {
    accent: '#E879F9',
    glow: 'rgba(232,121,249,0.65)',
    grad: 'from-[#1E1045] via-[#581C87] to-[#0E7490]',
    encounterOmen: 'Langit terbelah! Evolusi raksasa dari Bab 0 bangkit dari palung kosmik!',
    finisherName: 'SUPERNOVA ALJABAR SETARA!!',
    victoryTag: 'CTHULHU SAMUDRA BERHASIL DITAKLUKKAN!!',
  },
};

const VICTORY_CONFETTI = [
  { left: '8%', color: '#FDE047', delay: 0.05, dur: 2.1 },
  { left: '16%', color: '#38BDF8', delay: 0.25, dur: 2.4 },
  { left: '25%', color: '#FB7185', delay: 0.1, dur: 2.0 },
  { left: '35%', color: '#34D399', delay: 0.35, dur: 2.3 },
  { left: '46%', color: '#FBBF24', delay: 0.15, dur: 2.2 },
  { left: '58%', color: '#F0ABFC', delay: 0.3, dur: 2.5 },
  { left: '68%', color: '#38BDF8', delay: 0.08, dur: 2.1 },
  { left: '78%', color: '#FDE047', delay: 0.22, dur: 2.3 },
  { left: '88%', color: '#FB7185', delay: 0.12, dur: 2.2 },
  { left: '94%', color: '#34D399', delay: 0.38, dur: 2.0 },
];

function getSceneIndex(ms: number): number {
  if (ms < SCENE_BREAKS_MS[1]) return 0;
  if (ms < SCENE_BREAKS_MS[2]) return 1;
  return 2;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const s = totalSec % 60;
  return `0:${s < 10 ? '0' : ''}${s}`;
}

export const BossCinematicVideo: React.FC<BossCinematicVideoProps> = ({
  mode,
  boss,
  chapterId,
  onFinish,
}) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [bgFailed, setBgFailed] = useState(false);

  const lastSceneRef = useRef(-1);
  const finishedRef = useRef(false);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  const theme = CHAPTER_CINEMATIC_THEME[chapterId] ?? CHAPTER_CINEMATIC_THEME[0];
  const sceneIdx = getSceneIndex(elapsedMs);
  const isFinished = elapsedMs >= TOTAL_DURATION_MS;

  const sceneCopy = useMemo(() => {
    if (mode === 'encounter') {
      return [
        {
          kicker: `Bab ${chapterId} · Pertemuan Bos Penjaga`,
          title: 'Awas! Sesuatu Muncul dari Laut!',
          subtitle: theme.encounterOmen,
        },
        {
          kicker: boss.role,
          title: boss.name,
          subtitle: `“${boss.introLine}”`,
        },
        {
          kicker: 'Pertarungan Dimulai!',
          title: `Kibo vs ${boss.name}`,
          subtitle: `Taklukkan ${boss.gimmick === 'heal_once' ? 5 : boss.phases.length} HP ${boss.name} menggunakan kekuatan pindah ruas!`,
        },
      ];
    }
    return [
      {
        kicker: 'Serangan Pamungkas!',
        title: theme.finisherName,
        subtitle: `Persamaan terakhir setara! Kibo melepaskan gelombang cahaya emas ke arah ${boss.name}!`,
      },
      {
        kicker: `${boss.name} Tumbang!`,
        title: 'TERKALAHKAN!!',
        subtitle: `“${boss.defeatLine}”`,
      },
      {
        kicker: `Bos Bab ${chapterId} Selesai`,
        title: theme.victoryTag,
        subtitle: 'Ombak samudra kembali tenang dan matahari pagi menyinari kemenanganmu bersama Kibo!',
      },
    ];
  }, [mode, chapterId, boss, theme]);

  // Smooth RAF timeline loop
  useEffect(() => {
    if (!playing || isFinished) return;
    let rafId = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(80, now - prev);
      prev = now;
      setElapsedMs((curr) => {
        const next = curr + dt;
        if (next >= TOTAL_DURATION_MS) {
          setPlaying(false);
          return TOTAL_DURATION_MS;
        }
        return next;
      });
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [playing, isFinished]);

  // Trigger dramatic Web Audio SFX per scene
  useEffect(() => {
    if (sceneIdx === lastSceneRef.current) return;
    lastSceneRef.current = sceneIdx;

    if (mode === 'encounter') {
      if (sceneIdx === 0) sound.playPickup();
      if (sceneIdx === 1) sound.playBossTaunt();
      if (sceneIdx === 2) sound.playExpand();
    } else {
      if (sceneIdx === 0) sound.playTranspose();
      if (sceneIdx === 1) sound.playBossHit();
      if (sceneIdx === 2) sound.playBossVictory();
    }
  }, [sceneIdx, mode]);

  // Auto-proceed smoothly shortly after video finishes
  useEffect(() => {
    if (!isFinished) return;
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        onFinish();
      }
    }, 1400);
    return () => {
      if (autoAdvanceTimerRef.current) window.clearTimeout(autoAdvanceTimerRef.current);
    };
  }, [isFinished, onFinish]);

  // Keyboard shortcuts: Space play/pause, Enter/Escape finish
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isFinished) {
          setElapsedMs(0);
          setPlaying(true);
        } else {
          setPlaying((p) => !p);
        }
      } else if (e.code === 'Escape' || e.code === 'Enter') {
        e.preventDefault();
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFinished, onFinish]);

  const handleFinishNow = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    sound.playPickup();
    onFinish();
  };

  const activeBgSrc =
    mode === 'victory' && sceneIdx === 2 ? VICTORY_BG_SRC : ENCOUNTER_BG_SRC;

  const activeCopy = sceneCopy[sceneIdx];

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#031322] text-white overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'encounter'
          ? `Video Pertemuan Bos ${boss.name}`
          : `Video Kemenangan Mengalahkan ${boss.name}`
      }
    >
      {/* CINEMATIC TOP BAR */}
      <div className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 via-black/45 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              mode === 'encounter'
                ? 'bg-gradient-to-br from-[#F43F5E] to-[#9F1239] text-white'
                : 'bg-gradient-to-br from-[#FDE047] to-[#D97706] text-[#291802]'
            }`}
          >
            {mode === 'encounter' ? (
              <Swords className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Trophy className="w-4 h-4" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-wide text-[#FEF08A] truncate">
              {mode === 'encounter' ? `PERTEMUAN BOS · BAB ${chapterId}` : `KEMENANGAN EPIK · BAB ${chapterId}`}
            </div>
            <div className="font-display font-extrabold text-sm sm:text-base text-white truncate">
              {boss.name}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinishNow}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs sm:text-sm font-extrabold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Lewati</span>
          <SkipForward className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* MAIN 16:9 CINEMATIC VIDEO STAGE */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Ken Burns Animated Backdrop */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBgSrc}
            initial={{ opacity: 0.25, scale: 1.08 }}
            animate={{ opacity: 1, scale: [1.04, 1.12] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.65 },
              scale: { duration: 9.5, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            {!bgFailed ? (
              <img
                src={activeBgSrc}
                alt={
                  mode === 'victory' && sceneIdx === 2
                    ? 'Matahari terbit di pantai tropis kemenangan Setara'
                    : 'Arena badai samudra pertarungan bos Setara'
                }
                referrerPolicy="no-referrer"
                onError={() => setBgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${theme.grad}`} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Measured Contrast Scrim + Chapter Aura Vignette */}
        <div
          className={`pointer-events-none absolute inset-0 transition-colors duration-700 ${
            mode === 'victory' && sceneIdx === 2
              ? 'bg-gradient-to-t from-[#06243B]/85 via-[#06243B]/25 to-black/35'
              : 'bg-gradient-to-t from-[#030D1A]/90 via-[#071C33]/40 to-black/55'
          }`}
          aria-hidden="true"
        />

        {/* Dramatic Anime Speed Lines / Energy Rings */}
        {(sceneIdx === 1 || sceneIdx === 2) && !(mode === 'victory' && sceneIdx === 2) && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35" aria-hidden="true">
            <svg
              viewBox="0 0 400 400"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] cosmic-vortex"
            >
              <circle
                cx="200"
                cy="200"
                r="172"
                fill="none"
                stroke={theme.accent}
                strokeWidth="3"
                strokeDasharray="18 22"
              />
              <circle
                cx="200"
                cy="200"
                r="125"
                fill="none"
                stroke="#FDE047"
                strokeWidth="2.5"
                strokeDasharray="10 18"
              />
            </svg>
          </div>
        )}

        {/* White Impact Flash on Reveal / KO */}
        {sceneIdx === 1 && (
          <motion.div
            key={`flash-${mode}-${sceneIdx}`}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="pointer-events-none absolute inset-0 bg-white z-20"
            aria-hidden="true"
          />
        )}

        {/* SCENE CONTENT */}
        <div className="relative z-10 w-full max-w-4xl px-4 sm:px-8 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {/* ======================================================= */}
            {/* ENCOUNTER MODE: 3 EPIC SCENES                           */}
            {/* ======================================================= */}
            {mode === 'encounter' && sceneIdx === 0 && (
              <motion.div
                key="enc-0"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Looming Boss Silhouette */}
                <motion.div
                  animate={{ y: [0, -10, 0], scale: [0.96, 1.05, 0.98] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div
                    className="absolute inset-0 -m-6 rounded-full opacity-55"
                    style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 72%)` }}
                    aria-hidden="true"
                  />
                  <div className="relative brightness-0 contrast-200 opacity-90 drop-shadow-[0_0_24px_rgba(255,255,255,0.6)]">
                    <AnimatedBoss
                      chapterId={chapterId}
                      state="enraged"
                      phonkPlaying
                      size="xl"
                      interactive={false}
                    />
                  </div>
                </motion.div>

                <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#FEF08A] tracking-wider uppercase">
                  <Zap className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                  <span>{activeCopy.kicker}</span>
                  <Zap className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                </div>
              </motion.div>
            )}

            {mode === 'encounter' && sceneIdx === 1 && (
              <motion.div
                key="enc-1"
                initial={{ opacity: 0, scale: 0.55, y: 26 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0.9 }}
                    animate={{ scale: [0.6, 1.5, 1.9], opacity: [0.85, 0.4, 0] }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 -m-6 rounded-full border-4"
                    style={{ borderColor: theme.accent }}
                  />
                  <div
                    className="rounded-3xl p-2 border-3 shadow-2xl"
                    style={{
                      borderColor: theme.accent,
                      boxShadow: `0 0 44px ${theme.glow}`,
                    }}
                  >
                    <AnimatedBoss
                      chapterId={chapterId}
                      state="enraged"
                      phonkPlaying
                      cosmicMode={chapterId === 5}
                      isSleeping={chapterId === 3}
                      size="xl"
                      interactive={false}
                    />
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-xs font-extrabold tracking-widest uppercase text-[#BAE6FD]">
                    {activeCopy.kicker}
                  </div>
                  <h1 className="mt-1 font-display text-3xl sm:text-5xl font-extrabold text-[#FEF08A] drop-shadow-[0_4px_14px_rgba(0,0,0,0.75)]">
                    {activeCopy.title}
                  </h1>
                </div>
              </motion.div>
            )}

            {mode === 'encounter' && sceneIdx === 2 && (
              <motion.div
                key="enc-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full flex flex-col items-center gap-4"
              >
                {/* EPIC ANIME VS FACE-OFF */}
                <div className="w-full max-w-2xl flex items-center justify-center gap-4 sm:gap-10">
                  <motion.div
                    initial={{ x: -90, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <AnimatedKibo
                      size="lg"
                      mood="excited"
                      interactive={false}
                      className="border-3 border-[#38BDF8] shadow-[0_0_28px_rgba(56,189,248,0.65)]"
                    />
                    <span className="font-display font-extrabold text-sm sm:text-base text-[#BAE6FD]">
                      KIBO & KAMU
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0, rotate: -25 }}
                    animate={{ scale: [0, 1.28, 1], rotate: [20, -8, 0] }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#FDE047] via-[#F59E0B] to-[#DC2626] border-3 border-white flex items-center justify-center shadow-[0_0_32px_rgba(251,191,36,0.9)]">
                      <span className="font-display font-extrabold text-2xl sm:text-3xl text-white drop-shadow">
                        VS
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 90, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <AnimatedBoss
                      chapterId={chapterId}
                      state="enraged"
                      phonkPlaying
                      cosmicMode={chapterId === 5}
                      isSleeping={chapterId === 3}
                      size="lg"
                      interactive={false}
                    />
                    <span className="font-display font-extrabold text-sm sm:text-base text-[#FEF08A]">
                      {boss.name.toUpperCase()}
                    </span>
                  </motion.div>
                </div>

                <motion.button
                  type="button"
                  initial={{ y: 16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  onClick={handleFinishNow}
                  className="game-btn-gold mt-1 inline-flex items-center gap-2 min-h-[50px] px-7 rounded-2xl text-sm sm:text-base font-extrabold cursor-pointer shadow-2xl"
                >
                  <Swords className="w-5 h-5" aria-hidden="true" />
                  <span>MULAI PERTARUNGAN!</span>
                </motion.button>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* VICTORY MODE: 3 EPIC SCENES                             */}
            {/* ======================================================= */}
            {mode === 'victory' && sceneIdx === 0 && (
              <motion.div
                key="vic-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl flex flex-col items-center gap-4"
              >
                <div className="relative w-full flex items-center justify-between gap-2 sm:gap-6 px-2">
                  <motion.div
                    animate={{ y: [0, -10, 0], scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <AnimatedKibo
                      size="lg"
                      mood="excited"
                      interactive={false}
                      className="border-3 border-[#FDE047] shadow-[0_0_32px_rgba(253,224,71,0.85)]"
                    />
                  </motion.div>

                  {/* Giant Golden Pindah Ruas Energy Beam! */}
                  <div className="relative flex-1 h-12 flex items-center">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: 'left center' }}
                      className="w-full h-7 sm:h-9 rounded-full bg-gradient-to-r from-[#38BDF8] via-[#FEF08A] to-[#F59E0B] shadow-[0_0_36px_rgba(253,224,71,0.95)] flex items-center justify-around px-3 overflow-hidden"
                    >
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#451A03]">
                        + → −
                      </span>
                      <span className="font-display font-extrabold text-lg sm:text-xl text-[#451A03]">
                        =
                      </span>
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-[#451A03]">
                        × → ÷
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    animate={{ x: [0, 8, -6, 10, 0], rotate: [0, 6, -6, 8, 0] }}
                    transition={{ duration: 0.35, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <AnimatedBoss
                      chapterId={chapterId}
                      state="hit"
                      phonkPlaying={false}
                      size="lg"
                      interactive={false}
                    />
                  </motion.div>
                </div>

                <div className="font-display text-2xl sm:text-4xl font-extrabold text-[#FEF08A] drop-shadow-[0_3px_12px_rgba(0,0,0,0.8)]">
                  {activeCopy.title}
                </div>
              </motion.div>
            )}

            {mode === 'victory' && sceneIdx === 1 && (
              <motion.div
                key="vic-1"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 2.3, opacity: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="pointer-events-none absolute inset-0 rounded-full border-4 border-[#FEF08A]"
                  />
                  <motion.div
                    animate={{ y: [0, 14], rotate: [0, -14], opacity: [1, 0.78] }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                  >
                    <AnimatedBoss
                      chapterId={chapterId}
                      state="defeated"
                      phonkPlaying={false}
                      size="xl"
                      interactive={false}
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ scale: 0.4, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="font-display text-3xl sm:text-5xl font-extrabold text-[#FDE047] drop-shadow-[0_4px_18px_rgba(234,88,12,0.85)]"
                >
                  {activeCopy.title}
                </motion.div>
              </motion.div>
            )}

            {mode === 'victory' && sceneIdx === 2 && (
              <motion.div
                key="vic-2"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="relative flex flex-col items-center gap-3"
              >
                {/* Falling Victory Confetti */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
                  {VICTORY_CONFETTI.map((c, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ y: -30, opacity: 1, rotate: 0 }}
                      animate={{ y: '105vh', opacity: [1, 1, 0.2], rotate: 420 }}
                      transition={{
                        duration: c.dur,
                        delay: c.delay,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{ left: c.left, backgroundColor: c.color }}
                      className="absolute top-0 w-3 h-4 rounded-xs shadow"
                    />
                  ))}
                </div>

                <div className="relative z-10 inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FEF08A] tracking-wider uppercase">
                  <Crown className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                  <span>{activeCopy.kicker}</span>
                  <Sparkles className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                </div>

                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <AnimatedKibo
                    size="xl"
                    crown
                    highFiveRaised
                    mood="excited"
                    interactive={false}
                    className="border-4 border-[#FDE047] shadow-[0_0_40px_rgba(253,224,71,0.8)]"
                  />
                </motion.div>

                <h1 className="relative z-10 font-display text-2xl sm:text-4xl font-extrabold text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.75)] text-balance">
                  {activeCopy.title}
                </h1>

                <button
                  type="button"
                  onClick={handleFinishNow}
                  className="relative z-10 game-btn-gold mt-1 inline-flex items-center gap-2 min-h-[50px] px-7 rounded-2xl text-sm sm:text-base font-extrabold cursor-pointer shadow-2xl"
                >
                  <Trophy className="w-5 h-5" aria-hidden="true" />
                  <span>Lanjut Rayakan!</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SUBTITLE & VIDEO PLAYER CONTROLS */}
      <div className="relative z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 sm:px-8 pt-4 pb-5 space-y-3">
        {/* Subtitle Caption Box */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base font-bold text-[#F0F9FF] leading-relaxed drop-shadow">
            {activeCopy.subtitle}
          </p>
        </div>

        {/* 3-Segment Scrubber & Play/Pause Bar */}
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isFinished) {
                setElapsedMs(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label={playing ? 'Jeda video' : 'Putar video'}
          >
            {playing ? (
              <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            )}
          </button>

          <div className="flex-1 grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((seg) => {
              const segStart = SCENE_BREAKS_MS[seg];
              const segEnd = SCENE_BREAKS_MS[seg + 1];
              const pct = Math.max(
                0,
                Math.min(100, ((elapsedMs - segStart) / (segEnd - segStart)) * 100)
              );
              return (
                <button
                  key={seg}
                  type="button"
                  onClick={() => {
                    setElapsedMs(segStart + 20);
                    setPlaying(true);
                  }}
                  aria-label={`Lompat ke adegan ${seg + 1}`}
                  className="h-2.5 rounded-full bg-white/20 overflow-hidden cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-[width] duration-75 ${
                      mode === 'victory'
                        ? 'bg-gradient-to-r from-[#FDE047] to-[#34D399]'
                        : 'bg-gradient-to-r from-[#38BDF8] to-[#F59E0B]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="font-mono text-xs font-bold text-[#BAE6FD] tabular-nums shrink-0">
            {formatTime(elapsedMs)} / {formatTime(TOTAL_DURATION_MS)}
          </span>
        </div>
      </div>
    </div>
  );
};
