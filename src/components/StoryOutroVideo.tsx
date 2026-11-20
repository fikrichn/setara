import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Crown,
  HelpCircle,
  Pause,
  Play,
  SkipForward,
  Sparkles,
  Sun,
  Trophy,
} from 'lucide-react';
import { sound } from '../game/sound';
import { AnimatedBoss, KiboSilhouetteBoss } from './AnimatedBoss';
import { AnimatedKibo } from './AnimatedKibo';

interface StoryOutroVideoProps {
  onFinish: () => void;
}

const TOTAL_DURATION_MS = 12800;
const SCENE_BREAKS_MS = [0, 4100, 8400, TOTAL_DURATION_MS] as const;

const VICTORY_BG_SRC = '/src/assets/images/boss_victory_sunrise_1795103407988.jpg';
const BEACH_BG_SRC = '/src/assets/images/intro_beach_shore_1795102189593.jpg';

const OUTRO_CONFETTI = [
  { left: '6%', color: '#FDE047', delay: 0.05, dur: 2.3 },
  { left: '15%', color: '#38BDF8', delay: 0.25, dur: 2.6 },
  { left: '24%', color: '#FB7185', delay: 0.12, dur: 2.1 },
  { left: '34%', color: '#34D399', delay: 0.35, dur: 2.4 },
  { left: '45%', color: '#FBBF24', delay: 0.18, dur: 2.5 },
  { left: '56%', color: '#F0ABFC', delay: 0.3, dur: 2.7 },
  { left: '66%', color: '#38BDF8', delay: 0.08, dur: 2.2 },
  { left: '77%', color: '#FDE047', delay: 0.22, dur: 2.5 },
  { left: '86%', color: '#FB7185', delay: 0.15, dur: 2.3 },
  { left: '93%', color: '#34D399', delay: 0.4, dur: 2.1 },
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

export const StoryOutroVideo: React.FC<StoryOutroVideoProps> = ({ onFinish }) => {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [bgFailed, setBgFailed] = useState(false);

  const lastSceneRef = useRef(-1);
  const finishedRef = useRef(false);

  const sceneIdx = getSceneIndex(elapsedMs);
  const isFinished = elapsedMs >= TOTAL_DURATION_MS;

  const sceneCopy = useMemo(
    () => [
      {
        kicker: 'Bab 5 Tuntas · Badai Kosmik Mereda',
        title: 'Samudra Setara Kembali Damai!',
        subtitle:
          'Cthulhu Samudra akhirnya kembali tenang setelah 10 persamaan kosmik berhasil kamu seimbangkan dengan gemilang.',
      },
      {
        kicker: 'Juara Sejati Pindah Ruas · Bab 0 s.d. Bab 5',
        title: 'Semua Pulau Bebas & Terang!',
        subtitle:
          'Dari Pantai Simbol hingga Palung Terdalam, timbangan emas Nusantara kembali seimbang bersama Kibo si Hiu Gemoy!',
      },
      {
        kicker: 'Epilog Rahasia · Cakrawala Baru...',
        title: 'Siapa di Balik Ombak Bab 6?!',
        subtitle:
          'Tunggu... bayangan sirip hiu misterius muncul di ufuk samudra! Bersiaplah menantikan Bab 6 Segera Hadir!',
      },
    ],
    []
  );

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

  useEffect(() => {
    if (sceneIdx === lastSceneRef.current) return;
    lastSceneRef.current = sceneIdx;

    if (sceneIdx === 0) sound.playBossVictory();
    if (sceneIdx === 1) sound.playHighFive();
    if (sceneIdx === 2) sound.playBossTaunt();
  }, [sceneIdx]);

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

  const activeBg = sceneIdx === 1 ? BEACH_BG_SRC : VICTORY_BG_SRC;
  const activeCopy = sceneCopy[sceneIdx];

  return (
    <div
      className="fixed inset-0 z-[75] flex flex-col bg-[#031322] text-white overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Outro Ending Setara Bab 5"
    >
      {/* Top Bar */}
      <div className="relative z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 via-black/45 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FDE047] to-[#D97706] text-[#291802] flex items-center justify-center shrink-0 shadow-lg">
            <Trophy className="w-4 h-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold tracking-wide text-[#FEF08A] truncate">
              OUTRO ENDING · TAMAT BAB 0–5
            </div>
            <div className="font-display font-extrabold text-sm sm:text-base text-white truncate">
              Fajar Damai Pantai Setara
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinishNow}
          className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-xs sm:text-sm font-extrabold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>Selesai</span>
          <SkipForward className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBg}
            initial={{ opacity: 0.25, scale: 1.07 }}
            animate={{ opacity: 1, scale: [1.03, 1.11] }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.7 },
              scale: { duration: 11, ease: 'linear' },
            }}
            className="absolute inset-0"
          >
            {!bgFailed ? (
              <img
                src={activeBg}
                alt="Fajar damai di Pantai Setara setelah menyelesaikan seluruh bab"
                referrerPolicy="no-referrer"
                onError={() => setBgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0E7490] via-[#1D4ED8] to-[#0F172A]" />
            )}
          </motion.div>
        </AnimatePresence>

        <div
          className={`pointer-events-none absolute inset-0 transition-colors duration-700 ${
            sceneIdx === 2
              ? 'bg-gradient-to-t from-[#020617]/95 via-[#0F172A]/65 to-[#1E1B4B]/70'
              : 'bg-gradient-to-t from-[#041E30]/90 via-[#07304C]/30 to-black/35'
          }`}
          aria-hidden="true"
        />

        {/* Celebratory Confetti on Scene 0 & 1 */}
        {sceneIdx < 2 && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-10" aria-hidden="true">
            {OUTRO_CONFETTI.map((c, idx) => (
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
        )}

        <div className="relative z-20 w-full max-w-4xl px-4 sm:px-8 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {sceneIdx === 0 && (
              <motion.div
                key="outro-0"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.06 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FEF08A] tracking-wider uppercase">
                  <Sun className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                  <span>{activeCopy.kicker}</span>
                  <Sparkles className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                </div>

                <div className="flex items-center justify-center gap-5 sm:gap-8">
                  <AnimatedKibo
                    size="lg"
                    crown
                    highFiveRaised
                    mood="excited"
                    interactive={false}
                    className="border-3 border-[#FDE047] shadow-[0_0_32px_rgba(253,224,71,0.75)]"
                  />
                  <div className="opacity-85">
                    <AnimatedBoss
                      chapterId={5}
                      state="defeated"
                      phonkPlaying={false}
                      size="lg"
                      interactive={false}
                    />
                  </div>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.75)]">
                  {activeCopy.title}
                </h1>
              </motion.div>
            )}

            {sceneIdx === 1 && (
              <motion.div
                key="outro-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#FEF08A] tracking-wider uppercase">
                  <Crown className="w-4 h-4 text-[#FDE047]" aria-hidden="true" />
                  <span>{activeCopy.kicker}</span>
                </div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <AnimatedKibo
                    size="xl"
                    crown
                    highFiveRaised
                    mood="excited"
                    reaction="happy_dance"
                    interactive={false}
                    className="border-4 border-[#FDE047] shadow-[0_0_40px_rgba(253,224,71,0.85)]"
                  />
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((chId) => (
                    <AnimatedBoss
                      key={chId}
                      chapterId={chId}
                      state="defeated"
                      phonkPlaying={false}
                      size="sm"
                      interactive={false}
                    />
                  ))}
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#FEF08A] drop-shadow-[0_3px_14px_rgba(0,0,0,0.8)]">
                  {activeCopy.title}
                </h1>
              </motion.div>
            )}

            {sceneIdx === 2 && (
              <motion.div
                key="outro-2"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#67E8F9] tracking-wider uppercase">
                  <HelpCircle className="w-4 h-4 text-[#22D3EE]" aria-hidden="true" />
                  <span>{activeCopy.kicker}</span>
                </div>

                <div className="flex items-center justify-center gap-5 sm:gap-9">
                  <AnimatedKibo
                    size="lg"
                    mood="thinking"
                    interactive={false}
                    className="border-3 border-[#38BDF8] shadow-xl"
                  />
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-[#FEF08A]">
                    ?!
                  </span>
                  <motion.div
                    animate={{ y: [0, -6, 0], scale: [0.98, 1.04, 0.98] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <KiboSilhouetteBoss size="xl" interactive={false} />
                  </motion.div>
                </div>

                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#E0F2FE] drop-shadow-[0_3px_14px_rgba(0,0,0,0.85)]">
                  {activeCopy.title}
                </h1>

                <button
                  type="button"
                  onClick={handleFinishNow}
                  className="game-btn-gold mt-1 inline-flex items-center gap-2 min-h-[50px] px-7 rounded-2xl text-sm sm:text-base font-extrabold cursor-pointer shadow-2xl"
                >
                  <Trophy className="w-5 h-5" aria-hidden="true" />
                  <span>Tutup & Simpan Kenangan</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Subtitle & Player Controls */}
      <div className="relative z-30 bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 sm:px-8 pt-4 pb-5 space-y-3">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm sm:text-base font-bold text-[#F0F9FF] leading-relaxed drop-shadow">
            {activeCopy.subtitle}
          </p>
        </div>

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
            aria-label={playing ? 'Jeda outro' : 'Putar outro'}
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
                    className="h-full rounded-full bg-gradient-to-r from-[#FDE047] to-[#38BDF8] transition-[width] duration-75"
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
