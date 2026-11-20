import React from 'react';
import { SYMBOL_NAMES } from '../game/algebraEngine';
import { EquationState, Side, SymbolFamily, Term, VisualStyle } from '../game/types';

export type DragKind = 'term' | 'coeff' | 'denom';

interface AlgebraTileProps {
  term: Term;
  side: Side;
  isFirstOnSide: boolean;
  isSoloOnSide: boolean;
  visualStyle: VisualStyle;
  isSelected: boolean;
  isHinted: boolean;
  isCombineTarget: boolean;
  isDraggingThis: boolean;
  onPointerStart: (e: React.PointerEvent, term: Term, side: Side, dragKind: DragKind) => void;
  onTap: (term: Term, side: Side) => void;
}

export const SunCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="2.1" />
    <path
      d="M12 2.2v2.6M12 19.2v2.6M2.2 12h2.6M19.2 12h2.6M5.1 5.1l1.9 1.9M17 17l1.9 1.9M18.9 5.1L17 7M7 17l-1.9 1.9"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
  </svg>
);

export const MoonCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M19.2 14.6A7.6 7.6 0 0 1 9.4 4.8a7.6 7.6 0 1 0 9.8 9.8Z"
      fill="currentColor"
      fillOpacity="0.26"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ShellCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3.8C6.6 3.8 3.3 7.9 4.1 13.2L7 19.2h10l2.9-6C20.7 7.9 17.4 3.8 12 3.8Z"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M12 3.8v15.4M8 5.2L9.8 19.2M16 5.2L14.2 19.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.85"
    />
  </svg>
);

export const LeafCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M19.6 4.4C12.4 4.4 5.8 8.5 4.8 18.6c4.6 1 11.8-.5 14.8-14.2Z"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M4.8 18.6L14.2 9.8"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
  </svg>
);

export const TreasureChestIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
    <rect
      x="3"
      y="7.5"
      width="22"
      height="15.5"
      rx="3.5"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="2.1"
    />
    <path d="M3 13.5h22" stroke="currentColor" strokeWidth="2.1" />
    <rect x="11.5" y="11" width="5" height="5.8" rx="1.2" fill="currentColor" />
    <path d="M7.5 7.5V5.8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1.7" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const OpenedChestIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
    {/* Raised Open Lid tilted back */}
    <path
      d="M4.5 11.5 L6.2 4.5 C6.6 3.3 7.8 2.8 9 2.8 H19 C20.2 2.8 21.4 3.3 21.8 4.5 L23.5 11.5 Z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Open dark hollow interior */}
    <path
      d="M4.5 11.5 H23.5 L22.2 14.2 H5.8 Z"
      fill="currentColor"
      fillOpacity="0.45"
    />
    {/* Chest base */}
    <rect
      x="3.5"
      y="13.2"
      width="21"
      height="11.5"
      rx="3"
      fill="currentColor"
      fillOpacity="0.24"
      stroke="currentColor"
      strokeWidth="2.1"
    />
    {/* Open latch */}
    <rect x="12" y="12.5" width="4" height="4.2" rx="1" fill="currentColor" />
  </svg>
);

export const PusakaHexIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <polygon
      points="12,2.5 20.2,7.25 20.2,16.75 12,21.5 3.8,16.75 3.8,7.25"
      fill="currentColor"
      fillOpacity="0.18"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <polygon
      points="12,6.5 16.8,9.25 16.8,14.75 12,17.5 7.2,14.75 7.2,9.25"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeOpacity="0.65"
      strokeLinejoin="round"
    />
  </svg>
);

export function renderFamilyGlyph(family: SymbolFamily, sign: 1 | -1, sizeClass = 'w-11 h-11 sm:w-12 sm:h-12') {
  if (family === 'sun') {
    return sign > 0 ? (
      <SunCarving className={`${sizeClass} text-[#FEF3C7]`} />
    ) : (
      <MoonCarving className={`${sizeClass} text-[#FEE2E2]`} />
    );
  }
  if (family === 'shell') {
    return (
      <ShellCarving
        className={`${sizeClass} ${
          sign > 0 ? 'text-[#CCFBF1]' : 'text-[#FEE2E2] rotate-180'
        }`}
      />
    );
  }
  return (
    <LeafCarving
      className={`${sizeClass} ${
        sign > 0 ? 'text-[#D1FAE5]' : 'text-[#FEE2E2] -scale-x-100'
      }`}
    />
  );
}

