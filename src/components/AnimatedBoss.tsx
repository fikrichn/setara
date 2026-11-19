import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../game/sound';

export type BossVariant =
  | 'squid'
  | 'pufferfish'
  | 'crab'
  | 'cannon_turtle'
  | 'orca'
  | 'cthulhu';

export type BossAnimState = 'idle' | 'enraged' | 'hit' | 'defeated' | 'mocking';

export const CHAPTER_BOSS_VARIANTS: Record<number, BossVariant> = {
  0: 'squid',
  1: 'pufferfish',
  2: 'crab',
  3: 'cannon_turtle',
  4: 'orca',
  5: 'cthulhu',
};

export function getBossVariantForChapter(chapterId: number): BossVariant {
  return CHAPTER_BOSS_VARIANTS[chapterId] ?? 'squid';
}

const TAP_COMIC_WORDS: Record<BossVariant, { tap: string; mock: string; bg: string }> = {
  squid: { tap: 'Eek!!', mock: 'Wleee!', bg: 'bg-[#F0ABFC] text-[#3B0764]' },
  pufferfish: { tap: 'Hmph!', mock: 'Hehe!', bg: 'bg-[#FDE047] text-[#451A03]' },
  crab: { tap: 'Milikku!', mock: 'Klak!', bg: 'bg-[#FBBF24] text-[#451A03]' },
  cannon_turtle: { tap: 'Zzz...', mock: 'Hoam~', bg: 'bg-[#5EEAD4] text-[#042F2E]' },
  orca: { tap: 'Heh!', mock: 'Haha!', bg: 'bg-[#38BDF8] text-[#082F49]' },
  cthulhu: { tap: 'ROAAR!', mock: 'MWAHA!', bg: 'bg-[#FB7185] text-white' },
};

interface AnimatedBossProps {
  variant?: BossVariant;
  chapterId: number;
  state: BossAnimState;
  phonkPlaying: boolean;
  cosmicMode?: boolean;
  isSleeping?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onTaunt?: () => void;
  className?: string;
}

const CHAPTER_ACCENT: Record<number, { glow: string; bg1: string; bg2: string }> = {
  0: { glow: '#F472B6', bg1: '#3B0764', bg2: '#1E1B4B' },
  1: { glow: '#FBBF24', bg1: '#155E75', bg2: '#082F49' },
  2: { glow: '#FDE047', bg1: '#7C2D12', bg2: '#3B110E' },
  3: { glow: '#38BDF8', bg1: '#115E59', bg2: '#082F49' },
  4: { glow: '#22D3EE', bg1: '#0C4A6E', bg2: '#08182B' },
  5: { glow: '#E879F9', bg1: '#4C1D95', bg2: '#13072E' },
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'w-12 h-12 rounded-xl',
  md: 'w-18 h-18 sm:w-21 sm:h-21 rounded-2xl',
  lg: 'w-20 h-20 sm:w-24 sm:h-24 rounded-2xl',
  xl: 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl',
};

