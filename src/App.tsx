/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Compass,
  Crown,
  Home,
  Play,
  Settings,
  Shuffle,
  Star,
} from 'lucide-react';
import { BeachBackdrop } from './components/BeachBackdrop';
import { BeachEasterEggs } from './components/BeachEasterEggs';
import { DailyMissionsCard } from './components/DailyMissionsCard';
import { KiboAvatar, KiboSpecialEndingModal } from './components/KiboCompanion';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { SettingsModal } from './components/SettingsExitModals';
import { evaluateBadges } from './game/achievements';
import { generatePracticeLevel } from './game/algebraEngine';
import {
  EvaluatedDailyMission,
  createFreshDailyProgress,
  evaluateDailyMissions,
} from './game/dailyMissions';
import { getInitialLobbyKiboLine } from './game/kiboDialogues';
import { ALL_LEVELS, CHAPTERS, getNextLevel } from './game/levels';
import { phonkMusic } from './game/phonkMusic';
import { sound } from './game/sound';
import { stageMusic } from './game/stageMusic';
import { LevelDef, ProgressStore } from './game/types';

const GameBoard = lazy(() =>
  import('./components/GameBoard').then((m) => ({ default: m.GameBoard }))
);
const KiboIntroVideo = lazy(() =>
  import('./components/KiboIntroVideo').then((m) => ({ default: m.KiboIntroVideo }))
);
const TreasureMap = lazy(() =>
  import('./components/TreasureMap').then((m) => ({ default: m.TreasureMap }))
);
const PocketGuide = lazy(() =>
  import('./components/PocketGuide').then((m) => ({ default: m.PocketGuide }))
);
const ProfileBadgesCard = lazy(() =>
  import('./components/ProfileBadgesCard').then((m) => ({ default: m.ProfileBadgesCard }))
);

type GameScreen = 'LOBBY' | 'MAP' | 'ARCADE' | 'CODEX' | 'BADGES';

const STORAGE_KEY = 'setara_progress_v1';

