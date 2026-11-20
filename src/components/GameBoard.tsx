import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FlipHorizontal2,
  Lightbulb,
  Lock,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Timer,
  Undo2,
  X,
  Zap,
} from 'lucide-react';
import {
  canCombineTerms,
  checkSolved,
  cloneState,
  combineTerms,
  computeEquationComplexity,
  expandGroupTerm,
  flipBothSides,
  formatEquation,
  formatTermShort,
  getSmartHint,
  isPureSymbolState,
  transposeCoefficient,
  transposeDenominator,
  transposeTerm,
} from '../game/algebraEngine';
import { isRestTime } from '../game/kiboDialogues';
import { phonkMusic } from '../game/phonkMusic';
import { sound } from '../game/sound';
import { stageMusic } from '../game/stageMusic';
import {
  EquationState,
  HistoryStep,
  LevelDef,
  MoveResult,
  Side,
  SmartHint,
  Term,
  VisualStyle,
} from '../game/types';
import {
  AlgebraTile,
  DragKind,
  InlineEquationVisual,
  InlineTermChip,
  OperatorCardFace,
  TileCardFace,
} from './AlgebraTile';
import { BeachBackdrop } from './BeachBackdrop';
import { BeachEasterEggs } from './BeachEasterEggs';
import type { BossCinematicMode } from './BossCinematicVideo';

const LazyBossCinematicVideo = lazy(() =>
  import('./BossCinematicVideo').then((m) => ({ default: m.BossCinematicVideo }))
);
import {
  BossArenaBanner,
  BossDefeatModal,
  KiboAfkDefeatModal,
  KiboAvatar,
  KiboBossCelebration,
  KiboMood,
  KiboTutorialCard,
} from './KiboCompanion';

interface GameBoardProps {
  level: LevelDef;
  speedRunEnabled?: boolean;
  onToggleSpeedRun?: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
  onComplete: (
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
  ) => void;
  onRetryStage?: (level: LevelDef) => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
  onNewPractice?: () => void;
}

interface DragMeta {
  term: Term;
  fromSide: Side;
  dragKind: DragKind;
  overSide: Side | null;
  combineTargetId: string | null;
  combineIsZero: boolean;
}

interface PendingPointer {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  term: Term;
  fromSide: Side;
  dragKind: DragKind;
}

interface OperatorCardMeta {
  opSymbol: '×' | '÷';
  valueLabel: string;
  tone: 'gold' | 'teal';
}

interface FlyingTileAnim {
  id: number;
  fromX: number;
  fromY: number;
  bridgeX: number;
  bridgeY: number;
  apexY: number;
  toX: number;
  toY: number;
  fromSide: Side;
  toSide: Side;
  dragKind: DragKind;
  visualStyle: VisualStyle;
  startTerm?: Term;
  endTerm?: Term;
  startOp?: OperatorCardMeta;
  endOp?: OperatorCardMeta;
  bridgeTag: string;
  bridgeStartSym?: Term;
  bridgeEndSym?: Term;
}

interface BridgeFlashState {
  tag: string;
  fromSide?: Side;
  toSide?: Side;
  startTerm?: Term;
  endTerm?: Term;
}

interface SparkBurst {
  id: number;
  side: Side;
  color: string;
  label?: string;
}