/**
 * Pure visual square/box card representation used for:
 * - Floating Drag Ghost (stays a real square card with symbols!)
 * - Parabolic 3D-Flipping Transposition Animation (stays a real square card with symbols!)
 */
export const TileCardFace: React.FC<{
  term: Term;
  visualStyle: VisualStyle;
  side?: Side;
  glowGold?: boolean;
  className?: string;
}> = ({ term, visualStyle, side, glowGold = false, className = '' }) => {
  const showStones = visualStyle === 'stones';
  const pureSymbols = visualStyle === 'pure_symbols';
  const glowClass = glowGold ? 'ring-2 ring-[#FEF08A]' : 'shadow-md';

  // 0. PURE SYMBOL CARD (BAB 0)
  if (term.kind === 'sym') {
    const isPos = term.sign > 0;
    const posBg =
      term.family === 'sun'
        ? 'bg-[#0F766E] border-[#5EEAD4]/75'
        : term.family === 'shell'
          ? 'bg-[#0369A1] border-[#7DD3FC]/75'
          : 'bg-[#15803D] border-[#86EFAC]/75';

    return (
      <div
        className={`relative select-none rounded-2xl w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] p-2.5 flex flex-col items-center justify-center ${
          isPos
            ? `${posBg} text-white tile-shadow-pos border-2`
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/75'
        } ${glowClass} ${className}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/20" />
        {!isPos && (
          <span className="absolute top-1.5 right-2 font-display font-extrabold text-sm leading-none text-[#FECACA]">
            −
          </span>
        )}
        {renderFamilyGlyph(term.family, term.sign)}
      </div>
    );
  }

  // 1. CONSTANT CARD
  if (term.kind === 'const') {
    const isPositive = term.value > 0;
    const absVal = Math.abs(term.value);
    const signSymbol = isPositive ? '+' : '−';

    return (
      <div
        className={`relative select-none rounded-2xl min-w-[80px] min-h-[80px] sm:min-w-[88px] sm:min-h-[88px] px-3.5 py-2.5 flex flex-col items-center justify-center ${
          isPositive
            ? 'bg-[#0F766E] text-white tile-shadow-pos border-2 border-[#5EEAD4]/60'
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/70'
        } ${glowClass} ${className}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/15" />
        {showStones && (
          <div className="mb-0.5 opacity-95">
            {isPositive ? (
              <SunCarving className="w-4 h-4 text-[#FEF08A]" />
            ) : (
              <MoonCarving className="w-4 h-4 text-[#FECACA]" />
            )}
          </div>
        )}
        <div className="flex items-baseline gap-0.5 font-display font-extrabold text-2xl sm:text-3xl leading-none tracking-tight tabular-nums">
          <span className="text-lg sm:text-xl font-bold opacity-90">{signSymbol}</span>
          <span>{absVal}</span>
        </div>
        {showStones && (
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide opacity-85">
            {isPositive ? 'Surya' : 'Bulan'}
          </span>
        )}
      </div>
    );
  }

  // 2. VARIABLE / PETI PUSAKA CARD
  if (term.kind === 'var') {
    const isNeg = term.coeff < 0;
    const absCoeff = Math.abs(term.coeff);
    const hasCoeff = absCoeff > 1;
    const hasDenom = term.denom > 1;

    if (pureSymbols && Math.abs(term.coeff) === 1 && term.denom === 1) {
      const isOpened = side ? side === 'right' : term.coeff < 0;
      return (
        <div
          className={`relative select-none rounded-2xl w-[86px] h-[86px] sm:w-[94px] sm:h-[94px] p-2.5 flex flex-col items-center justify-center text-white ${
            isNeg
              ? 'bg-[#B91C1C] tile-shadow-neg border-2 border-dashed border-white/75'
              : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] tile-shadow-var border-2 border-[#FEF3C7]'
          } ${glowClass} ${className}`}
        >
          <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#FEF3C7]/35" />
          {isNeg && (
            <span className="absolute top-1.5 right-2 font-display font-extrabold text-sm leading-none text-[#FECACA]">
              −
            </span>
          )}
          {isOpened ? (
            <OpenedChestIcon className={`w-11 h-11 sm:w-12 sm:h-12 ${isNeg ? 'text-[#FEE2E2]' : 'text-[#FFFBEB]'}`} />
          ) : (
            <TreasureChestIcon className={`w-11 h-11 sm:w-12 sm:h-12 ${isNeg ? 'text-[#FEE2E2]' : 'text-[#FFFBEB]'}`} />
          )}
        </div>
      );
    }

    return (
      <div
        className={`relative select-none rounded-2xl min-w-[84px] min-h-[80px] sm:min-w-[94px] sm:min-h-[88px] px-3.5 py-2.5 flex flex-col items-center justify-center bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white tile-shadow-var ${
          isNeg ? 'border-2 border-dashed border-[#FEE2E2]' : 'border-2 border-[#FEF3C7]/85'
        } ${glowClass} ${className}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#FEF3C7]/25" />
        {showStones && !hasCoeff && !hasDenom && (
          <PusakaHexIcon className="w-4 h-4 text-[#FEF3C7] mb-0.5" />
        )}
        <div className="flex items-center justify-center gap-1">
          {isNeg && !hasCoeff && (
            <span className="font-display font-extrabold text-xl sm:text-2xl text-[#FEF2F2]">
              −
            </span>
          )}
          {hasCoeff && (
            <span className="inline-flex items-center justify-center rounded-lg px-2 py-0.5 font-display font-extrabold text-xl sm:text-2xl tabular-nums leading-tight bg-[#78350F] text-[#FEF3C7] border border-[#FCD34D]">
              {isNeg ? `−${absCoeff}` : absCoeff}
            </span>
          )}
          <span className="font-display font-extrabold italic text-3xl sm:text-4xl leading-none tracking-tight">
            x
          </span>
        </div>
        {hasDenom && (
          <div className="w-full mt-1.5 pt-1 border-t-2 border-white/80 flex justify-center">
            <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 font-mono font-bold text-sm sm:text-base tabular-nums bg-[#78350F] text-[#FEF3C7] border border-[#FCD34D]">
              ÷{term.denom}
            </span>
          </div>
        )}
        {showStones && !hasDenom && (
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-[#FEF3C7]">
            Pusaka
          </span>
        )}
      </div>
    );
  }

  // 3. GROUP CARD
  const xLabel =
    term.innerVar === 1 ? 'x' : term.innerVar === -1 ? '−x' : `${term.innerVar}x`;
  const cLabel =
    term.innerConst === 0
      ? ''
      : term.innerConst > 0
        ? ` + ${term.innerConst}`
        : ` − ${Math.abs(term.innerConst)}`;

  return (
    <div
      className={`relative select-none rounded-2xl min-h-[80px] sm:min-h-[88px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 bg-[#1E3A5F] text-white tile-shadow-group border-2 border-[#93C5FD]/60 ${glowClass} ${className}`}
    >
      <span className="inline-flex items-center justify-center rounded-lg px-2 py-1 font-display font-extrabold text-xl sm:text-2xl tabular-nums bg-[#D97706] text-white border border-[#FDE68A]">
        {term.factor < 0 ? `−${Math.abs(term.factor)}` : term.factor}
      </span>
      <div className="rounded-xl bg-white/12 px-2.5 py-1.5 font-display font-bold text-xl sm:text-2xl tracking-tight">
        (<span className="italic text-[#FDE68A]">{xLabel}</span>
        <span>{cLabel}</span>)
      </div>
    </div>
  );
};

/**
 * Square/box 3D card for dragging or flying a multiplier (×) or divisor (÷) across =.
 */
export const OperatorCardFace: React.FC<{
  opSymbol: '×' | '÷';
  valueLabel: string;
  tone: 'gold' | 'teal';
  glowGold?: boolean;
}> = ({ opSymbol, valueLabel, tone, glowGold = false }) => {
  const isGold = tone === 'gold';
  return (
    <div
      className={`relative select-none rounded-2xl min-w-[82px] min-h-[82px] sm:min-w-[88px] sm:min-h-[88px] px-3 py-2 flex flex-col items-center justify-center text-white border-2 ${
        isGold
          ? 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] tile-shadow-var border-[#FEF3C7]'
          : 'bg-[#0F766E] tile-shadow-pos border-[#5EEAD4]'
      } ${glowGold ? 'ring-2 ring-[#FEF08A]' : 'shadow-md'}`}
    >
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/20" />
      <div className="font-display font-extrabold text-2xl sm:text-3xl leading-none tabular-nums whitespace-nowrap">
        <span>{opSymbol}</span>
        <span>{valueLabel}</span>
      </div>
      <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider opacity-90">
        {opSymbol === '×' ? 'Kali' : 'Bagi'}
      </span>
    </div>
  );
};

/**
 * Compact square symbol chip for scoreboard, bridge flash, history log, selected strip, and victory modal.
 * Keeps symbols as real visual icon cards instead of plain text!
 */
export const InlineTermChip: React.FC<{
  term: Term;
  pureSymbols?: boolean;
  side?: Side;
  size?: 'xs' | 'sm' | 'md';
}> = ({ term, pureSymbols = true, side, size = 'sm' }) => {
  const boxCls =
    size === 'xs'
      ? 'w-6 h-6 rounded-md'
      : size === 'md'
        ? 'w-9 h-9 rounded-xl'
        : 'w-7 h-7 rounded-lg';
  const iconCls =
    size === 'xs' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-4.5 h-4.5';

  if (term.kind === 'sym') {
    const isPos = term.sign > 0;
    const posBg =
      term.family === 'sun'
        ? 'bg-[#0F766E] border-[#5EEAD4]/60'
        : term.family === 'shell'
          ? 'bg-[#0369A1] border-[#7DD3FC]/60'
          : 'bg-[#15803D] border-[#86EFAC]/60';
    const info = SYMBOL_NAMES[term.family];

    return (
      <span
        title={isPos ? info.pos : info.neg}
        aria-label={isPos ? info.pos : info.neg}
        className={`relative inline-flex items-center justify-center shrink-0 align-middle text-white shadow-xs ${boxCls} ${
          isPos
            ? `${posBg} border`
            : 'bg-[#B91C1C] border border-dashed border-white/75'
        }`}
      >
        {renderFamilyGlyph(term.family, term.sign, iconCls)}
        {!isPos && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7F1D1D] border border-white/80 text-[8px] font-extrabold leading-none flex items-center justify-center text-white">
            −
          </span>
        )}
      </span>
    );
  }

  if (term.kind === 'var' && pureSymbols && Math.abs(term.coeff) === 1 && term.denom === 1) {
    const isOpened = side ? side === 'right' : term.coeff < 0;
    const isNeg = term.coeff < 0;
    return (
      <span
        title={isOpened ? 'Peti Terbuka' : 'Peti Pusaka'}
        aria-label={isOpened ? 'Peti Terbuka' : 'Peti Pusaka'}
        className={`relative inline-flex items-center justify-center shrink-0 align-middle shadow-xs ${boxCls} ${
          isNeg
            ? 'bg-[#B91C1C] border border-dashed border-white/75 text-[#FEE2E2]'
            : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] border border-[#FEF3C7] text-[#FFFBEB]'
        }`}
      >
        {isOpened ? (
          <OpenedChestIcon className={iconCls} />
        ) : (
          <TreasureChestIcon className={iconCls} />
        )}
        {isNeg && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7F1D1D] border border-white/80 text-[8px] font-extrabold leading-none flex items-center justify-center text-white">
            −
          </span>
        )}
      </span>
    );
  }

  if (term.kind === 'const') {
    const isPos = term.value > 0;
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 align-middle px-1.5 font-mono font-extrabold text-xs text-white shadow-xs ${
          size === 'xs' ? 'h-6 rounded-md text-[11px]' : size === 'md' ? 'h-9 px-2.5 rounded-xl text-sm' : 'h-7 rounded-lg text-xs'
        } ${isPos ? 'bg-[#0F766E]' : 'bg-[#B91C1C] border border-dashed border-white/70'}`}
      >
        {isPos ? `+${term.value}` : `−${Math.abs(term.value)}`}
      </span>
    );
  }

  if (term.kind === 'var') {
    const absC = Math.abs(term.coeff);
    const cStr = absC === 1 ? '' : `${absC}`;
    const sign = term.coeff < 0 ? '−' : '';
    const txt = term.denom > 1 ? `${sign}${cStr}x/${term.denom}` : `${sign}${cStr}x`;
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 align-middle px-1.5 font-mono font-extrabold text-white bg-[#D97706] shadow-xs ${
          size === 'xs' ? 'h-6 rounded-md text-[11px]' : size === 'md' ? 'h-9 px-2.5 rounded-xl text-sm' : 'h-7 rounded-lg text-xs'
        }`}
      >
        {txt}
      </span>
    );
  }

  return null;
};

