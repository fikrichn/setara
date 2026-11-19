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
  Shuffle,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GameBoard } from './components/GameBoard';
import { KiboAvatar } from './components/KiboCompanion';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PocketGuide } from './components/PocketGuide';
import { PWAInstallButton } from './components/PWAInstallButton';
import { formatEquation, generatePracticeLevel } from './game/algebraEngine';
import { ALL_LEVELS, CHAPTERS, getNextLevel } from './game/levels';
import { sound } from './game/sound';
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
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { completed: {}, practiceSolved: 0, soundEnabled: true };
}

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('LOBBY');
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);
  const [practiceDifficulty, setPracticeDifficulty] = useState<'mudah' | 'sedang' | 'tantangan'>('mudah');
  const [progress, setProgress] = useState<ProgressStore>(() => loadProgress());
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  useEffect(() => {
    sound.enabled = progress.soundEnabled;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore quota errors
    }
  }, [progress]);

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

  const handleToggleSound = () => {
    setProgress((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
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

  // FULL-SCREEN ACTIVE GAME BOARD
  if (activeLevel) {
    const nextLvl = activeLevel.isPractice ? null : getNextLevel(activeLevel.id);
    return (
      <>
        <GameBoard
          level={activeLevel}
          soundEnabled={progress.soundEnabled}
          onToggleSound={handleToggleSound}
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
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col game-canvas-bg text-white pb-20 md:pb-6">
      {/* ANDROID GAME TOP STATUS HUD (Game-native, zero web-page chrome) */}
      <header className="sticky top-0 z-30 h-14 bg-[#091C16]/95 backdrop-blur-md border-b border-[#254E40]">
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FBBF24] to-[#C88617] border border-[#FEF3C7] text-[#11241E] font-display font-extrabold text-2xl flex items-center justify-center shadow">
              =
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-white whitespace-nowrap">
              SETARA
            </span>
          </button>

          {/* Desktop Game Mode Tabs */}
          <nav
            aria-label="Menu permainan"
            className="hidden md:flex items-center gap-2"
          >
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
                className={`min-h-[40px] px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  screen === id
                    ? 'bg-[#1D4E3E] text-[#FDE68A] border border-[#F5C156]/60'
                    : 'text-[#A8C9BD] hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Game Resource Counters & Sound */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold tabular-nums">
              <span className="inline-flex items-center gap-1 text-[#FDE68A]" title="Total Bintang">
                <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" aria-hidden="true" />
                {totalStars}
              </span>
              <span className="inline-flex items-center gap-1 text-[#5EEAD4]" title="Bos Dikalahkan">
                <Crown className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                {bossesDefeated}/{totalBosses}
              </span>
            </div>

            <PWAInstallButton variant="header" />

            <button
              type="button"
              onClick={handleToggleSound}
              className="game-btn-wood min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl cursor-pointer"
              aria-label={progress.soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            >
              {progress.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#FDE68A]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#7EA396]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME SCREEN */}
      <main className="flex-1 flex flex-col">
        {/* SCREEN 1: ANDROID GAME LOBBY */}
        {screen === 'LOBBY' && (
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left / Center Mobile Game Start Panel */}
            <section className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Kibo Podium Card */}
              <div className="w-full rounded-3xl game-panel p-4 sm:p-5 flex items-center gap-4 text-left">
                <KiboAvatar size="lg" animate />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-[#FDE68A]">
                    Kibo si Hiu Gemoy
                  </div>
                  <p className="mt-1 text-sm sm:text-base font-medium text-white leading-snug">
                    {completedCount === 0
                      ? '“Halo! Ayo mulai dari Bab 0 dulu — main simbol seru tanpa angka!”'
                      : `“Keren! Kamu sudah tuntas ${completedCount} stage & ${bossesDefeated} Bos! Lanjut yuk!”`}
                  </p>
                </div>
              </div>

              {/* Main Carved Game Title */}
              <div className="mt-6">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.06] text-balance">
                  Timbangan Pindah Ruas
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[#A8C9BD]">
                  6 Bab Petualangan · 6 Bos Penjaga · Gratis & Offline
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
                    <div className="w-10 h-10 rounded-xl bg-[#11241E]/15 flex items-center justify-center">
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
                    <Compass className="w-6 h-6 text-[#5EEAD4]" aria-hidden="true" />
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
                    <Shuffle className="w-6 h-6 text-[#FBBF24]" aria-hidden="true" />
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
                    <BookOpen className="w-6 h-6 text-[#FDE68A]" aria-hidden="true" />
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
              <div className="rounded-3xl overflow-hidden border-2 border-[#D4A853]/50 bg-[#112B22] shadow-2xl aspect-[16/10]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/hero_setara_board_1795079216335.jpg"
                    alt="Papan timbangan batu ukir Nusantara Setara"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-display text-3xl font-extrabold text-[#FDE68A]">
                    SETARA
                  </div>
                )}
              </div>

              {/* Quick Chapter Launch Grid */}
              <div className="rounded-2xl game-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-sm text-[#FDE68A]">
                    Pilih Cepat Bab (Semua Gratis)
                  </span>
                  <span className="text-xs font-mono text-[#9EC2B5] tabular-nums">
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
                        className={`min-h-[60px] rounded-xl p-2 flex flex-col items-center justify-center border transition-transform active:scale-95 cursor-pointer ${
                          bossBeat
                            ? 'bg-[#294B2B] border-[#FBBF24]/70 text-[#FDE68A]'
                            : 'bg-[#0E261E] border-[#295748] text-white hover:border-[#5EEAD4]'
                        }`}
                      >
                        <span className="font-display font-extrabold text-sm">Bab {ch.id}</span>
                        <span className="text-[11px] font-mono text-[#9EC2B5] tabular-nums">
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

        {/* SCREEN 2: ANDROID GAME WORLD / CHAPTER MAP */}
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
                        isActive ? 'text-[#161E1B]/80' : 'text-[#9EC2B5]'
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
              <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                {activeChapter.artwork && (
                  <div className="md:col-span-4 h-40 md:h-auto bg-[#0D251E] overflow-hidden">
                    <img
                      src={activeChapter.artwork}
                      alt={activeChapter.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`${
                    activeChapter.artwork ? 'md:col-span-8' : 'md:col-span-12'
                  } p-5 sm:p-6 flex flex-col justify-between gap-5`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-[#5EEAD4]">
                      {activeChapter.focusRule}
                    </div>
                    <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
                      {activeChapter.title}
                    </h1>
                    <p className="mt-1 text-sm text-[#C7DDD4]">{activeChapter.subtitle}</p>
                  </div>

                  {/* CHUNKY GAME STAGE NODES GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                          className={`rounded-2xl p-3.5 text-left flex flex-col justify-between gap-2.5 min-h-[118px] transition-transform active:scale-[0.97] cursor-pointer ${
                            isBoss
                              ? 'bg-gradient-to-b from-[#4B1D1F] to-[#2B1012] border-2 border-[#FBBF24] shadow-lg'
                              : stat
                                ? 'bg-[#164536] border-2 border-[#5EEAD4]/60 shadow-md'
                                : 'bg-[#0F2C23] border-2 border-[#2A5949] hover:border-[#FDE68A]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`font-display font-extrabold text-sm flex items-center gap-1 ${
                                isBoss ? 'text-[#FDE68A]' : 'text-white'
                              }`}
                            >
                              {isBoss ? (
                                <>
                                  <Crown className="w-4 h-4 text-[#FBBF24]" aria-hidden="true" />
                                  <span>BOS</span>
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
                                      ? 'text-[#FBBF24] fill-[#FBBF24]'
                                      : 'text-[#395F52]'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="font-display font-bold text-xs sm:text-sm text-white leading-snug line-clamp-2">
                              {lvl.title}
                            </div>
                            <div className="mt-1 font-mono text-[11px] font-semibold text-[#9EC2B5] truncate">
                              {isBoss
                                ? `${lvl.boss?.phases.length ?? 3} Fase · ${lvl.boss?.name}`
                                : isStage1
                                  ? 'Panduan Kibo · ' +
                                    formatEquation(lvl.initial, lvl.defaultVisual === 'pure_symbols')
                                  : formatEquation(lvl.initial, lvl.defaultVisual === 'pure_symbols')}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* SCREEN 3: ARCADE PRACTICE MODE */}
        {screen === 'ARCADE' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
            <div className="rounded-2xl game-panel p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <KiboAvatar size="md" animate />
                <div>
                  <p className="text-xs font-extrabold text-[#FDE68A]">Mode Latihan Tanpa Batas</p>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                    Arena Soal Acak
                  </h1>
                  <p className="text-xs sm:text-sm text-[#C7DDD4]">
                    Soal baru otomatis tanpa kuota internet. Cocok buat latihan ulangan!
                  </p>
                </div>
              </div>
              <div className="font-mono text-sm font-extrabold text-[#5EEAD4] tabular-nums">
                Tuntas: {progress.practiceSolved} soal
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  {
                    id: 'mudah' as const,
                    label: 'MUDAH',
                    example: 'x + 6 = 11',
                    desc: 'Pindah ruas tambah & kurang dengan bilangan positif maupun negatif.',
                    btnClass: 'game-btn-emerald',
                  },
                  {
                    id: 'sedang' as const,
                    label: 'SEDANG',
                    example: '3x − 4 = 11 · x/3 + 2 = 6',
                    desc: 'Perkalian koefisien (× → ÷) dan pecahan pembagian (÷ → ×).',
                    btnClass: 'game-btn-gold',
                  },
                  {
                    id: 'tantangan' as const,
                    label: 'TANTANGAN',
                    example: '4x − 3 = 2x + 7 · 2(x + 3) = 10',
                    desc: 'Variabel x di kedua ruas dan persamaan berkurung Aljabar SMP.',
                    btnClass: 'game-btn-gold',
                  },
                ]
              ).map((tier) => (
                <article
                  key={tier.id}
                  className="rounded-3xl game-panel p-5 sm:p-6 flex flex-col justify-between gap-5"
                >
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-white">{tier.label}</h2>
                    <p className="mt-2 font-mono text-sm font-bold text-[#FDE68A]">{tier.example}</p>
                    <p className="mt-2 text-sm text-[#C7DDD4] leading-relaxed">{tier.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartPractice(tier.id)}
                    className={`${tier.btnClass} w-full min-h-[50px] rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>MAIN {tier.label}</span>
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#091C16]/95 backdrop-blur-md border-t border-[#254E40] pb-safe"
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
                  active ? 'text-[#FDE68A]' : 'text-[#87ABA0]'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} aria-hidden="true" />
                <span className="text-[11px] font-extrabold tracking-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