const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const COSMIC_STARS = [
  { left: '8%', top: '14%', size: 4, dur: '2.1s', delay: '0s', color: '#FEF08A' },
  { left: '19%', top: '34%', size: 3, dur: '2.6s', delay: '0.4s', color: '#22D3EE' },
  { left: '28%', top: '18%', size: 5, dur: '1.9s', delay: '0.9s', color: '#F0ABFC' },
  { left: '42%', top: '10%', size: 3, dur: '2.4s', delay: '0.2s', color: '#FFFFFF' },
  { left: '56%', top: '26%', size: 4, dur: '2.0s', delay: '0.7s', color: '#22D3EE' },
  { left: '71%', top: '15%', size: 5, dur: '2.3s', delay: '0.3s', color: '#FEF08A' },
  { left: '85%', top: '28%', size: 4, dur: '1.8s', delay: '1.1s', color: '#F0ABFC' },
  { left: '92%', top: '52%', size: 3, dur: '2.5s', delay: '0.5s', color: '#FFFFFF' },
  { left: '14%', top: '68%', size: 4, dur: '2.2s', delay: '0.8s', color: '#F0ABFC' },
  { left: '34%', top: '76%', size: 3, dur: '2.7s', delay: '0.1s', color: '#22D3EE' },
  { left: '66%', top: '72%', size: 5, dur: '2.0s', delay: '0.6s', color: '#FEF08A' },
  { left: '84%', top: '80%', size: 4, dur: '2.4s', delay: '1.0s', color: '#22D3EE' },
];

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  speedRunEnabled = false,
  onToggleSpeedRun,
  onOpenSettings,
  onExit,
  onComplete,
  onRetryStage,
  onNextLevel,
  hasNextLevel,
  onNewPractice,
}) => {
  const isBossLevel = !!level.isBoss && !!level.boss && level.boss.phases.length > 0;
  const isStageOne = level.levelNumber === 1 && !level.isPractice;
  const bossGimmick = level.boss?.gimmick;
  const totalBossTime = level.boss?.timeLimitSeconds ?? 120;
  const maxBossMistakes = level.boss?.maxMistakes ?? 4;
  const bossPenaltySec = level.boss?.penaltySeconds ?? 30;

  const initialPhaseState = useMemo(
    () => cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial),
    [level, isBossLevel]
  );

  const [bossPhaseIndex, setBossPhaseIndex] = useState(0);
  const [bossHitAnim, setBossHitAnim] = useState(false);
  const [bossHealAnim, setBossHealAnim] = useState(false);
  const [bossHasHealed, setBossHasHealed] = useState(false);
  const [bossPreHealOneHp, setBossPreHealOneHp] = useState(false);
  const [bossStrikeAnim, setBossStrikeAnim] = useState(false);
  const [bossDialogue, setBossDialogue] = useState(level.boss?.introLine ?? '');
  const [bossTimeLeft, setBossTimeLeft] = useState(totalBossTime);
  const [bossMistakes, setBossMistakes] = useState(0);
  const [bossAwake, setBossAwake] = useState(() => !(isBossLevel && bossGimmick === 'freeze_penalty'));
  const [bossTimedOut, setBossTimedOut] = useState(false);
  const [bossDefeatReason, setBossDefeatReason] = useState<'timeout' | 'mistakes'>('timeout');
  const [bossCinematic, setBossCinematic] = useState<BossCinematicMode | null>(() =>
    isBossLevel ? 'encounter' : null
  );
  const [afkDefeat, setAfkDefeat] = useState(false);
  const [timeBonusFlash, setTimeBonusFlash] = useState(false);
  const [timePenaltyFlash, setTimePenaltyFlash] = useState(false);
  const [penaltyFlashText, setPenaltyFlashText] = useState('');
  const bossTauntIdxRef = useRef(0);
  const timeBonusTimerRef = useRef<number | null>(null);
  const timePenaltyTimerRef = useRef<number | null>(null);

  const buildInitialExplanation = useCallback(
    (lvl: LevelDef) => {
      if (lvl.levelNumber === 1 && !lvl.isPractice) return lvl.tip;
      if (lvl.defaultVisual === 'pure_symbols') {
        return 'Buat Peti Pusaka berdiri sendirian di satu ruas.';
      }
      return 'Pisahkan variabel x hingga berdiri sendirian di satu ruas.';
    },
    []
  );

  const [eqState, setEqState] = useState<EquationState>(initialPhaseState);
  const [undoStack, setUndoStack] = useState<EquationState[]>([]);
  const [totalMoves, setTotalMoves] = useState(0);
  const [history, setHistory] = useState<HistoryStep[]>(() => [
    {
      equationText: formatEquation(initialPhaseState, level.defaultVisual === 'pure_symbols'),
      ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
      explanation: buildInitialExplanation(level),
      stateSnapshot: cloneState(initialPhaseState),
    },
  ]);

  const [visualStyle, setVisualStyle] = useState<VisualStyle>(level.defaultVisual);
  const [selected, setSelected] = useState<{ termId: string; side: Side } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'info' | 'warn' | 'good' } | null>(
    null
  );
  const [kiboMood, setKiboMood] = useState<KiboMood>('idle');
  const [activeHint, setActiveHint] = useState<SmartHint | null>(null);
  const [zeroBurstSide, setZeroBurstSide] = useState<Side | null>(null);
  const [sparkBurst, setSparkBurst] = useState<SparkBurst | null>(null);
  const [landingSide, setLandingSide] = useState<Side | null>(null);
  const [bridgeFlash, setBridgeFlash] = useState<BridgeFlashState | null>(null);
  const [flyingAnim, setFlyingAnim] = useState<FlyingTileAnim | null>(null);
  const [flyingMidFlipped, setFlyingMidFlipped] = useState(false);
  const [showMobileLog, setShowMobileLog] = useState(false);
  const [solvedInfo, setSolvedInfo] = useState<{
    displayResult: string;
    stars: number;
    elapsedSec?: number;
    speedsterEarned?: boolean;
    speedRunTargetSec?: number;
  } | null>(null);

  const speedRunTargetSec = Math.max(15, level.parMoves * 7 + (level.chapterId >= 3 ? 6 : 0));
  const [speedRunElapsed, setSpeedRunElapsed] = useState(0);

  const [tutorialIndex, setTutorialIndex] = useState<number | null>(
    level.tutorialSteps && level.tutorialSteps.length > 0 ? 0 : null
  );

  const [dragMeta, setDragMeta] = useState<DragMeta | null>(null);
  const dragMetaRef = useRef<DragMeta | null>(null);
  const dragPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragGhostRef = useRef<HTMLDivElement | null>(null);
  const dragHangRef = useRef<HTMLDivElement | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const dragPhysicsRef = useRef({
    lastX: 0,
    lastT: 0,
    vx: 0,
    angle: 0,
    angVel: 0,
  });
  const dragHitCacheRef = useRef<{
    leftRect: DOMRect | null;
    rightRect: DOMRect | null;
    splitX: number;
    combineTargets: Array<{
      id: string;
      left: number;
      right: number;
      top: number;
      bottom: number;
      isZero: boolean;
    }>;
  } | null>(null);
  const pendingRef = useRef<PendingPointer | null>(null);
  const suppressClickRef = useRef(false);
  const leftPanRef = useRef<HTMLDivElement | null>(null);
  const rightPanRef = useRef<HTMLDivElement | null>(null);
  const bridgeRef = useRef<HTMLDivElement | null>(null);
  const flyTimerRef = useRef<number[]>([]);
  const moodTimerRef = useRef<number | null>(null);
  const lowTimeNotifiedRef = useRef<0 | 30 | 15>(0);
  const hadMistakeRef = useRef(false);
  const usedHintRef = useRef(false);
  const transposesRunRef = useRef(0);

  const flashKiboMood = useCallback((nextMood: KiboMood, ms = 1700) => {
    setKiboMood(nextMood);
    if (moodTimerRef.current) window.clearTimeout(moodTimerRef.current);
    moodTimerRef.current = window.setTimeout(() => setKiboMood('idle'), ms);
  }, []);

  const clearFlyTimers = useCallback(() => {
    flyTimerRef.current.forEach((id) => window.clearTimeout(id));
    flyTimerRef.current = [];
  }, []);

  // ALWAYS-ACTIVE MUSIC LIFECYCLE & BOSS HP/GIMMICK COMPUTATION
  const totalBossPhases = level.boss?.phases.length ?? 0;
  const bossMaxHp = bossGimmick === 'heal_once' ? 5 : totalBossPhases;
  const bossCurrentHp = useMemo(() => {
    if (!isBossLevel) return 0;
    if (bossGimmick === 'heal_once') {
      if (bossPreHealOneHp) return 1;
      if (!bossHasHealed) return Math.max(1, 5 - bossPhaseIndex);
      return Math.max(0, totalBossPhases - bossPhaseIndex);
    }
    return Math.max(0, totalBossPhases - bossPhaseIndex);
  }, [isBossLevel, bossGimmick, bossPreHealOneHp, bossHasHealed, bossPhaseIndex, totalBossPhases]);

  const hasMistakeRule = isBossLevel && bossGimmick === 'freeze_penalty';
  const isBossSleeping = hasMistakeRule && !bossAwake;
  const isTimeFrozen = isBossSleeping;
  const cosmicMode =
    isBossLevel &&
    !solvedInfo &&
    !bossTimedOut &&
    bossGimmick === 'cosmic_many_hp' &&
    bossCurrentHp > 0 &&
    bossCurrentHp <= 5;
  const isSpeedUp =
    isBossLevel &&
    !solvedInfo &&
    !bossTimedOut &&
    ((bossGimmick === 'speed_enrage' && bossCurrentHp === 1) || cosmicMode);
  const timeSpeedMultiplier = isSpeedUp ? 2 : 1;

  const isBossLowTime =
    isBossLevel &&
    !isTimeFrozen &&
    !solvedInfo &&
    !bossTimedOut &&
    bossCurrentHp > 0 &&
    bossTimeLeft > 0 &&
    bossTimeLeft <= 30;
  const isBossCriticalTime = isBossLowTime && bossTimeLeft <= 15;

  const phonkActive =
    isBossLevel && !solvedInfo && !bossTimedOut && bossCurrentHp > 0 && bossCinematic !== 'victory';
  const bossIntensity: 'normal' | 'enraged' =
    bossCurrentHp === 1 || bossHasHealed || cosmicMode ? 'enraged' : 'normal';

  useEffect(() => {
    if (phonkActive) {
      stageMusic.stop();
      phonkMusic.start(bossIntensity, level.chapterId);
    } else {
      phonkMusic.stop();
      stageMusic.start(level.chapterId);
    }
  }, [phonkActive, bossIntensity, level.chapterId]);

  useEffect(() => {
    return () => {
      phonkMusic.stop();
      if (moodTimerRef.current) window.clearTimeout(moodTimerRef.current);
      if (timeBonusTimerRef.current) window.clearTimeout(timeBonusTimerRef.current);
      if (timePenaltyTimerRef.current) window.clearTimeout(timePenaltyTimerRef.current);
      if (dragRafRef.current) window.cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  // Boss fight countdown timer:
  // - Paused while epic boss encounter/victory video is playing!
  // - Bab 3 (freeze_penalty): frozen while asleep; starts ticking at 1x once player wakes Kura Meriam!
  // - Bab 1 at 1 HP: 2x faster tick (500ms)!
  // - Bab 5 at <=5 HP (Cosmic Rush): 2x faster tick (500ms)!
  // - Others: normal 1000ms tick.
  useEffect(() => {
    if (
      !isBossLevel ||
      !level.boss ||
      bossCinematic !== null ||
      isTimeFrozen ||
      solvedInfo ||
      bossTimedOut ||
      bossHitAnim ||
      bossHealAnim ||
      bossCurrentHp <= 0
    ) {
      return;
    }
    const tickMs = timeSpeedMultiplier === 2 ? 500 : 1000;
    const intervalId = window.setInterval(() => {
      setBossTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          phonkMusic.stop();
          sound.playBossTaunt();
          setBossDefeatReason('timeout');
          setBossTimedOut(true);
          setBossDialogue(level.boss!.timeoutLine);
          setSelected(null);
          dragMetaRef.current = null;
          setDragMeta(null);
          pendingRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, tickMs);
    return () => window.clearInterval(intervalId);
  }, [
    isBossLevel,
    level.boss,
    bossCinematic,
    isTimeFrozen,
    timeSpeedMultiplier,
    solvedInfo,
    bossTimedOut,
    bossHitAnim,
    bossHealAnim,
    bossCurrentHp,
  ]);

  // Kibo low-time boss interaction: alert player at <= 30s and <= 15s
  useEffect(() => {
    if (
      !isBossLevel ||
      !level.boss ||
      bossCinematic !== null ||
      isTimeFrozen ||
      solvedInfo ||
      bossTimedOut ||
      bossCurrentHp <= 0 ||
      bossTimeLeft <= 0
    ) {
      return;
    }
    if (bossTimeLeft <= 15 && lowTimeNotifiedRef.current < 15) {
      lowTimeNotifiedRef.current = 15;
      sound.playNudge();
      flashKiboMood('oops', 2800);
      setFeedback({
        text: level.boss.kiboLines.lowTimeCritical,
        tone: 'warn',
      });
    } else if (bossTimeLeft <= 30 && bossTimeLeft > 15 && lowTimeNotifiedRef.current < 30) {
      lowTimeNotifiedRef.current = 30;
      sound.playNudge();
      flashKiboMood('oops', 2400);
      setFeedback({
        text: level.boss.kiboLines.lowTimeAlert,
        tone: 'warn',
      });
    }
  }, [
    isBossLevel,
    level.boss,
    bossCinematic,
    isTimeFrozen,
    solvedInfo,
    bossTimedOut,
    bossCurrentHp,
    bossTimeLeft,
    flashKiboMood,
  ]);

  // Non-boss stage 1-minute AFK defeat: Kibo faints & player loses the stage (except Boss stages!)
  useEffect(() => {
    if (isBossLevel || solvedInfo || afkDefeat) return;

    let timerId: number | null = null;
    let lastStamp = Date.now();

    const triggerAfkLoss = () => {
      sound.playKiboCry();
      setSelected(null);
      dragMetaRef.current = null;
      setDragMeta(null);
      pendingRef.current = null;
      setAfkDefeat(true);
      setFeedback({
        text: 'Uuu... Kibo pingsan karena kamu diam lebih dari 1 menit! Stage gagal!',
        tone: 'warn',
      });
    };

    const armTimer = () => {
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(triggerAfkLoss, 60_000);
    };

    const onActivity = () => {
      const now = Date.now();
      if (now - lastStamp < 800) return;
      lastStamp = now;
      armTimer();
    };

    armTimer();
    window.addEventListener('pointerdown', onActivity, { passive: true });
    window.addEventListener('pointermove', onActivity, { passive: true });
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity, { passive: true });

    return () => {
      if (timerId) window.clearTimeout(timerId);
      window.removeEventListener('pointerdown', onActivity);
      window.removeEventListener('pointermove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
    };
  }, [isBossLevel, solvedInfo, afkDefeat, level]);

  useEffect(() => {
    clearFlyTimers();
    const startEq = cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial);
    setBossPhaseIndex(0);
    setBossHitAnim(false);
    setBossHealAnim(false);
    setBossHasHealed(false);
    setBossPreHealOneHp(false);
    setBossStrikeAnim(false);
    setBossDialogue(level.boss?.introLine ?? '');
    setBossTimeLeft(level.boss?.timeLimitSeconds ?? 120);
    setBossMistakes(0);
    setBossAwake(!(isBossLevel && level.boss?.gimmick === 'freeze_penalty'));
    setBossTimedOut(false);
    setBossDefeatReason('timeout');
    setBossCinematic(isBossLevel ? 'encounter' : null);
    setAfkDefeat(false);
    setTimeBonusFlash(false);
    setTimePenaltyFlash(false);
    setPenaltyFlashText('');
    bossTauntIdxRef.current = 0;
    setEqState(startEq);
    setUndoStack([]);
    setTotalMoves(0);
    setHistory([
      {
        equationText: formatEquation(startEq, level.defaultVisual === 'pure_symbols'),
        ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
        explanation: buildInitialExplanation(level),
        stateSnapshot: cloneState(startEq),
      },
    ]);
    setVisualStyle(level.defaultVisual);
    setSelected(null);
    setFeedback(null);
    setKiboMood('idle');
    setActiveHint(null);
    setZeroBurstSide(null);
    setSparkBurst(null);
    setLandingSide(null);
    setBridgeFlash(null);
    setFlyingAnim(null);
    setFlyingMidFlipped(false);
    setSolvedInfo(null);
    setSpeedRunElapsed(0);
    setShowMobileLog(false);
    setTutorialIndex(level.tutorialSteps && level.tutorialSteps.length > 0 ? 0 : null);
    dragMetaRef.current = null;
    setDragMeta(null);
    pendingRef.current = null;
    lowTimeNotifiedRef.current = 0;
    hadMistakeRef.current = false;
    usedHintRef.current = false;
    transposesRunRef.current = 0;
    return clearFlyTimers;
  }, [level, isBossLevel, clearFlyTimers, buildInitialExplanation]);

  const pureSymbolsMode = visualStyle === 'pure_symbols' || isPureSymbolState(eqState);
  const currentEquationText = useMemo(
    () => formatEquation(eqState, pureSymbolsMode),
    [eqState, pureSymbolsMode]
  );

  const currentTip = isBossLevel
    ? level.boss!.phases[Math.min(bossPhaseIndex, level.boss!.phases.length - 1)].tip
    : level.tip;

  const activeTutorialStep =
    tutorialIndex !== null && level.tutorialSteps ? level.tutorialSteps[tutorialIndex] : null;

  // Optional Speed Run timer for regular stages
  useEffect(() => {
    if (isBossLevel || !speedRunEnabled || solvedInfo || afkDefeat || activeTutorialStep) {
      return;
    }
    const intervalId = window.setInterval(() => {
      setSpeedRunElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isBossLevel, speedRunEnabled, solvedInfo, afkDefeat, activeTutorialStep]);

  const triggerFlyAnimation = useCallback(
    (
      term: Term,
      fromSide: Side,
      dragKind: DragKind
    ) => {
      const srcPan = fromSide === 'left' ? leftPanRef.current : rightPanRef.current;
      const targetPan = fromSide === 'left' ? rightPanRef.current : leftPanRef.current;
      if (!targetPan || !srcPan) return;

      const sr = srcPan.getBoundingClientRect();
      const tr = targetPan.getBoundingClientRect();
      const br = bridgeRef.current?.getBoundingClientRect();

      let fromX = sr.left + sr.width / 2;
      let fromY = sr.top + sr.height / 2;

      // Always launch from the true tile position on fromSide so children clearly see
      // the card vault from its origin side across the '=' sign to the opposite side!
      const el = document.querySelector(`[data-term-id="${term.id}"]`) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const midLine = br ? br.left + br.width / 2 : (sr.right + tr.left) / 2;
        const isOnSourceSide = fromSide === 'left' ? cx <= midLine : cx >= midLine;
        if (isOnSourceSide && r.width > 0 && r.height > 0) {
          fromX = cx;
          fromY = cy;
        }
      }

      const toX = tr.left + tr.width / 2;
      const toY = tr.top + tr.height / 2;
      const bridgeX = br ? br.left + br.width / 2 : (fromX + toX) / 2;
      const bridgeY = br ? br.top + br.height / 2 : (fromY + toY) / 2;
      const apexY = Math.max(76, Math.min(fromY, toY, bridgeY) - 92);

      let startTerm: Term | undefined;
      let endTerm: Term | undefined;
      let startOp: OperatorCardMeta | undefined;
      let endOp: OperatorCardMeta | undefined;
      let bridgeTag = '+ → −';
      let bridgeStartSym: Term | undefined;
      let bridgeEndSym: Term | undefined;

      if (dragKind === 'coeff') {
        const factor =
          term.kind === 'var' ? term.coeff : term.kind === 'group' ? term.factor : 1;
        const fStr = factor < 0 ? `(−${Math.abs(factor)})` : `${factor}`;
        startOp = { opSymbol: '×', valueLabel: fStr, tone: 'gold' };
        endOp = { opSymbol: '÷', valueLabel: fStr, tone: 'teal' };
        bridgeTag = `×${fStr} → ÷${fStr}`;
      } else if (dragKind === 'denom' && term.kind === 'var') {
        startOp = { opSymbol: '÷', valueLabel: `${term.denom}`, tone: 'gold' };
        endOp = { opSymbol: '×', valueLabel: `${term.denom}`, tone: 'teal' };
        bridgeTag = `÷${term.denom} → ×${term.denom}`;
      } else if (term.kind === 'sym') {
        startTerm = { ...term };
        endTerm = { ...term, sign: term.sign === 1 ? -1 : 1 };
        bridgeStartSym = startTerm;
        bridgeEndSym = endTerm;
        bridgeTag = term.sign > 0 ? 'Asli → Lawan' : 'Lawan → Asli';
      } else if (term.kind === 'const') {
        startTerm = { ...term };
        endTerm = { ...term, value: -term.value };
        const absVal = Math.abs(term.value);
        bridgeTag = term.value > 0 ? `+${absVal} → −${absVal}` : `−${absVal} → +${absVal}`;
      } else if (term.kind === 'var') {
        startTerm = { ...term };
        endTerm = { ...term, coeff: -term.coeff };
        if (pureSymbolsMode && Math.abs(term.coeff) === 1 && term.denom === 1) {
          const targetSidePreview: Side = fromSide === 'left' ? 'right' : 'left';
          bridgeStartSym = startTerm;
          bridgeEndSym = endTerm;
          bridgeTag = targetSidePreview === 'right' ? 'Peti → Terbuka' : 'Terbuka → Tertutup';
        } else {
          const absC = Math.abs(term.coeff);
          const cStr = absC === 1 ? '' : `${absC}`;
          const frac = term.denom > 1 ? `/${term.denom}` : '';
          bridgeTag =
            term.coeff > 0
              ? `+${cStr}x${frac} → −${cStr}x${frac}`
              : `−${cStr}x${frac} → +${cStr}x${frac}`;
        }
      }

      const toSide: Side = fromSide === 'left' ? 'right' : 'left';
      clearFlyTimers();
      setFlyingMidFlipped(false);
      setBridgeFlash({
        tag: bridgeTag,
        fromSide,
        toSide,
        startTerm: bridgeStartSym,
        endTerm: bridgeEndSym,
      });
      setFlyingAnim({
        id: Date.now(),
        fromX,
        fromY,
        bridgeX,
        bridgeY,
        apexY,
        toX,
        toY,
        fromSide,
        toSide,
        dragKind,
        visualStyle: pureSymbolsMode ? 'pure_symbols' : visualStyle,
        startTerm,
        endTerm,
        startOp,
        endOp,
        bridgeTag,
        bridgeStartSym,
        bridgeEndSym,
      });

      const t1 = window.setTimeout(() => setFlyingMidFlipped(true), 330);
      const t2 = window.setTimeout(() => {
        setFlyingAnim(null);
        setFlyingMidFlipped(false);
        setLandingSide(toSide);
      }, 740);
      const t3 = window.setTimeout(() => {
        setBridgeFlash(null);
        setLandingSide(null);
      }, 1150);
      flyTimerRef.current = [t1, t2, t3];
    },
    [clearFlyTimers, pureSymbolsMode, visualStyle]
  );

  const commitMove = useCallback(
    (
      result: MoveResult,
      moveKind: 'transpose' | 'combine' | 'expand' | 'flip',
      flyMeta?: { term: Term; fromSide: Side; dragKind: DragKind; originPoint?: { x: number; y: number } },
      combineSide?: Side
    ) => {
      // Helper for Bab 3 Freeze-Penalty wrong move (-30s, max 4 mistakes)
      const applyFreezePenalty = (reasonText: string) => {
        if (!level.boss) return;
        hadMistakeRef.current = true;
        sound.playNudge();
        sound.playBossTaunt();
        flashKiboMood('oops', 2000);
        const nextMistakes = bossMistakes + 1;
        const nextTime = Math.max(0, bossTimeLeft - bossPenaltySec);
        setBossMistakes(nextMistakes);
        setBossTimeLeft(nextTime);
        setPenaltyFlashText(`−${bossPenaltySec} dtk!`);
        setTimePenaltyFlash(true);
        if (timePenaltyTimerRef.current) window.clearTimeout(timePenaltyTimerRef.current);
        timePenaltyTimerRef.current = window.setTimeout(() => setTimePenaltyFlash(false), 1150);
        setSelected(null);
        dragMetaRef.current = null;
        setDragMeta(null);
        pendingRef.current = null;

        if (nextMistakes >= maxBossMistakes || nextTime <= 0) {
          phonkMusic.stop();
          setBossDefeatReason('mistakes');
          setBossTimedOut(true);
          setBossDialogue(level.boss.timeoutLine);
          setFeedback({
            text: `Salah pindah ke-${nextMistakes}/${maxBossMistakes}! Waktumu langsung habis!`,
            tone: 'warn',
          });
        } else {
          setBossDialogue(
            `Hoaaam... salah pindah tuh! Ku-potong ${bossPenaltySec} detik, sisa kesempatan salahmu ${maxBossMistakes - nextMistakes}× lagi...`
          );
          setFeedback({
            text: `${reasonText} (−${bossPenaltySec} dtk · Salah ${nextMistakes}/${maxBossMistakes})`,
            tone: 'warn',
          });
        }
      };

      if (!result.ok || !result.nextState) {
        hadMistakeRef.current = true;
        if (hasMistakeRule && level.boss) {
          applyFreezePenalty(level.boss.kiboLines.gimmickAlert);
          return;
        }
        sound.playNudge();
        flashKiboMood('oops', 1500);
        setFeedback({
          text: result.errorMessage || 'Langkah ini belum bisa dilakukan.',
          tone: 'warn',
        });
        return;
      }

      // Bab 3 Freeze-Penalty: catch wrong/counterproductive transpose or flip moves (both asleep & awake!)
      if (hasMistakeRule && level.boss && (moveKind === 'transpose' || moveKind === 'flip')) {
        const beforeDist = computeEquationComplexity(eqState);
        const afterDist = computeEquationComplexity(result.nextState);
        if (afterDist >= beforeDist) {
          applyFreezePenalty(level.boss.kiboLines.gimmickAlert);
          return;
        }
      }

      if (moveKind === 'transpose') {
        transposesRunRef.current += 1;
        if (flyMeta) {
          triggerFlyAnimation(flyMeta.term, flyMeta.fromSide, flyMeta.dragKind);
        }
      }

      if (tutorialIndex !== null) {
        setTutorialIndex(null);
      }

      const nextState = result.nextState;
      const newTotalMoves = totalMoves + 1;

      setUndoStack((prev) => [...prev, eqState]);
      setEqState(nextState);
      setTotalMoves(newTotalMoves);
      setSelected(null);
      setActiveHint(null);

      setHistory((prev) => [
        ...prev,
        {
          equationText: formatEquation(nextState, pureSymbolsMode),
          ruleLabel: result.ruleLabel || 'Langkah Aljabar',
          explanation: result.explanation || '',
          stateSnapshot: cloneState(nextState),
        },
      ]);

      setFeedback({
        text: result.explanation || result.ruleLabel || 'Langkah berhasil!',
        tone: 'good',
      });

      if (result.cancelledToZero && result.cancelledSide) {
        sound.playZeroCancel();
        flashKiboMood('excited', 1900);
        setZeroBurstSide(result.cancelledSide);
        setSparkBurst({
          id: Date.now(),
          side: result.cancelledSide,
          color: '#FDE68A',
        });
        window.setTimeout(() => setZeroBurstSide(null), 650);
        window.setTimeout(() => setSparkBurst(null), 650);
      } else if (moveKind === 'transpose') {
        sound.playTranspose();
        flashKiboMood('happy', 1500);
      } else if (moveKind === 'combine') {
        sound.playCombine();
        flashKiboMood('happy', 1500);
        if (combineSide) {
          setSparkBurst({
            id: Date.now(),
            side: combineSide,
            color: '#5EEAD4',
          });
          window.setTimeout(() => setSparkBurst(null), 550);
        }
      } else if (moveKind === 'expand' || moveKind === 'flip') {
        sound.playExpand();
        flashKiboMood('happy', 1500);
      }

      const check = checkSolved(nextState, pureSymbolsMode);
      if (check.solved && check.displayResult) {
        if (isBossLevel && level.boss) {
          const nextPhaseIdx = bossPhaseIndex + 1;
          const totalPhases = level.boss.phases.length;

          // Fire Golden Energy Strike Beam toward Boss!
          setBossStrikeAnim(true);
          flashKiboMood('excited', 2200);

          if (nextPhaseIdx < totalPhases) {
            const isOrcaHealTrigger =
              bossGimmick === 'heal_once' && !bossHasHealed && nextPhaseIdx === 4;
            const nextHpAfterHit =
              bossGimmick === 'heal_once' && !bossHasHealed
                ? Math.max(1, 5 - nextPhaseIdx)
                : totalPhases - nextPhaseIdx;
            const willEnterSpeedOrCosmic =
              (bossGimmick === 'speed_enrage' && nextHpAfterHit === 1) ||
              (bossGimmick === 'cosmic_many_hp' && nextHpAfterHit === 5);

            const hitLine = willEnterSpeedOrCosmic && level.boss.enrageGimmickLine
              ? level.boss.enrageGimmickLine
              : level.boss.hitLines[bossPhaseIndex] || 'Aduh! Lanjut ke fase berikutnya!';

            window.setTimeout(() => {
              sound.playBossHit();
              setBossHitAnim(true);
              if (isOrcaHealTrigger) {
                setBossPreHealOneHp(true);
              }
              setBossDialogue(hitLine);

              setFeedback({
                text: willEnterSpeedOrCosmic
                  ? level.boss!.kiboLines.gimmickAlert
                  : level.boss!.kiboLines.hitCheer,
                tone: willEnterSpeedOrCosmic ? 'warn' : 'good',
              });
            }, 240);

            if (isOrcaHealTrigger) {
              // Bab 4 Kapten Orca reaches 1 HP → gets angry and HEALS FULL HP ONCE!
              window.setTimeout(() => {
                sound.playBossTaunt();
                setBossHitAnim(false);
                setBossStrikeAnim(false);
                setBossPreHealOneHp(false);
                setBossHasHealed(true);
                setBossHealAnim(true);
                setBossPhaseIndex(nextPhaseIdx);
                setBossDialogue(level.boss!.healLine || hitLine);
                flashKiboMood('oops', 2600);
                setFeedback({
                  text: level.boss!.kiboLines.gimmickAlert,
                  tone: 'warn',
                });
              }, 950);

              window.setTimeout(() => {
                const nextPhase = level.boss!.phases[nextPhaseIdx];
                const nextFresh = cloneState(nextPhase.initial);
                setBossHealAnim(false);
                setEqState(nextFresh);
                setUndoStack([]);
                setSelected(null);
                setActiveHint(null);
                setHistory((prev) => [
                  ...prev,
                  {
                    equationText: formatEquation(nextFresh, pureSymbolsMode),
                    ruleLabel: nextPhase.label,
                    explanation: 'Kapten Orca memulihkan HP penuh! Selesaikan fase baru ini!',
                    stateSnapshot: cloneState(nextFresh),
                  },
                ]);
              }, 1900);
              return;
            }

            window.setTimeout(() => {
              const nextPhase = level.boss!.phases[nextPhaseIdx];
              const nextFresh = cloneState(nextPhase.initial);
              setBossHitAnim(false);
              setBossStrikeAnim(false);
              setBossPhaseIndex(nextPhaseIdx);
              setEqState(nextFresh);
              setUndoStack([]);
              setSelected(null);
              setActiveHint(null);
              setHistory((prev) => [
                ...prev,
                {
                  equationText: formatEquation(nextFresh, pureSymbolsMode),
                  ruleLabel: nextPhase.label,
                  explanation: 'Selesaikan persamaan fase ini tanpa bantuan — buktikan kemampuanmu!',
                  stateSnapshot: cloneState(nextFresh),
                },
              ]);
            }, 1050);
            return;
          }

          const stars =
            newTotalMoves <= level.parMoves ? 3 : newTotalMoves <= level.parMoves + 3 ? 2 : 1;
          window.setTimeout(() => {
            sound.playBossHit();
            phonkMusic.stop();
            setBossHitAnim(true);
            setBossPhaseIndex(totalPhases);
            setBossDialogue(level.boss!.defeatLine);
          }, 220);

          window.setTimeout(() => {
            sound.playBossVictory();
            setBossHitAnim(false);
            setBossStrikeAnim(false);
            setSolvedInfo({ displayResult: check.displayResult as string, stars });
            setBossCinematic('victory');
            onComplete(level, newTotalMoves, stars, {
              flawless: !hadMistakeRef.current,
              usedHint: usedHintRef.current,
              transposes: transposesRunRef.current,
            });
          }, 760);
          return;
        }

        const stars =
          newTotalMoves <= level.parMoves ? 3 : newTotalMoves <= level.parMoves + 2 ? 2 : 1;
        const capturedElapsed = speedRunElapsed;
        const speedsterEarned = Boolean(speedRunEnabled && capturedElapsed <= speedRunTargetSec);
        flashKiboMood('excited', 2400);
        window.setTimeout(() => {
          sound.playVictory();
          setSolvedInfo({
            displayResult: check.displayResult as string,
            stars,
            elapsedSec: speedRunEnabled ? capturedElapsed : undefined,
            speedsterEarned,
            speedRunTargetSec: speedRunEnabled ? speedRunTargetSec : undefined,
          });
          onComplete(level, newTotalMoves, stars, {
            flawless: !hadMistakeRef.current,
            usedHint: usedHintRef.current,
            transposes: transposesRunRef.current,
            elapsedSec: speedRunEnabled ? capturedElapsed : undefined,
            speedsterEarned,
          });
        }, 320);
      }
    },
    [
      eqState,
      totalMoves,
      level,
      onComplete,
      pureSymbolsMode,
      isBossLevel,
      bossGimmick,
      bossHasHealed,
      bossPhaseIndex,
      bossMistakes,
      bossTimeLeft,
      maxBossMistakes,
      bossPenaltySec,
      hasMistakeRule,
      totalBossTime,
      triggerFlyAnimation,
      tutorialIndex,
      flashKiboMood,
      speedRunEnabled,
      speedRunElapsed,
      speedRunTargetSec,
    ]
  );

  const handlePointerStart = useCallback(
    (e: React.PointerEvent, term: Term, side: Side, dragKind: DragKind) => {
      if (solvedInfo || bossHitAnim || bossHealAnim || bossTimedOut || bossCinematic !== null || afkDefeat) {
        return;
      }
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      // Ensure Web Audio unlocks cleanly on mobile touch gesture
      if (phonkActive) {
        phonkMusic.start(bossIntensity, level.chapterId);
      } else {
        stageMusic.start(level.chapterId);
      }

      pendingRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        term,
        fromSide: side,
        dragKind,
      };
    },
    [
      solvedInfo,
      bossHitAnim,
      bossHealAnim,
      bossTimedOut,
      bossCinematic,
      afkDefeat,
      phonkActive,
      bossIntensity,
      level.chapterId,
    ]
  );

  const applyGhostTransform = useCallback(() => {
    dragRafRef.current = null;
    const el = dragGhostRef.current;
    const hangEl = dragHangRef.current;
    const meta = dragMetaRef.current;
    if (!el || !meta) return;

    const { x, y } = dragPosRef.current;
    const crossing = meta.overSide !== null && meta.overSide !== meta.fromSide;
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0) translate(-50%, -18%) scale(${
      crossing ? 1.07 : 1.02
    })`;

    const phys = dragPhysicsRef.current;
    const now = performance.now();
    if (now - phys.lastT > 24) {
      phys.vx *= 0.82;
      if (Math.abs(phys.vx) < 0.01) phys.vx = 0;
    }

    // Positive vx (dragging right) makes bottom trail left -> positive CSS clockwise deg
    const targetAngle = Math.max(-24, Math.min(24, phys.vx * 14));
    phys.angVel = (phys.angVel + (targetAngle - phys.angle) * 0.24) * 0.72;
    phys.angle += phys.angVel;

    if (hangEl) {
      hangEl.style.transform = `rotate(${phys.angle.toFixed(2)}deg)`;
    }

    const settled =
      Math.abs(phys.vx) <= 0.02 &&
      Math.abs(phys.angle) <= 0.25 &&
      Math.abs(phys.angVel) <= 0.25;
    if (!settled) {
      dragRafRef.current = window.requestAnimationFrame(applyGhostTransform);
    } else {
      phys.angle = 0;
      phys.angVel = 0;
      if (hangEl) hangEl.style.transform = 'rotate(0deg)';
    }
  }, []);

  useLayoutEffect(() => {
    if (dragMeta && !dragRafRef.current) {
      dragRafRef.current = window.requestAnimationFrame(applyGhostTransform);
    }
  }, [dragMeta, applyGhostTransform]);

  useEffect(() => {
    const buildHitCache = (draggedTerm: Term, fromSide: Side, dragKind: DragKind) => {
      const leftRect = leftPanRef.current?.getBoundingClientRect() ?? null;
      const rightRect = rightPanRef.current?.getBoundingClientRect() ?? null;
      const splitX =
        leftRect && rightRect ? (leftRect.right + rightRect.left) / 2 : window.innerWidth / 2;

      const combineTargets: Array<{
        id: string;
        left: number;
        right: number;
        top: number;
        bottom: number;
        isZero: boolean;
      }> = [];

      if (dragKind === 'term') {
        const nodes = document.querySelectorAll<HTMLElement>(
          `[data-term-id][data-side="${fromSide}"]`
        );
        nodes.forEach((el) => {
          const tid = el.getAttribute('data-term-id');
          if (!tid || tid === draggedTerm.id) return;
          const targetTerm = eqState[fromSide].find((t) => t.id === tid);
          if (!targetTerm || !canCombineTerms(draggedTerm, targetTerm)) return;
          const r = el.getBoundingClientRect();
          const isZero =
            draggedTerm.kind === 'sym' ||
            (draggedTerm.kind === 'const' &&
              targetTerm.kind === 'const' &&
              draggedTerm.value + targetTerm.value === 0) ||
            (draggedTerm.kind === 'var' &&
              targetTerm.kind === 'var' &&
              draggedTerm.coeff + targetTerm.coeff === 0);
          combineTargets.push({
            id: tid,
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            isZero,
          });
        });
      }

      return { leftRect, rightRect, splitX, combineTargets };
    };

    const getPanUnderPointCached = (x: number, y: number): Side | null => {
      const cache = dragHitCacheRef.current;
      if (!cache) return null;
      const l = cache.leftRect;
      if (l && x >= l.left && x <= l.right && y >= l.top - 40 && y <= l.bottom + 40) {
        return 'left';
      }
      const r = cache.rightRect;
      if (r && x >= r.left && x <= r.right && y >= r.top - 40 && y <= r.bottom + 40) {
        return 'right';
      }
      return x < cache.splitX ? 'left' : 'right';
    };

    const findCombineTargetCached = (
      x: number,
      y: number
    ): { id: string; isZero: boolean } | null => {
      const cache = dragHitCacheRef.current;
      if (!cache) return null;
      for (let i = 0; i < cache.combineTargets.length; i++) {
        const t = cache.combineTargets[i];
        if (x >= t.left && x <= t.right && y >= t.top && y <= t.bottom) {
          return { id: t.id, isZero: t.isZero };
        }
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== e.pointerId) return;

      const prevMeta = dragMetaRef.current;
      const dx = e.clientX - pending.startX;
      const dy = e.clientY - pending.startY;

      if (!prevMeta && dx * dx + dy * dy < 64) return;

      const now = performance.now();
      if (!prevMeta) {
        sound.playPickup();
        suppressClickRef.current = true;
        setSelected(null);
        dragHitCacheRef.current = buildHitCache(pending.term, pending.fromSide, pending.dragKind);
        dragPhysicsRef.current = {
          lastX: e.clientX,
          lastT: now,
          vx: 0,
          angle: -7,
          angVel: 2.6,
        };
      } else {
        const phys = dragPhysicsRef.current;
        const dt = Math.max(8, now - phys.lastT);
        const instantVx = (e.clientX - phys.lastX) / dt;
        phys.vx = phys.vx * 0.55 + instantVx * 0.45;
        phys.lastX = e.clientX;
        phys.lastT = now;
      }

      dragPosRef.current = { x: e.clientX, y: e.clientY };

      const overSide = getPanUnderPointCached(e.clientX, e.clientY);
      const combineHit =
        pending.dragKind === 'term' ? findCombineTargetCached(e.clientX, e.clientY) : null;
      const nextTargetId = combineHit?.id ?? null;
      const nextIsZero = combineHit?.isZero ?? false;

      if (
        !prevMeta ||
        prevMeta.overSide !== overSide ||
        prevMeta.combineTargetId !== nextTargetId ||
        prevMeta.combineIsZero !== nextIsZero
      ) {
        const nextMeta: DragMeta = {
          term: pending.term,
          fromSide: pending.fromSide,
          dragKind: pending.dragKind,
          overSide,
          combineTargetId: nextTargetId,
          combineIsZero: nextIsZero,
        };
        dragMetaRef.current = nextMeta;
        setDragMeta(nextMeta);
      }

      if (!dragRafRef.current) {
        dragRafRef.current = window.requestAnimationFrame(applyGhostTransform);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== e.pointerId) return;

      if (dragRafRef.current) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }

      const currentDrag = dragMetaRef.current;
      const lastPos = dragPosRef.current;
      dragHitCacheRef.current = null;
      dragMetaRef.current = null;
      pendingRef.current = null;
      setDragMeta(null);

      if (currentDrag) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 60);

        if (currentDrag.dragKind === 'term' && currentDrag.combineTargetId) {
          const res = combineTerms(
            eqState,
            currentDrag.fromSide,
            currentDrag.term.id,
            currentDrag.combineTargetId
          );
          commitMove(res, 'combine', undefined, currentDrag.fromSide);
        } else if (currentDrag.overSide && currentDrag.overSide !== currentDrag.fromSide) {
          const flyMeta = {
            term: currentDrag.term,
            fromSide: currentDrag.fromSide,
            dragKind: currentDrag.dragKind,
            originPoint: { x: lastPos.x, y: lastPos.y },
          };
          if (currentDrag.dragKind === 'coeff') {
            commitMove(
              transposeCoefficient(eqState, currentDrag.fromSide, currentDrag.term.id),
              'transpose',
              flyMeta
            );
          } else if (currentDrag.dragKind === 'denom') {
            commitMove(
              transposeDenominator(eqState, currentDrag.fromSide, currentDrag.term.id),
              'transpose',
              flyMeta
            );
          } else {
            commitMove(
              transposeTerm(eqState, currentDrag.fromSide, currentDrag.term.id),
              'transpose',
              flyMeta
            );
          }
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [eqState, commitMove, applyGhostTransform]);

  const handleTileTap = useCallback(
    (term: Term, side: Side) => {
      if (
        suppressClickRef.current ||
        solvedInfo ||
        bossHitAnim ||
        bossTimedOut ||
        bossCinematic !== null ||
        afkDefeat
      ) {
        return;
      }

      if (selected) {
        if (selected.termId === term.id) {
          setSelected(null);
          return;
        }
        if (selected.side === side) {
          const firstTerm = eqState[side].find((t) => t.id === selected.termId);
          if (firstTerm && canCombineTerms(firstTerm, term)) {
            const res = combineTerms(eqState, side, firstTerm.id, term.id);
            commitMove(res, 'combine', undefined, side);
            return;
          }
        }
      }

      sound.playPickup();
      setSelected({ termId: term.id, side });
    },
    [selected, eqState, commitMove, solvedInfo, bossHitAnim, bossTimedOut, bossCinematic, afkDefeat]
  );

  const handlePanClick = (panSide: Side) => {
    if (!selected || solvedInfo || bossHitAnim || bossTimedOut || bossCinematic !== null || afkDefeat) {
      return;
    }
    if (selected.side !== panSide) {
      const term = eqState[selected.side].find((t) => t.id === selected.termId);
      if (term && term.kind !== 'group') {
        commitMove(transposeTerm(eqState, selected.side, term.id), 'transpose', {
          term,
          fromSide: selected.side,
          dragKind: 'term',
        });
      }
    } else {
      setSelected(null);
    }
  };

  const selectedTerm = useMemo(() => {
    if (!selected) return null;
    return eqState[selected.side].find((t) => t.id === selected.termId) || null;
  }, [selected, eqState]);

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    hadMistakeRef.current = true;
    sound.playPickup();
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setEqState(prev);
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    setSelected(null);
    setActiveHint(null);
    setFeedback({ text: 'Kembali satu langkah.', tone: 'info' });
  };

  const handleReset = () => {
    sound.playPickup();
    onRetryStage?.(level);
    hadMistakeRef.current = false;
    usedHintRef.current = false;
    transposesRunRef.current = 0;
    const fresh = cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial);
    setBossPhaseIndex(0);
    setBossHitAnim(false);
    setBossHealAnim(false);
    setBossHasHealed(false);
    setBossPreHealOneHp(false);
    setBossDialogue(level.boss?.introLine ?? '');
    setBossTimeLeft(totalBossTime);
    setBossMistakes(0);
    setBossAwake(!(isBossLevel && level.boss?.gimmick === 'freeze_penalty'));
    setBossTimedOut(false);
    setBossDefeatReason('timeout');
    setBossCinematic(null);
    setAfkDefeat(false);
    setTimeBonusFlash(false);
    setTimePenaltyFlash(false);
    setPenaltyFlashText('');
    bossTauntIdxRef.current = 0;
    setEqState(fresh);
    setUndoStack([]);
    setTotalMoves(0);
    setHistory([
      {
        equationText: formatEquation(fresh, pureSymbolsMode),
        ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
        explanation: buildInitialExplanation(level),
        stateSnapshot: cloneState(fresh),
      },
    ]);
    setSelected(null);
    setActiveHint(null);
    setKiboMood('idle');
    setSolvedInfo(null);
    setSpeedRunElapsed(0);
    dragMetaRef.current = null;
    setDragMeta(null);
    pendingRef.current = null;
    lowTimeNotifiedRef.current = 0;
    setFeedback({ text: 'Papan dikembalikan ke posisi awal.', tone: 'info' });
  };

  const handleHint = () => {
    if (isBossLevel) {
      sound.playNudge();
      flashKiboMood('oops', 1600);
      setFeedback({
        text: 'Bantuan tidak dapat dipakai saat melawan Bos! Ayo selesaikan dengan kemampuanmu sendiri!',
        tone: 'warn',
      });
      return;
    }
    usedHintRef.current = true;
    const hint = getSmartHint(eqState, pureSymbolsMode);
    sound.playPickup();
    flashKiboMood('thinking', 2500);
    setActiveHint(hint);
    setFeedback({ text: hint.message, tone: 'info' });
  };

  const handleBossTaunt = () => {
    if (!level.boss || solvedInfo || bossTimedOut) return;

    // Bab 3 Kura Meriam: starts sleeping (time frozen); interacting wakes him up & starts the timer!
    if (bossGimmick === 'freeze_penalty' && !bossAwake) {
      setBossAwake(true);
      flashKiboMood('oops', 2400);
      setBossDialogue(
        'HEY! Kamu bangunin tidur siangku?! Sekarang jamnya kujalankan, tapi aturan salah 4× (−30 dtk) tetap berlaku ya!'
      );
      setFeedback({
        text: 'YAH! Kura Meriam terbangun gara-gara disentuh! Waktunya sekarang berjalan, dan aturan salah 4× tetap aktif!',
        tone: 'warn',
      });
      return;
    }

    // Bab 5 Cthulhu Samudra: interacting with him deducts 5 seconds immediately!
    if (bossGimmick === 'cosmic_many_hp') {
      const nextTime = Math.max(0, bossTimeLeft - 5);
      setBossTimeLeft(nextTime);
      setPenaltyFlashText('−5 dtk!');
      setTimePenaltyFlash(true);
      if (timePenaltyTimerRef.current) window.clearTimeout(timePenaltyTimerRef.current);
      timePenaltyTimerRef.current = window.setTimeout(() => setTimePenaltyFlash(false), 1150);
      flashKiboMood('oops', 2000);

      const lines = level.boss.tauntLines;
      const line =
        lines && lines.length > 0
          ? lines[bossTauntIdxRef.current % lines.length]
          : 'BERANINYA MENYENTUHKU?! KUPOTONG 5 DETIK WAKTUMU!';
      bossTauntIdxRef.current += 1;

      if (nextTime <= 0) {
        phonkMusic.stop();
        setBossDefeatReason('timeout');
        setBossTimedOut(true);
        setBossDialogue(level.boss.timeoutLine);
        setSelected(null);
        dragMetaRef.current = null;
        setDragMeta(null);
        pendingRef.current = null;
        setFeedback({
          text: 'ADUH! Menyentuh Cthulhu memotong 5 detik terakhir dan waktumu habis!',
          tone: 'warn',
        });
        return;
      }

      setBossDialogue(line);
      setFeedback({
        text: 'AWAS! Jangan sentuh Cthulhu — waktumu langsung terpotong 5 detik (−5 dtk)!',
        tone: 'warn',
      });
      return;
    }

    const lines = level.boss.tauntLines;
    if (!lines || lines.length === 0) return;
    const line = lines[bossTauntIdxRef.current % lines.length];
    bossTauntIdxRef.current += 1;
    setBossDialogue(line);
  };

  const handleFlipBoth = () => {
    commitMove(flipBothSides(eqState), 'flip');
  };

  const ghostPreview = useMemo(() => {
    if (!dragMeta) return null;
    const crossing = dragMeta.overSide !== null && dragMeta.overSide !== dragMeta.fromSide;

    if (dragMeta.dragKind === 'coeff') {
      const factor =
        dragMeta.term.kind === 'var'
          ? dragMeta.term.coeff
          : dragMeta.term.kind === 'group'
            ? dragMeta.term.factor
            : 1;
      const fStr = factor < 0 ? `(−${Math.abs(factor)})` : `${factor}`;
      return {
        crossing,
        op: {
          opSymbol: (crossing ? '÷' : '×') as '×' | '÷',
          valueLabel: fStr,
          tone: (crossing ? 'teal' : 'gold') as 'gold' | 'teal',
        },
        caption: crossing ? `Lepas → bagi ${fStr}` : 'Tarik ke seberang =',
      };
    }

    if (dragMeta.dragKind === 'denom' && dragMeta.term.kind === 'var') {
      const d = dragMeta.term.denom;
      return {
        crossing,
        op: {
          opSymbol: (crossing ? '×' : '÷') as '×' | '÷',
          valueLabel: `${d}`,
          tone: (crossing ? 'teal' : 'gold') as 'gold' | 'teal',
        },
        caption: crossing ? `Lepas → kali ${d}` : 'Tarik ke seberang =',
      };
    }

    const t = dragMeta.term;
    if (t.kind === 'sym') {
      const nextSign: 1 | -1 = crossing ? (t.sign === 1 ? -1 : 1) : t.sign;
      const previewTerm: Term = { ...t, sign: nextSign };
      return {
        crossing,
        term: previewTerm,
        caption: dragMeta.combineTargetId
          ? 'Saling hapus & lenyap!'
          : crossing
            ? 'Berubah jadi lawan!'
            : 'Geser ke seberang =',
      };
    }

    if (t.kind === 'const') {
      const val = crossing ? -t.value : t.value;
      const str = val > 0 ? `+${val}` : `−${Math.abs(val)}`;
      const previewTerm: Term = { ...t, value: val };
      return {
        crossing,
        term: previewTerm,
        caption: dragMeta.combineTargetId
          ? dragMeta.combineIsZero
            ? 'Saling hapus jadi 0!'
            : 'Lepas untuk gabung'
          : crossing
            ? `Pindah → jadi ${str}`
            : 'Geser ke seberang =',
      };
    }

    if (t.kind === 'var') {
      if (pureSymbolsMode && Math.abs(t.coeff) === 1 && t.denom === 1) {
        const targetSide: Side = crossing
          ? dragMeta.fromSide === 'left'
            ? 'right'
            : 'left'
          : dragMeta.fromSide;
        const nextCoeff = crossing ? -t.coeff : t.coeff;
        const previewTerm: Term = { ...t, coeff: nextCoeff };
        return {
          crossing,
          targetSide,
          term: previewTerm,
          caption: crossing
            ? targetSide === 'right'
              ? 'Di ruas kanan: Peti Terbuka'
              : 'Di ruas kiri: Peti Tertutup'
            : targetSide === 'right'
              ? 'Geser ke kiri untuk menutup'
              : 'Geser ke kanan untuk membuka',
        };
      }
      const nextCoeff = crossing ? -t.coeff : t.coeff;
      const absC = Math.abs(nextCoeff);
      const cStr = absC === 1 ? '' : `${absC}`;
      const sign = nextCoeff > 0 ? '+' : '−';
      const str = t.denom > 1 ? `${sign}${cStr}x/${t.denom}` : `${sign}${cStr}x`;
      const previewTerm: Term = { ...t, coeff: nextCoeff };
      return {
        crossing,
        term: previewTerm,
        caption: dragMeta.combineTargetId
          ? dragMeta.combineIsZero
            ? 'Saling hapus jadi 0!'
            : 'Lepas untuk gabung'
          : crossing
            ? `Pindah → jadi ${str}`
            : 'Geser ke seberang =',
      };
    }

    return {
      crossing,
      term: t,
      caption: 'Geser kartu',
    };
  }, [dragMeta, pureSymbolsMode]);

  const beamTilt = useMemo(() => {
    if (flyingAnim) return flyingAnim.toX > flyingAnim.fromX ? 7 : -7;
    if (!dragMeta || !dragMeta.overSide) return 0;
    if (dragMeta.overSide === dragMeta.fromSide) return 0;
    return dragMeta.overSide === 'right' ? 6 : -6;
  }, [dragMeta, flyingAnim]);

  const combinedHighlightedIds = useMemo(() => {
    const ids = new Set<string>();
    activeHint?.highlightIds.forEach((id) => ids.add(id));
    activeTutorialStep?.highlightIds?.forEach((id) => ids.add(id));
    return ids;
  }, [activeHint, activeTutorialStep]);

  const defaultKiboMessage = isBossLevel && level.boss
    ? isBossCriticalTime
      ? level.boss.kiboLines.lowTimeCritical
      : isBossLowTime
        ? level.boss.kiboLines.lowTimeAlert
        : level.boss.kiboLines.intro
    : isStageOne
      ? currentTip
      : isRestTime()
        ? 'Sudah lewat jam 10 malam nih! Pelan-pelan ya, jangan lupa istirahat setelah stage ini!'
        : 'Ayo pecahkan sendiri dulu! Kalau butuh petunjuk, tekan tombol Bantuan.';

  return (
    <div
      className={`relative min-h-[100dvh] flex flex-col game-canvas-bg game-canvas-ch-${level.chapterId} text-[#0D354C] ${
        dragMeta ? 'is-dragging' : ''
      }`}
    >
      <BeachBackdrop chapterId={level.chapterId} paused={!!bossCinematic} />
      {!bossCinematic && (
        <BeachEasterEggs
          variant="game"
          chapterId={level.chapterId}
          onTriggerKibo={(quip) => {
            flashKiboMood('excited', 1800);
            setFeedback({ text: quip, tone: 'good' });
          }}
        />
      )}

      {/* BAB 5 CTHULHU 1-HP COSMIC DIMENSION OVERLAY */}
      {cosmicMode && (
        <div
          className="pointer-events-none fixed inset-0 z-[1] overflow-hidden cosmic-nebula-overlay transition-opacity duration-500"
          aria-hidden="true"
        >
          {/* Swirling Galaxy Vortex */}
          <svg
            viewBox="0 0 320 320"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] opacity-30 cosmic-vortex"
          >
            <circle cx="160" cy="160" r="140" fill="none" stroke="#E879F9" strokeWidth="2.5" strokeDasharray="16 14" />
            <circle cx="160" cy="160" r="102" fill="none" stroke="#22D3EE" strokeWidth="2" strokeDasharray="10 12" />
            <circle cx="160" cy="160" r="64" fill="none" stroke="#FEF08A" strokeWidth="1.8" strokeDasharray="8 10" />
          </svg>

          {/* Twinkling Cosmic Stars */}
          {COSMIC_STARS.map((st, idx) => (
            <span
              key={idx}
              style={
                {
                  left: st.left,
                  top: st.top,
                  width: `${st.size}px`,
                  height: `${st.size}px`,
                  backgroundColor: st.color,
                  boxShadow: `0 0 10px ${st.color}`,
                  '--star-dur': st.dur,
                  '--star-delay': st.delay,
                } as React.CSSProperties
              }
              className="absolute rounded-full cosmic-star-twinkle"
            />
          ))}

          {/* Shooting Cosmic Meteors */}
          <span
            style={{ top: '14%', right: '10%', '--met-dur': '3.4s', '--met-delay': '0s' } as React.CSSProperties}
            className="absolute w-24 h-[2px] rounded-full bg-gradient-to-l from-[#22D3EE] via-[#F0ABFC] to-transparent cosmic-meteor"
          />
          <span
            style={{ top: '38%', right: '18%', '--met-dur': '4.2s', '--met-delay': '1.4s' } as React.CSSProperties}
            className="absolute w-28 h-[2px] rounded-full bg-gradient-to-l from-[#FEF08A] via-[#E879F9] to-transparent cosmic-meteor"
          />
        </div>
      )}

      {/* COASTAL ANDROID GAME TOP HUD BAR */}
      <header className="sticky top-0 z-30 h-14 bg-[#0D4A6B]/96 border-b-2 border-[#7DD3FC]/55 px-3 sm:px-5 flex items-center justify-between gap-2.5 text-white shadow-md">
        <button
          type="button"
          onClick={onExit}
          className="game-btn-wood inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Peta</span>
        </button>

        <div className="min-w-0 text-center flex-1">
          <div className="text-[11px] font-extrabold text-[#FEF08A] truncate">
            {level.isPractice
              ? level.title
              : isBossLevel
                ? `Bab ${level.chapterId} · Bos Penjaga`
                : `Bab ${level.chapterId} · Stage ${level.levelNumber}/20`}
          </div>
          <div className="font-display font-extrabold text-sm sm:text-base text-white truncate">
            {level.title}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!pureSymbolsMode && (
            <button
              type="button"
              onClick={() => setVisualStyle((v) => (v === 'stones' ? 'symbols' : 'stones'))}
              className="game-btn-wood min-h-[42px] px-2.5 sm:px-3 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
              title="Ubah tampilan antara Batu Alam dan Simbol Aljabar"
            >
              {visualStyle === 'stones' ? 'Batu' : 'Simbol'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sound.playPickup();
              onOpenSettings();
            }}
            className="game-btn-wood min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl shrink-0 cursor-pointer"
            aria-label="Pengaturan"
            title="Pengaturan"
          >
            <Settings className="w-4.5 h-4.5 text-[#0D354C]" />
          </button>
        </div>
      </header>

      {/* MAIN GAME ARENA */}
      <main className="pointer-events-none relative z-10 flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-5 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
        <section className="pointer-events-auto flex flex-col gap-3 min-w-0">
          {/* BOSS BANNER */}
          {isBossLevel && level.boss && (
            <BossArenaBanner
              boss={level.boss}
              chapterId={level.chapterId}
              phaseIndex={bossPhaseIndex}
              currentHp={bossCurrentHp}
              maxHp={bossMaxHp}
              isHit={bossHitAnim}
              isHealAnim={bossHealAnim}
              isSpeedUp={isSpeedUp}
              timeSpeedMultiplier={timeSpeedMultiplier}
              isTimeFrozen={isTimeFrozen}
              isBossSleeping={isBossSleeping}
              cosmicMode={cosmicMode}
              mistakesUsed={bossMistakes}
              maxMistakes={hasMistakeRule ? maxBossMistakes : 0}
              dialogue={bossDialogue}
              phonkActive={phonkActive}
              timeLeftSeconds={bossTimeLeft}
              totalTimeSeconds={totalBossTime}
              timeBonusFlash={timeBonusFlash}
              timePenaltyFlash={timePenaltyFlash}
              penaltyFlashText={penaltyFlashText}
              onBossTaunt={handleBossTaunt}
            />
          )}

          {/* KIBO STAGE-1 TUTORIAL */}
          {activeTutorialStep && level.tutorialSteps && tutorialIndex !== null && (
            <KiboTutorialCard
              steps={level.tutorialSteps}
              currentIndex={tutorialIndex}
              chapterId={level.chapterId}
              onNext={() => {
                sound.playPickup();
                if (tutorialIndex + 1 < level.tutorialSteps!.length) {
                  setTutorialIndex(tutorialIndex + 1);
                } else {
                  setTutorialIndex(null);
                }
              }}
              onSkip={() => setTutorialIndex(null)}
            />
          )}

          {/* LIVE EQUATION SCOREBOARD BAR */}
          <div className="rounded-2xl game-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#35637A] tabular-nums">
              <span>Langkah {totalMoves}</span>
              <span aria-hidden="true">·</span>
              <span>Target {level.parMoves}</span>

              {!isBossLevel && onToggleSpeedRun && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPickup();
                      onToggleSpeedRun();
                    }}
                    title="Aktifkan/nonaktifkan pengatur waktu Speed Run untuk Medali Speedster"
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold border transition-colors cursor-pointer ${
                      speedRunEnabled
                        ? speedRunElapsed <= speedRunTargetSec
                          ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]'
                          : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#475569]'
                        : 'bg-[#E0F2FE] border-[#7DD3FC] text-[#0369A1] hover:bg-[#BAE6FD]'
                    }`}
                  >
                    {speedRunEnabled ? (
                      <Zap className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                    ) : (
                      <Timer className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>
                      {speedRunEnabled
                        ? `${formatSeconds(speedRunElapsed)} / ${formatSeconds(speedRunTargetSec)}`
                        : 'Speed Run'}
                    </span>
                  </button>
                </>
              )}
            </div>
            <div
              className="font-mono font-extrabold text-base sm:text-xl text-[#0284C7] tracking-tight tabular-nums"
              aria-live="polite"
            >
              {pureSymbolsMode ? (
                <InlineEquationVisual state={eqState} size="sm" />
              ) : (
                currentEquationText
              )}
            </div>
          </div>

          {/* KIBO COMPACT INTERACTIVE HELPER STRIP (NO SPOILER ON STAGE 2-20, UNIQUE PER BOSS!) */}
          {!activeTutorialStep && (
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-snug border-2 flex items-center gap-3 transition-colors shadow-sm ${
                feedback?.tone === 'warn' || isBossCriticalTime
                  ? 'bg-[#FFF1F2] border-[#FDA4AF] text-[#9F1239]'
                  : isBossLowTime
                    ? 'bg-[#FEF3C7] border-[#F59E0B] text-[#78350F]'
                    : feedback?.tone === 'good'
                      ? 'bg-[#ECFEFF] border-[#5EEAD4] text-[#0F4C5C]'
                      : cosmicMode
                        ? 'bg-[#2E1065]/92 border-[#E879F9] text-[#FAF5FF]'
                        : 'bg-[#FFFDF5] border-[#F6CF7D] text-[#17465E]'
              }`}
            >
              <KiboAvatar
                size="sm"
                chapterId={level.chapterId}
                mood={afkDefeat ? 'fainted' : kiboMood}
                interactive
                afkTimeoutMs={0}
                customQuips={
                  isBossLevel
                    ? isBossLowTime
                      ? level.boss?.kiboLines.lowTimeTapLines
                      : level.boss?.kiboLines.tapLines
                    : undefined
                }
                onInteract={(quip) => {
                  flashKiboMood('giggle', 1300);
                  setFeedback({ text: quip, tone: isBossCriticalTime ? 'warn' : 'good' });
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-extrabold text-[11px] ${
                      isBossCriticalTime
                        ? 'text-[#BE123C]'
                        : isBossLowTime
                          ? 'text-[#B45309]'
                          : cosmicMode && !feedback
                            ? 'text-[#F0ABFC]'
                            : 'text-[#0284C7]'
                    }`}
                  >
                    Kibo
                  </span>
                  {isBossLowTime && (
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono font-extrabold tabular-nums ${
                        isBossCriticalTime
                          ? 'bg-[#BE123C] text-white animate-pulse'
                          : 'bg-[#F59E0B] text-[#291802]'
                      }`}
                    >
                      Sisa {bossTimeLeft}d! Ketuk Kibo!
                    </span>
                  )}
                </div>
                <span className="font-medium block">
                  {feedback ? feedback.text : defaultKiboMessage}
                </span>
              </div>
              {level.tutorialSteps && level.tutorialSteps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTutorialIndex(0)}
                  className="text-xs font-extrabold text-[#B45309] underline shrink-0 cursor-pointer"
                >
                  Panduan
                </button>
              )}
            </div>
          )}

          {/* TROPICAL LAGOON / COSMIC BALANCE BOARD */}
          <div
            className={`relative rounded-3xl p-3 sm:p-5 overflow-hidden transition-all duration-500 ${
              cosmicMode ? 'cosmic-board-frame' : 'beach-board-frame'
            }`}
          >
            {/* GOLDEN ENERGY STRIKE BEAM WHEN BOSS TAKES A HIT */}
            <AnimatePresence>
              {bossStrikeAnim && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0.1, y: 120 }}
                  animate={{ opacity: [0.95, 1, 0], scaleY: [0.2, 1.35, 1.6], y: [100, -40, -140] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-30 flex justify-center"
                >
                  <div className="w-10 sm:w-14 h-full rounded-full bg-gradient-to-t from-transparent via-[#FBBF24] to-[#FEF08A] shadow-[0_0_40px_rgba(251,191,36,0.95)]" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-[1fr_52px_1fr] sm:grid-cols-[1fr_76px_1fr] items-center mb-2 px-1">
              <div className="text-xs font-extrabold text-[#E0F2FE]">Ruas Kiri</div>
              <div className="text-center text-[11px] font-extrabold text-[#FEF08A]">Setara</div>
              <div className="text-right text-xs font-extrabold text-[#E0F2FE]">Ruas Kanan</div>
            </div>

            <div className="grid grid-cols-[1fr_46px_1fr] sm:grid-cols-[1fr_70px_1fr] gap-1.5 sm:gap-3 items-stretch min-h-[240px] sm:min-h-[300px]">
              {/* LEFT PAN */}
              <div
                ref={leftPanRef}
                onClick={() => handlePanClick('left')}
                className={`relative rounded-2xl p-3 sm:p-5 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-3.5 transition-colors duration-150 border-2 overflow-hidden ${
                  dragMeta && dragMeta.fromSide === 'right' && dragMeta.overSide === 'left'
                    ? 'bg-[#FEF9C3] border-[#F59E0B]'
                    : selected && selected.side === 'right'
                      ? 'bg-[#FFFBEB]/95 border-[#FBBF24] cursor-pointer'
                      : 'bg-[#EBF9FF]/94 border-[#7DD3FC]'
                }`}
              >
                {landingSide === 'left' && (
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-4 border-[#F59E0B]/80 animate-shockwave" />
                )}

                {eqState.left.length === 0 ? (
                  <div className="select-none rounded-2xl border-2 border-dashed border-[#7DD3FC] px-5 py-4 font-display font-extrabold text-2xl sm:text-3xl text-[#0369A1]">
                    {pureSymbolsMode ? 'Kosong' : '0'}
                  </div>
                ) : (
                  eqState.left.map((term, idx) => (
                    <AlgebraTile
                      key={term.id}
                      term={term}
                      side="left"
                      isFirstOnSide={idx === 0}
                      isSoloOnSide={eqState.left.length === 1}
                      visualStyle={visualStyle}
                      isSelected={selected?.termId === term.id}
                      isHinted={combinedHighlightedIds.has(term.id)}
                      isCombineTarget={dragMeta?.combineTargetId === term.id}
                      isDraggingThis={
                        dragMeta?.term.id === term.id && dragMeta.dragKind === 'term'
                      }
                      onPointerStart={handlePointerStart}
                      onTap={handleTileTap}
                    />
                  ))
                )}

                {/* RADIATING SPARK BURST ON MERGE OR ZERO CANCEL */}
                {sparkBurst?.side === 'left' && (
                  <div
                    key={sparkBurst.id}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center z-20"
                  >
                    {SPARK_ANGLES.map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const tx = Math.cos(rad) * 58;
                      const ty = Math.sin(rad) * 58;
                      return (
                        <motion.span
                          key={deg}
                          initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                          animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                          transition={{ duration: 0.48, ease: 'easeOut' }}
                          style={{ backgroundColor: sparkBurst.color }}
                          className="absolute w-2.5 h-2.5 rounded-full shadow"
                        />
                      );
                    })}
                  </div>
                )}

                {zeroBurstSide === 'left' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
                    <span className="animate-zero-flash font-display font-extrabold text-2xl text-[#D97706] drop-shadow">
                      {pureSymbolsMode ? 'Lenyap!' : '0 · Lenyap!'}
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER BRASS BRIDGE PORTAL (=) */}
              {(() => {
                const isCrossingPortal =
                  !!flyingAnim ||
                  (!!dragMeta &&
                    dragMeta.overSide !== null &&
                    dragMeta.overSide !== dragMeta.fromSide);
                return (
                  <div className="relative flex flex-col items-center justify-center select-none">
                    <div
                      className={`w-0.5 flex-1 transition-all duration-150 ${
                        isCrossingPortal
                          ? 'w-1 bg-gradient-to-b from-transparent via-[#FEF08A] to-[#FBBF24] shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                          : 'bg-gradient-to-b from-transparent via-[#FDE68A]/70 to-[#FBBF24]'
                      }`}
                    />
                    <div className="relative my-2 flex items-center justify-center">
                      {isCrossingPortal && (
                        <div className="pointer-events-none absolute inset-0 -m-2 rounded-2xl border-2 border-[#FEF08A] animate-shockwave" />
                      )}
                      <div
                        ref={bridgeRef}
                        style={{
                          transform: `rotate(${beamTilt}deg) scale(${isCrossingPortal ? 1.14 : 1})`,
                        }}
                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-[#291802] font-display font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-2 border-[#FEF9C3] transition-transform duration-150 ${
                          isCrossingPortal
                            ? 'shadow-[0_0_24px_rgba(251,191,36,0.9)]'
                            : 'shadow-lg'
                        } ${bridgeFlash ? 'animate-bridge-flash' : ''}`}
                        aria-hidden="true"
                      >
                        =
                      </div>
                    </div>
                    {bridgeFlash && (
                      <div className="pointer-events-none absolute top-2.5 left-1/2 -translate-x-1/2 z-20 rounded-xl bg-[#FEF08A] text-[#291802] font-mono font-extrabold text-[11px] px-2 py-1 shadow-md whitespace-nowrap animate-pop-in flex items-center gap-1 border border-[#F59E0B]/40">
                        {bridgeFlash.startTerm && bridgeFlash.endTerm ? (
                          <>
                            <InlineTermChip
                              term={bridgeFlash.startTerm}
                              pureSymbols
                              side={bridgeFlash.fromSide}
                              size="xs"
                            />
                            <span aria-hidden="true">→</span>
                            <InlineTermChip
                              term={bridgeFlash.endTerm}
                              pureSymbols
                              side={bridgeFlash.toSide}
                              size="xs"
                            />
                          </>
                        ) : (
                          bridgeFlash.tag
                        )}
                      </div>
                    )}
                    <div
                      className={`w-0.5 flex-1 transition-all duration-150 ${
                        isCrossingPortal
                          ? 'w-1 bg-gradient-to-t from-transparent via-[#FEF08A] to-[#FBBF24] shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                          : 'bg-gradient-to-t from-transparent via-[#FDE68A]/70 to-[#FBBF24]'
                      }`}
                    />
                  </div>
                );
              })()}

              {/* RIGHT PAN */}
              <div
                ref={rightPanRef}
                onClick={() => handlePanClick('right')}
                className={`relative rounded-2xl p-3 sm:p-5 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-3.5 transition-colors duration-150 border-2 overflow-hidden ${
                  dragMeta && dragMeta.fromSide === 'left' && dragMeta.overSide === 'right'
                    ? 'bg-[#FEF9C3] border-[#F59E0B]'
                    : selected && selected.side === 'left'
                      ? 'bg-[#FFFBEB]/95 border-[#FBBF24] cursor-pointer'
                      : 'bg-[#EBF9FF]/94 border-[#7DD3FC]'
                }`}
              >
                {landingSide === 'right' && (
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-4 border-[#F59E0B]/80 animate-shockwave" />
                )}

                {eqState.right.length === 0 ? (
                  <div className="select-none rounded-2xl border-2 border-dashed border-[#7DD3FC] px-5 py-4 font-display font-extrabold text-2xl sm:text-3xl text-[#0369A1]">
                    {pureSymbolsMode ? 'Kosong' : '0'}
                  </div>
                ) : (
                  eqState.right.map((term, idx) => (
                    <AlgebraTile
                      key={term.id}
                      term={term}
                      side="right"
                      isFirstOnSide={idx === 0}
                      isSoloOnSide={eqState.right.length === 1}
                      visualStyle={visualStyle}
                      isSelected={selected?.termId === term.id}
                      isHinted={combinedHighlightedIds.has(term.id)}
                      isCombineTarget={dragMeta?.combineTargetId === term.id}
                      isDraggingThis={
                        dragMeta?.term.id === term.id && dragMeta.dragKind === 'term'
                      }
                      onPointerStart={handlePointerStart}
                      onTap={handleTileTap}
                    />
                  ))
                )}

                {/* RADIATING SPARK BURST ON MERGE OR ZERO CANCEL */}
                {sparkBurst?.side === 'right' && (
                  <div
                    key={sparkBurst.id}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center z-20"
                  >
                    {SPARK_ANGLES.map((deg) => {
                      const rad = (deg * Math.PI) / 180;
                      const tx = Math.cos(rad) * 58;
                      const ty = Math.sin(rad) * 58;
                      return (
                        <motion.span
                          key={deg}
                          initial={{ x: 0, y: 0, scale: 1.2, opacity: 1 }}
                          animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                          transition={{ duration: 0.48, ease: 'easeOut' }}
                          style={{ backgroundColor: sparkBurst.color }}
                          className="absolute w-2.5 h-2.5 rounded-full shadow"
                        />
                      );
                    })}
                  </div>
                )}

                {zeroBurstSide === 'right' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-20">
                    <span className="animate-zero-flash font-display font-extrabold text-2xl text-[#D97706] drop-shadow">
                      {pureSymbolsMode ? 'Lenyap!' : '0 · Lenyap!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTEXTUAL TAP-TO-ACT STRIP */}
          {selected && selectedTerm && (
            <div className="rounded-2xl game-panel border-2 border-[#F59E0B] p-3 shadow-lg flex flex-wrap items-center justify-between gap-2 animate-pop-in">
              <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1E4E68] pl-1">
                <span>Dipilih:</span>
                {pureSymbolsMode ? (
                  <InlineTermChip term={selectedTerm} pureSymbols side={selected.side} size="sm" />
                ) : (
                  <strong className="font-mono text-[#B45309]">
                    {formatTermShort(selectedTerm, pureSymbolsMode)}
                  </strong>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTerm.kind !== 'group' && (
                  <button
                    type="button"
                    onClick={() =>
                      commitMove(
                        transposeTerm(eqState, selected.side, selectedTerm.id),
                        'transpose',
                        { term: selectedTerm, fromSide: selected.side, dragKind: 'term' }
                      )
                    }
                    className="game-btn-gold inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                  >
                    {selected.side === 'left' ? (
                      <>
                        <span>Pindah ke Kanan</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Pindah ke Kiri</span>
                      </>
                    )}
                  </button>
                )}

                {selectedTerm.kind === 'var' &&
                  eqState[selected.side].length === 1 &&
                  Math.abs(selectedTerm.coeff) > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        commitMove(
                          transposeCoefficient(eqState, selected.side, selectedTerm.id),
                          'transpose',
                          { term: selectedTerm, fromSide: selected.side, dragKind: 'coeff' }
                        )
                      }
                      className="game-btn-emerald inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      <span>
                        Pindah ×{selectedTerm.coeff} → ÷{selectedTerm.coeff}
                      </span>
                    </button>
                  )}

                {selectedTerm.kind === 'var' &&
                  eqState[selected.side].length === 1 &&
                  selectedTerm.denom > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        commitMove(
                          transposeDenominator(eqState, selected.side, selectedTerm.id),
                          'transpose',
                          { term: selectedTerm, fromSide: selected.side, dragKind: 'denom' }
                        )
                      }
                      className="game-btn-emerald inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      <span>
                        Pindah ÷{selectedTerm.denom} → ×{selectedTerm.denom}
                      </span>
                    </button>
                  )}

                {selectedTerm.kind === 'group' && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        commitMove(expandGroupTerm(eqState, selected.side, selectedTerm.id), 'expand')
                      }
                      className="game-btn-gold inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" aria-hidden="true" />
                      <span>Buka Kurung</span>
                    </button>
                    {eqState[selected.side].length === 1 && Math.abs(selectedTerm.factor) > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          commitMove(
                            transposeCoefficient(eqState, selected.side, selectedTerm.id),
                            'transpose',
                            { term: selectedTerm, fromSide: selected.side, dragKind: 'coeff' }
                          )
                        }
                        className="game-btn-emerald inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                      >
                        <span>
                          Pindah ×{selectedTerm.factor} → ÷{selectedTerm.factor}
                        </span>
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="game-btn-wood min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl cursor-pointer"
                  aria-label="Batalkan pilihan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CHUNKY ANDROID THUMB-ZONE ACTION DOCK */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="game-btn-wood flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[54px] sm:min-h-[48px] px-2 rounded-xl text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Undo2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleHint}
              disabled={isBossLevel}
              title={
                isBossLevel
                  ? 'Bantuan tidak tersedia saat melawan Bos'
                  : 'Minta petunjuk langkah berikutnya'
              }
              className={`${
                isBossLevel ? 'game-btn-wood opacity-45 cursor-not-allowed' : 'game-btn-gold cursor-pointer'
              } flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[54px] sm:min-h-[48px] px-2 rounded-xl text-xs sm:text-sm font-extrabold`}
            >
              {isBossLevel ? (
                <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
              <span>{isBossLevel ? 'Terkunci' : 'Bantuan'}</span>
            </button>

            <button
              type="button"
              onClick={handleFlipBoth}
              className="game-btn-wood flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[54px] sm:min-h-[48px] px-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
              title="Balik semua tanda pada kedua ruas"
            >
              <FlipHorizontal2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Balik ±</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="game-btn-wood flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[54px] sm:min-h-[48px] px-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ulangi</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMobileLog((s) => !s)}
              className="col-span-4 sm:col-span-1 lg:hidden game-btn-wood flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-[#0284C7]" aria-hidden="true" />
              <span>{showMobileLog ? 'Tutup Catatan' : `Catatan (${history.length - 1})`}</span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: CATATAN PINDAH RUAS */}
        <aside
          className={`pointer-events-auto ${
            showMobileLog ? 'block' : 'hidden'
          } lg:block rounded-3xl game-panel p-4 sm:p-5`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#BAE6FD]">
            <h2 className="font-display font-extrabold text-base text-[#0D354C]">
              Catatan Langkah
            </h2>
            <span className="font-mono text-xs font-bold text-[#0284C7] tabular-nums">
              {totalMoves} langkah
            </span>
          </div>

          <ol className="mt-3.5 space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {history.map((step, idx) => (
              <li
                key={idx}
                className="pb-3 border-b border-[#E0F2FE] last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-2">
                  {pureSymbolsMode && step.stateSnapshot ? (
                    <InlineEquationVisual state={step.stateSnapshot} size="xs" />
                  ) : (
                    <span className="font-mono font-extrabold text-sm text-[#0D354C] tabular-nums">
                      {step.equationText}
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-[#4B7A91] shrink-0">
                    {idx === 0 ? 'Awal' : `#${idx}`}
                  </span>
                </div>
                <p className="mt-1 text-xs font-extrabold text-[#0284C7]">{step.ruleLabel}</p>
                {step.explanation && (
                  <p className="mt-0.5 text-xs text-[#35637A] leading-relaxed">
                    {step.explanation}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </aside>
      </main>

      {/* 3D-FLIPPING PARABOLIC FLYING CARD + VISIBLE GOLDEN ARC ACROSS '=' OVERLAY */}
      <AnimatePresence>
        {flyingAnim && (
          <React.Fragment key={flyingAnim.id}>
            {/* Glowing Golden Parabolic Dashed Trajectory Arc Over '=' */}
            <svg
              className="fixed inset-0 z-40 pointer-events-none w-screen h-screen overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id={`fly-arrow-${flyingAnim.id}`}
                  viewBox="0 0 12 12"
                  refX="8"
                  refY="6"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto"
                >
                  <path d="M 0 1 L 11 6 L 0 11 z" fill="#F59E0B" />
                </marker>
              </defs>

              {(() => {
                // Quadratic Bezier control point so the curve passes through (bridgeX, apexY) at t=0.5
                const ctrlX = 2 * flyingAnim.bridgeX - 0.5 * (flyingAnim.fromX + flyingAnim.toX);
                const ctrlY = 2 * flyingAnim.apexY - 0.5 * (flyingAnim.fromY + flyingAnim.toY);
                const arcD = `M ${flyingAnim.fromX} ${flyingAnim.fromY} Q ${ctrlX} ${ctrlY} ${flyingAnim.toX} ${flyingAnim.toY}`;
                return (
                  <>
                    {/* Soft golden halo */}
                    <motion.path
                      d={arcD}
                      fill="none"
                      stroke="#FDE047"
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0.45 }}
                      animate={{ pathLength: 1, opacity: [0.45, 0.35, 0] }}
                      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Crisp dashed flight path with arrowhead */}
                    <motion.path
                      d={arcD}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="4"
                      strokeDasharray="10 8"
                      strokeLinecap="round"
                      markerEnd={`url(#fly-arrow-${flyingAnim.id})`}
                      initial={{ pathLength: 0, opacity: 0.95 }}
                      animate={{ pathLength: 1, opacity: [0.95, 0.95, 0] }}
                      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {/* Origin takeoff pulse ring */}
                    <motion.circle
                      cx={flyingAnim.fromX}
                      cy={flyingAnim.fromY}
                      r="12"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3"
                      initial={{ scale: 0.6, opacity: 0.9 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    />
                    {/* Mid-air sign-flip burst directly over '=' */}
                    <motion.circle
                      cx={flyingAnim.bridgeX}
                      cy={flyingAnim.apexY}
                      r="18"
                      fill="#FEF08A"
                      initial={{ scale: 0.2, opacity: 0 }}
                      animate={{ scale: [0.2, 1.9, 2.4], opacity: [0, 0.65, 0] }}
                      transition={{ duration: 0.55, delay: 0.22, ease: 'easeOut' }}
                    />
                  </>
                );
              })()}
            </svg>

            {/* Mid-Air Transformation Callout Directly Above '=' */}
            <motion.div
              initial={{
                x: flyingAnim.bridgeX,
                y: flyingAnim.apexY - 46,
                scale: 0.72,
                opacity: 0,
              }}
              animate={{
                x: flyingAnim.bridgeX,
                y: flyingAnim.apexY - 58,
                scale: flyingMidFlipped ? 1.12 : 0.96,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 0.74, times: [0, 0.22, 0.82, 1] }}
              className="fixed top-0 left-0 z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#0D354C]/95 text-[#FEF08A] border-2 border-[#FBBF24] px-3 py-1.5 shadow-xl flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FDE047] shrink-0" aria-hidden="true" />
              {flyingAnim.bridgeStartSym && flyingAnim.bridgeEndSym ? (
                <span className="inline-flex items-center gap-1.5">
                  <InlineTermChip
                    term={flyingAnim.bridgeStartSym}
                    pureSymbols
                    side={flyingAnim.fromSide}
                    size="xs"
                  />
                  <span className="font-extrabold text-[#FDE047]">→</span>
                  <InlineTermChip
                    term={flyingAnim.bridgeEndSym}
                    pureSymbols
                    side={flyingAnim.toSide}
                    size="xs"
                  />
                </span>
              ) : (
                <span className="font-mono font-extrabold text-xs sm:text-sm tracking-tight">
                  {flyingAnim.bridgeTag}
                </span>
              )}
            </motion.div>

            {/* Flying Square Card Vaulting Across '=' With 3D Sign Flip */}
            <motion.div
              initial={{
                x: flyingAnim.fromX,
                y: flyingAnim.fromY,
                scale: 1,
                rotate: 0,
                rotateY: 0,
                opacity: 1,
              }}
              animate={{
                x: [flyingAnim.fromX, flyingAnim.bridgeX, flyingAnim.toX],
                y: [flyingAnim.fromY, flyingAnim.apexY, flyingAnim.toY],
                scale: [1, 1.24, 0.98],
                rotate: [0, flyingAnim.toX > flyingAnim.fromX ? 14 : -14, 0],
                rotateY: [0, 90, 0],
                opacity: [1, 1, 0.92],
              }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: 1000 }}
              className="fixed top-0 left-0 z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
            >
              {flyingAnim.dragKind === 'coeff' || flyingAnim.dragKind === 'denom' ? (
                flyingAnim.startOp &&
                flyingAnim.endOp && (
                  <OperatorCardFace
                    opSymbol={flyingMidFlipped ? flyingAnim.endOp.opSymbol : flyingAnim.startOp.opSymbol}
                    valueLabel={
                      flyingMidFlipped ? flyingAnim.endOp.valueLabel : flyingAnim.startOp.valueLabel
                    }
                    tone={flyingMidFlipped ? flyingAnim.endOp.tone : flyingAnim.startOp.tone}
                    glowGold
                  />
                )
              ) : (
                flyingAnim.startTerm &&
                flyingAnim.endTerm && (
                  <TileCardFace
                    term={flyingMidFlipped ? flyingAnim.endTerm : flyingAnim.startTerm}
                    visualStyle={flyingAnim.visualStyle}
                    side={flyingMidFlipped ? flyingAnim.toSide : flyingAnim.fromSide}
                    glowGold
                  />
                )
              )}
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* INTERACTIVE VELOCITY-SPRING HANGING DRAG CARD (ZERO-REFLOW REF-DRIVEN) */}
      {dragMeta && ghostPreview && (
        <div
          ref={dragGhostRef}
          style={{ willChange: 'transform', contain: 'layout style' }}
          className="fixed top-0 left-0 z-50 pointer-events-none flex flex-col items-center gap-1.5"
        >
          {/* Golden finger pinch anchor dot */}
          <span
            aria-hidden="true"
            className="w-2.5 h-2.5 rounded-full bg-[#FEF08A] border-2 border-[#B45309] shadow-sm -mb-2 relative z-10"
          />
          <div
            ref={dragHangRef}
            style={{ transformOrigin: '50% 6%', willChange: 'transform' }}
          >
            {'op' in ghostPreview && ghostPreview.op ? (
              <OperatorCardFace
                opSymbol={ghostPreview.op.opSymbol}
                valueLabel={ghostPreview.op.valueLabel}
                tone={ghostPreview.op.tone}
                glowGold={ghostPreview.crossing}
              />
            ) : (
              'term' in ghostPreview &&
              ghostPreview.term && (
                <TileCardFace
                  term={ghostPreview.term}
                  visualStyle={pureSymbolsMode ? 'pure_symbols' : visualStyle}
                  side={'targetSide' in ghostPreview ? ghostPreview.targetSide : dragMeta.fromSide}
                  glowGold={ghostPreview.crossing}
                />
              )
            )}
          </div>
          <span className="rounded-lg bg-[#0D354C]/94 text-[#FEF08A] text-xs font-bold px-2.5 py-1 shadow-md whitespace-nowrap border border-[#7DD3FC]/35">
            {ghostPreview.caption}
          </span>
        </div>
      )}

      {/* EPIC BOSS ENCOUNTER & VICTORY CINEMATIC VIDEO */}
      {isBossLevel && level.boss && bossCinematic && (
        <Suspense fallback={null}>
          <LazyBossCinematicVideo
            mode={bossCinematic}
            boss={level.boss}
            chapterId={level.chapterId}
            onFinish={() => setBossCinematic(null)}
          />
        </Suspense>
      )}

      {/* BOSS VICTORY CELEBRATION (KIBO HIGH-FIVE & CHEERING AFTER EPIC VIDEO!) */}
      {solvedInfo && isBossLevel && level.boss && bossCinematic !== 'victory' && (
        <KiboBossCelebration
          boss={level.boss}
          chapterId={level.chapterId}
          stars={solvedInfo.stars}
          totalMoves={totalMoves}
          displayResult={solvedInfo.displayResult}
          resultNode={
            pureSymbolsMode ? <InlineEquationVisual state={eqState} size="sm" /> : undefined
          }
          hasNextLevel={hasNextLevel}
          onNextLevel={onNextLevel}
          onReplay={handleReset}
          onExit={onExit}
        />
      )}

      {/* BOSS TIMEOUT DEFEAT MODAL (BOSS MOCKS THE PLAYER!) */}
      {bossTimedOut && !solvedInfo && isBossLevel && level.boss && (
        <BossDefeatModal
          boss={level.boss}
          chapterId={level.chapterId}
          reason={bossDefeatReason}
          onRetry={handleReset}
          onExit={onExit}
        />
      )}

      {/* NON-BOSS AFK > 1 MIN FAINT DEFEAT MODAL */}
      {afkDefeat && !solvedInfo && !isBossLevel && (
        <KiboAfkDefeatModal onRetry={handleReset} onExit={onExit} />
      )}

      {/* REGULAR STAGE VICTORY MODAL */}
      {solvedInfo && !isBossLevel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/82 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-heading"
        >
          <div className="w-full max-w-md rounded-3xl game-panel border-3 border-[#38BDF8] p-6 sm:p-7 text-center animate-pop-in shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="mb-3">
                <KiboAvatar size="lg" chapterId={level.chapterId} mood="excited" />
              </div>

              <div className="flex items-center gap-2 mb-2" aria-label={`${solvedInfo.stars} dari 3 bintang`}>
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 ${
                      n <= solvedInfo.stars
                        ? 'text-[#F59E0B] fill-[#FBBF24]'
                        : 'text-[#CBD5E1] fill-[#E2E8F0]'
                    }`}
                  />
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0284C7]">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Stage Tuntas · {totalMoves} langkah</span>
              </div>

              <h2
                id="victory-heading"
                className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]"
              >
                {pureSymbolsMode ? 'Peti Pusaka Sendirian!' : 'Hebat! x Ditemukan!'}
              </h2>

              <div className="mt-4 w-full rounded-2xl bg-[#EBF8FF] border-2 border-[#BAE6FD] py-3.5 px-5">
                {pureSymbolsMode ? (
                  <div className="flex flex-col items-center gap-2">
                    <InlineEquationVisual state={eqState} size="md" />
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-semibold text-[#35637A]">
                      <span>Awal:</span>
                      <InlineEquationVisual state={level.initial} size="xs" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-mono font-extrabold text-2xl sm:text-3xl text-[#0284C7] tabular-nums">
                      {solvedInfo.displayResult}
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#35637A]">
                      Awal:{' '}
                      <span className="font-mono font-extrabold text-[#0D354C]">
                        {formatEquation(level.initial, pureSymbolsMode)}
                      </span>
                    </p>
                  </>
                )}
              </div>

              {solvedInfo.speedsterEarned ? (
                <div className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] border-2 border-[#F59E0B] px-3.5 py-2.5 flex items-center justify-center gap-2.5 text-left animate-pop-in">
                  <div className="w-8 h-8 rounded-xl bg-[#D97706] text-white flex items-center justify-center shrink-0">
                    <Zap className="w-4.5 h-4.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-xs sm:text-sm text-[#92400E]">
                      Medali Speedster Diraih!
                    </div>
                    <div className="text-[11px] font-bold text-[#78350F] tabular-nums">
                      Selesai dalam {formatSeconds(solvedInfo.elapsedSec ?? 0)} (target{' '}
                      {formatSeconds(solvedInfo.speedRunTargetSec ?? speedRunTargetSec)})
                    </div>
                  </div>
                </div>
              ) : (
                solvedInfo.elapsedSec !== undefined && (
                  <div className="mt-3 text-xs font-bold text-[#4B7A91] tabular-nums">
                    Waktu Speed Run: {formatSeconds(solvedInfo.elapsedSec)} (target Medali:{' '}
                    {formatSeconds(solvedInfo.speedRunTargetSec ?? speedRunTargetSec)})
                  </div>
                )
              )}

              <div className="mt-6 w-full flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="game-btn-wood flex-1 min-h-[48px] px-4 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                >
                  Ulangi
                </button>

                {level.isPractice && onNewPractice ? (
                  <button
                    type="button"
                    onClick={onNewPractice}
                    className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                  >
                    <span>Soal Baru</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : hasNextLevel ? (
                  <button
                    type="button"
                    onClick={onNextLevel}
                    className="game-btn-gold flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-5 rounded-xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
                  >
                    <span>Stage Berikutnya</span>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