/**
 * Renders a full Bab 0 pure-symbol equation as inline visual symbol cards:
 * [Chest] [Sun]  =  [Shell] [Sun]
 */
export const InlineEquationVisual: React.FC<{
  state: EquationState;
  size?: 'xs' | 'sm' | 'md';
}> = ({ state, size = 'sm' }) => {
  const eqSize =
    size === 'xs'
      ? 'w-5 h-5 text-xs rounded-md'
      : size === 'md'
        ? 'w-8 h-8 text-lg rounded-xl'
        : 'w-6 h-6 text-sm rounded-lg';

  const renderSide = (terms: Term[], side: Side) => {
    if (terms.length === 0) {
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg border border-dashed border-[#7DD3FC] text-[11px] font-bold text-[#0369A1]">
          Kosong
        </span>
      );
    }
    return terms.map((t) => (
      <InlineTermChip key={t.id} term={t} pureSymbols side={side} size={size} />
    ));
  };

  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-1.5 align-middle">
      <span className="inline-flex flex-wrap items-center gap-1">{renderSide(state.left, 'left')}</span>
      <span
        className={`inline-flex items-center justify-center font-display font-extrabold bg-gradient-to-b from-[#FDE047] to-[#F59E0B] text-[#291802] border border-[#FEF9C3] shadow-xs shrink-0 ${eqSize}`}
      >
        =
      </span>
      <span className="inline-flex flex-wrap items-center gap-1">{renderSide(state.right, 'right')}</span>
    </span>
  );
};

