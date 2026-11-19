import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FlipHorizontal2,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  canCombineTerms,
  checkSolved,
  cloneState,
  combineTerms,
  expandGroupTerm,
  flipBothSides,
  formatEquation,
  formatTermShort,
  getSmartHint,
  isPureSymbolState,
  SYMBOL_NAMES,
  transposeCoefficient,
  transposeDenominator,
  transposeTerm,
} from '../game/algebraEngine';
import { sound } from '../game/sound';
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
import { AlgebraTile, DragKind } from './AlgebraTile';
import {
  BossArenaBanner,
  KiboAvatar,
  KiboBossCelebration,
  KiboTutorialCard,
} from './KiboCompanion';

interface GameBoardProps {
  level: LevelDef;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onExit: () => void;
  onComplete: (level: LevelDef, moves: number, stars: number) => void;
  onNextLevel: () => void;
  hasNextLevel: boolean;
  onNewPractice?: () => void;
}

interface ActiveDrag {
  term: Term;
  fromSide: Side;
  dragKind: DragKind;
  x: number;
  y: number;
  overSide: Side | null;
  combineTargetId: string | null;
  combineIsZero: boolean;
}

interface PendingPointer {
  pointerId: number;
  startX: number;
  startY: number;
  term: Term;
  fromSide: Side;
  dragKind: DragKind;
}

