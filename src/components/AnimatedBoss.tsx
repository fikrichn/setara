import React, { useId, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../game/sound';

export type BossVariant = 'turtle' | 'owl';
export type BossAnimState = 'idle' | 'enraged' | 'hit' | 'defeated';

interface AnimatedBossProps {
  variant: BossVariant;
  chapterId: number;
  state: BossAnimState;
  phonkPlaying: boolean;
  onTaunt?: () => void;
  className?: string;
}

const CHAPTER_ACCENT: Record<number, { glow: string; shell: string; bg1: string; bg2: string }> = {
  0: { glow: '#34D399', shell: '#145343', bg1: '#154438', bg2: '#081D17' },
  1: { glow: '#FBBF24', shell: '#47361E', bg1: '#2D2414', bg2: '#120E08' },
  2: { glow: '#FB923C', shell: '#57241A', bg1: '#3D1A14', bg2: '#170907' },
  3: { glow: '#38BDF8', shell: '#183C52', bg1: '#143347', bg2: '#071621' },
  4: { glow: '#2DD4BF', shell: '#134E4A', bg1: '#103D3B', bg2: '#061A1A' },
  5: { glow: '#FDE047', shell: '#4C1D3D', bg1: '#3B162F', bg2: '#150712' },
};

export const AnimatedBoss: React.FC<AnimatedBossProps> = ({
  variant,
  chapterId,
  state,
  phonkPlaying,
  onTaunt,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const [tauntBurst, setTauntBurst] = useState(0);
  const palette = CHAPTER_ACCENT[chapterId] || CHAPTER_ACCENT[0];

  const beatClass =
    state === 'defeated'
      ? ''
      : state === 'enraged'
        ? 'anime-boss-enraged'
        : phonkPlaying
          ? 'anime-boss-beat'
          : 'anime-kibo-breathe';

  const eyeColor = state === 'enraged' ? '#FF3B30' : palette.glow;

  const handleTap = () => {
    if (state === 'defeated') return;
    sound.playBossTaunt();
    setTauntBurst((b) => b + 1);
    onTaunt?.();
  };

  const renderEyes = (lx: number, rx: number, y: number) => {
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
        <g stroke="#CBD5E1" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <circle cx={lx} cy={y} r="6" />
          <path d={`M ${lx - 2.5} ${y} A 2.5 2.5 0 1 1 ${lx + 2.5} ${y}`} />
          <circle cx={rx} cy={y} r="6" />
          <path d={`M ${rx - 2.5} ${y} A 2.5 2.5 0 1 1 ${rx + 2.5} ${y}`} />
        </g>
      );
    }
    return (
      <g className="anime-eye-blink">
        <circle cx={lx} cy={y} r="6.2" fill="#0B1316" />
        <circle cx={rx} cy={y} r="6.2" fill="#0B1316" />
        <circle cx={lx} cy={y} r="3.6" fill={eyeColor} />
        <circle cx={rx} cy={y} r="3.6" fill={eyeColor} />
        <circle cx={lx - 1.5} cy={y - 1.5} r="1.5" fill="#FFFFFF" />
        <circle cx={rx - 1.5} cy={y - 1.5} r="1.5" fill="#FFFFFF" />
        {/* Fierce anime furrowed eyebrows */}
        <path
          d={`M ${lx - 7} ${y - 7} L ${lx + 6} ${y - 3.5}`}
          stroke="#111827"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d={`M ${rx + 7} ${y - 7} L ${rx - 6} ${y - 3.5}`}
          stroke="#111827"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>
    );
  };

  const renderTurtle = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`bossBg-${uid}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#6D161E' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`bossGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#bossBg-${uid})`} />

      {/* Enraged Phonk Aura Ring */}
      {state === 'enraged' && (
        <circle
          cx="60"
          cy="64"
          r="46"
          fill="none"
          stroke="#EF4444"
          strokeWidth="3"
          strokeDasharray="8 6"
          opacity="0.7"
          className="anime-gear-cw"
        />
      )}

      {/* Shadow */}
      <ellipse cx="60" cy="108" rx="38" ry="6" fill="#000000" opacity="0.45" />

      <g className={beatClass}>
        {/* Armored Feet */}
        <g className="anime-foot-l">
          <rect x="26" y="88" width="18" height="16" rx="6" fill="#475569" stroke="#0F172A" strokeWidth="3" />
          <path d="M 29 102 L 29 97 M 35 102 L 35 97 M 41 102 L 41 97" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className="anime-foot-r">
          <rect x="76" y="88" width="18" height="16" rx="6" fill="#475569" stroke="#0F172A" strokeWidth="3" />
          <path d="M 79 102 L 79 97 M 85 102 L 85 97 M 91 102 L 91 97" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Rune-Carved Stone Dome Shell */}
        <path
          d="M 18 82 C 18 42, 36 28, 60 28 C 84 28, 102 42, 102 82 C 102 90, 92 94, 60 94 C 28 94, 18 90, 18 82 Z"
          fill={palette.shell}
          stroke="#0F172A"
          strokeWidth="3.6"
        />

        {/* Glowing Carved Shell Runes */}
        <path
          d="M 35 55 L 48 44 L 72 44 L 85 55 L 76 74 L 44 74 Z"
          fill="none"
          stroke={eyeColor}
          strokeWidth="2.4"
          opacity="0.85"
        />
        <line x1="60" y1="30" x2="60" y2="44" stroke={eyeColor} strokeWidth="2.4" opacity="0.8" />
        <line x1="25" y1="68" x2="42" y2="62" stroke={eyeColor} strokeWidth="2.2" opacity="0.7" />
        <line x1="95" y1="68" x2="78" y2="62" stroke={eyeColor} strokeWidth="2.2" opacity="0.7" />

        {/* Brass Rim */}
        <rect x="16" y="80" width="88" height="10" rx="5" fill={`url(#bossGold-${uid})`} stroke="#78350F" strokeWidth="2.4" />

        {/* Swaying Golden Balance Scale Crown */}
        <g className="anime-crown-sway">
          <rect x="57" y="13" width="6" height="17" rx="2" fill={`url(#bossGold-${uid})`} stroke="#78350F" strokeWidth="2" />
          <line x1="36" y1="16" x2="84" y2="16" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 36 16 L 31 25 L 41 25 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1.6" />
          <path d="M 84 16 L 79 25 L 89 25 Z" fill="#FBBF24" stroke="#78350F" strokeWidth="1.6" />
          <circle cx="60" cy="16" r="4" fill="#EF4444" stroke="#FEF08A" strokeWidth="1.6" />
        </g>

        {/* Stone Guardian Head */}
        <path
          d="M 36 66 C 36 52, 46 46, 60 46 C 74 46, 84 52, 84 66 C 84 80, 74 87, 60 87 C 46 87, 36 80, 36 66 Z"
          fill="#64748B"
          stroke="#0F172A"
          strokeWidth="3.4"
        />
        <path d="M 42 52 Q 60 47 78 52" fill="none" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" />

        {renderEyes(49, 71, 63)}

        {/* Fierce Jaw / Mouth */}
        {state === 'hit' ? (
          <ellipse cx="60" cy="77" rx="7" ry="4.5" fill="#111827" />
        ) : state === 'defeated' ? (
          <path d="M 52 78 Q 60 72 68 78" fill="none" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path
            d="M 48 76 L 54 73 L 60 76 L 66 73 L 72 76"
            fill="none"
            stroke="#0F172A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
    </svg>
  );

  const renderOwl = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full select-none" aria-hidden="true">
      <defs>
        <radialGradient id={`owlBg-${uid}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor={state === 'enraged' ? '#6D161E' : palette.bg1} />
          <stop offset="100%" stopColor={palette.bg2} />
        </radialGradient>
        <linearGradient id={`owlBrass-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="120" height="120" rx="22" fill={`url(#owlBg-${uid})`} />

      {/* Spinning Mechanical Brass Gears Behind Owl */}
      <g className="anime-gear-cw" opacity="0.88">
        <circle cx="24" cy="36" r="14" fill="none" stroke="#D97706" strokeWidth="4" strokeDasharray="5 4" />
        <circle cx="24" cy="36" r="8" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
      </g>
      <g className="anime-gear-ccw" opacity="0.88">
        <circle cx="96" cy="38" r="13" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="5 4" />
        <circle cx="96" cy="38" r="7" fill="#78350F" stroke="#FDE68A" strokeWidth="2" />
      </g>

      <ellipse cx="60" cy="108" rx="34" ry="5.5" fill="#000000" opacity="0.45" />

      <g className={beatClass}>
        {/* Flapping Brass Wings */}
        <g className="anime-kibo-fin-l">
          <path
            d="M 30 56 C 12 62, 10 82, 22 92 C 29 88, 33 78, 34 68 Z"
            fill={`url(#owlBrass-${uid})`}
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>
        <g className="anime-kibo-fin-r">
          <path
            d="M 90 56 C 108 62, 110 82, 98 92 C 91 88, 87 78, 86 68 Z"
            fill={`url(#owlBrass-${uid})`}
            stroke="#0F172A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Owl Ear Tufts */}
        <polygon points="34,42 26,20 47,34" fill={`url(#owlBrass-${uid})`} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
        <polygon points="86,42 94,20 73,34" fill={`url(#owlBrass-${uid})`} stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />

        {/* Swaying Golden Balance Crest */}
        <g className="anime-crown-sway">
          <path d="M 46 28 L 52 14 L 60 22 L 68 14 L 74 28 Z" fill={`url(#owlBrass-${uid})`} stroke="#78350F" strokeWidth="2.2" />
          <circle cx="60" cy="21" r="3" fill={eyeColor} />
        </g>

        {/* Armored Mechanical Owl Torso */}
        <path
          d="M 30 62 C 30 38, 43 28, 60 28 C 77 28, 90 38, 90 62 C 90 88, 78 98, 60 98 C 42 98, 30 88, 30 62 Z"
          fill={palette.shell}
          stroke="#0F172A"
          strokeWidth="3.5"
        />

        {/* Carved Chest Dial with '=' */}
        <circle cx="60" cy="81" r="11" fill="#0F2620" stroke="#F59E0B" strokeWidth="2.5" />
        <line x1="55" y1="78.5" x2="65" y2="78.5" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="55" y1="83.5" x2="65" y2="83.5" stroke={eyeColor} strokeWidth="2.5" strokeLinecap="round" />

        {/* Brass Spectacles */}
        <g
          style={
            state === 'hit' || state === 'defeated'
              ? { transform: 'rotate(-8deg)', transformBox: 'fill-box', transformOrigin: 'center' }
              : undefined
          }
        >
          <circle cx="47" cy="53" r="12" fill="#111827" stroke="#FBBF24" strokeWidth="3" />
          <circle cx="73" cy="53" r="12" fill="#111827" stroke="#FBBF24" strokeWidth="3" />
          <line x1="59" y1="53" x2="61" y2="53" stroke="#FBBF24" strokeWidth="3.5" />
          {renderEyes(47, 73, 53)}
        </g>

        {/* Golden Beak */}
        <polygon
          points="55,61 65,61 60,71"
          fill={`url(#owlBrass-${uid})`}
          stroke="#0F172A"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Claws */}
        <path d="M 45 97 L 42 104 M 49 97 L 49 104 M 71 97 L 71 104 M 75 97 L 78 104" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );

  return (
    <motion.button
      type="button"
      onClick={handleTap}
      whileTap={{ scale: 0.92 }}
      animate={
        state === 'hit'
          ? { x: [0, -8, 8, -5, 5, 0], rotate: [0, -7, 7, -4, 0], scale: [1, 0.9, 1.06, 1] }
          : tauntBurst > 0
            ? { scale: [1, 1.12, 0.95, 1] }
            : { x: 0, rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.4 }}
      aria-label="Ketuk Bos Penjaga"
      title="Ketuk Bos!"
      className={`relative w-18 h-18 sm:w-21 sm:h-21 rounded-2xl overflow-hidden border-2 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] ${
        state === 'hit'
          ? 'border-[#F87171] shadow-[0_0_20px_rgba(248,113,113,0.75)]'
          : state === 'enraged'
            ? 'border-[#FB7185] shadow-[0_0_18px_rgba(244,63,94,0.6)]'
            : 'border-[#F5C156] shadow-lg'
      } ${className}`}
    >
      {variant === 'turtle' ? renderTurtle() : renderOwl()}
    </motion.button>
  );
};
