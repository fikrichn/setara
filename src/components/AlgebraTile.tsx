import React from 'react';
import { SYMBOL_NAMES } from '../game/algebraEngine';
import { Side, SymbolFamily, Term, VisualStyle } from '../game/types';

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

const SunCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const MoonCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShellCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 4C6.8 4 3.5 8 4.2 13.2L7 19h10l2.8-5.8C20.5 8 17.2 4 12 4Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinejoin="round"
    />
    <path
      d="M12 4v15M8 5.2L9.8 19M16 5.2L14.2 19"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeOpacity="0.8"
    />
  </svg>
);

const LeafCarving: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M19.5 4.5C12.5 4.5 6 8.5 5 18.5c4.5 1 11.5-.5 14.5-14Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M5 18.5L14 10"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const TreasureChestIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
    <rect
      x="3"
      y="7"
      width="22"
      height="16"
      rx="3.5"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="2.1"
    />
    <path d="M3 13h22" stroke="currentColor" strokeWidth="2.1" />
    <rect x="11.5" y="11" width="5" height="5.5" rx="1.2" fill="currentColor" />
    <path d="M7.5 7V5.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2V7" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const PusakaHexIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <polygon
      points="12,2.5 20.2,7.25 20.2,16.75 12,21.5 3.8,16.75 3.8,7.25"
      stroke="currentColor"
      strokeWidth="1.8"
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

function renderFamilyGlyph(family: SymbolFamily, sign: 1 | -1) {
  const cls = 'w-7 h-7 sm:w-8 sm:h-8';
  if (family === 'sun') {
    return sign > 0 ? (
      <SunCarving className={`${cls} text-[#FEF3C7]`} />
    ) : (
      <MoonCarving className={`${cls} text-[#FECACA]`} />
    );
  }
  if (family === 'shell') {
    return (
      <ShellCarving
        className={`${cls} ${sign > 0 ? 'text-[#CCFBF1]' : 'text-[#FECACA] rotate-180'}`}
      />
    );
  }
  return (
    <LeafCarving
      className={`${cls} ${sign > 0 ? 'text-[#D1FAE5]' : 'text-[#FECACA] -scale-x-100'}`}
    />
  );
}

export const AlgebraTile: React.FC<AlgebraTileProps> = ({
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
    ? 'ring-3 ring-[#FDE68A] ring-offset-2 ring-offset-[#15392E] -translate-y-1'
    : isCombineTarget
      ? 'ring-3 ring-[#5EEAD4] ring-offset-2 ring-offset-[#15392E] scale-[1.07]'
      : isHinted
        ? 'animate-hint-ring'
        : 'hover:-translate-y-0.5';

  const opacityClass = isDraggingThis ? 'opacity-25 scale-95' : 'opacity-100';

  // 0. PURE SYMBOL TERM (BAB 0)
  if (term.kind === 'sym') {
    const isPos = term.sign > 0;
    const info = SYMBOL_NAMES[term.family];
    const posBg =
      term.family === 'sun'
        ? 'bg-[#0F766E] border-[#2DD4BF]/50'
        : term.family === 'shell'
          ? 'bg-[#0369A1] border-[#7DD3FC]/50'
          : 'bg-[#15803D] border-[#86EFAC]/50';

    return (
      <div
        data-term-id={term.id}
        data-side={side}
        role="button"
        tabIndex={0}
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
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[82px] sm:min-w-[96px] min-h-[82px] sm:min-h-[92px] px-3 py-2.5 flex flex-col items-center justify-center gap-1 transition-transform duration-150 animate-pop-in ${
          isPos
            ? `${posBg} text-white tile-shadow-pos border`
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/55'
        } ${selectionClass} ${opacityClass}`}
      >
        {!isPos && (
          <span className="absolute top-1.5 right-2 font-display font-extrabold text-xs leading-none text-[#FECACA]">
            −
          </span>
        )}
        {renderFamilyGlyph(term.family, term.sign)}
        <span className="text-[11px] font-bold tracking-tight leading-none text-center">
          {isPos ? info.pos : `Lawan ${info.pos}`}
        </span>
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
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[76px] sm:min-w-[88px] min-h-[76px] sm:min-h-[86px] px-3.5 py-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in ${
          isPositive
            ? 'bg-[#0F766E] text-white tile-shadow-pos border border-[#2DD4BF]/45'
            : 'bg-[#B91C1C] text-white tile-shadow-neg border-2 border-dashed border-white/50'
        } ${selectionClass} ${opacityClass}`}
      >
        {showStones && (
          <div className="mb-0.5 opacity-90">
            {isPositive ? (
              <SunCarving className="w-4 h-4 text-[#A7F3D0]" />
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
          <span className="mt-1 text-[10px] font-medium tracking-wide opacity-80">
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

    if (pureSymbols && term.coeff === 1 && term.denom === 1) {
      return (
        <div
          data-term-id={term.id}
          data-side={side}
          role="button"
          tabIndex={0}
          aria-label={`Peti Pusaka di ruas ${side === 'left' ? 'kiri' : 'kanan'}`}
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
          className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[86px] sm:min-w-[98px] min-h-[84px] sm:min-h-[94px] px-3 py-2.5 flex flex-col items-center justify-center gap-1 transition-transform duration-150 animate-pop-in bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white tile-shadow-var border-2 border-[#FEF3C7] ${selectionClass} ${opacityClass}`}
        >
          <TreasureChestIcon className="w-9 h-9 text-[#FFFBEB]" />
          <span className="text-[11px] font-extrabold tracking-tight text-[#FFFBEB]">
            Peti Pusaka
          </span>
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
        className={`relative select-none touch-none cursor-grab active:cursor-grabbing rounded-2xl min-w-[82px] sm:min-w-[96px] min-h-[78px] sm:min-h-[88px] px-3.5 py-2.5 flex flex-col items-center justify-center transition-transform duration-150 animate-pop-in bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white tile-shadow-var ${
          isNeg ? 'border-2 border-dashed border-[#FEE2E2]' : 'border-2 border-[#FEF3C7]/80'
        } ${selectionClass} ${opacityClass}`}
      >
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
          <span className="mt-1 text-[10px] font-medium tracking-wide text-[#FEF3C7]">
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
      className={`relative select-none touch-none cursor-pointer rounded-2xl min-h-[78px] sm:min-h-[88px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 transition-transform duration-150 animate-pop-in bg-[#1E3A5F] text-white tile-shadow-group border border-[#93C5FD]/45 ${selectionClass} ${opacityClass}`}
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
};
