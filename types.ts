export type Side = 'left' | 'right';

export type VisualStyle = 'pure_symbols' | 'stones' | 'symbols';

export type SymbolFamily = 'sun' | 'shell' | 'leaf';

export type Term =
  | {
      id: string;
      kind: 'const';
      value: number; // non-zero integer
    }
  | {
      id: string;
      kind: 'var';
      coeff: number; // non-zero integer
      denom: number; // positive integer >= 1
    }
  | {
      id: string;
      kind: 'group';
      factor: number; // non-zero integer (|factor| >= 2 or -1)
      innerVar: number; // coeff of x inside parentheses
      innerConst: number; // constant inside parentheses
    }
  | {
      id: string;
      kind: 'sym';
      family: SymbolFamily;
      sign: 1 | -1; // 1 = Asli, -1 = Lawan
    };

export interface EquationState {
  left: Term[];
  right: Term[];
}

export interface HistoryStep {
  equationText: string;
  ruleLabel: string;
  explanation: string;
  stateSnapshot?: EquationState;
}

export interface MoveResult {
  ok: boolean;
  nextState?: EquationState;
  ruleLabel?: string;
  explanation?: string;
  cancelledToZero?: boolean;
  cancelledSide?: Side;
  errorMessage?: string;
}

export interface SmartHint {
  message: string;
  highlightIds: string[];
  actionType: 'transpose' | 'combine' | 'coeff' | 'denom' | 'expand' | 'flip';
}

export interface TutorialStep {
  mood: 'wave' | 'point' | 'cheer';
  title: string;
  message: string;
  highlightIds?: string[];
  buttonLabel?: string;
}

export interface BossPhase {
  label: string;
  tip: string;
  initial: EquationState;
}

export type BossGimmick =
  | 'normal'
  | 'speed_enrage'
  | 'many_numbers'
  | 'freeze_penalty'
  | 'heal_once'
  | 'cosmic_many_hp';

export interface KiboBossDialogues {
  intro: string;
  tapLines: string[];
  gimmickAlert: string;
  hitCheer: string;
  lowTimeAlert: string;
  lowTimeCritical: string;
  lowTimeTapLines: string[];
  victoryPreTos: string;
  victoryPostTos: string;
  defeatEncourage: string;
}

export interface BossConfig {
  name: string;
  role: string;
  personality: string;
  gimmick: BossGimmick;
  gimmickLabel: string;
  gimmickDesc: string;
  timeLimitSeconds: number;
  maxMistakes?: number;
  penaltySeconds?: number;
  healLine?: string;
  enrageGimmickLine?: string;
  artwork: string;
  introLine: string;
  tauntLines: string[];
  hitLines: string[];
  defeatLine: string;
  timeoutLine: string;
  kiboLines: KiboBossDialogues;
  phases: BossPhase[];
}

export interface LevelDef {
  id: string;
  chapterId: number;
  levelNumber: number;
  title: string;
  tip: string;
  defaultVisual: VisualStyle;
  parMoves: number;
  solution?: number;
  initial: EquationState;
  isPractice?: boolean;
  isBoss?: boolean;
  boss?: BossConfig;
  tutorialSteps?: TutorialStep[];
}

export interface ChapterDef {
  id: number;
  title: string;
  subtitle: string;
  focusRule: string;
  artwork?: string;
  levels: LevelDef[];
}

export interface LevelProgress {
  stars: number; // 1..3
  bestMoves: number;
}

export interface PlayerStats {
  flawlessStageIds: string[]; // Stage IDs completed with zero errors/mistakes/undo
  retryCount: number; // Total stage retries / replays
  totalTransposes: number; // Total pindah ruas across '='
  noHintBossWins: number; // Bosses defeated without using Bantuan
}

export interface ProgressStore {
  completed: Record<string, LevelProgress>;
  practiceSolved: number;
  soundEnabled: boolean;
  musicVolume: number; // 0.15 .. 1.0 (cannot be disabled)
  sfxVolume: number; // 0 .. 1.0
  stats: PlayerStats;
}