function loadProgress(): ProgressStore {
  const defaultStats = {
    flawlessStageIds: [] as string[],
    retryCount: 0,
    totalTransposes: 0,
    noHintBossWins: 0,
    speedsterCount: 0,
  };
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
        speedRunEnabled: Boolean(parsed.speedRunEnabled),
        stats: {
          flawlessStageIds: Array.isArray(parsed.stats?.flawlessStageIds)
            ? parsed.stats.flawlessStageIds
            : [],
          retryCount:
            typeof parsed.stats?.retryCount === 'number' ? parsed.stats.retryCount : 0,
          totalTransposes:
            typeof parsed.stats?.totalTransposes === 'number' ? parsed.stats.totalTransposes : 0,
          noHintBossWins:
            typeof parsed.stats?.noHintBossWins === 'number' ? parsed.stats.noHintBossWins : 0,
          speedsterCount:
            typeof parsed.stats?.speedsterCount === 'number' ? parsed.stats.speedsterCount : 0,
        },
        daily: createFreshDailyProgress(parsed.daily),
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
    speedRunEnabled: false,
    stats: defaultStats,
    daily: createFreshDailyProgress(),
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
  const [lobbyRuleIdx, setLobbyRuleIdx] = useState(0);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitedGame, setExitedGame] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [specialEndingOpen, setSpecialEndingOpen] = useState(false);
  const [recentBadgeToast, setRecentBadgeToast] = useState<{
    title: string;
    kiboPraise: string;
  } | null>(null);
  const badgeToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (badgeToastTimerRef.current) window.clearTimeout(badgeToastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!activeLevel && progress.daily?.specialEndingUnlocked && !progress.daily?.specialEndingSeen) {
      sound.playVictory();
      setSpecialEndingOpen(true);
    }
  }, [activeLevel, progress.daily?.specialEndingUnlocked, progress.daily?.specialEndingSeen]);

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

  const activeThemeChapter = screen === 'MAP' ? selectedChapterId : 0;

  // Always-active tropical beach stage music outside Boss levels (Lobby/Bab 0 use original song; Bab 1-5 use unique songs)
  useEffect(() => {
    if (exitedGame) {
      stageMusic.stop();
      phonkMusic.stop();
      return;
    }

    const inBoss = !!activeLevel?.isBoss;
    const activeMusicTheme = activeLevel ? activeLevel.chapterId : screen === 'MAP' ? selectedChapterId : 0;
    if (!inBoss) {
      phonkMusic.stop();
      stageMusic.start(activeMusicTheme);
    }

    const unlockAudio = () => {
      if (exitedGame) return;
      if (!activeLevel?.isBoss) {
        stageMusic.start(activeMusicTheme);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [activeLevel, exitedGame, screen, selectedChapterId]);

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

  const handleConfirmExit = async () => {
    setSettingsOpen(false);
    stageMusic.stop();
    phonkMusic.stop();

    // Native Android Capacitor exit (supports Capacitor App plugin & bridge)
    const cap = (
      window as unknown as {
        Capacitor?: {
          Plugins?: { App?: { exitApp?: () => Promise<void> | void } };
          nativePromise?: (pluginName: string, methodName: string) => Promise<void>;
        };
      }
    ).Capacitor;

    try {
      if (cap?.Plugins?.App?.exitApp) {
        await cap.Plugins.App.exitApp();
      } else if (cap?.nativePromise) {
        await cap.nativePromise('App', 'exitApp');
      }
    } catch {
      // Fallback below if running in web browser
    }

    // Legacy Cordova / Android WebView navigator fallback
    try {
      const navApp = (navigator as unknown as { app?: { exitApp?: () => void } }).app;
      navApp?.exitApp?.();
    } catch {
      // Ignore
    }

    try {
      window.close();
    } catch {
      // Browsers may ignore window.close()
    }
    setActiveLevel(null);
    setExitedGame(true);
  };

  const announceNewBadges = (prevState: ProgressStore, nextState: ProgressStore) => {
    const prevUnlocked = new Set(
      evaluateBadges(prevState)
        .filter((b) => b.unlocked)
        .map((b) => b.id)
    );
    const newlyUnlocked = evaluateBadges(nextState).find(
      (b) => b.unlocked && !prevUnlocked.has(b.id)
    );
    if (newlyUnlocked) {
      sound.playKiboGiggle();
      setRecentBadgeToast({
        title: newlyUnlocked.title,
        kiboPraise: newlyUnlocked.kiboPraise,
      });
      if (badgeToastTimerRef.current) window.clearTimeout(badgeToastTimerRef.current);
      badgeToastTimerRef.current = window.setTimeout(() => setRecentBadgeToast(null), 4600);
    }
  };

  const handleToggleSpeedRun = () => {
    setProgress((prev) => ({
      ...prev,
      speedRunEnabled: !prev.speedRunEnabled,
    }));
  };

  const handleCompleteLevel = (
    level: LevelDef,
    moves: number,
    stars: number,
    meta?: {
      flawless: boolean;
      usedHint: boolean;
      transposes: number;
      elapsedSec?: number;
      speedsterEarned?: boolean;
    }
  ) => {
    setProgress((prev) => {
      const prevFlawless = prev.stats.flawlessStageIds;
      const shouldAddFlawless =
        !level.isPractice && meta?.flawless && !prevFlawless.includes(level.id);
      const nextStats = {
        flawlessStageIds: shouldAddFlawless ? [...prevFlawless, level.id] : prevFlawless,
        retryCount: prev.stats.retryCount,
        totalTransposes: prev.stats.totalTransposes + (meta?.transposes ?? 0),
        noHintBossWins:
          prev.stats.noHintBossWins + (level.isBoss && !meta?.usedHint ? 1 : 0),
        speedsterCount: prev.stats.speedsterCount + (meta?.speedsterEarned ? 1 : 0),
      };

      const freshDaily = createFreshDailyProgress(prev.daily);
      const updatedDaily = {
        ...freshDaily,
        transposesToday: freshDaily.transposesToday + (meta?.transposes ?? 0),
        stagesToday: freshDaily.stagesToday + 1,
        practiceToday: freshDaily.practiceToday + (level.isPractice ? 1 : 0),
        flawlessToday: freshDaily.flawlessToday + (meta?.flawless ? 1 : 0),
      };

      let nextState: ProgressStore;
      if (level.isPractice) {
        nextState = {
          ...prev,
          practiceSolved: prev.practiceSolved + 1,
          stats: nextStats,
          daily: updatedDaily,
        };
      } else {
        const existing = prev.completed[level.id];
        const bestStars = Math.max(existing?.stars ?? 0, stars);
        const bestMoves = existing ? Math.min(existing.bestMoves, moves) : moves;
        const bestTimeSec =
          typeof meta?.elapsedSec === 'number'
            ? typeof existing?.bestTimeSec === 'number'
              ? Math.min(existing.bestTimeSec, meta.elapsedSec)
              : meta.elapsedSec
            : existing?.bestTimeSec;
        const speedster = Boolean(existing?.speedster || meta?.speedsterEarned);
        nextState = {
          ...prev,
          completed: {
            ...prev.completed,
            [level.id]: { stars: bestStars, bestMoves, bestTimeSec, speedster },
          },
          stats: nextStats,
          daily: updatedDaily,
        };
      }

      const evaluatedDaily = evaluateDailyMissions(nextState);
      if (
        evaluatedDaily.every((m) => m.completed) &&
        updatedDaily.lastCompletedDateKey !== updatedDaily.dateKey
      ) {
        const nextStreak = updatedDaily.streakDays + 1;
        const unlockedNow = Boolean(updatedDaily.specialEndingUnlocked || nextStreak >= 7);
        nextState = {
          ...nextState,
          daily: {
            ...updatedDaily,
            streakDays: nextStreak,
            lastCompletedDateKey: updatedDaily.dateKey,
            specialEndingUnlocked: unlockedNow,
          },
        };
      }

      announceNewBadges(prev, nextState);
      return nextState;
    });
  };

  const handleClaimDailyMission = (mission: EvaluatedDailyMission) => {
    if (!mission.completed || mission.claimed) return;
    sound.playVictory();
    setProgress((prev) => {
      const freshDaily = createFreshDailyProgress(prev.daily);
      if (freshDaily.claimedIds.includes(mission.id)) return prev;

      const nextDaily = {
        ...freshDaily,
        claimedIds: [...freshDaily.claimedIds, mission.id],
        bonusPoints: freshDaily.bonusPoints + mission.bonusPoints,
      };

      const nextStats = {
        ...prev.stats,
        totalTransposes:
          mission.badgeBoostKind === 'transpose'
            ? prev.stats.totalTransposes + mission.badgeBoostAmount
            : prev.stats.totalTransposes,
      };

      const nextPractice =
        mission.badgeBoostKind === 'practice'
          ? prev.practiceSolved + mission.badgeBoostAmount
          : prev.practiceSolved;

      const nextState: ProgressStore = {
        ...prev,
        practiceSolved: nextPractice,
        stats: nextStats,
        daily: nextDaily,
      };

      announceNewBadges(prev, nextState);
      return nextState;
    });
    setLobbyKiboLine(
      `Yeay! Kamu klaim ${mission.bonusPoints} Poin Bonus & ${mission.badgeBoostLabel} dari misi "${mission.title}"!`
    );
  };

  const handleRetryStage = () => {
    setProgress((prev) => {
      const nextState: ProgressStore = {
        ...prev,
        stats: {
          ...prev.stats,
          retryCount: prev.stats.retryCount + 1,
        },
      };
      announceNewBadges(prev, nextState);
      return nextState;
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
      const firstLvl = ch.levels[0];
      const globalIdx = ALL_LEVELS.findIndex((l) => l.id === firstLvl.id);
      const isUnlocked =
        globalIdx <= 0 ||
        !!progress.completed[ALL_LEVELS[globalIdx - 1].id] ||
        !!progress.completed[firstLvl.id];
      setSelectedChapterId(chapterId);
      if (isUnlocked) {
        setActiveLevel(firstLvl);
      } else {
        setScreen('MAP');
      }
    }
  };

  // GOODBYE SCREEN (for browser/WebView if OS doesn't terminate process immediately)
  if (exitedGame) {
    return (
      <div className="relative min-h-[100dvh] flex items-center justify-center game-canvas-bg p-5">
        <BeachBackdrop />
        <div className="relative z-10 w-full max-w-md rounded-3xl game-panel p-7 text-center shadow-2xl animate-pop-in">
          <div className="flex flex-col items-center">
            <KiboAvatar size="lg" mood="crying" interactive={false} />
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

  // CINEMATIC ANIMATED INTRO VIDEO: KIBO MEETS THE PLAYER ON GAME START
  if (showIntro) {
    return (
      <>
        <Suspense fallback={null}>
          <KiboIntroVideo
            onFinish={() => {
              setShowIntro(false);
              stageMusic.start(screen === 'MAP' ? selectedChapterId : 0);
            }}
          />
        </Suspense>
        <OfflineIndicator />
      </>
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
        onReplayIntro={() => {
          setSettingsOpen(false);
          setActiveLevel(null);
          setShowIntro(true);
        }}
        onRequestExit={handleConfirmExit}
        onClose={() => setSettingsOpen(false)}
      />
      <KiboSpecialEndingModal
        open={specialEndingOpen}
        streakDays={progress.daily?.streakDays ?? 7}
        bonusPoints={progress.daily?.bonusPoints ?? 0}
        onClose={() => {
          setSpecialEndingOpen(false);
          setProgress((prev) => ({
            ...prev,
            daily: prev.daily ? { ...prev.daily, specialEndingSeen: true } : prev.daily,
          }));
        }}
      />
    </>
  );

  const badgeToast = recentBadgeToast && (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md rounded-2xl bg-gradient-to-r from-[#FEF08A] via-[#FDE047] to-[#FBBF24] border-2 border-[#FFFFFF] text-[#291802] px-4 py-3 shadow-2xl flex items-center gap-3 animate-pop-in"
    >
      <div className="w-10 h-10 rounded-xl bg-[#78350F] text-[#FEF08A] flex items-center justify-center shrink-0 shadow">
        <Award className="w-6 h-6" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#92400E]">
          Badge Pencapaian Terbuka!
        </div>
        <div className="font-display font-extrabold text-base leading-tight text-[#0D354C] truncate">
          {recentBadgeToast.title}
        </div>
        <div className="text-xs font-bold text-[#78350F] truncate">
          {recentBadgeToast.kiboPraise}
        </div>
      </div>
    </div>
  );

  // FULL-SCREEN ACTIVE GAME BOARD
  if (activeLevel) {
    const nextLvl = activeLevel.isPractice ? null : getNextLevel(activeLevel.id);
    return (
      <>
        <Suspense fallback={null}>
          <GameBoard
            level={activeLevel}
            speedRunEnabled={!!progress.speedRunEnabled}
            onToggleSpeedRun={handleToggleSpeedRun}
            onOpenSettings={() => setSettingsOpen(true)}
            onExit={() => setActiveLevel(null)}
            onComplete={handleCompleteLevel}
            onRetryStage={handleRetryStage}
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
        </Suspense>
        {badgeToast}
        {modals}
        <OfflineIndicator />
      </>
    );
  }

  return (
    <div
      className={`relative min-h-[100dvh] flex flex-col game-canvas-bg game-canvas-ch-${activeThemeChapter} text-[#0D354C] pb-20 md:pb-6`}
    >
      <BeachBackdrop chapterId={activeThemeChapter} />
      {screen === 'LOBBY' && (
        <BeachEasterEggs
          variant="lobby"
          chapterId={selectedChapterId}
          onTriggerKibo={(quip) => setLobbyKiboLine(quip)}
        />
      )}

      {/* COASTAL ANDROID GAME TOP STATUS HUD */}
      <header className="sticky top-0 z-30 h-14 bg-[#0D4A6B]/96 border-b-2 border-[#7DD3FC]/55 text-white shadow-md">
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
          <nav aria-label="Menu permainan" className="hidden md:flex items-center gap-1.5">
            {(
              [
                ['LOBBY', 'Lobi'],
                ['MAP', 'Peta Bab'],
                ['ARCADE', 'Latihan Acak'],
                ['CODEX', 'Buku Saku'],
                ['BADGES', 'Badge'],
              ] as [GameScreen, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  sound.playPickup();
                  setScreen(id);
                }}
                className={`min-h-[40px] px-3.5 rounded-xl text-sm font-extrabold transition-all whitespace-nowrap cursor-pointer ${
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
      <main className={`relative z-10 flex-1 flex flex-col ${screen === 'LOBBY' ? 'pointer-events-none' : ''}`}>
        {/* SCREEN 1: TROPICAL BEACH GAME LOBBY */}
        {screen === 'LOBBY' && (
          <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left / Center Mobile Game Start Panel */}
            <section className="pointer-events-auto lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* Kibo Podium Card */}
              <div className="w-full rounded-3xl game-panel p-4 sm:p-5 flex items-center gap-4 text-left">
                <KiboAvatar
                  size="lg"
                  chapterId={selectedChapterId}
                  mood={lobbyKiboLine ? 'excited' : 'happy'}
                  interactive
                  onFaintChange={(fainted) => {
                    if (fainted) {
                      setLobbyKiboLine(
                        'Zzz... Kibo pingsan kelamaan nungguin kamu lebih dari 1 menit! Sentuh layar dong!'
                      );
                    } else {
                      setLobbyKiboLine('Hwaaah! Kibo sudah bangun! Ayo main lagi yuk!');
                    }
                  }}
                  onInteract={(quip) => setLobbyKiboLine(quip)}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-[#0284C7]">Kibo si Hiu Gemoy</div>
                  {(() => {
                    const activeLobbyText =
                      lobbyKiboLine ??
                      getInitialLobbyKiboLine(selectedChapterId, completedCount, bossesDefeated);
                    return (
                      <div
                        key={activeLobbyText}
                        className="relative mt-1.5 ml-1.5 rounded-2xl bg-[#EBF8FF] border-2 border-[#7DD3FC] px-3.5 py-2 shadow-sm speech-bubble-pop"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute -left-2 top-3.5 w-3.5 h-3.5 rotate-45 bg-[#EBF8FF] border-l-2 border-b-2 border-[#7DD3FC]"
                        />
                        <p className="relative z-10 text-sm sm:text-base font-semibold text-[#0D354C] leading-snug">
                          “{activeLobbyText}”
                        </p>
                      </div>
                    );
                  })()}
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

                {/* 4 CHUNKY ANDROID MENU BUTTONS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setScreen('MAP');
                    }}
                    className="game-btn-wood min-h-[76px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-6 h-6 text-[#0284C7]" aria-hidden="true" />
                    <span className="text-xs font-extrabold whitespace-nowrap">Peta Bab</span>
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
                    <span className="text-xs font-extrabold whitespace-nowrap">Latihan</span>
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
                    <span className="text-xs font-extrabold whitespace-nowrap">Buku Saku</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      setScreen('BADGES');
                    }}
                    className="game-btn-wood min-h-[76px] p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-6 h-6 text-[#B45309]" aria-hidden="true" />
                    <span className="text-xs font-extrabold whitespace-nowrap">Badge</span>
                  </button>
                </div>

                <div className="flex justify-center lg:justify-start pt-1">
                  <PWAInstallButton variant="banner" />
                </div>
              </div>
            </section>

            {/* Right: Interactive Board Showcase + Quick Chapter Strip */}
            <section className="pointer-events-auto lg:col-span-6 space-y-4">
              {(() => {
                const LOBBY_RULES = [
                  { badge: '+3 ⇄ −3', hint: 'Tambah menyeberang jadi Kurang!', eq: 'x + 3 = 8  →  x = 8 − 3' },
                  { badge: '−4 ⇄ +4', hint: 'Kurang menyeberang jadi Tambah!', eq: 'x − 4 = 5  →  x = 5 + 4' },
                  { badge: '×2 ⇄ ÷2', hint: 'Kali menyeberang jadi Bagi!', eq: '2x = 12  →  x = 12 ÷ 2' },
                  { badge: '÷5 ⇄ ×5', hint: 'Bagi menyeberang jadi Kali!', eq: 'x/5 = 3  →  x = 3 × 5' },
                ];
                const activeRule = LOBBY_RULES[lobbyRuleIdx % LOBBY_RULES.length];
                return (
                  <div className="relative rounded-3xl overflow-hidden border-3 border-[#FFFFFF]/85 bg-[#E0F2FE] shadow-xl aspect-[16/10] group">
                    {!heroImgFailed ? (
                      <img
                        src="/src/assets/images/hero_setara_board_1795079216335.jpg"
                        alt="Papan timbangan batu ukir Nusantara Setara"
                        referrerPolicy="no-referrer"
                        onError={() => setHeroImgFailed(true)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display text-3xl font-extrabold text-[#0284C7]">
                        SETARA
                      </div>
                    )}

                    {/* Floating Animated Portal Badge */}
                    <div
                      className="anime-lobby-float pointer-events-none absolute top-3 left-3 rounded-xl bg-[#0D4A6B]/90 border border-[#7DD3FC]/70 text-white px-2.5 py-1.5 flex items-center gap-1.5 shadow-md"
                      style={{ animationDuration: '4.2s' }}
                    >
                      <span className="w-6 h-6 rounded-lg bg-[#FBBF24] text-[#291802] font-display font-extrabold text-base flex items-center justify-center">
                        =
                      </span>
                      <span className="text-[11px] font-extrabold text-[#FEF08A]">Jembatan Ruas</span>
                    </div>

                    {/* Interactive Tap-to-Flip Rule Demo Chip */}
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTranspose();
                        const nextIdx = (lobbyRuleIdx + 1) % LOBBY_RULES.length;
                        setLobbyRuleIdx(nextIdx);
                        setLobbyKiboLine(`Rumus kilat: ${LOBBY_RULES[nextIdx].hint}`);
                      }}
                      className="absolute bottom-3 left-3 right-3 rounded-2xl bg-[#0D354C]/90 border-2 border-[#FBBF24]/80 px-3 py-2 text-left flex items-center justify-between gap-2 shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FDE047]">
                          Ketuk Contoh Pindah Ruas
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-extrabold text-white truncate tabular-nums">
                          {activeRule.eq}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-xl bg-[#FEF08A] text-[#291802] font-mono font-extrabold text-xs px-2.5 py-1.5">
                        {activeRule.badge}
                      </span>
                    </button>
                  </div>
                );
              })()}

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
                        className={`min-h-[60px] rounded-2xl p-2 flex flex-col items-center justify-center border-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 cursor-pointer ${
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

              {/* Daily Missions Compact Panel */}
              <DailyMissionsCard
                progress={progress}
                onClaimMission={handleClaimDailyMission}
                onWatchSpecialEnding={() => setSpecialEndingOpen(true)}
                compact
              />
            </section>
          </div>
        )}

        {/* SCREEN 2: TREASURE MAP PARCHMENT WITH SWIMMING FISH, RED DASHED PATH & KIBO */}
        {screen === 'MAP' && (
          <Suspense fallback={null}>
            <TreasureMap
              chapters={CHAPTERS}
              activeChapter={activeChapter}
              progress={progress}
              onSelectChapter={setSelectedChapterId}
              onSelectLevel={setActiveLevel}
            />
          </Suspense>
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
                    desc: 'Soal acak aljabar lengkap dengan tanda kurung, pengali negatif, dan variabel di kedua ruas.',
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
        {screen === 'CODEX' && (
          <Suspense fallback={null}>
            <PocketGuide onStartChapter={handleStartChapter} />
          </Suspense>
        )}

        {/* SCREEN 5: DEDICATED ACHIEVEMENT BADGES MENU */}
        {screen === 'BADGES' && (
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
            <div className="rounded-3xl game-panel p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <KiboAvatar size="md" chapterId={selectedChapterId} mood="excited" animate />
                <div>
                  <p className="text-xs font-extrabold text-[#B45309]">
                    Koleksi Prestasi Petualangan
                  </p>
                  <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]">
                    Badge Pencapaian
                  </h1>
                  <p className="text-xs sm:text-sm text-[#35637A]">
                    Kumpulkan semua lencana spesial dari setiap tantangan dan kemenanganmu bersama Kibo!
                  </p>
                </div>
              </div>
            </div>

            <DailyMissionsCard
              progress={progress}
              onClaimMission={handleClaimDailyMission}
              onWatchSpecialEnding={() => setSpecialEndingOpen(true)}
            />

            <Suspense fallback={null}>
              <ProfileBadgesCard progress={progress} />
            </Suspense>
          </div>
        )}
      </main>

      {/* MOBILE NATIVE ANDROID BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Navigasi game"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D4A6B]/98 border-t-2 border-[#7DD3FC]/55 pb-safe"
      >
        <div className="grid grid-cols-5 h-15">
          {(
            [
              { id: 'LOBBY' as GameScreen, label: 'Lobi', Icon: Home },
              { id: 'MAP' as GameScreen, label: 'Peta', Icon: Compass },
              { id: 'ARCADE' as GameScreen, label: 'Latihan', Icon: Shuffle },
              { id: 'CODEX' as GameScreen, label: 'Buku Saku', Icon: BookOpen },
              { id: 'BADGES' as GameScreen, label: 'Badge', Icon: Award },
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
                <span className="text-[10px] font-extrabold tracking-tight whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {badgeToast}
      {modals}
      <OfflineIndicator />
    </div>
  );
}