export const AnimatedBoss: React.FC<AnimatedBossProps> = ({
  variant,
  chapterId,
  state,
  phonkPlaying,
  cosmicMode = false,
  isSleeping = false,
  size = 'md',
  interactive = true,
  onTaunt,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const [tapCount, setTapCount] = useState(0);
  const [isReacting, setIsReacting] = useState(false);
  const reactTimerRef = useRef<number | null>(null);
  const resolvedVariant = variant ?? getBossVariantForChapter(chapterId);
  const palette = CHAPTER_ACCENT[chapterId] || CHAPTER_ACCENT[0];
  const comicMeta = TAP_COMIC_WORDS[resolvedVariant];

  useEffect(() => {
    return () => {
      if (reactTimerRef.current) window.clearTimeout(reactTimerRef.current);
    };
  }, []);

  // Kid-friendly subtle bobbing using existing animation keys
  const beatClass = state === 'defeated' ? '' : 'anime-kibo-breathe';
  const outerBobClass =
    state === 'defeated' || state === 'hit' || isReacting ? '' : 'animate-kibo-waddle';

  const eyeColor =
    state === 'enraged' || (resolvedVariant === 'cthulhu' && (isReacting || state === 'mocking'))
      ? '#FB7185'
      : palette.glow;

  const isMocking = state === 'mocking';
  const activeExpr = isReacting || isMocking;

  const handleTap = () => {
    if (!interactive || state === 'defeated') return;
    sound.playBossTaunt();
    setTapCount((c) => c + 1);
    setIsReacting(true);
    if (reactTimerRef.current) window.clearTimeout(reactTimerRef.current);
    reactTimerRef.current = window.setTimeout(() => setIsReacting(false), 820);
    onTaunt?.();
  };

  const renderEnragedAura = (cx = 60, cy = 62, r = 47) =>
    state === 'enraged' || (isReacting && resolvedVariant === 'cthulhu') ? (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#FB7185"
        strokeWidth="3"
        strokeDasharray="8 6"
        opacity="0.78"
        className="anime-gear-cw"
      />
    ) : null;

  const renderBubbles = () => (
    <g opacity="0.55" fill="none" stroke="#BAE6FD" strokeWidth="1.5">
      <circle cx="16" cy="96" r="3" className="anime-bubble-rise" />
      <circle
        cx="104"
        cy="88"
        r="2.4"
        className="anime-bubble-rise"
        style={{ animationDelay: '0.8s' }}
      />
      <circle
        cx="22"
        cy="34"
        r="2"
        className="anime-bubble-rise"
        style={{ animationDelay: '1.3s' }}
      />
    </g>
  );

  const renderStandardEyes = (
    lx: number,
    rx: number,
    y: number,
    opts?: {
      r?: number;
      cute?: boolean;
      iris?: string;
      scared?: boolean;
      jealous?: boolean;
      sleepy?: boolean;
      smug?: boolean;
    }
  ) => {
    const r = opts?.r ?? 6;
    const iris = opts?.iris ?? eyeColor;
    if (state === 'hit') {
      return (
        <g stroke="#FEF08A" strokeWidth="3.2" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 5} ${y - 4} L ${lx + 4} ${y} L ${lx - 5} ${y + 4}`} />
          <path d={`M ${rx + 5} ${y - 4} L ${rx - 4} ${y} L ${rx + 5} ${y + 4}`} />
        </g>
      );
    }
    if (state === 'defeated') {
      return (
        <g stroke="#E2E8F0" strokeWidth="2.3" fill="none" strokeLinecap="round">
          <circle cx={lx} cy={y} r={r - 0.5} />
          <path d={`M ${lx - 2.3} ${y} A 2.3 2.3 0 1 1 ${lx + 2.3} ${y}`} />
          <circle cx={rx} cy={y} r={r - 0.5} />
          <path d={`M ${rx - 2.3} ${y} A 2.3 2.3 0 1 1 ${rx + 2.3} ${y}`} />
        </g>
      );
    }
    if (opts?.scared) {
      return (
        <g>
          <circle cx={lx} cy={y} r={r + 1.4} fill="#FFFFFF" stroke="#3B0764" strokeWidth="2" />
          <circle cx={rx} cy={y} r={r + 1.4} fill="#FFFFFF" stroke="#3B0764" strokeWidth="2" />
          <circle cx={lx} cy={y} r="2.1" fill="#1E1B4B" />
          <circle cx={rx} cy={y} r="2.1" fill="#1E1B4B" />
          {/* Anime scared sweat drops */}
          <path d={`M ${lx - 11} ${y - 10} Q ${lx - 14} ${y - 3} ${lx - 11} ${y} Q ${lx - 8} ${y - 3} ${lx - 11} ${y - 10} Z`} fill="#38BDF8" />
          <path d={`M ${rx + 11} ${y - 8} Q ${rx + 14} ${y - 1} ${rx + 11} ${y + 2} Q ${rx + 8} ${y - 1} ${rx + 11} ${y - 8} Z`} fill="#38BDF8" />
        </g>
      );
    }
    if (opts?.sleepy) {
      return (
        <g>
          <path
            d={`M ${lx - 6.5} ${y + 1} Q ${lx} ${y - 4.5} ${lx + 6.5} ${y + 1}`}
            fill="none"
            stroke="#042F2E"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d={`M ${rx - 6.5} ${y + 1} Q ${rx} ${y - 4.5} ${rx + 6.5} ${y + 1}`}
            fill="none"
            stroke="#042F2E"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </g>
      );
    }
    if (opts?.jealous) {
      return (
        <g>
          <rect x={lx - 6.5} y={y - 3} width="13" height="6.5" rx="3" fill="#0F172A" />
          <rect x={rx - 6.5} y={y - 3} width="13" height="6.5" rx="3" fill="#0F172A" />
          <circle cx={lx + 2.2} cy={y + 0.5} r="2.6" fill="#FDE047" />
          <circle cx={rx + 2.2} cy={y + 0.5} r="2.6" fill="#FDE047" />
          <path d={`M ${lx - 7} ${y - 5} L ${lx + 6} ${y - 2.5}`} stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          <path d={`M ${rx + 7} ${y - 5} L ${rx - 6} ${y - 2.5}`} stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }
    if (opts?.smug) {
      return (
        <g stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 5.5} ${y + 1.5} Q ${lx} ${y - 5.5} ${lx + 5.5} ${y + 1.5}`} />
          <path d={`M ${rx - 5.5} ${y + 1.5} Q ${rx} ${y - 5.5} ${rx + 5.5} ${y + 1.5}`} />
        </g>
      );
    }
    return (
      <g className="anime-eye-blink">
        <circle cx={lx} cy={y} r={r} fill="#0F172A" />
        <circle cx={rx} cy={y} r={r} fill="#0F172A" />
        <circle cx={lx} cy={y} r={r * 0.58} fill={iris} />
        <circle cx={rx} cy={y} r={r * 0.58} fill={iris} />
        <circle cx={lx - 1.7} cy={y - 1.7} r={r * 0.28} fill="#FFFFFF" />
        <circle cx={rx - 1.7} cy={y - 1.7} r={r * 0.28} fill="#FFFFFF" />
        {!opts?.cute ? (
          <>
            <path
              d={`M ${lx - 7} ${y - 7} L ${lx + 5.5} ${y - 3.5}`}
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d={`M ${rx + 7} ${y - 7} L ${rx - 5.5} ${y - 3.5}`}
              stroke="#0F172A"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d={`M ${lx - 5.5} ${y - 7.2} L ${lx + 4} ${y - 5.2}`}
              stroke="#4C1D95"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d={`M ${rx + 5.5} ${y - 7.2} L ${rx - 4} ${y - 5.2}`}
              stroke="#4C1D95"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        )}
      </g>
    );
  };

  // =========================================================================
  // BAB 0: CUMI CILIK (Sifat: PENAKUT)
  // =========================================================================
  const renderSquid = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`sqBg-${uid}`} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`sqBody-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#sqBg-${uid})`} />
      {renderBubbles()}
      {renderEnragedAura(60, 60, 46)}

      {/* Cute scared ink cloud puff when tapped! */}
      {isReacting && (
        <g opacity="0.72">
          <circle cx="24" cy="84" r="9" fill="#581C87" />
          <circle cx="96" cy="82" r="8" fill="#581C87" />
          <circle cx="18" cy="72" r="5" fill="#7E22CE" />
        </g>
      )}

      <ellipse cx="60" cy="109" rx="26" ry="4.5" fill="#000000" opacity="0.35" />

      <g className={beatClass}>
        <g className="anime-tentacle-a">
          <path
            d="M 41 75 C 32 85, 24 94, 30 103 C 33 106, 39 102, 39 95"
            fill="none"
            stroke="#A855F7"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 41 75 C 32 85, 24 94, 30 103"
            fill="none"
            stroke="#F5D0FE"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>
        <g className="anime-tentacle-b">
          <path d="M 50 77 C 46 89, 43 99, 48 106" fill="none" stroke="#9333EA" strokeWidth="7" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-c">
          <path d="M 60 78 C 58 90, 62 98, 60 107" fill="none" stroke="#C084FC" strokeWidth="7.5" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-a">
          <path d="M 70 77 C 74 89, 77 99, 72 106" fill="none" stroke="#9333EA" strokeWidth="7" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-b">
          <path
            d="M 79 75 C 88 85, 96 94, 90 103 C 87 106, 81 102, 81 95"
            fill="none"
            stroke="#A855F7"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>

        <g className="anime-kibo-fin-l">
          <path d="M 38 35 C 21 25, 19 42, 33 48 Z" fill="#E879F9" stroke="#3B0764" strokeWidth="2.8" strokeLinejoin="round" />
        </g>
        <g className="anime-kibo-fin-r">
          <path d="M 82 35 C 99 25, 101 42, 87 48 Z" fill="#E879F9" stroke="#3B0764" strokeWidth="2.8" strokeLinejoin="round" />
        </g>

        <path
          d="M 60 15 C 40 15, 31 37, 34 62 C 36 75, 45 81, 60 81 C 75 81, 84 75, 86 62 C 89 37, 80 15, 60 15 Z"
          fill={`url(#sqBody-${uid})`}
          stroke="#3B0764"
          strokeWidth="3.3"
        />

        <ellipse cx="49" cy="30" rx="5.5" ry="9" transform="rotate(-18 49 30)" fill="#FFFFFF" opacity="0.32" />

        <polygon
          points="60,25 65,33 60,41 55,33"
          fill="#FEF08A"
          stroke="#7E22CE"
          strokeWidth="1.6"
          className="anime-gold-glint"
        />

        <ellipse cx="40" cy="64" rx="5" ry="3" fill="#FB7185" opacity="0.55" />
        <ellipse cx="80" cy="64" rx="5" ry="3" fill="#FB7185" opacity="0.55" />

        {renderStandardEyes(49, 71, 56, {
          r: 6.8,
          cute: true,
          scared: isReacting,
          smug: isMocking,
          iris: state === 'enraged' ? '#FF3B30' : '#38BDF8',
        })}

        {state === 'hit' || isReacting ? (
          <ellipse cx="60" cy="69" rx="5" ry="4" fill="#3B0764" />
        ) : isMocking ? (
          <g>
            <path d="M 52 66 Q 60 72 68 66" fill="none" stroke="#3B0764" strokeWidth="2.6" strokeLinecap="round" />
            <ellipse cx="60" cy="71" rx="4.2" ry="4.5" fill="#FB7185" stroke="#3B0764" strokeWidth="1.6" />
          </g>
        ) : state === 'defeated' ? (
          <path d="M 54 70 Q 60 65 66 70" fill="none" stroke="#3B0764" strokeWidth="2.8" strokeLinecap="round" />
        ) : (
          <path d="M 54 68 Q 57 65 60 68 Q 63 65 66 68" fill="none" stroke="#3B0764" strokeWidth="2.6" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );

  // =========================================================================
  // BAB 1: KAPTEN BUNTAL (Sifat: IRI)
  // =========================================================================
  const renderPufferfish = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`pfBg-${uid}`} cx="50%" cy="40%" r="66%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <radialGradient id={`pfBody-${uid}`} cx="45%" cy="38%" r="60%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="65%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#pfBg-${uid})`} />
      {renderBubbles()}
      {renderEnragedAura(60, 67, 46)}

      <ellipse cx="60" cy="110" rx="34" ry="5" fill="#000000" opacity="0.38" />

      <g className={beatClass}>
        <g
          className={state === 'defeated' ? '' : 'anime-puffer-inflate'}
          style={
            activeExpr
              ? { transform: 'scale(1.1)', transformBox: 'fill-box', transformOrigin: 'center' }
              : undefined
          }
        >
          <g className="anime-kibo-fin-l">
            <path d="M 27 65 C 12 58, 10 74, 24 78 Z" fill="#FBBF24" stroke="#451A03" strokeWidth="2.8" strokeLinejoin="round" />
          </g>
          <g className="anime-kibo-fin-r">
            <path d="M 93 65 C 108 58, 110 74, 96 78 Z" fill="#FBBF24" stroke="#451A03" strokeWidth="2.8" strokeLinejoin="round" />
          </g>

          <g fill="#FEF08A" stroke="#78350F" strokeWidth="2.2" strokeLinejoin="round">
            <polygon points="24,52 14,45 27,43" />
            <polygon points="22,68 11,68 23,74" />
            <polygon points="27,84 18,92 33,89" />
            <polygon points="96,52 106,45 93,43" />
            <polygon points="98,68 109,68 97,74" />
            <polygon points="93,84 102,92 87,89" />
            <polygon points="48,98 44,108 56,100" />
            <polygon points="72,98 76,108 64,100" />
          </g>

          <circle cx="60" cy="68" r="34" fill={`url(#pfBody-${uid})`} stroke="#451A03" strokeWidth="3.4" />
          <path d="M 31 76 C 39 95, 81 95, 89 76 C 78 83, 42 83, 31 76 Z" fill="#FEF9C3" opacity="0.92" />

          <circle cx="37" cy="72" r={activeExpr ? 7.5 : 5.5} fill={activeExpr ? '#FB7185' : '#FB923C'} opacity="0.72" />
          <circle cx="83" cy="72" r={activeExpr ? 7.5 : 5.5} fill={activeExpr ? '#FB7185' : '#FB923C'} opacity="0.72" />

          {renderStandardEyes(48, 72, 63, {
            r: 6.2,
            jealous: isReacting,
            smug: isMocking,
            iris: state === 'enraged' ? '#FF3B30' : '#0284C7',
          })}

          {state === 'hit' ? (
            <ellipse cx="60" cy="78" rx="6.5" ry="4.5" fill="#451A03" />
          ) : isReacting ? (
            <path d="M 52 78 L 60 75 L 68 78" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          ) : isMocking ? (
            <path d="M 50 75 Q 60 83 70 75" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          ) : state === 'defeated' ? (
            <path d="M 52 79 Q 60 73 68 79" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <g>
              <circle cx="60" cy="76" r="5.2" fill="#F97316" stroke="#451A03" strokeWidth="2.5" />
              <circle cx="60" cy="76" r="2.2" fill="#451A03" />
            </g>
          )}
        </g>

        <g className="anime-crown-sway">
          <path d="M 31 38 Q 60 44 89 38 L 86 44 Q 60 50 34 44 Z" fill="#DC2626" stroke="#450A0A" strokeWidth="2" />
          <path
            d="M 22 38 C 25 25, 39 24, 46 15 C 55 9, 65 9, 74 15 C 81 24, 95 25, 98 38 C 82 43, 38 43, 22 38 Z"
            fill="#1E293B"
            stroke="#020617"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M 27 36 C 42 40, 78 40, 93 36" fill="none" stroke="#FBBF24" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="60" cy="25" r="7" fill="#FBBF24" stroke="#78350F" strokeWidth="1.8" />
          <line x1="56.5" y1="23.5" x2="63.5" y2="23.5" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="56.5" y1="27" x2="63.5" y2="27" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );

  // =========================================================================
  // BAB 2: KEPITING EMAS (Sifat: KIKIR)
  // =========================================================================
  const renderCrab = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`crBg-${uid}`} cx="50%" cy="40%" r="66%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`crShell-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <radialGradient id={`goldBead-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#crBg-${uid})`} />
      {renderEnragedAura(60, 66, 47)}

      {/* Extra golden glint burst when greedy crab is clicked! */}
      {activeExpr && (
        <g fill="#FEF08A">
          <path d="M 16 18 L 18 23 L 23 25 L 18 27 L 16 32 L 14 27 L 9 25 L 14 23 Z" />
          <path d="M 103 18 L 105 23 L 110 25 L 105 27 L 103 32 L 101 27 L 96 25 L 101 23 Z" />
        </g>
      )}

      <ellipse cx="60" cy="109" rx="38" ry="5" fill="#000000" opacity="0.4" />

      <g className={beatClass}>
        <g className="anime-foot-l" stroke="#991B1B" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M 32 82 L 17 89 L 13 99" />
          <path d="M 37 88 L 24 98 L 21 106" />
        </g>
        <g className="anime-foot-r" stroke="#991B1B" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M 88 82 L 103 89 L 107 99" />
          <path d="M 83 88 L 96 98 L 99 106" />
        </g>

        <g className="anime-claw-l">
          <path d="M 33 66 L 21 53" stroke="#B91C1C" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M 18 52 C 8 44, 9 28, 22 25 C 20 33, 24 37, 29 36 C 33 28, 39 36, 33 49 C 29 55, 22 55, 18 52 Z"
            fill={`url(#crShell-${uid})`}
            stroke="#450A0A"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="54" r="3.4" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.2" />
          <circle cx="29" cy="58" r="3.2" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.2" />
        </g>

        <g className="anime-claw-r">
          <path d="M 87 66 L 99 53" stroke="#B91C1C" strokeWidth="6" strokeLinecap="round" />
          <path
            d="M 102 52 C 112 44, 111 28, 98 25 C 100 33, 96 37, 91 36 C 87 28, 81 36, 87 49 C 91 55, 98 55, 102 52 Z"
            fill={`url(#crShell-${uid})`}
            stroke="#450A0A"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <circle cx="96" cy="54" r="3.4" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.2" />
          <circle cx="91" cy="58" r="3.2" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.2" />
        </g>

        <line x1="48" y1="52" x2="45" y2="39" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="72" y1="52" x2="75" y2="39" stroke="#DC2626" strokeWidth="5.5" strokeLinecap="round" />

        <path
          d="M 24 72 C 24 49, 40 43, 60 43 C 80 43, 96 49, 96 72 C 96 89, 80 95, 60 95 C 40 95, 24 89, 24 72 Z"
          fill={`url(#crShell-${uid})`}
          stroke="#450A0A"
          strokeWidth="3.4"
        />

        <path d="M 31 74 Q 60 90 89 74" fill="none" stroke="#B45309" strokeWidth="2" />
        {[
          { x: 34, y: 76, r: 4.2 },
          { x: 43, y: 81, r: 4.6 },
          { x: 52, y: 84, r: 5 },
          { x: 60, y: 85, r: 5.5 },
          { x: 68, y: 84, r: 5 },
          { x: 77, y: 81, r: 4.6 },
          { x: 86, y: 76, r: 4.2 },
        ].map((b, idx) => (
          <circle
            key={idx}
            cx={b.x}
            cy={b.y}
            r={b.r}
            fill={`url(#goldBead-${uid})`}
            stroke="#78350F"
            strokeWidth="1.4"
          />
        ))}

        <g className="anime-crown-sway">
          <circle cx="51" cy="43" r="3.8" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.3" />
          <circle cx="60" cy="39" r="5" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.4" />
          <circle cx="69" cy="43" r="3.8" fill={`url(#goldBead-${uid})`} stroke="#78350F" strokeWidth="1.3" />
        </g>

        <g className="anime-gold-glint" fill="#FEF9C3">
          <path d="M 60 77 L 61.5 81 L 65.5 82.5 L 61.5 84 L 60 88 L 58.5 84 L 54.5 82.5 L 58.5 81 Z" />
          <circle cx="43" cy="79" r="1.8" />
          <circle cx="77" cy="79" r="1.8" />
        </g>

        <circle cx="45" cy="37" r="7.5" fill="#FEF2F2" stroke="#450A0A" strokeWidth="2.4" />
        <circle cx="75" cy="37" r="7.5" fill="#FEF2F2" stroke="#450A0A" strokeWidth="2.4" />
        {renderStandardEyes(45, 75, 37, {
          r: 5.4,
          jealous: isReacting,
          smug: isMocking,
          iris: state === 'enraged' ? '#FF3B30' : '#F59E0B',
        })}

        {state === 'hit' ? (
          <ellipse cx="60" cy="65" rx="6.5" ry="4" fill="#450A0A" />
        ) : state === 'defeated' ? (
          <path d="M 52 67 Q 60 62 68 67" fill="none" stroke="#450A0A" strokeWidth="2.8" strokeLinecap="round" />
        ) : (
          <path d="M 48 64 Q 60 72 72 64" fill="none" stroke="#450A0A" strokeWidth="3" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );

  // =========================================================================
  // BAB 3: KURA MERIAM (Sifat: MALAS)
  // =========================================================================
  const renderCannonTurtle = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`ctBg-${uid}`} cx="50%" cy="40%" r="66%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`ctIron-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="50%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id={`ctGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#ctBg-${uid})`} />
      {renderEnragedAura(60, 66, 47)}

      {/* Sleeping or lazy floating Zzz bubble */}
      {(isSleeping || activeExpr) && (
        <g>
          <text
            x="84"
            y="34"
            fill="#FEF08A"
            fontSize="14"
            fontWeight="900"
            className="anime-kibo-zzz"
          >
            Zzz
          </text>
          {isSleeping && (
            <text
              x="98"
              y="22"
              fill="#BAE6FD"
              fontSize="10"
              fontWeight="800"
              className="anime-kibo-zzz"
              style={{ animationDelay: '0.7s' }}
            >
              z
            </text>
          )}
        </g>
      )}

      <ellipse cx="60" cy="109" rx="38" ry="5.5" fill="#000000" opacity="0.4" />

      <g className={beatClass}>
        <g className={state === 'defeated' || isSleeping ? '' : 'anime-cannon-recoil'}>
          <g transform="rotate(-24 38 42)">
            <rect x="24" y="14" width="16" height="30" rx="4" fill={`url(#ctIron-${uid})`} stroke="#020617" strokeWidth="2.6" />
            <rect x="22" y="12" width="20" height="6" rx="2.5" fill={`url(#ctGold-${uid})`} stroke="#78350F" strokeWidth="1.8" />
            <rect x="25" y="28" width="14" height="4" rx="1.5" fill="#F59E0B" />
          </g>
          <g transform="rotate(24 82 42)">
            <rect x="80" y="14" width="16" height="30" rx="4" fill={`url(#ctIron-${uid})`} stroke="#020617" strokeWidth="2.6" />
            <rect x="78" y="12" width="20" height="6" rx="2.5" fill={`url(#ctGold-${uid})`} stroke="#78350F" strokeWidth="1.8" />
            <rect x="81" y="28" width="14" height="4" rx="1.5" fill="#F59E0B" />
          </g>

          {state !== 'defeated' && !isSleeping && (
            <>
              <g className="anime-muzzle-flash">
                <polygon
                  points="20,10 24,16 30,14 25,20 28,26 21,22 15,25 18,18 12,14 19,15"
                  fill="#FEF08A"
                  stroke="#F97316"
                  strokeWidth="1.4"
                />
              </g>
              <g className="anime-muzzle-flash" style={{ animationDelay: '0.25s' }}>
                <polygon
                  points="100,10 101,15 108,14 102,18 105,25 99,22 92,26 95,20 90,14 96,16"
                  fill="#FEF08A"
                  stroke="#F97316"
                  strokeWidth="1.4"
                />
              </g>
            </>
          )}
        </g>

        <g className={isSleeping ? '' : 'anime-foot-l'}>
          <rect x="24" y="88" width="19" height="16" rx="6" fill="#0F766E" stroke="#042F2E" strokeWidth="3" />
          <path d="M 28 102 L 28 97 M 34 102 L 34 97 M 40 102 L 40 97" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className={isSleeping ? '' : 'anime-foot-r'}>
          <rect x="77" y="88" width="19" height="16" rx="6" fill="#0F766E" stroke="#042F2E" strokeWidth="3" />
          <path d="M 81 102 L 81 97 M 87 102 L 87 97 M 93 102 L 93 97" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
        </g>

        <path
          d="M 18 82 C 18 46, 36 33, 60 33 C 84 33, 102 46, 102 82 C 102 90, 92 94, 60 94 C 28 94, 18 90, 18 82 Z"
          fill="#115E59"
          stroke="#042F2E"
          strokeWidth="3.5"
        />

        <path
          d="M 36 56 L 48 45 L 72 45 L 84 56 L 76 74 L 44 74 Z"
          fill="#0F766E"
          stroke="#5EEAD4"
          strokeWidth="2"
          opacity="0.85"
        />

        <rect x="16" y="80" width="88" height="10" rx="5" fill={`url(#ctGold-${uid})`} stroke="#78350F" strokeWidth="2.4" />

        <path
          d="M 37 67 C 37 53, 46 47, 60 47 C 74 47, 83 53, 83 67 C 83 80, 74 87, 60 87 C 46 87, 37 80, 37 67 Z"
          fill="#14B8A6"
          stroke="#042F2E"
          strokeWidth="3.2"
        />

        {isSleeping ? (
          /* Peacefully closed sleeping eyes */
          <g stroke="#042F2E" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 43 64 Q 49 69 55 64" />
            <path d="M 65 64 Q 71 69 77 64" />
          </g>
        ) : (
          renderStandardEyes(49, 71, 64, {
            r: 6,
            sleepy: activeExpr,
            iris: state === 'enraged' ? '#FF3B30' : '#FDE047',
          })
        )}

        {isSleeping ? (
          /* Cute sleeping snore bubble */
          <g>
            <circle cx="60" cy="76" r="3" fill="#042F2E" />
            <circle cx="67" cy="74" r="5" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.85" className="anime-kibo-breathe" />
          </g>
        ) : state === 'hit' || activeExpr ? (
          <ellipse cx="60" cy="77" rx="5.5" ry="5.5" fill="#042F2E" />
        ) : state === 'defeated' ? (
          <path d="M 52 78 Q 60 73 68 78" fill="none" stroke="#042F2E" strokeWidth="2.8" strokeLinecap="round" />
        ) : (
          <path d="M 52 76 Q 60 74 68 76" fill="none" stroke="#042F2E" strokeWidth="2.8" strokeLinecap="round" />
        )}
      </g>
    </svg>
  );

  // =========================================================================
  // BAB 4: KAPTEN ORCA (Sifat: ANGKUH)
  // =========================================================================
  const renderOrca = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`orBg-${uid}`} cx="50%" cy="38%" r="66%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`orBody-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="45%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#orBg-${uid})`} />
      {renderBubbles()}
      {renderEnragedAura(60, 62, 47)}

      <path
        d="M 10 104 Q 35 96 60 104 T 110 104"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.6"
        className="anime-wave-mid"
      />

      <g className={beatClass}>
        <g className={state === 'defeated' ? '' : 'anime-orca-glide'}>
          <path
            d="M 52 30 C 56 10, 74 6, 77 18 C 72 22, 70 28, 70 33 Z"
            fill={`url(#orBody-${uid})`}
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <g className="anime-kibo-fin-l">
            <path d="M 27 69 C 10 73, 8 89, 20 94 C 27 92, 31 83, 32 76 Z" fill={`url(#orBody-${uid})`} stroke="#38BDF8" strokeWidth="2" />
          </g>
          <g className="anime-kibo-fin-r">
            <path d="M 93 69 C 110 73, 112 89, 100 94 C 93 92, 89 83, 88 76 Z" fill={`url(#orBody-${uid})`} stroke="#38BDF8" strokeWidth="2" />
          </g>

          <path
            d="M 24 68 C 24 38, 40 27, 60 27 C 80 27, 96 38, 96 68 C 96 90, 82 99, 60 99 C 38 99, 24 90, 24 68 Z"
            fill={`url(#orBody-${uid})`}
            stroke="#64748B"
            strokeWidth="2.8"
          />

          <ellipse cx="36" cy="48" rx="9" ry="5.5" transform="rotate(-24 36 48)" fill="#F8FAFC" opacity="0.95" />
          <ellipse cx="84" cy="48" rx="9" ry="5.5" transform="rotate(24 84 48)" fill="#F8FAFC" opacity="0.95" />
          <path d="M 33 74 C 41 96, 79 96, 87 74 C 76 68, 44 68, 33 74 Z" fill="#F8FAFC" />
          <path d="M 43 35 Q 60 30 77 35" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

          <line x1="28" y1="45" x2="88" y2="68" stroke="#78350F" strokeWidth="4.2" strokeLinecap="round" />
          <line x1="28" y1="45" x2="88" y2="68" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.85" />

          <path
            d="M 37 54 C 37 49, 55 49, 55 54 C 55 63, 49 66, 46 66 C 43 66, 37 63, 37 54 Z"
            fill="#1C1917"
            stroke="#F59E0B"
            strokeWidth="2.4"
          />
          <path d="M 43 55 L 49 61 M 49 55 L 43 61" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />

          {state === 'hit' ? (
            <path d="M 79 53 L 70 57 L 79 61" fill="none" stroke="#FEF08A" strokeWidth="3.2" strokeLinecap="round" />
          ) : state === 'defeated' ? (
            <g stroke="#CBD5E1" strokeWidth="2.4" fill="none">
              <circle cx="74" cy="57" r="6" />
              <path d="M 71.5 57 A 2.5 2.5 0 1 1 76.5 57" />
            </g>
          ) : (
            <g className="anime-eye-blink">
              <circle cx="74" cy="57" r="6.8" fill="#020617" stroke="#E2E8F0" strokeWidth="1.5" />
              <circle cx="74" cy="57" r="4.1" fill={state === 'enraged' ? '#FF3B30' : '#22D3EE'} />
              <circle cx="72.4" cy="55.3" r="1.7" fill="#FFFFFF" />
              <path d="M 82 50 L 68 53.5" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
              {/* Arrogant anime eye star glint on tap / mocking! */}
              {activeExpr && (
                <path
                  d="M 74 44 L 76 54 L 86 57 L 76 60 L 74 70 L 72 60 L 62 57 L 72 54 Z"
                  fill="#FEF08A"
                  opacity="0.92"
                />
              )}
            </g>
          )}

          {state === 'hit' ? (
            <ellipse cx="60" cy="80" rx="8" ry="4.5" fill="#0F172A" />
          ) : activeExpr ? (
            <path d="M 46 79 Q 64 85 78 73" fill="none" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
          ) : state === 'defeated' ? (
            <path d="M 50 82 Q 60 76 70 82" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          ) : (
            <g>
              <path d="M 44 76 Q 60 85 76 76 Q 60 89 44 76 Z" fill="#0F172A" />
              <polygon points="50,78 53,82 56,79" fill="#FFFFFF" />
              <polygon points="64,79 67,82 70,78" fill="#FFFFFF" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );

  // =========================================================================
  // BAB 5: CTHULHU SAMUDRA (Sifat: MARAH — Evolusi Cumi Cilik Bab 0)
  // =========================================================================
  const renderCthulhu = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`cthBg-${uid}`} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor={state === 'enraged' || activeExpr ? '#7F1D1D' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`cthBody-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="48%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#115E59" />
        </linearGradient>
        <linearGradient id={`cthWing-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#cthBg-${uid})`} />

      <circle
        cx="60"
        cy="60"
        r="49"
        fill="none"
        stroke={state === 'enraged' || activeExpr ? '#FB7185' : '#C084FC'}
        strokeWidth="2.4"
        strokeDasharray="6 6"
        opacity="0.65"
        className="anime-gear-cw"
      />
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="#2DD4BF"
        strokeWidth="1.6"
        strokeDasharray="4 8"
        opacity="0.45"
        className="anime-gear-ccw"
      />

      <ellipse cx="60" cy="110" rx="34" ry="5" fill="#000000" opacity="0.45" />

      <g className={beatClass}>
        <g className="anime-cthulhu-wing-l">
          <path
            d="M 38 56 C 14 26, 6 42, 10 66 C 15 62, 20 74, 24 80 C 29 73, 34 73, 38 69 Z"
            fill={`url(#cthWing-${uid})`}
            stroke="#E879F9"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M 34 57 L 14 45 M 34 62 L 16 64" stroke="#C084FC" strokeWidth="1.4" opacity="0.65" />
        </g>
        <g className="anime-cthulhu-wing-r">
          <path
            d="M 82 56 C 106 26, 114 42, 110 66 C 105 62, 100 74, 96 80 C 91 73, 86 73, 82 69 Z"
            fill={`url(#cthWing-${uid})`}
            stroke="#E879F9"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path d="M 86 57 L 106 45 M 86 62 L 104 64" stroke="#C084FC" strokeWidth="1.4" opacity="0.65" />
        </g>

        <path d="M 39 31 C 23 16, 25 8, 37 18 L 46 26 Z" fill="#C084FC" stroke="#2E1065" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M 81 31 C 97 16, 95 8, 83 18 L 74 26 Z" fill="#C084FC" stroke="#2E1065" strokeWidth="2.6" strokeLinejoin="round" />
        <g className="anime-crown-sway">
          <path d="M 48 23 L 53 10 L 60 18 L 67 10 L 72 23 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
        </g>

        <path
          d="M 60 18 C 39 18, 31 36, 33 59 C 34 73, 45 81, 60 81 C 75 81, 86 73, 87 59 C 89 36, 81 18, 60 18 Z"
          fill={`url(#cthBody-${uid})`}
          stroke="#1E1B4B"
          strokeWidth="3.2"
        />

        <polygon
          points="60,24 67,34 60,44 53,34"
          fill={activeExpr ? '#FB7185' : '#FEF08A'}
          stroke="#E879F9"
          strokeWidth="2"
          className="anime-gold-glint"
        />

        {/* Classic anime fury vein mark when Cthulhu is tapped or enraged! */}
        {activeExpr && (
          <g stroke="#FB7185" strokeWidth="2.4" strokeLinecap="round" fill="none">
            <path d="M 78 27 Q 81 31 78 35" />
            <path d="M 86 27 Q 83 31 86 35" />
            <path d="M 76 31 Q 82 28 88 31" />
          </g>
        )}

        {state !== 'hit' && state !== 'defeated' && (
          <g>
            <circle cx="46" cy="44" r="2.6" fill={activeExpr ? '#FB7185' : '#2DD4BF'} />
            <circle cx="74" cy="44" r="2.6" fill={activeExpr ? '#FB7185' : '#2DD4BF'} />
          </g>
        )}
        {renderStandardEyes(48, 72, 56, {
          r: 6.4,
          iris: state === 'enraged' || activeExpr ? '#FF3B30' : '#FDE047',
        })}

        <g className="anime-tentacle-a">
          <path d="M 41 68 C 30 78, 25 90, 32 103" fill="none" stroke="#9333EA" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 41 68 C 30 78, 25 90, 32 103" fill="none" stroke="#E879F9" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        </g>
        <g className="anime-tentacle-b">
          <path d="M 49 71 C 43 85, 41 96, 46 107" fill="none" stroke="#7E22CE" strokeWidth="6.5" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-c">
          <path d="M 56 72 C 54 87, 56 97, 54 109" fill="none" stroke="#14B8A6" strokeWidth="6.8" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-a">
          <path d="M 64 72 C 66 87, 64 97, 66 109" fill="none" stroke="#14B8A6" strokeWidth="6.8" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-b">
          <path d="M 71 71 C 77 85, 79 96, 74 107" fill="none" stroke="#7E22CE" strokeWidth="6.5" strokeLinecap="round" />
        </g>
        <g className="anime-tentacle-c">
          <path d="M 79 68 C 90 78, 95 90, 88 103" fill="none" stroke="#9333EA" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 79 68 C 90 78, 95 90, 88 103" fill="none" stroke="#E879F9" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        </g>
        {cosmicMode && (
          <g pointerEvents="none">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#E879F9"
              strokeWidth="2.4"
              strokeDasharray="6 6"
              className="anime-gear-cw"
              opacity="0.9"
            />
            <circle
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2"
              strokeDasharray="4 8"
              className="anime-gear-ccw"
              opacity="0.85"
            />
            <circle cx="18" cy="22" r="2.8" fill="#FEF08A" className="cosmic-star-twinkle" />
            <circle cx="102" cy="26" r="2.5" fill="#22D3EE" className="cosmic-star-twinkle" />
            <circle cx="20" cy="94" r="2.2" fill="#F0ABFC" className="cosmic-star-twinkle" />
            <circle cx="100" cy="96" r="2.6" fill="#FEF08A" className="cosmic-star-twinkle" />
          </g>
        )}
      </g>
    </svg>
  );

  const renderBossSvg = () => {
    switch (resolvedVariant) {
      case 'squid':
        return renderSquid();
      case 'pufferfish':
        return renderPufferfish();
      case 'crab':
        return renderCrab();
      case 'cannon_turtle':
        return renderCannonTurtle();
      case 'orca':
        return renderOrca();
      case 'cthulhu':
        return renderCthulhu();
    }
  };

  const frameClass = `relative overflow-visible shrink-0 ${SIZE_CLASSES[size]} ${outerBobClass} ${className}`;
  const innerCardClass = `relative w-full h-full overflow-hidden border-2 ${
    size === 'sm' ? 'rounded-xl' : size === 'xl' ? 'rounded-3xl' : 'rounded-2xl'
  } ${
    state === 'hit'
      ? 'border-[#FCA5A5] shadow-[0_0_20px_rgba(248,113,113,0.75)]'
      : cosmicMode
        ? 'border-[#E879F9] shadow-[0_0_28px_rgba(232,121,249,0.95)]'
        : isReacting
          ? 'border-[#FEF08A] shadow-[0_0_22px_rgba(254,240,138,0.85)]'
          : state === 'enraged' || state === 'mocking'
            ? 'border-[#FDE047] shadow-[0_0_18px_rgba(251,191,36,0.65)]'
            : 'border-[#FDE68A] shadow-lg'
  }`;

  if (!interactive) {
    return (
      <div className={frameClass} aria-hidden="true">
        <div className={innerCardClass}>{renderBossSvg()}</div>
        {isMocking && (
          <span
            className={`pointer-events-none absolute -top-2.5 -right-2 z-20 rounded-xl px-2 py-0.5 font-display font-extrabold text-[11px] shadow-md border border-white/70 ${comicMeta.bg}`}
          >
            {comicMeta.mock}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      whileTap={{ scale: 0.9 }}
      animate={
        state === 'hit'
          ? { x: [0, -7, 7, -4, 4, 0], rotate: [0, -6, 6, -3, 0], scale: [1, 0.92, 1.05, 1] }
          : { x: 0, rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.38 }}
      aria-label="Ketuk Bos Penjaga"
      title="Ketuk Bos!"
      className={`${frameClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24]`}
    >
      {/* Keyed squash-and-stretch wrapper replays cleanly on EVERY tap! */}
      <div key={tapCount} className={`${innerCardClass} ${tapCount > 0 ? 'animate-boss-tap' : ''}`}>
        {renderBossSvg()}
      </div>

      {/* Comic Reaction Bubble on Every Tap */}
      {isReacting && (
        <span
          key={`comic-${tapCount}`}
          className={`pointer-events-none absolute -top-3 -right-2 z-30 rounded-xl px-2 py-0.5 font-display font-extrabold text-[11px] shadow-lg border border-white/80 whitespace-nowrap animate-boss-comic ${comicMeta.bg}`}
        >
          {comicMeta.tap}
        </span>
      )}
    </motion.button>
  );
};