interface FlyingTileAnim {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  startLabel: string;
  endLabel: string;
  startBg: string;
  endBg: string;
  bridgeTag: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  soundEnabled,
  onToggleSound,
  onExit,
  onComplete,
  onNextLevel,
  hasNextLevel,
  onNewPractice,
}) => {
  const isBossLevel = !!level.isBoss && !!level.boss && level.boss.phases.length > 0;
  const initialPhaseState = useMemo(
    () => cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial),
    [level, isBossLevel]
  );

  const [bossPhaseIndex, setBossPhaseIndex] = useState(0);
  const [bossHitAnim, setBossHitAnim] = useState(false);
  const [bossDialogue, setBossDialogue] = useState(level.boss?.introLine ?? '');

  const [eqState, setEqState] = useState<EquationState>(initialPhaseState);
  const [undoStack, setUndoStack] = useState<EquationState[]>([]);
  const [totalMoves, setTotalMoves] = useState(0);
  const [history, setHistory] = useState<HistoryStep[]>(() => [
    {
      equationText: formatEquation(initialPhaseState, level.defaultVisual === 'pure_symbols'),
      ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
      explanation: isBossLevel ? level.boss!.phases[0].tip : level.tip,
    },
  ]);

  const [visualStyle, setVisualStyle] = useState<VisualStyle>(level.defaultVisual);
  const [selected, setSelected] = useState<{ termId: string; side: Side } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: 'info' | 'warn' | 'good' } | null>(
    null
  );
  const [activeHint, setActiveHint] = useState<SmartHint | null>(null);
  const [zeroBurstSide, setZeroBurstSide] = useState<Side | null>(null);
  const [bridgeFlashTag, setBridgeFlashTag] = useState<string | null>(null);
  const [flyingAnim, setFlyingAnim] = useState<FlyingTileAnim | null>(null);
  const [flyingMidFlipped, setFlyingMidFlipped] = useState(false);
  const [showMobileLog, setShowMobileLog] = useState(false);
  const [solvedInfo, setSolvedInfo] = useState<{
    displayResult: string;
    stars: number;
  } | null>(null);

  const [tutorialIndex, setTutorialIndex] = useState<number | null>(
    level.tutorialSteps && level.tutorialSteps.length > 0 ? 0 : null
  );

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const pendingRef = useRef<PendingPointer | null>(null);
  const suppressClickRef = useRef(false);
  const leftPanRef = useRef<HTMLDivElement | null>(null);
  const rightPanRef = useRef<HTMLDivElement | null>(null);
  const flyTimerRef = useRef<number[]>([]);

  const clearFlyTimers = useCallback(() => {
    flyTimerRef.current.forEach((id) => window.clearTimeout(id));
    flyTimerRef.current = [];
  }, []);

  useEffect(() => {
    clearFlyTimers();
    const startEq = cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial);
    setBossPhaseIndex(0);
    setBossHitAnim(false);
    setBossDialogue(level.boss?.introLine ?? '');
    setEqState(startEq);
    setUndoStack([]);
    setTotalMoves(0);
    setHistory([
      {
        equationText: formatEquation(startEq, level.defaultVisual === 'pure_symbols'),
        ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
        explanation: isBossLevel ? level.boss!.phases[0].tip : level.tip,
      },
    ]);
    setVisualStyle(level.defaultVisual);
    setSelected(null);
    setFeedback(null);
    setActiveHint(null);
    setZeroBurstSide(null);
    setBridgeFlashTag(null);
    setFlyingAnim(null);
    setFlyingMidFlipped(false);
    setSolvedInfo(null);
    setShowMobileLog(false);
    setTutorialIndex(level.tutorialSteps && level.tutorialSteps.length > 0 ? 0 : null);
    return clearFlyTimers;
  }, [level, isBossLevel, clearFlyTimers]);

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

  const triggerFlyAnimation = useCallback(
    (
      term: Term,
      fromSide: Side,
      dragKind: DragKind,
      originPoint?: { x: number; y: number }
    ) => {
      const targetPan = fromSide === 'left' ? rightPanRef.current : leftPanRef.current;
      if (!targetPan) return;

      let fromX = originPoint?.x ?? 0;
      let fromY = originPoint?.y ?? 0;

      if (!originPoint) {
        const el = document.querySelector(`[data-term-id="${term.id}"]`) as HTMLElement | null;
        if (el) {
          const r = el.getBoundingClientRect();
          fromX = r.left + r.width / 2;
          fromY = r.top + r.height / 2;
        } else {
          const srcPan = fromSide === 'left' ? leftPanRef.current : rightPanRef.current;
          if (!srcPan) return;
          const sr = srcPan.getBoundingClientRect();
          fromX = sr.left + sr.width / 2;
          fromY = sr.top + sr.height / 2;
        }
      }

      const tr = targetPan.getBoundingClientRect();
      const toX = tr.left + tr.width / 2;
      const toY = tr.top + tr.height / 2;

      let startLabel = '';
      let endLabel = '';
      let startBg = 'bg-[#0F766E]';
      let endBg = 'bg-[#B91C1C]';
      let bridgeTag = '+ → −';

      if (dragKind === 'coeff') {
        const factor =
          term.kind === 'var' ? term.coeff : term.kind === 'group' ? term.factor : 1;
        const fStr = factor < 0 ? `(−${Math.abs(factor)})` : `${factor}`;
        startLabel = `×${fStr}`;
        endLabel = `÷${fStr}`;
        startBg = 'bg-[#D97706]';
        endBg = 'bg-[#0F766E]';
        bridgeTag = `×${fStr} → ÷${fStr}`;
      } else if (dragKind === 'denom' && term.kind === 'var') {
        startLabel = `÷${term.denom}`;
        endLabel = `×${term.denom}`;
        startBg = 'bg-[#D97706]';
        endBg = 'bg-[#0F766E]';
        bridgeTag = `÷${term.denom} → ×${term.denom}`;
      } else if (term.kind === 'sym') {
        const info = SYMBOL_NAMES[term.family];
        startLabel = term.sign > 0 ? info.pos : `Lawan ${info.pos}`;
        endLabel = term.sign > 0 ? `Lawan ${info.pos}` : info.pos;
        startBg = term.sign > 0 ? 'bg-[#0F766E]' : 'bg-[#B91C1C]';
        endBg = term.sign > 0 ? 'bg-[#B91C1C]' : 'bg-[#0F766E]';
        bridgeTag = term.sign > 0 ? 'Asli → Lawan' : 'Lawan → Asli';
      } else if (term.kind === 'const') {
        const oldStr = term.value > 0 ? `+${term.value}` : `−${Math.abs(term.value)}`;
        const newStr = term.value > 0 ? `−${term.value}` : `+${Math.abs(term.value)}`;
        startLabel = oldStr;
        endLabel = newStr;
        startBg = term.value > 0 ? 'bg-[#0F766E]' : 'bg-[#B91C1C]';
        endBg = term.value > 0 ? 'bg-[#B91C1C]' : 'bg-[#0F766E]';
        bridgeTag = term.value > 0 ? '+ → −' : '− → +';
      } else if (term.kind === 'var') {
        startLabel = formatTermShort(term, pureSymbolsMode);
        const flipped: Term = { ...term, coeff: -term.coeff };
        endLabel = formatTermShort(flipped, pureSymbolsMode);
        startBg = 'bg-[#D97706]';
        endBg = 'bg-[#D97706]';
        bridgeTag = term.coeff > 0 ? '+x → −x' : '−x → +x';
      }

      clearFlyTimers();
      setFlyingMidFlipped(false);
      setBridgeFlashTag(bridgeTag);
      setFlyingAnim({
        id: Date.now(),
        fromX,
        fromY,
        toX,
        toY,
        startLabel,
        endLabel,
        startBg,
        endBg,
        bridgeTag,
      });

      const t1 = window.setTimeout(() => setFlyingMidFlipped(true), 170);
      const t2 = window.setTimeout(() => {
        setFlyingAnim(null);
        setFlyingMidFlipped(false);
      }, 410);
      const t3 = window.setTimeout(() => setBridgeFlashTag(null), 680);
      flyTimerRef.current = [t1, t2, t3];
    },
    [clearFlyTimers, pureSymbolsMode]
  );

  const commitMove = useCallback(
    (
      result: MoveResult,
      moveKind: 'transpose' | 'combine' | 'expand' | 'flip',
      flyMeta?: { term: Term; fromSide: Side; dragKind: DragKind; originPoint?: { x: number; y: number } }
    ) => {
      if (!result.ok || !result.nextState) {
        sound.playNudge();
        setFeedback({
          text: result.errorMessage || 'Langkah ini belum bisa dilakukan.',
          tone: 'warn',
        });
        return;
      }

      if (moveKind === 'transpose' && flyMeta) {
        triggerFlyAnimation(flyMeta.term, flyMeta.fromSide, flyMeta.dragKind, flyMeta.originPoint);
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
        },
      ]);

      setFeedback({
        text: result.explanation || result.ruleLabel || 'Langkah berhasil!',
        tone: 'good',
      });

      if (result.cancelledToZero && result.cancelledSide) {
        sound.playZeroCancel();
        setZeroBurstSide(result.cancelledSide);
        window.setTimeout(() => setZeroBurstSide(null), 600);
      } else if (moveKind === 'transpose') {
        sound.playTranspose();
      } else if (moveKind === 'combine') {
        sound.playCombine();
      } else if (moveKind === 'expand' || moveKind === 'flip') {
        sound.playExpand();
      }

      const check = checkSolved(nextState, pureSymbolsMode);
      if (check.solved && check.displayResult) {
        if (isBossLevel && level.boss) {
          const nextPhaseIdx = bossPhaseIndex + 1;
          const totalPhases = level.boss.phases.length;

          if (nextPhaseIdx < totalPhases) {
            const hitLine =
              level.boss.hitLines[bossPhaseIndex] || 'Aduh! Lanjut ke fase berikutnya!';
            window.setTimeout(() => {
              sound.playBossHit();
              setBossHitAnim(true);
              setBossDialogue(hitLine);
              setFeedback({
                text: `Kena telak! ${level.boss!.name} kehilangan 1 HP — siap untuk fase ${nextPhaseIdx + 1}!`,
                tone: 'good',
              });
            }, 220);

            window.setTimeout(() => {
              const nextPhase = level.boss!.phases[nextPhaseIdx];
              const nextFresh = cloneState(nextPhase.initial);
              setBossHitAnim(false);
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
                  explanation: nextPhase.tip,
                },
              ]);
            }, 1050);
            return;
          }

          const stars =
            newTotalMoves <= level.parMoves ? 3 : newTotalMoves <= level.parMoves + 3 ? 2 : 1;
          window.setTimeout(() => {
            sound.playBossHit();
            setBossHitAnim(true);
            setBossPhaseIndex(totalPhases);
            setBossDialogue(level.boss!.defeatLine);
          }, 200);

          window.setTimeout(() => {
            sound.playBossVictory();
            setBossHitAnim(false);
            setSolvedInfo({ displayResult: check.displayResult as string, stars });
            onComplete(level, newTotalMoves, stars);
          }, 700);
          return;
        }

        const stars =
          newTotalMoves <= level.parMoves ? 3 : newTotalMoves <= level.parMoves + 2 ? 2 : 1;
        window.setTimeout(() => {
          sound.playVictory();
          setSolvedInfo({ displayResult: check.displayResult as string, stars });
          onComplete(level, newTotalMoves, stars);
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
      bossPhaseIndex,
      triggerFlyAnimation,
      tutorialIndex,
    ]
  );

  const handlePointerStart = useCallback(
    (e: React.PointerEvent, term: Term, side: Side, dragKind: DragKind) => {
      if (solvedInfo || bossHitAnim) return;
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      pendingRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        term,
        fromSide: side,
        dragKind,
      };
    },
    [solvedInfo, bossHitAnim]
  );

  useEffect(() => {
    const getPanUnderPoint = (x: number, y: number): Side | null => {
      const lRect = leftPanRef.current?.getBoundingClientRect();
      if (lRect && x >= lRect.left && x <= lRect.right && y >= lRect.top - 40 && y <= lRect.bottom + 40) {
        return 'left';
      }
      const rRect = rightPanRef.current?.getBoundingClientRect();
      if (rRect && x >= rRect.left && x <= rRect.right && y >= rRect.top - 40 && y <= rRect.bottom + 40) {
        return 'right';
      }
      if (lRect && rRect) {
        const mid = (lRect.right + rRect.left) / 2;
        return x < mid ? 'left' : 'right';
      }
      return null;
    };

    const findCombineTarget = (
      x: number,
      y: number,
      draggedTerm: Term,
      fromSide: Side
    ): { id: string; isZero: boolean } | null => {
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        const tileEl = (el as HTMLElement).closest?.('[data-term-id]') as HTMLElement | null;
        if (tileEl) {
          const tid = tileEl.getAttribute('data-term-id');
          const tSide = tileEl.getAttribute('data-side') as Side | null;
          if (tid && tSide === fromSide && tid !== draggedTerm.id) {
            const targetTerm = eqState[fromSide].find((t) => t.id === tid);
            if (targetTerm && canCombineTerms(draggedTerm, targetTerm)) {
              const isZero =
                draggedTerm.kind === 'sym' ||
                (draggedTerm.kind === 'const' &&
                  targetTerm.kind === 'const' &&
                  draggedTerm.value + targetTerm.value === 0) ||
                (draggedTerm.kind === 'var' &&
                  targetTerm.kind === 'var' &&
                  draggedTerm.coeff + targetTerm.coeff === 0);
              return { id: tid, isZero };
            }
          }
        }
      }
      return null;
    };

    const onPointerMove = (e: PointerEvent) => {
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== e.pointerId) return;

      const dx = e.clientX - pending.startX;
      const dy = e.clientY - pending.startY;
      const dist = Math.hypot(dx, dy);

      if (!activeDrag && dist < 8) return;

      if (!activeDrag) {
        sound.playPickup();
        suppressClickRef.current = true;
        setSelected(null);
      }

      const overSide = getPanUnderPoint(e.clientX, e.clientY);
      const combineHit =
        pending.dragKind === 'term'
          ? findCombineTarget(e.clientX, e.clientY, pending.term, pending.fromSide)
          : null;

      setActiveDrag({
        term: pending.term,
        fromSide: pending.fromSide,
        dragKind: pending.dragKind,
        x: e.clientX,
        y: e.clientY,
        overSide,
        combineTargetId: combineHit?.id ?? null,
        combineIsZero: combineHit?.isZero ?? false,
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== e.pointerId) return;

      const currentDrag = activeDrag;
      pendingRef.current = null;
      setActiveDrag(null);

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
          commitMove(res, 'combine');
        } else if (currentDrag.overSide && currentDrag.overSide !== currentDrag.fromSide) {
          const flyMeta = {
            term: currentDrag.term,
            fromSide: currentDrag.fromSide,
            dragKind: currentDrag.dragKind,
            originPoint: { x: currentDrag.x, y: currentDrag.y },
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

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [activeDrag, eqState, commitMove]);

  const handleTileTap = useCallback(
    (term: Term, side: Side) => {
      if (suppressClickRef.current || solvedInfo || bossHitAnim) return;

      if (selected) {
        if (selected.termId === term.id) {
          setSelected(null);
          return;
        }
        if (selected.side === side) {
          const firstTerm = eqState[side].find((t) => t.id === selected.termId);
          if (firstTerm && canCombineTerms(firstTerm, term)) {
            const res = combineTerms(eqState, side, firstTerm.id, term.id);
            commitMove(res, 'combine');
            return;
          }
        }
      }

      sound.playPickup();
      setSelected({ termId: term.id, side });
    },
    [selected, eqState, commitMove, solvedInfo, bossHitAnim]
  );

  const handlePanClick = (panSide: Side) => {
    if (!selected || solvedInfo || bossHitAnim) return;
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
    const fresh = cloneState(isBossLevel ? level.boss!.phases[0].initial : level.initial);
    setBossPhaseIndex(0);
    setBossHitAnim(false);
    setBossDialogue(level.boss?.introLine ?? '');
    setEqState(fresh);
    setUndoStack([]);
    setTotalMoves(0);
    setHistory([
      {
        equationText: formatEquation(fresh, pureSymbolsMode),
        ruleLabel: isBossLevel ? level.boss!.phases[0].label : 'Persamaan Awal',
        explanation: isBossLevel ? level.boss!.phases[0].tip : level.tip,
      },
    ]);
    setSelected(null);
    setActiveHint(null);
    setSolvedInfo(null);
    setFeedback({ text: 'Papan dikembalikan ke posisi awal.', tone: 'info' });
  };

  const handleHint = () => {
    const hint = getSmartHint(eqState, pureSymbolsMode);
    sound.playPickup();
    setActiveHint(hint);
    setFeedback({ text: hint.message, tone: 'info' });
  };

  const handleFlipBoth = () => {
    commitMove(flipBothSides(eqState), 'flip');
  };

  const ghostPreview = useMemo(() => {
    if (!activeDrag) return null;
    const crossing = activeDrag.overSide !== null && activeDrag.overSide !== activeDrag.fromSide;

    if (activeDrag.dragKind === 'coeff') {
      const factor =
        activeDrag.term.kind === 'var'
          ? activeDrag.term.coeff
          : activeDrag.term.kind === 'group'
            ? activeDrag.term.factor
            : 1;
      const fStr = factor < 0 ? `(−${Math.abs(factor)})` : `${factor}`;
      return {
        label: crossing ? `÷${fStr}` : `×${fStr}`,
        caption: crossing ? `Lepas → bagi ${fStr}` : 'Tarik ke seberang =',
        bg: crossing ? 'bg-[#0F766E]' : 'bg-[#D97706]',
      };
    }

    if (activeDrag.dragKind === 'denom' && activeDrag.term.kind === 'var') {
      const d = activeDrag.term.denom;
      return {
        label: crossing ? `×${d}` : `÷${d}`,
        caption: crossing ? `Lepas → kali ${d}` : 'Tarik ke seberang =',
        bg: crossing ? 'bg-[#0F766E]' : 'bg-[#D97706]',
      };
    }

    const t = activeDrag.term;
    if (t.kind === 'sym') {
      const info = SYMBOL_NAMES[t.family];
      const nextSign = crossing ? -t.sign : t.sign;
      const lbl = nextSign > 0 ? info.pos : `Lawan ${info.pos}`;
      return {
        label: lbl,
        caption: activeDrag.combineTargetId
          ? 'Saling hapus & lenyap!'
          : crossing
            ? `Pindah → jadi ${lbl}`
            : 'Geser ke seberang =',
        bg: nextSign > 0 ? 'bg-[#0F766E]' : 'bg-[#B91C1C]',
      };
    }

    if (t.kind === 'const') {
      const val = crossing ? -t.value : t.value;
      const str = val > 0 ? `+${val}` : `−${Math.abs(val)}`;
      return {
        label: str,
        caption: activeDrag.combineTargetId
          ? activeDrag.combineIsZero
            ? 'Saling hapus jadi 0!'
            : 'Lepas untuk gabung'
          : crossing
            ? `Pindah → jadi ${str}`
            : 'Geser ke seberang =',
        bg: val > 0 ? 'bg-[#0F766E]' : 'bg-[#B91C1C]',
      };
    }

    if (t.kind === 'var') {
      if (pureSymbolsMode && t.coeff === 1 && t.denom === 1) {
        return {
          label: 'Peti Pusaka',
          caption: 'Sisakan Peti sendirian!',
          bg: 'bg-[#D97706]',
        };
      }
      const nextCoeff = crossing ? -t.coeff : t.coeff;
      const absC = Math.abs(nextCoeff);
      const cStr = absC === 1 ? '' : `${absC}`;
      const sign = nextCoeff > 0 ? '+' : '−';
      const str = t.denom > 1 ? `${sign}${cStr}x/${t.denom}` : `${sign}${cStr}x`;
      return {
        label: str,
        caption: activeDrag.combineTargetId
          ? activeDrag.combineIsZero
            ? 'Saling hapus jadi 0!'
            : 'Lepas untuk gabung'
          : crossing
            ? `Pindah → jadi ${str}`
            : 'Geser ke seberang =',
        bg: 'bg-[#D97706]',
      };
    }

    return null;
  }, [activeDrag, pureSymbolsMode]);

  const beamTilt = useMemo(() => {
    if (flyingAnim) return flyingAnim.toX > flyingAnim.fromX ? 7 : -7;
    if (!activeDrag || !activeDrag.overSide) return 0;
    if (activeDrag.overSide === activeDrag.fromSide) return 0;
    return activeDrag.overSide === 'right' ? 6 : -6;
  }, [activeDrag, flyingAnim]);

  const combinedHighlightedIds = useMemo(() => {
    const ids = new Set<string>();
    activeHint?.highlightIds.forEach((id) => ids.add(id));
    activeTutorialStep?.highlightIds?.forEach((id) => ids.add(id));
    return ids;
  }, [activeHint, activeTutorialStep]);

  return (
    <div className="min-h-[100dvh] flex flex-col game-canvas-bg text-white">
      {/* ANDROID GAME TOP HUD BAR */}
      <header className="sticky top-0 z-30 h-14 bg-[#0A1D17]/95 backdrop-blur-md border-b border-[#254E40] px-3 sm:px-5 flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onExit}
          className="game-btn-wood inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Peta</span>
        </button>

        <div className="min-w-0 text-center flex-1">
          <div className="text-[11px] font-bold text-[#F5C156] truncate">
            {level.isPractice
              ? level.title
              : isBossLevel
                ? `Bab ${level.chapterId} · Bos Penjaga`
                : `Bab ${level.chapterId} · Stage ${level.levelNumber}`}
          </div>
          <div className="font-display font-bold text-sm sm:text-base text-white truncate">
            {level.title}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!pureSymbolsMode && (
            <button
              type="button"
              onClick={() => setVisualStyle((v) => (v === 'stones' ? 'symbols' : 'stones'))}
              className="game-btn-wood min-h-[42px] px-2.5 sm:px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
              title="Ubah tampilan antara Batu Alam dan Simbol Aljabar"
            >
              {visualStyle === 'stones' ? 'Batu' : 'Simbol'}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSound}
            className="game-btn-wood min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl shrink-0 cursor-pointer"
            aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#FDE68A]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#7EA396]" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN GAME ARENA */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-3.5 sm:py-5 grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 items-start">
        <section className="flex flex-col gap-3 min-w-0">
          {/* BOSS BANNER */}
          {isBossLevel && level.boss && (
            <BossArenaBanner
              boss={level.boss}
              phaseIndex={bossPhaseIndex}
              isHit={bossHitAnim}
              dialogue={bossDialogue}
            />
          )}

          {/* KIBO STAGE-1 TUTORIAL */}
          {activeTutorialStep && level.tutorialSteps && tutorialIndex !== null && (
            <KiboTutorialCard
              steps={level.tutorialSteps}
              currentIndex={tutorialIndex}
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
          <div className="rounded-2xl bg-[#112B22] border border-[#2A5848] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9EC2B5] tabular-nums">
              <span>Langkah {totalMoves}</span>
              <span aria-hidden="true">·</span>
              <span>Target {level.parMoves}</span>
            </div>
            <div
              className="font-mono font-extrabold text-base sm:text-xl text-[#FDE68A] tracking-tight tabular-nums"
              aria-live="polite"
            >
              {currentEquationText}
            </div>
          </div>

          {/* KIBO COMPACT HELPER STRIP */}
          {!activeTutorialStep && (
            <div
              className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-snug border flex items-center gap-3 transition-colors ${
                feedback?.tone === 'warn'
                  ? 'bg-[#3D1519] border-[#F87171]/60 text-[#FECACA]'
                  : feedback?.tone === 'good'
                    ? 'bg-[#0F382B] border-[#34D399]/50 text-[#D1FAE5]'
                    : 'bg-[#143329] border-[#D4A853]/35 text-[#E5F2ED]'
              }`}
            >
              <KiboAvatar size="sm" animate={feedback?.tone === 'good'} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-[11px] text-[#FDE68A] block">Kibo</span>
                <span>{feedback ? feedback.text : currentTip}</span>
              </div>
              {level.tutorialSteps && level.tutorialSteps.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTutorialIndex(0)}
                  className="text-xs font-bold text-[#FDE68A] underline shrink-0 cursor-pointer"
                >
                  Panduan
                </button>
              )}
            </div>
          )}

          {/* CARVED TEAKWOOD BALANCE BOARD */}
          <div className="relative rounded-3xl bg-[#102921] p-3 sm:p-5 border-2 border-[#D4A853]/55 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_52px_1fr] sm:grid-cols-[1fr_76px_1fr] items-center mb-2 px-1">
              <div className="text-xs font-bold text-[#9EC2B5]">Ruas Kiri</div>
              <div className="text-center text-[11px] font-extrabold text-[#F5C156]">Setara</div>
              <div className="text-right text-xs font-bold text-[#9EC2B5]">Ruas Kanan</div>
            </div>

            <div className="grid grid-cols-[1fr_46px_1fr] sm:grid-cols-[1fr_70px_1fr] gap-1.5 sm:gap-3 items-stretch min-h-[240px] sm:min-h-[300px]">
              {/* LEFT PAN */}
              <div
                ref={leftPanRef}
                onClick={() => handlePanClick('left')}
                className={`relative rounded-2xl p-3 sm:p-5 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-3.5 transition-colors duration-150 border-2 ${
                  activeDrag && activeDrag.fromSide === 'right' && activeDrag.overSide === 'left'
                    ? 'bg-[#1C4D3D] border-[#FBBF24]'
                    : selected && selected.side === 'right'
                      ? 'bg-[#184335] border-[#FBBF24]/65 cursor-pointer'
                      : 'bg-[#15392E] border-[#285B4A]'
                }`}
              >
                {eqState.left.length === 0 ? (
                  <div className="select-none rounded-2xl border-2 border-dashed border-[#467A69] px-5 py-4 font-display font-bold text-2xl sm:text-3xl text-[#8AB5A6]">
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
                      isCombineTarget={activeDrag?.combineTargetId === term.id}
                      isDraggingThis={
                        activeDrag?.term.id === term.id && activeDrag.dragKind === 'term'
                      }
                      onPointerStart={handlePointerStart}
                      onTap={handleTileTap}
                    />
                  ))
                )}

                {zeroBurstSide === 'left' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="animate-zero-flash font-display font-extrabold text-2xl text-[#FDE68A] drop-shadow">
                      {pureSymbolsMode ? 'Lenyap!' : '0 · Lenyap!'}
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER BRASS BRIDGE (=) */}
              <div className="relative flex flex-col items-center justify-center select-none">
                <div className="w-0.5 flex-1 bg-gradient-to-b from-transparent via-[#D4A853]/50 to-[#D4A853]" />
                <div
                  style={{ transform: `rotate(${beamTilt}deg)` }}
                  className={`my-2 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-[#FBBF24] to-[#C88617] text-[#11241E] font-display font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-2 border-[#FEF3C7] transition-transform duration-150 ${
                    bridgeFlashTag ? 'animate-bridge-flash' : ''
                  }`}
                  aria-hidden="true"
                >
                  =
                </div>
                {bridgeFlashTag && (
                  <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-20 rounded-lg bg-[#FDE68A] text-[#11241E] font-mono font-extrabold text-[11px] px-2 py-0.5 shadow-md whitespace-nowrap animate-pop-in">
                    {bridgeFlashTag}
                  </div>
                )}
                <div className="w-0.5 flex-1 bg-gradient-to-t from-transparent via-[#D4A853]/50 to-[#D4A853]" />
              </div>

              {/* RIGHT PAN */}
              <div
                ref={rightPanRef}
                onClick={() => handlePanClick('right')}
                className={`relative rounded-2xl p-3 sm:p-5 flex flex-wrap items-center justify-center content-center gap-2.5 sm:gap-3.5 transition-colors duration-150 border-2 ${
                  activeDrag && activeDrag.fromSide === 'left' && activeDrag.overSide === 'right'
                    ? 'bg-[#1C4D3D] border-[#FBBF24]'
                    : selected && selected.side === 'left'
                      ? 'bg-[#184335] border-[#FBBF24]/65 cursor-pointer'
                      : 'bg-[#15392E] border-[#285B4A]'
                }`}
              >
                {eqState.right.length === 0 ? (
                  <div className="select-none rounded-2xl border-2 border-dashed border-[#467A69] px-5 py-4 font-display font-bold text-2xl sm:text-3xl text-[#8AB5A6]">
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
                      isCombineTarget={activeDrag?.combineTargetId === term.id}
                      isDraggingThis={
                        activeDrag?.term.id === term.id && activeDrag.dragKind === 'term'
                      }
                      onPointerStart={handlePointerStart}
                      onTap={handleTileTap}
                    />
                  ))
                )}

                {zeroBurstSide === 'right' && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="animate-zero-flash font-display font-extrabold text-2xl text-[#FDE68A] drop-shadow">
                      {pureSymbolsMode ? 'Lenyap!' : '0 · Lenyap!'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTEXTUAL TAP-TO-ACT STRIP */}
          {selected && selectedTerm && (
            <div className="rounded-2xl bg-[#14352B] border-2 border-[#F5C156]/80 p-3 shadow-lg flex flex-wrap items-center justify-between gap-2 animate-pop-in">
              <div className="text-xs sm:text-sm font-semibold text-[#D6EAE2] pl-1">
                Dipilih:{' '}
                <strong className="font-mono text-[#FDE68A]">
                  {formatTermShort(selectedTerm, pureSymbolsMode)}
                </strong>
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
              className="game-btn-gold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 min-h-[54px] sm:min-h-[48px] px-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Bantuan</span>
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
              className="col-span-4 sm:col-span-1 lg:hidden game-btn-wood flex items-center justify-center gap-2 min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
            >
              <BookOpen className="w-4 h-4 shrink-0 text-[#FDE68A]" aria-hidden="true" />
              <span>{showMobileLog ? 'Tutup Catatan' : `Catatan (${history.length - 1})`}</span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: CARVED CATATAN PINDAH RUAS */}
        <aside
          className={`${
            showMobileLog ? 'block' : 'hidden'
          } lg:block rounded-2xl game-panel p-4 sm:p-5`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="font-display font-bold text-base text-[#FDE68A]">
              Catatan Langkah
            </h2>
            <span className="font-mono text-xs text-[#9EC2B5] tabular-nums">
              {totalMoves} langkah
            </span>
          </div>

          <ol className="mt-3.5 space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {history.map((step, idx) => (
              <li
                key={idx}
                className="pb-3 border-b border-white/10 last:border-b-0 last:pb-0"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-white tabular-nums">
                    {step.equationText}
                  </span>
                  <span className="text-[11px] font-semibold text-[#8FB5A7] shrink-0">
                    {idx === 0 ? 'Awal' : `#${idx}`}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-[#5EEAD4]">{step.ruleLabel}</p>
                {step.explanation && (
                  <p className="mt-0.5 text-xs text-[#C7DDD4] leading-relaxed">
                    {step.explanation}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </aside>
      </main>

      {/* FLYING ARC TRANSPOSITION ANIMATION OVERLAY */}
      <AnimatePresence>
        {flyingAnim && (
          <motion.div
            key={flyingAnim.id}
            initial={{
              x: flyingAnim.fromX,
              y: flyingAnim.fromY,
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: [
                flyingAnim.fromX,
                (flyingAnim.fromX + flyingAnim.toX) / 2,
                flyingAnim.toX,
              ],
              y: [
                flyingAnim.fromY,
                Math.min(flyingAnim.fromY, flyingAnim.toY) - 68,
                flyingAnim.toY,
              ],
              scale: [1, 1.24, 0.96],
              rotate: [0, flyingAnim.toX > flyingAnim.fromX ? 12 : -12, 0],
              opacity: [1, 1, 0.15],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className={`px-5 py-3.5 rounded-2xl text-white font-display font-extrabold text-2xl shadow-2xl border-2 border-[#FDE68A] transition-colors duration-100 whitespace-nowrap ${
                flyingMidFlipped ? flyingAnim.endBg : flyingAnim.startBg
              }`}
            >
              {flyingMidFlipped ? flyingAnim.endLabel : flyingAnim.startLabel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING DRAG GHOST */}
      {activeDrag && ghostPreview && (
        <div
          style={{
            transform: `translate3d(${activeDrag.x}px, ${activeDrag.y}px, 0) translate(-50%, -65%)`,
          }}
          className="fixed top-0 left-0 z-50 pointer-events-none flex flex-col items-center gap-1.5"
        >
          <div
            className={`px-5 py-3.5 rounded-2xl text-white font-display font-extrabold text-xl sm:text-2xl shadow-2xl border-2 border-white/80 whitespace-nowrap ${ghostPreview.bg}`}
          >
            {ghostPreview.label}
          </div>
          <span className="rounded-lg bg-[#081712]/95 text-[#FDE68A] text-xs font-bold px-2.5 py-1 shadow-md whitespace-nowrap">
            {ghostPreview.caption}
          </span>
        </div>
      )}

      {/* BOSS VICTORY CELEBRATION (KIBO HIGH-FIVE & CHEERING!) */}
      {solvedInfo && isBossLevel && level.boss && (
        <KiboBossCelebration
          boss={level.boss}
          chapterId={level.chapterId}
          stars={solvedInfo.stars}
          totalMoves={totalMoves}
          displayResult={solvedInfo.displayResult}
          hasNextLevel={hasNextLevel}
          onNextLevel={onNextLevel}
          onReplay={handleReset}
          onExit={onExit}
        />
      )}

      {/* REGULAR STAGE VICTORY MODAL */}
      {solvedInfo && !isBossLevel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#061510]/80 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-heading"
        >
          <div className="w-full max-w-md rounded-3xl game-panel border-2 border-[#5EEAD4]/60 p-6 sm:p-7 text-center text-white animate-pop-in">
            <div className="flex flex-col items-center">
              <div className="mb-3">
                <KiboAvatar size="lg" animate />
              </div>

              <div className="flex items-center gap-2 mb-2" aria-label={`${solvedInfo.stars} dari 3 bintang`}>
                {[1, 2, 3].map((n) => (
                  <Star
                    key={n}
                    className={`w-8 h-8 ${
                      n <= solvedInfo.stars
                        ? 'text-[#FBBF24] fill-[#FBBF24]'
                        : 'text-[#315549] fill-[#17352B]'
                    }`}
                  />
                ))}
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5EEAD4]">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>Stage Tuntas · {totalMoves} langkah</span>
              </div>

              <h2
                id="victory-heading"
                className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-white"
              >
                {pureSymbolsMode ? 'Peti Pusaka Sendirian!' : 'Hebat! x Ditemukan!'}
              </h2>

              <div className="mt-4 w-full rounded-2xl bg-[#0C231C] border border-[#2D5E4E] py-3.5 px-5">
                <div className="font-mono font-extrabold text-2xl sm:text-3xl text-[#FDE68A] tabular-nums">
                  {solvedInfo.displayResult}
                </div>
                <p className="mt-1 text-xs text-[#9EC2B5]">
                  Awal:{' '}
                  <span className="font-mono font-semibold text-white">
                    {formatEquation(level.initial, pureSymbolsMode)}
                  </span>
                </p>
              </div>

              <div className="mt-6 w-full flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="game-btn-wood flex-1 min-h-[48px] px-4 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer"
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