export const AlgebraTile: React.FC<AlgebraTileProps> = React.memo(({
  term,
  side,
  isSoloOnSide,
  visualStyle,
  isSelected,
  isHinted,
  isCombineTarget,
  isDraggingThis,
  onPointerStart,
  onTap,
}) => {
  const showStones = visualStyle === 'stones';
  const pureSymbols = visualStyle === 'pure_symbols';

  const selectionClass = isSelected
    ? 'ring-3 ring-[#F59E0B] ring-offset-2 ring-offset-[#EBF9FF] -translate-y-1.5 scale-[1.04] rotate-[-1.5deg]'
    : isCombineTarget
      ? 'ring-3 ring-[#14B8A6] ring-offset-2 ring-offset-[#EBF9FF] scale-[1.07]'
      : isHinted
        ? 'animate-hint-ring'
        : 'hover:-translate-y-0.5';

  const opacityClass = isDraggingThis ? 'opacity-25 scale-95' : 'opacity-100';

  // 0. PURE SYMBOL TERM (BAB 0) — pure square symbol card with crisp SVG icon!
  if (term.kind === 'sym') {
    const isPos = term.sign > 0;
    const info = SYMBOL_NAMES[term.family];
    const posBg =
      term.family === 'sun'
        ? 'bg-[#0F766E] border-[#5EEAD4]/65'
        : term.family === 'shell'
          ? 'bg-[#0369A1] border-[#7DD3FC]/65'
          : 'bg-[#15803D] border-[#86EFAC]/65';

    return (
      <div
        data-term-id={term.id}
        data-side={side}
        role="button"
        tabIndex={0}
        title={isPos ? info.pos : info.neg}
        aria-label={`${isPos ? info.pos : info.neg} di ruas ${side === 'left' ? 'kiri' : 'kanan'}`}
        onPointerDown={(e) => onPointerStart(e, term, side, 'term')}
        onClick={(e) => {
          e.stopPropagation();
          onTap(term, side);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTap(term, side);
          }
        }}
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] p-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in ${
          isPos
            ? `${posBg} text-white tile-shadow-pos border-2`
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/70'
        } ${selectionClass} ${opacityClass}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/20" />
        {!isPos && (
          <span className="absolute top-1.5 right-2 font-display font-extrabold text-sm leading-none text-[#FECACA]">
            −
          </span>
        )}
        {renderFamilyGlyph(term.family, term.sign)}
      </div>
    );
  }

  // 1. CONSTANT TERM
  if (term.kind === 'const') {
    const isPositive = term.value > 0;
    const absVal = Math.abs(term.value);
    const signSymbol = isPositive ? '+' : '−';

    return (
      <div
        data-term-id={term.id}
        data-side={side}
        role="button"
        tabIndex={0}
        aria-label={`Angka ${isPositive ? 'positif' : 'negatif'} ${absVal} di ruas ${side === 'left' ? 'kiri' : 'kanan'}`}
        onPointerDown={(e) => onPointerStart(e, term, side, 'term')}
        onClick={(e) => {
          e.stopPropagation();
          onTap(term, side);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTap(term, side);
          }
        }}
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[80px] min-h-[80px] sm:min-w-[88px] sm:min-h-[88px] px-3.5 py-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in ${
          isPositive
            ? 'bg-[#0F766E] text-white tile-shadow-pos border-2 border-[#5EEAD4]/55'
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/65'
        } ${selectionClass} ${opacityClass}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-white/15" />
        {showStones && (
          <div className="mb-0.5 opacity-95">
            {isPositive ? (
              <SunCarving className="w-4 h-4 text-[#FEF08A]" />
            ) : (
              <MoonCarving className="w-4 h-4 text-[#FECACA]" />
            )}
          </div>
        )}
        <div className="flex items-baseline gap-0.5 font-display font-extrabold text-2xl sm:text-3xl leading-none tracking-tight tabular-nums">
          <span className="text-lg sm:text-xl font-bold opacity-90">{signSymbol}</span>
          <span>{absVal}</span>
        </div>
        {showStones && (
          <span className="mt-1 text-[10px] font-semibold tracking-wide opacity-85">
            {isPositive ? 'Surya' : 'Bulan'}
          </span>
        )}
      </div>
    );
  }

  // 2. VARIABLE TERM
  if (term.kind === 'var') {
    const isNeg = term.coeff < 0;
    const absCoeff = Math.abs(term.coeff);
    const hasCoeff = absCoeff > 1;
    const hasDenom = term.denom > 1;
    const canDragCoeff = isSoloOnSide && hasCoeff;
    const canDragDenom = isSoloOnSide && hasDenom;

    if (pureSymbols && Math.abs(term.coeff) === 1 && term.denom === 1) {
      const isOpened = side === 'right';
      return (
        <div
          data-term-id={term.id}
          data-side={side}
          role="button"
          tabIndex={0}
          title={isOpened ? 'Peti Terbuka (Ruas Kanan)' : 'Peti Pusaka (Ruas Kiri)'}
          aria-label={`${isOpened ? 'Peti Terbuka' : 'Peti Pusaka'} di ruas ${side === 'left' ? 'kiri' : 'kanan'}`}
          onPointerDown={(e) => onPointerStart(e, term, side, 'term')}
          onClick={(e) => {
            e.stopPropagation();
            onTap(term, side);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTap(term, side);
            }
          }}
          className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl w-[86px] h-[86px] sm:w-[94px] sm:h-[94px] p-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in text-white ${
            isNeg
              ? 'bg-[#B91C1C] tile-shadow-neg border-2 border-dashed border-white/70'
              : 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] tile-shadow-var border-2 border-[#FEF3C7]'
          } ${selectionClass} ${opacityClass}`}
        >
          <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#FEF3C7]/35" />
          {isNeg && (
            <span className="absolute top-1.5 right-2 font-display font-extrabold text-sm leading-none text-[#FECACA]">
              −
            </span>
          )}
          {isOpened ? (
            <OpenedChestIcon className={`w-11 h-11 sm:w-12 sm:h-12 ${isNeg ? 'text-[#FEE2E2]' : 'text-[#FFFBEB]'}`} />
          ) : (
            <TreasureChestIcon className={`w-11 h-11 sm:w-12 sm:h-12 ${isNeg ? 'text-[#FEE2E2]' : 'text-[#FFFBEB]'}`} />
          )}
        </div>
      );
    }

    return (
      <div
        data-term-id={term.id}
        data-side={side}
        role="button"
        tabIndex={0}
        aria-label={`Variabel ${term.coeff === 1 ? 'x' : term.coeff === -1 ? 'negatif x' : `${term.coeff}x`}${hasDenom ? ` per ${term.denom}` : ''} di ruas ${side === 'left' ? 'kiri' : 'kanan'}`}
        onPointerDown={(e) => onPointerStart(e, term, side, 'term')}
        onClick={(e) => {
          e.stopPropagation();
          onTap(term, side);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTap(term, side);
          }
        }}
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[84px] sm:min-w-[94px] min-h-[80px] sm:min-h-[88px] px-3.5 py-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white tile-shadow-var ${
          isNeg ? 'border-2 border-dashed border-[#FEE2E2]' : 'border-2 border-[#FEF3C7]/80'
        } ${selectionClass} ${opacityClass}`}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-[#FEF3C7]/20" />
        {showStones && !hasCoeff && !hasDenom && (
          <PusakaHexIcon className="w-4 h-4 text-[#FEF3C7] mb-0.5" />
        )}

        <div className="flex items-center justify-center gap-1">
          {isNeg && !hasCoeff && (
            <span className="font-display font-extrabold text-xl sm:text-2xl text-[#FEF2F2]">
              −
            </span>
          )}

          {hasCoeff && (
            <div
              onPointerDown={(e) => {
                if (canDragCoeff) {
                  e.stopPropagation();
                  onPointerStart(e, term, side, 'coeff');
                }
              }}
              title={canDragCoeff ? 'Tarik pengali ini menyeberangi =' : undefined}
              className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 font-display font-extrabold text-xl sm:text-2xl tabular-nums leading-tight ${
                canDragCoeff
                  ? 'bg-[#78350F] text-[#FEF3C7] border border-[#FCD34D] shadow-sm cursor-grab hover:bg-[#92400E]'
                  : 'bg-[#92400E]/60 text-white'
              }`}
            >
              {isNeg ? `−${absCoeff}` : absCoeff}
              {canDragCoeff && <span className="text-xs ml-0.5 opacity-80">×</span>}
            </div>
          )}

          <span className="font-display font-extrabold italic text-3xl sm:text-4xl leading-none tracking-tight">
            x
          </span>
        </div>

        {hasDenom && (
          <div className="w-full mt-1.5 pt-1 border-t-2 border-white/80 flex justify-center">
            <div
              onPointerDown={(e) => {
                if (canDragDenom) {
                  e.stopPropagation();
                  onPointerStart(e, term, side, 'denom');
                }
              }}
              title={canDragDenom ? 'Tarik pembagi ini menyeberangi =' : undefined}
              className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 font-mono font-bold text-sm sm:text-base tabular-nums ${
                canDragDenom
                  ? 'bg-[#78350F] text-[#FEF3C7] border border-[#FCD34D] cursor-grab hover:bg-[#92400E]'
                  : 'bg-[#92400E]/55 text-white'
              }`}
            >
              ÷{term.denom}
            </div>
          </div>
        )}

        {showStones && !hasDenom && (
          <span className="mt-1 text-[10px] font-semibold tracking-wide text-[#FEF3C7]">
            Pusaka
          </span>
        )}
      </div>
    );
  }

  // 3. GROUP / PARENTHESES TERM
  const canDragFactor = isSoloOnSide && Math.abs(term.factor) > 1;
  const xLabel =
    term.innerVar === 1 ? 'x' : term.innerVar === -1 ? '−x' : `${term.innerVar}x`;
  const cLabel =
    term.innerConst === 0
      ? ''
      : term.innerConst > 0
        ? ` + ${term.innerConst}`
        : ` − ${Math.abs(term.innerConst)}`;

  return (
    <div
      data-term-id={term.id}
      data-side={side}
      role="button"
      tabIndex={0}
      aria-label={`Kurung ${term.factor} kali ${xLabel}${cLabel}`}
      onClick={(e) => {
        e.stopPropagation();
        onTap(term, side);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap(term, side);
        }
      }}
      className={`relative select-none touch-none cursor-pointer rounded-2xl min-h-[80px] sm:min-h-[88px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 transition-transform duration-150 animate-pop-in bg-[#1E3A5F] text-white tile-shadow-group border-2 border-[#93C5FD]/55 ${selectionClass} ${opacityClass}`}
    >
      <div
        onPointerDown={(e) => {
          if (canDragFactor) {
            e.stopPropagation();
            onPointerStart(e, term, side, 'coeff');
          }
        }}
        className={`inline-flex items-center justify-center rounded-lg px-2 py-1 font-display font-extrabold text-xl sm:text-2xl tabular-nums ${
          canDragFactor
            ? 'bg-[#D97706] text-white border border-[#FDE68A] cursor-grab'
            : 'bg-white/15 text-white'
        }`}
      >
        {term.factor < 0 ? `−${Math.abs(term.factor)}` : term.factor}
        {canDragFactor && <span className="text-xs ml-0.5">×</span>}
      </div>
      <div className="rounded-xl bg-white/12 px-2.5 py-1.5 font-display font-bold text-xl sm:text-2xl tracking-tight">
        (<span className="italic text-[#FDE68A]">{xLabel}</span>
        <span>{cLabel}</span>)
      </div>
    </div>
  );
});

AlgebraTile.displayName = 'AlgebraTile';
