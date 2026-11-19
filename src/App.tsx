/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Compass,
  Crown,
  Home,
  Play,
  Settings,
  Shuffle,
  Star,
} from 'lucide-react';
import { AnimatedKibo } from './components/AnimatedKibo';
import { BeachBackdrop } from './components/BeachBackdrop';
import { GameBoard } from './components/GameBoard';
import { KiboAvatar } from './components/KiboCompanion';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PocketGuide } from './components/PocketGuide';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ExitConfirmModal, SettingsModal } from './components/SettingsExitModals';
import { formatEquation, generatePracticeLevel } from './game/algebraEngine';
import { ALL_LEVELS, CHAPTERS, getNextLevel } from './game/levels';
import { phonkMusic } from './game/phonkMusic';
import { sound } from './game/sound';
import { stageMusic } from './game/stageMusic';
import { LevelDef, ProgressStore } from './game/types';

type GameScreen = 'LOBBY' | 'MAP' | 'ARCADE' | 'CODEX';

const STORAGE_KEY = 'setara_progress_v1';

function loadProgress(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ProgressStore>;
      return {
        completed: parsed.completed ?? {},
        practiceSolved: parsed.practiceSolved ?? 0,
        soundEnabled: parsed.soundEnabled ?? true,
        musicVolume:
          typeof parsed.musicVolume === 'number'
            ? Math.max(0.15, Math.min(1, parsed.musicVolume))
            : 0.7,
        sfxVolume:
          typeof parsed.sfxVolume === 'number'
            ? Math.max(0, Math.min(1, parsed.sfxVolume))
            : 0.85,
      };
    }
  } catch {
    // Ignore storage errors
  }
  return {
    completed: {},
    practiceSolved: 0,
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.85,
  };
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('LOBBY');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [practiceDifficulty, setPracticeDifficulty] = useState<'mudah' | 'sedang' | 'tantangan'>('mudah');
  const [progress, setProgress] = useState<ProgressStore>(() => loadProgress());
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [lobbyKiboLine, setLobbyKiboLine] = useState<string | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [exitedGame, setExitedGame] = useState(false);

  // Sync audio volumes & persistence
  useEffect(() => {
    stageMusic.setVolume(progress.musicVolume);
    phonkMusic.setVolume(progress.musicVolume);
    sound.setVolume(progress.sfxVolume);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore quota errors
    }
  }, [progress]);

  // Always-active tropical beach stage music outside Boss levels (and unlock on first gesture)
  useEffect(() => {
    if (exitedGame) {
      stageMusic.stop();
      phonkMusic.stop();
      return;
    }

    const inBoss = !!activeLevel?.isBoss;
    if (!inBoss) {
      phonkMusic.stop();
      stageMusic.start();
    }

    const unlockAudio = () => {
      if (exitedGame) return;
      if (!activeLevel?.isBoss) {
        stageMusic.start();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [activeLevel, exitedGame]);

  const totalStars = useMemo(
    () => Object.values(progress.completed).reduce((sum, item) => sum + item.stars, 0),
    [progress.completed]
  );
  const completedCount = Object.keys(progress.completed).length;
  const maxStars = ALL_LEVELS.length * 3;
  const bossesDefeated = useMemo(
    () => ALL_LEVELS.filter((l) => l.isBoss && progress.completed[l.id]).length,
    [progress.completed]
  );
  const totalBosses = useMemo(() => ALL_LEVELS.filter((l) => l.isBoss).length, []);

  const resumeLevel = useMemo(() => {
    const nextUnfinished = ALL_LEVELS.find((lvl) => !progress.completed[lvl.id]);
    return nextUnfinished || ALL_LEVELS[0];
  }, [progress.completed]);

  const activeChapter = useMemo(
    () => CHAPTERS.find((c) => c.id === selectedChapterId) || CHAPTERS[0],
    [selectedChapterId]
  );

  const handleChangeMusicVolume = (val: number) => {
    const clamped = Math.max(0.15, Math.min(1, val));
    setProgress((prev) => ({ ...prev, musicVolume: clamped }));
  };

  const handleChangeSfxVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setProgress((prev) => ({ ...prev, sfxVolume: clamped, soundEnabled: clamped > 0.01 }));
  };

  const handleReturnToMenu = () => {
    setSettingsOpen(false);
    setActiveLevel(null);
    setScreen('LOBBY');
  };

  const handleConfirmExit = () => {
    setExitConfirmOpen(false);
    setSettingsOpen(false);
    stageMusic.stop();
    phonkMusic.stop();

    // Native Android Capacitor exit if available
    const cap = (
      window as unknown as {
        Capacitor?: { Plugins?: { App?: { exitApp?: () => void } } };
      }
    ).Capacitor;
    if (cap?.Plugins?.App?.exitApp) {
      try {
        cap.Plugins.App.exitApp();
      } catch {
        // Fallback below
      }
    }

    try {
      window.close();
    } catch {
      // Browsers may ignore window.close()
    }
    setActiveLevel(null);
    setExitedGame(true);
  };

  const handleCompleteLevel = (level: LevelDef, moves: number, stars: number) => {
    setProgress((prev) => {
      if (level.isPractice) {
        return { ...prev, practiceSolved: prev.practiceSolved + 1 };
      }
      const existing = prev.completed[level.id];
      const bestStars = Math.max(existing?.stars ?? 0, stars);
      const bestMoves = existing ? Math.min(existing.bestMoves, moves) : moves;
      return {
        ...prev,
        completed: {
          ...prev.completed,
          [level.id]: { stars: bestStars, bestMoves },
        },
      };
    });
  };

  const handleStartPractice = (diff: 'mudah' | 'sedang' | 'tantangan') => {
    sound.playPickup();
    setPracticeDifficulty(diff);
    setActiveLevel(generatePracticeLevel(diff));
  };

  const handleStartChapter = (chapterId: number) => {
    sound.playPickup();
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (ch && ch.levels.length > 0) {
      setSelectedChapterId(chapterId);
      setActiveLevel(ch.levels[0]);
    }
  };

  // GOODBYE SCREEN (for browser/WebView if OS doesn't terminate process immediately)
  if (exitedGame) {
    return (
      <div className="relative min-h-[100dvh] flex items-center justify-center game-canvas-bg p-5">
        <BeachBackdrop />
        <div className="relative z-10 w-full max-w-md rounded-3xl game-panel p-7 text-center shadow-2xl animate-pop-in">
          <div className="flex flex-col items-center">
            <AnimatedKibo size="xl" mood="crying" interactive={false} />
            <h1 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]">
              Sampai Jumpa Lagi!
            </h1>
            <p className="mt-2 text-sm text-[#35637A] leading-relaxed">
              Kibo menunggumu kembali bermain aljabar di Pantai Setara kapan saja kamu siap!
            </p>
            <button
              type="button"
              onClick={() => {
                sound.playKiboGiggle();
                setExitedGame(false);
                setScreen('LOBBY');
              }}
              className="mt-6 game-btn-gold w-full min-h-[52px] rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>Buka Game Lagi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const modals = (
    <>
      <SettingsModal
        open={settingsOpen}
        musicVolume={progress.musicVolume}
        sfxVolume={progress.sfxVolume}
        canReturnToMenu={!!activeLevel || screen !== 'LOBBY'}
        onChangeMusicVolume={handleChangeMusicVolume}
        onChangeSfxVolume={handleChangeSfxVolume}
        onReturnToMenu={handleReturnToMenu}
        onRequestExit={() => {
          setSettingsOpen(false);
          setExitConfirmOpen(true);
        }}
        onClose={() => setSettingsOpen(false)}
      />
      <ExitConfirmModal
        open={exitConfirmOpen}
        onStay={() => setExitConfirmOpen(false)}
        onConfirmExit={handleConfirmExit}
      />
    </>
  );

  // FULL-SCREEN ACTIVE GAME BOARD
  if (activeLevel) {
    const nextLvl = activeLevel.isPractice ? null : getNextLevel(activeLevel.id);
    return (
      <>
        <GameBoard
          level={activeLevel}
          onOpenSettings={() => setSettingsOpen(true)}
          onExit={() => setActiveLevel(null)}
          onComplete={handleCompleteLevel}
          onNextLevel={() => {
            if (nextLvl) {
              setSelectedChapterId(nextLvl.chapterId);
              setActiveLevel(nextLvl);
            } else {
              setActiveLevel(null);
            }
          }}
          hasNextLevel={!!nextLvl}
          onNewPractice={() => setActiveLevel(generatePracticeLevel(practiceDifficulty))}
        />
        {modals}
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col game-canvas-bg text-[#0D354C] pb-20 md:pb-6">
      <BeachBackdrop />

      {/* COASTAL ANDROID GAME TOP STATUS HUD */}
      <header className="sticky top-0 z-30 h-14 bg-[#0D4A6B]/92 backdrop-blur-md border-b-2 border-[#7DD3FC]/55 text-white shadow-md">
        <div className="max-w-6xl mx-auto h-full px-3.5 sm:px-6 flex items-center justify-between gap-4">
          {/* Game Crest */}
          <button
            type="button"
            onClick={() => {
              sound.playPickup();
              setScreen('LOBBY');
            }}
            className="flex items-center gap-2.5 shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#FEF9C3] text-[#291802] font-display font-extrabold text-2xl flex items-center justify-center shadow">
              =
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white whitespace-nowrap">
              SETARA
            </span>
          </button>

          {/* Desktop Game Mode Tabs */}
          <nav aria-label="Menu permainan" className="hidden md:flex items-center gap-2">
            {(
              [
                ['LOBBY', 'Lobi'],
                ['MAP', 'Peta Bab'],
                ['ARCADE', 'Latihan Acak'],
                ['CODEX', 'Buku Saku'],
              ] as [GameScreen, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.playPickup();
                  setScreen(id);
                }}
                className={`min-h-[40px] px-4 rounded-xl text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                  screen === id
                    ? 'bg-[#FEF08A] text-[#0D354C] shadow'
                    : 'text-[#E0F2FE] hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Game Resource Counters & Settings */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold tabular-nums">
              <span className="inline-flex items-center gap-1 text-[#FEF08A]" title="Total Bintang">
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" aria-hidden="true" />
                {totalStars}
              </span>
              <span className="inline-flex items-center gap-1 text-[#7DD3FC]" title="Bos Dikalahkan">
                <Crown className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                {bossesDefeated}/{totalBosses}
              </span>
            </div>

            <PWAInstallButton variant="header" />

            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                setSettingsOpen(true);
              }}
              className="game-btn-wood min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl cursor-pointer"
              aria-label="Pengaturan"
              title="Pengaturan"
            >
              <Settings className="w-4.5 h-4.5 text-[#0D354C]" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME SCREEN */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* SCREEN 1: TROPICAL BEACH GAME LOBBY */}
        {screen === 'LOBBY' && (
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left / Center Mobile Game Start Panel */}
            <section className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Kibo Podium Card */}
              <div className="w-full rounded-3xl game-panel p-4 sm:p-5 flex items-center gap-4 text-left">
                <KiboAvatar
                  size="lg"
                  mood={lobbyKiboLine ? 'excited' : 'happy'}
                  interactive
                  onInteract={(quip) => setLobbyKiboLine(quip)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-[#0284C7]">Kibo si Hiu Gemoy</div>
                  <p className="mt-1 text-sm sm:text-base font-semibold text-[#0D354C] leading-snug">
                    {lobbyKiboLine
                      ? `“${lobbyKiboLine}”`
                      : completedCount === 0
                        ? '“Halo! Ayo main di Pantai Bab 0 dulu — seru belajar simbol tanpa angka!”'
                        : `“Keren! Kamu sudah tuntas ${completedCount} stage & ${bossesDefeated} Bos! Lanjut yuk!”`}
                  </p>
                </div>
              </div>

              {/* Main Friendly Game Title */}
              <div className="mt-6">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0B3B56] leading-[1.06] text-balance drop-shadow-[0_2px_0_rgba(255,255,255,0.75)]">
                  Timbangan Pindah Ruas
                </h1>
                <p className="mt-2 text-sm sm:text-base font-bold text-[#145374]">
                  6 Bab · 120 Stage · 6 Bos Penjaga · Gratis & Offline
                </p>
              </div>

              {/* BIG CHUNKY PRIMARY PLAY BUTTON */}
              <div className="mt-6 w-full max-w-md space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    setActiveLevel(resumeLevel);
                  }}
                  className="game-btn-gold w-full min-h-[60px] px-6 rounded-2xl flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#78350F]/15 flex items-center justify-center">
                      <Play className="w-6 h-6 fill-current" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <div className="font-display font-extrabold text-lg leading-tight">
                        {completedCount > 0 ? 'LANJUT MAIN' : 'MULAI PETUALANGAN'}
                      </div>
                      <div className="text-xs font-bold opacity-85">
                        Bab {resumeLevel.chapterId} ·{' '}
                        {resumeLevel.isBoss
                          ? resumeLevel.boss?.name
                          : `Stage ${resumeLevel.levelNumber}: ${resumeLevel.title}`}
                      </div>
                    </div>
                  </div>
                </button>

                {/* 3 CHUNKY ANDROID MENU BUTTONS */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setScreen('MAP');
                    }}
                    className="game-btn-wood min-h-[76px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-6 h-6 text-[#0284C7]" aria-hidden="true" />
                    <span className="text-xs font-extrabold">Peta Bab</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setScreen('ARCADE');
                    }}
                    className="game-btn-wood min-h-[76px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shuffle className="w-6 h-6 text-[#D97706]" aria-hidden="true" />
                    <span className="text-xs font-extrabold">Latihan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setScreen('CODEX');
                    }}
                    className="game-btn-wood min-h-[76px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-6 h-6 text-[#0D9488]" aria-hidden="true" />
                    <span className="text-xs font-extrabold">Buku Saku</span>
                  </button>
                </div>

                <div className="flex justify-center lg:justify-start pt-1">
                  <PWAInstallButton variant="banner" />
                </div>
              </div>
            </section>

            {/* Right: Board Showcase + Quick Chapter Strip */}
            <section className="lg:col-span-6 space-y-4">
              <div className="rounded-3xl overflow-hidden border-3 border-[#FFFFFF]/85 bg-[#E0F2FE] shadow-xl aspect-[16/10]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_setara_board_1795079216335.jpg"
                    alt="Papan timbangan batu ukir Nusantara Setara"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-3xl font-extrabold text-[#0284C7]">
                    SETARA
                  </div>
                )}
              </div>

              {/* Quick Chapter Launch Grid */}
              <div className="rounded-3xl game-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-extrabold text-sm text-[#0D354C]">
                    Pilih Cepat Pulau Bab (20 Stage / Bab)
                  </span>
                  <span className="text-xs font-mono font-extrabold text-[#D97706] tabular-nums">
                    {totalStars}/{maxStars} ★
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CHAPTERS.map((ch) => {
                    const doneInCh = ch.levels.filter((l) => progress.completed[l.id]).length;
                    const bossBeat = ch.levels.some((l) => l.isBoss && progress.completed[l.id]);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          sound.playPickup();
                          setSelectedChapterId(ch.id);
                          setScreen('MAP');
                        }}
                        className={`min-h-[60px] rounded-2xl p-2 flex flex-col items-center justify-center border-2 transition-transform active:scale-95 cursor-pointer ${
                          bossBeat
                            ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                            : 'bg-[#EBF8FF] border-[#BAE6FD] text-[#0D354C] hover:border-[#0284C7]'
                        }`}
                      >
                        <span className="font-display font-extrabold text-sm">Bab {ch.id}</span>
                        <span className="text-[11px] font-mono font-bold text-[#35637A] tabular-nums">
                          {doneInCh}/{ch.levels.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SCREEN 2: TROPICAL ISLAND WORLD / CHAPTER MAP (20 STAGES PER BAB) */}
        {screen === 'MAP' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-5">
            {/* Horizontal Chapter World Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CHAPTERS.map((ch) => {
                const isActive = ch.id === activeChapter.id;
                const done = ch.levels.filter((l) => progress.completed[l.id]).length;
                const bossWon = ch.levels.some((l) => l.isBoss && progress.completed[l.id]);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setSelectedChapterId(ch.id);
                    }}
                    className={`min-h-[52px] px-4 rounded-2xl flex flex-col items-start justify-center shrink-0 transition-all cursor-pointer ${
                      isActive ? 'game-btn-gold' : 'game-btn-wood'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-display font-extrabold text-sm whitespace-nowrap">
                      <span>Bab {ch.id}</span>
                      {bossWon && <Crown className="w-3.5 h-3.5" aria-hidden="true" />}
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold tabular-nums ${
                        isActive ? 'text-[#291802]/80' : 'text-[#35637A]'
                      }`}
                    >
                      {done}/{ch.levels.length} stage
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Chapter Island Card */}
            <section className="rounded-3xl game-panel overflow-hidden">
              <div className="p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#BAE6FD]">
                  <div>
                    <div className="text-xs font-extrabold text-[#0284C7]">
                      {activeChapter.focusRule} · {activeChapter.levels.length} Stage
                    </div>
                    <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]">
                      {activeChapter.title}
                    </h1>
                    <p className="mt-1 text-sm text-[#35637A]">{activeChapter.subtitle}</p>
                  </div>
                </div>

                {/* 20 CHUNKY GAME STAGE NODES GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                  {activeChapter.levels.map((lvl) => {
                    const stat = progress.completed[lvl.id];
                    const isBoss = !!lvl.isBoss;
                    const isStage1 = lvl.levelNumber === 1;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => {
                          sound.playPickup();
                          setActiveLevel(lvl);
                        }}
                        className={`rounded-2xl p-3 text-left flex flex-col justify-between gap-2 min-h-[108px] transition-transform active:scale-[0.97] cursor-pointer ${
                          isBoss
                            ? 'col-span-2 sm:col-span-2 md:col-span-2 bg-gradient-to-br from-[#0F3854] to-[#1D5B7F] border-2 border-[#F59E0B] text-white shadow-lg'
                            : stat
                              ? 'bg-[#ECFEFF] border-2 border-[#2DD4BF] text-[#0D354C] shadow-sm'
                              : 'bg-[#FFFDF6] border-2 border-[#BAE6FD] text-[#0D354C] hover:border-[#0284C7]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`font-display font-extrabold text-sm flex items-center gap-1 ${
                              isBoss ? 'text-[#FEF08A]' : 'text-[#0D354C]'
                            }`}
                          >
                            {isBoss ? (
                              <>
                                <Crown className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                                <span>Stage 20 · BOS</span>
                              </>
                            ) : (
                              <span>Stage {lvl.levelNumber}</span>
                            )}
                          </span>

                          <div className="flex items-center gap-0.5" aria-hidden="true">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  stat && s <= stat.stars
                                    ? 'text-[#F59E0B] fill-[#FBBF24]'
                                    : isBoss
                                      ? 'text-[#475569]'
                                      : 'text-[#CBD5E1]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <div
                            className={`font-display font-bold text-xs leading-snug line-clamp-2 ${
                              isBoss ? 'text-white' : 'text-[#0D354C]'
                            }`}
                          >
                            {lvl.title}
                          </div>
                          <div
                            className={`mt-1 font-mono text-[10px] font-bold truncate ${
                              isBoss ? 'text-[#BAE6FD]' : 'text-[#3B6D84]'
                            }`}
                          >
                            {isBoss
                              ? `${lvl.boss?.phases.length ?? 3} Fase · ${lvl.boss?.name}`
                              : isStage1
                                ? 'Panduan Kibo'
                                : formatEquation(lvl.initial, lvl.defaultVisual === 'pure_symbols')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SCREEN 3: PURE-RANDOM PROCEDURAL ARCADE PRACTICE MODE */}
        {screen === 'ARCADE' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
            <div className="rounded-3xl game-panel p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <KiboAvatar size="md" animate />
                <div>
                  <p className="text-xs font-extrabold text-[#0284C7]">
                    Generator Soal Random Otomatis · 100% Acak
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]">
                    Arena Latihan Acak
                  </h1>
                  <p className="text-xs sm:text-sm text-[#35637A]">
                    Setiap soal dibuat otomatis secara acak oleh mesin matematika — tidak mengambil
                    dari stage!
                  </p>
                </div>
              </div>
              <div className="font-mono text-sm font-extrabold text-[#0284C7] tabular-nums">
                Tuntas: {progress.practiceSolved} soal
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  {
                    id: 'mudah' as const,
                    label: 'MUDAH',
                    example: 'x ± a = b · −x + a = b',
                    desc: 'Soal acak pindah ruas tambah, kurang, gabung angka, dan balik tanda.',
                    btnClass: 'game-btn-emerald',
                  },
                  {
                    id: 'sedang' as const,
                    label: 'SEDANG',
                    example: 'ax ± b = c · x/d ± b = c',
                    desc: 'Soal acak perkalian koefisien, pecahan pembagian, dua sisi x, dan kurung dasar.',
                    btnClass: 'game-btn-gold',
                  },
                  {
                    id: 'tantangan' as const,
                    label: 'TANTANGAN',
                    example: 'ax + b = dx + e · k(x + m) = dx + c',
                    desc: 'Soal acak aljabar SMP dengan tanda kurung, pengali negatif, dan variabel di kedua ruas.',
                    btnClass: 'game-btn-gold',
                  },
                ]
              ).map((tier) => (
                <article
                  key={tier.id}
                  className="rounded-3xl game-panel p-5 sm:p-6 flex flex-col justify-between gap-5"
                >
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-[#0D354C]">
                      {tier.label}
                    </h2>
                    <p className="mt-2 font-mono text-xs sm:text-sm font-extrabold text-[#B45309]">
                      {tier.example}
                    </p>
                    <p className="mt-2 text-sm text-[#35637A] leading-relaxed">{tier.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartPractice(tier.id)}
                    className={`${tier.btnClass} w-full min-h-[50px] rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>ACAK SOAL {tier.label}</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 4: KIBO RULEBOOK / CODEX */}
        {screen === 'CODEX' && <PocketGuide onStartChapter={handleStartChapter} />}
      </main>

      {/* MOBILE NATIVE ANDROID BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Navigasi game"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D4A6B]/95 backdrop-blur-md border-t-2 border-[#7DD3FC]/55 pb-safe"
      >
        <div className="grid grid-cols-4 h-15">
          {(
            [
              { id: 'LOBBY' as GameScreen, label: 'Lobi', Icon: Home },
              { id: 'MAP' as GameScreen, label: 'Peta Bab', Icon: Compass },
              { id: 'ARCADE' as GameScreen, label: 'Latihan', Icon: Shuffle },
              { id: 'CODEX' as GameScreen, label: 'Buku Saku', Icon: BookOpen },
            ]
          ).map(({ id, label, Icon }) => {
            const active = screen === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.playPickup();
                  setScreen(id);
                }}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[46px] transition-colors cursor-pointer ${
                  active ? 'text-[#FEF08A]' : 'text-[#BAE6FD]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} aria-hidden="true" />
                <span className="text-[11px] font-extrabold tracking-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {modals}
      <OfflineIndicator />
    </div>
  );
}
