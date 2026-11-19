import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Pause, Play, SkipForward, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../game/sound';
import { stageMusic } from '../game/stageMusic';
import { AnimatedKibo, KiboMood, KiboReaction } from './AnimatedKibo';

interface KiboIntroVideoProps {
  onFinish: () => void;
}

interface IntroScene {
  id: number;
  startSec: number;
  endSec: number;
  backdrop: string;
  fallbackGradient: string;
  chapterTag: string;
  speaker: string;
  subtitle: string;
  kiboVisible: boolean;
  kiboMood: KiboMood;
  kiboReaction: KiboReaction;
  kiboHighFive?: boolean;
  showSplash?: boolean;
  showTiles?: boolean;
}

const TOTAL_DURATION_SEC = 18;

const INTRO_SCENES: IntroScene[] = [
  {
    id: 0,
    startSec: 0,
    endSec: 4.5,
    backdrop: '/src/assets/images/intro_beach_shore_1795102189593.jpg',
    fallbackGradient: 'linear-gradient(180deg, #7DD3FC 0%, #38BDF8 55%, #FDE68A 100%)',
    chapterTag: 'Adegan 1 · Pantai Setara',
    speaker: 'Narator',
    subtitle:
      'Suatu pagi yang cerah, langkah kakimu tiba di tepi Pantai Setara — tempat legenda timbangan pindah ruas berada...',
    kiboVisible: false,
    kiboMood: 'idle',
    kiboReaction: 'none',
  },
  {
    id: 1,
    startSec: 4.5,
    endSec: 9,
    backdrop: '/src/assets/images/intro_beach_shore_1795102189593.jpg',
    fallbackGradient: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 55%, #FDE68A 100%)',
    chapterTag: 'Adegan 2 · Pertemuan Pertama',
    speaker: 'Narator',
    subtitle:
      'BYUUR!! Tiba-tiba ombak berkilau memercik, dan seekor hiu kecil gemoy bersyal emas melompat ceria tepat di hadapanmu!',
    kiboVisible: true,
    kiboMood: 'excited',
    kiboReaction: 'cheer_jump',
    showSplash: true,
  },
  {
    id: 2,
    startSec: 9,
    endSec: 13.5,
    backdrop: '/src/assets/images/intro_beach_shore_1795102189593.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0EA5E9 0%, #0284C7 55%, #FDE68A 100%)',
    chapterTag: 'Adegan 3 · Salam Kenal!',
    speaker: 'Kibo si Hiu Gemoy',
    subtitle:
      '“Halo, teman baru!! Aku Kibo! Ayo jadi sahabatku — bersama kita bisa menaklukkan rahasia tanda sama dengan (=)!”',
    kiboVisible: true,
    kiboMood: 'happy',
    kiboReaction: 'happy_dance',
  },
  {
    id: 3,
    startSec: 13.5,
    endSec: 18,
    backdrop: '/src/assets/images/intro_ocean_adventure_1795102188348.jpg',
    fallbackGradient: 'linear-gradient(180deg, #0369A1 0%, #0EA5E9 55%, #FEF08A 100%)',
    chapterTag: 'Adegan 4 · Petualangan Dimulai',
    speaker: 'Kibo si Hiu Gemoy',
    subtitle:
      '“Enam pulau penuh teka-teki dan 6 Bos Samudra menanti kita! Siap berpetualang bareng Kibo? Tos dulu yuk!”',
    kiboVisible: true,
    kiboMood: 'excited',
    kiboReaction: 'treasure_sparkle',
    kiboHighFive: true,
    showTiles: true,
  },
];

function formatTime(sec: number): string {
  const s = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(sec)));
  return `0:${s < 10 ? '0' : ''}${s}`;
}

export const KiboIntroVideo: React.FC<KiboIntroVideoProps> = ({ onFinish }) => {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [audioActivated, setAudioActivated] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const lastSceneIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  const activeScene =
    INTRO_SCENES.find((sc) => elapsed >= sc.startSec && elapsed < sc.endSec) ??
    INTRO_SCENES[INTRO_SCENES.length - 1];
  const isFinished = elapsed >= TOTAL_DURATION_SEC;

  const unlockIntroAudio = useCallback(() => {
    if (!audioActivated) {
      setAudioActivated(true);
      stageMusic.start();
      sound.playKiboGiggle();
    }
  }, [audioActivated]);

  // Smooth 60fps video playback clock
  useEffect(() => {
    if (paused || isFinished) {
      lastFrameRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = now;
      }
      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      setElapsed((prev) => {
        const next = prev + dt;
        if (next >= TOTAL_DURATION_SEC) return TOTAL_DURATION_SEC;
        return next;
      });
      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, [paused, isFinished]);

  // Trigger playful sound cues on scene transitions once audio is unlocked
  useEffect(() => {
    if (activeScene.id !== lastSceneIdRef.current) {
      lastSceneIdRef.current = activeScene.id;
      if (audioActivated) {
        if (activeScene.id === 1) {
          sound.playTranspose();
        } else if (activeScene.id === 2) {
          sound.playKiboGiggle();
        } else if (activeScene.id === 3) {
          sound.playHighFive();
        }
      }
    }
  }, [activeScene.id, audioActivated]);

  // Keyboard shortcuts: Escape skips, Enter/Space advances or starts when finished
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sound.playPickup();
        onFinish();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        unlockIntroAudio();
        if (isFinished || activeScene.id === INTRO_SCENES.length - 1) {
          sound.playHighFive();
          onFinish();
        } else {
          const nextScene = INTRO_SCENES[activeScene.id + 1];
          if (nextScene) setElapsed(nextScene.startSec);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeScene.id, isFinished, onFinish, unlockIntroAudio]);

  const handleNextScene = () => {
    unlockIntroAudio();
    if (activeScene.id < INTRO_SCENES.length - 1) {
      setElapsed(INTRO_SCENES[activeScene.id + 1].startSec);
      setPaused(false);
    } else {
      sound.playHighFive();
      onFinish();
    }
  };

  const progressPct = Math.min(100, (elapsed / TOTAL_DURATION_SEC) * 100);
  const imgBroken = !!failedImages[activeScene.backdrop];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video Intro Bertemu Kibo"
      onPointerDown={unlockIntroAudio}
      className="fixed inset-0 z-[70] bg-[#061E2E] flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* CINEMATIC FULL-VIEWPORT ANIMATED SCENE STAGE */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        {/* Ken Burns Slow-Pan Storybook Backdrop Layer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScene.backdrop}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: activeScene.id % 2 === 0 ? 1.02 : 1.09, x: activeScene.id % 2 === 0 ? -10 : 10 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ background: activeScene.fallbackGradient }}
          >
            {!imgBroken && (
              <img
                src={activeScene.backdrop}
                alt="Pemandangan Pantai Setara"
                referrerPolicy="no-referrer"
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [activeScene.backdrop]: true }))
                }
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Measured Contrast Scrim for Crisp Subtitle & Controls Legibility */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#051C2B]/70 via-transparent to-[#041826]/92"
          aria-hidden="true"
        />

        {/* Animated Rolling Tropical Waves & Floating Sea Sparkles */}
        <div className="pointer-events-none absolute inset-x-0 bottom-20 sm:bottom-24 h-24 overflow-hidden opacity-55" aria-hidden="true">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-[115%] h-full anime-wave-slow">
            <path
              d="M0 64 Q 150 26 300 64 T 600 64 T 900 64 T 1200 64 L1200 120 L0 120 Z"
              fill="#38BDF8"
              opacity="0.45"
            />
          </svg>
        </div>

        {/* TOP CINEMA LETTERBOX HUD */}
        <header className="relative z-20 flex items-center justify-between gap-4 px-4 sm:px-8 pt-4 sm:pt-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#FEF9C3] text-[#291802] font-display font-extrabold text-2xl flex items-center justify-center shadow shrink-0">
              =
            </div>
            <div className="min-w-0">
              <div className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
                SETARA
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[#BAE6FD] truncate">
                {activeScene.chapterTag}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!audioActivated && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  unlockIntroAudio();
                }}
                className="min-h-[42px] px-3.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
              >
                <Volume2 className="w-4 h-4 text-[#FEF08A]" aria-hidden="true" />
                <span>Suara</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playPickup();
                onFinish();
              }}
              className="min-h-[42px] px-4 rounded-xl bg-[#0D354C]/80 hover:bg-[#0D354C] border border-[#7DD3FC]/55 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <span>Lewati Intro</span>
              <SkipForward className="w-4 h-4 text-[#FEF08A]" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* CENTER CHARACTER & ACTION STAGE */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
          <AnimatePresence mode="wait">
            {!activeScene.kiboVisible ? (
              /* Scene 1: Setara Emblem Floating Over Sunlit Cove */
              <motion.div
                key="intro-title-crest"
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.94 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-xl"
              >
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border-4 border-[#FEF9C3] text-[#291802] font-display font-extrabold text-5xl sm:text-6xl flex items-center justify-center shadow-2xl">
                  =
                </div>
                <h1 className="mt-4 font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_14px_rgba(4,24,38,0.75)] text-balance">
                  SETARA
                </h1>
                <p className="mt-2 text-sm sm:text-lg font-bold text-[#FEF08A] drop-shadow">
                  Petualangan Timbangan Pindah Ruas
                </p>
              </motion.div>
            ) : (
              /* Scenes 2-4: Kibo Leaps From Ocean Waves & Meets You! */
              <motion.div
                key={`kibo-scene-${activeScene.id}`}
                initial={
                  activeScene.id === 1
                    ? { opacity: 0, y: 120, scale: 0.55, rotate: -14 }
                    : { opacity: 0, scale: 0.88, y: 18 }
                }
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                className="relative flex flex-col items-center"
              >
                {/* Water Splash Shockwave Ring on Scene 2 Emergence */}
                {activeScene.showSplash && (
                  <>
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border-4 border-[#BAE6FD] animate-shockwave" />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1.05, 0.9], y: [10, -26, -34, -44] }}
                      transition={{ duration: 1.6, ease: 'easeOut' }}
                      className="pointer-events-none absolute -top-10 font-display font-extrabold text-2xl sm:text-3xl text-[#FEF08A] drop-shadow-[0_3px_10px_rgba(7,38,58,0.9)]"
                    >
                      BYUUR!!
                    </motion.div>
                  </>
                )}

                {/* Floating Magical Carved Algebra Cards Orbiting on Scene 4 */}
                {activeScene.showTiles && (
                  <div className="pointer-events-none absolute inset-0 -m-10 sm:-m-14" aria-hidden="true">
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [-8, -2, -8] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -left-6 sm:-left-12 top-4 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#2DD4BF] to-[#0F766E] border-2 border-[#CCFBF1] text-white font-mono font-extrabold text-lg flex items-center justify-center shadow-xl"
                    >
                      +3
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -12, 0], rotate: [6, -2, 6] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                      className="absolute -right-6 sm:-right-12 top-6 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#FB7185] to-[#BE123C] border-2 border-[#FFE4E6] text-white font-mono font-extrabold text-lg flex items-center justify-center shadow-xl"
                    >
                      −3
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -8, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.0, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                      className="absolute -right-4 sm:-right-8 bottom-4 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#FDE047] to-[#D97706] border-2 border-[#FEF9C3] text-[#291802] font-mono font-extrabold text-xl flex items-center justify-center shadow-xl"
                    >
                      x
                    </motion.div>
                  </div>
                )}

                {/* Live Animated Anime Kibo Meeting You! */}
                <AnimatedKibo
                  size="xl"
                  mood={activeScene.kiboMood}
                  reaction={activeScene.kiboReaction}
                  highFiveRaised={activeScene.kiboHighFive}
                  crown={activeScene.id === 3}
                  interactive
                  onInteract={() => sound.playKiboGiggle()}
                  className="border-4 border-[#FEF08A] shadow-[0_18px_45px_rgba(4,24,38,0.65)]"
                />

                {activeScene.id === 3 && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 16, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      unlockIntroAudio();
                      sound.playHighFive();
                      onFinish();
                    }}
                    className="mt-5 game-btn-gold min-h-[54px] px-7 rounded-2xl text-base sm:text-lg font-extrabold inline-flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-2xl"
                  >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                    <span>Mulai Petualangan!</span>
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM SUBTITLE & CINEMA VIDEO CONTROLS */}
        <footer className="relative z-20 px-4 sm:px-8 pb-5 sm:pb-7 max-w-4xl w-full mx-auto space-y-3.5">
          {/* Subtitle Dialogue Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScene.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
              className="rounded-2xl bg-[#072336]/88 border-2 border-[#7DD3FC]/45 px-4 sm:px-6 py-3.5 sm:py-4 text-center shadow-2xl"
            >
              <div className="text-xs font-extrabold text-[#FEF08A] tracking-wide">
                {activeScene.speaker}
              </div>
              <p className="mt-1 text-sm sm:text-lg font-semibold text-white leading-relaxed text-balance">
                {activeScene.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Video Timeline Bar + Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                unlockIntroAudio();
                if (isFinished) {
                  setElapsed(0);
                  setPaused(false);
                } else {
                  setPaused((p) => !p);
                }
              }}
              aria-label={paused || isFinished ? 'Putar video intro' : 'Jeda video intro'}
              className="min-h-[42px] min-w-[42px] rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              {paused || isFinished ? (
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              ) : (
                <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
              )}
            </button>

            {/* Segmented Interactive Video Progress Scrubber */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="grid grid-cols-4 gap-1.5">
                {INTRO_SCENES.map((sc) => {
                  const segPct =
                    elapsed <= sc.startSec
                      ? 0
                      : elapsed >= sc.endSec
                        ? 100
                        : ((elapsed - sc.startSec) / (sc.endSec - sc.startSec)) * 100;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockIntroAudio();
                        setElapsed(sc.startSec);
                        setPaused(false);
                      }}
                      aria-label={`Lompat ke ${sc.chapterTag}`}
                      className="h-2.5 rounded-full bg-white/20 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FEF08A]"
                    >
                      <div
                        style={{ width: `${segPct}%` }}
                        className="h-full bg-gradient-to-r from-[#FDE047] to-[#F59E0B] transition-[width] duration-75"
                      />
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#BAE6FD] tabular-nums">
                <span>
                  {formatTime(elapsed)} / {formatTime(TOTAL_DURATION_SEC)}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextScene();
              }}
              className="min-h-[42px] px-4 rounded-xl bg-[#FEF08A] hover:bg-[#FDE047] text-[#291802] text-xs sm:text-sm font-extrabold inline-flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              <span>{activeScene.id < INTRO_SCENES.length - 1 ? 'Lanjut' : 'Masuk Game'}</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
