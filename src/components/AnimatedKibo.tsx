import React, { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../game/sound';

export type KiboMood =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'oops'
  | 'giggle'
  | 'crying'
  | 'fainted';

export type KiboReaction =
  | 'none'
  | 'thinking_pose'
  | 'happy_dance'
  | 'cheer_jump'
  | 'pirate_salute'
  | 'treasure_sparkle'
  | 'bubble_blow'
  | 'surfer_wave'
  | 'cosmic_float'
  | 'fainted';

const KIBO_QUIPS = [
  'Hihi, geli! Ayo geser batunya ke seberang =!',
  'Wiuuu! Kibo siap bantu kamu taklukkan aljabar di pantai!',
  'Sirip gemoyku sudah siap tos kalau kamu menang!',
  'Ingat ya: lewat jembatan = tandanya berubah!',
  'Hiu-hiu! Kamu pasti bisa jadi jagoan pindah ruas!',
  'Chomp! Pasangan lawan kalau digabung langsung lenyap!',
];

interface AnimatedKiboProps {
  mood?: KiboMood;
  reaction?: KiboReaction;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  crown?: boolean;
  highFiveRaised?: boolean;
  interactive?: boolean;
  customQuips?: string[];
  onInteract?: (quip: string) => void;
  onPet?: () => void;
  className?: string;
}

export const AnimatedKibo: React.FC<AnimatedKiboProps> = ({
  mood = 'idle',
  reaction = 'none',
  size = 'md',
  crown = false,
  highFiveRaised = false,
  interactive = true,
  customQuips,
  onInteract,
  onPet,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const [petCount, setPetCount] = useState(0);
  const [isGiggling, setIsGiggling] = useState(false);
  const timerRef = useRef<number | null>(null);
  const quipIdxRef = useRef(0);

  useEffect(() => {
    quipIdxRef.current = 0;
  }, [customQuips]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const isCrying = mood === 'crying';
  const isFainted = !isCrying && (mood === 'fainted' || reaction === 'fainted');
  const activeReaction: KiboReaction = isCrying ? 'none' : isFainted ? 'fainted' : reaction;
  const activeMood: KiboMood = isCrying
    ? 'crying'
    : isFainted
      ? 'fainted'
      : isGiggling
        ? 'giggle'
        : activeReaction === 'thinking_pose'
          ? 'thinking'
          : activeReaction === 'cheer_jump' || activeReaction === 'treasure_sparkle'
            ? 'excited'
            : activeReaction === 'happy_dance' || activeReaction === 'surfer_wave'
              ? 'happy'
              : mood;

  const fastTail =
    !isCrying &&
    !isFainted &&
    (activeMood === 'happy' ||
      activeMood === 'excited' ||
      activeMood === 'giggle' ||
      activeReaction === 'happy_dance' ||
      activeReaction === 'cheer_jump' ||
      activeReaction === 'surfer_wave' ||
      highFiveRaised);

  const sizeClass =
    size === 'sm'
      ? 'w-12 h-12 rounded-xl'
      : size === 'lg'
        ? 'w-22 h-22 sm:w-25 sm:h-25 rounded-2xl'
        : size === 'xl'
          ? 'w-44 h-44 sm:w-48 sm:h-48 rounded-3xl'
          : 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl';

  const handlePet = () => {
    if (!interactive || isCrying) return;
    sound.playKiboGiggle();
    setPetCount((c) => c + 1);
    setIsGiggling(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIsGiggling(false), 1100);
    onPet?.();

    const pool = customQuips && customQuips.length > 0 ? customQuips : KIBO_QUIPS;
    const quip = pool[quipIdxRef.current % pool.length];
    quipIdxRef.current += 1;
    onInteract?.(quip);
  };

  const renderSvg = () => (
    <svg
      viewBox="0 0 120 120"
      className="w-full h-full overflow-visible select-none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`kiboBg-${uid}`} cx="50%" cy="30%" r="72%">
          <stop offset="0%" stopColor={isCrying ? '#7DD3FC' : '#BAE6FD'} />
          <stop offset="68%" stopColor={isCrying ? '#38BDF8' : '#38BDF8'} />
          <stop offset="100%" stopColor={isCrying ? '#0369A1' : '#0284C7'} />
        </radialGradient>
        <linearGradient id={`kiboBody-${uid}`} x1="20%" y1="10%" x2="80%" y2="95%">
          <stop offset="0%" stopColor="#72E5FF" />
          <stop offset="52%" stopColor="#35B2E0" />
          <stop offset="100%" stopColor="#1E7FB3" />
        </linearGradient>
        <linearGradient id={`kiboBelly-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0F7FF" />
        </linearGradient>
        <linearGradient id={`kiboGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* Sunny Beach / Cosmic Lagoon Backdrop */}
      <rect x="0" y="0" width="120" height="120" rx="24" fill={`url(#kiboBg-${uid})`} />
      {activeReaction === 'cosmic_float' && (
        <rect x="0" y="0" width="120" height="120" rx="24" fill="#3B0764" opacity="0.58" />
      )}
      {/* Warm Sand Strip at bottom */}
      <path d="M 0 96 Q 60 88, 120 96 L 120 120 L 0 120 Z" fill="#FDE6A8" opacity={activeReaction === 'cosmic_float' ? 0.35 : 0.92} />
      {isCrying ? (
        /* Cute little sad raincloud above Kibo when crying */
        <g opacity="0.85">
          <ellipse cx="92" cy="19" rx="14" ry="7" fill="#94A3B8" />
          <ellipse cx="86" cy="16" rx="9" ry="6" fill="#CBD5E1" />
          <ellipse cx="97" cy="17" rx="8" ry="5.5" fill="#CBD5E1" />
        </g>
      ) : isFainted ? (
        /* Fainted Dizzy Orbiting Stars & Zzz above Kibo */
        <g>
          <g className="anime-kibo-dizzy" style={{ transformOrigin: '60px 21px' }}>
            <ellipse cx="60" cy="21" rx="22" ry="6.5" fill="none" stroke="#FEF08A" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.85" />
            <path d="M 38 17 L 39.5 20.5 L 43 22 L 39.5 23.5 L 38 27 L 36.5 23.5 L 33 22 L 36.5 20.5 Z" fill="#FDE047" />
            <path d="M 82 15 L 83.2 18 L 86.2 19.2 L 83.2 20.4 L 82 23.4 L 80.8 20.4 L 77.8 19.2 L 80.8 18 Z" fill="#FBBF24" />
          </g>
          <text x="90" y="31" fill="#FFFFFF" fontSize="12" fontWeight="900" fontFamily="sans-serif" className="anime-kibo-zzz">
            Zzz
          </text>
        </g>
      ) : activeReaction === 'cosmic_float' ? (
        <g>
          <circle cx="22" cy="22" r="2.8" fill="#F0ABFC" className="anime-gold-glint" />
          <circle cx="96" cy="20" r="3.2" fill="#22D3EE" className="anime-gold-glint" />
          <circle cx="98" cy="76" r="2.5" fill="#FEF08A" className="anime-gold-glint" />
          <circle cx="20" cy="74" r="2.3" fill="#22D3EE" className="anime-gold-glint" />
        </g>
      ) : (
        <>
          <circle cx="24" cy="24" r="5" fill="#FFFFFF" opacity="0.45" />
          <circle cx="96" cy="24" r="7" fill="#FEF08A" opacity="0.65" />
        </>
      )}

      {/* Ground Shadow */}
      <ellipse
        cx={isFainted ? 62 : 58}
        cy="107"
        rx={isFainted ? 38 : activeReaction === 'cosmic_float' || activeReaction === 'cheer_jump' ? 22 : 30}
        ry="6"
        fill="#0C4A6E"
        opacity={isFainted ? 0.34 : 0.28}
      />

      {/* Main Character Group (tips sideways onto sand when fainted!) */}
      <g
        style={
          isFainted
            ? {
                transform: 'translate(6px, 18px) rotate(-28deg)',
                transformOrigin: '60px 82px',
              }
            : undefined
        }
      >
        {/* Animated Wagging Tail Fin (droops gently when crying or fainted) */}
        <g
          className={isCrying || isFainted ? '' : fastTail ? 'anime-kibo-tail-fast' : 'anime-kibo-tail'}
          style={
            isCrying || isFainted
              ? { transform: 'rotate(20deg)', transformBox: 'fill-box', transformOrigin: 'left center' }
              : undefined
          }
        >
          <path
            d="M 85 75 C 98 70, 108 58, 112 52 C 110 64, 106 72, 102 77 C 107 82, 111 89, 112 96 C 103 91, 95 85, 84 82 Z"
            fill={`url(#kiboBody-${uid})`}
            stroke="#0F2D3A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Stubby Gemoy Feet */}
        <g className={isCrying || isFainted ? '' : 'anime-foot-l'}>
          <path
            d="M 41 90 C 37 97, 36 105, 45 106 C 53 106, 54 98, 52 90 Z"
            fill="#2692C4"
            stroke="#0F2D3A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <ellipse cx="45" cy="102.5" rx="4.5" ry="2.2" fill="#D7F3FA" opacity="0.85" />
        </g>
        <g className={isCrying || isFainted ? '' : 'anime-foot-r'}>
          <path
            d="M 67 90 C 65 98, 66 106, 74 106 C 83 105, 82 97, 78 90 Z"
            fill="#2692C4"
            stroke="#0F2D3A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <ellipse cx="74" cy="102.5" rx="4.5" ry="2.2" fill="#D7F3FA" opacity="0.85" />
        </g>

        {/* Breathing / Sobbing Chubby Main Body Group */}
        <g className={isCrying ? 'anime-kibo-sob' : isFainted ? '' : 'anime-kibo-breathe'}>
        {/* Top Dorsal Fin */}
        <path
          d="M 52 28 C 54 13, 68 11, 74 22 C 70 24, 67 28, 67 32 Z"
          fill={`url(#kiboBody-${uid})`}
          stroke="#0F2D3A"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Optional Victory Crown */}
        {crown && !isCrying && (
          <g className="anime-crown-sway">
            <path
              d="M 43 26 L 40 12 L 51 19 L 59 8 L 67 19 L 78 12 L 75 26 Z"
              fill={`url(#kiboGold-${uid})`}
              stroke="#78350F"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <circle cx="59" cy="18" r="2.6" fill="#EF4444" />
            <circle cx="48" cy="21" r="2" fill="#2DD4BF" />
            <circle cx="70" cy="21" r="2" fill="#2DD4BF" />
          </g>
        )}

        {/* Chubby Round Shark Body */}
        <path
          d="M 25 65 C 24 38, 41 25, 59 25 C 79 25, 93 40, 92 66 C 91 86, 78 96, 59 96 C 39 96, 26 86, 25 65 Z"
          fill={`url(#kiboBody-${uid})`}
          stroke="#0F2D3A"
          strokeWidth="3.4"
        />

        {/* Top Specular Gloss Highlight */}
        <path
          d="M 38 35 C 45 29, 58 28, 67 31"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Cream-White Plump Belly Patch */}
        <path
          d="M 35 67 C 35 55, 46 50, 59 50 C 72 50, 82 56, 82 68 C 82 84, 72 93, 59 93 C 45 93, 35 84, 35 67 Z"
          fill={`url(#kiboBelly-${uid})`}
        />

        {/* Explorer Scarf + Golden '=' Medallion */}
        <path
          d="M 34 69 Q 59 78 83 69 Q 81 76 59 81 Q 37 76 34 69 Z"
          fill="#F59E0B"
          stroke="#78350F"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="59" cy="79" r="6.5" fill={`url(#kiboGold-${uid})`} stroke="#78350F" strokeWidth="2" />
        <line x1="55.8" y1="77.4" x2="62.2" y2="77.4" stroke="#11241E" strokeWidth="1.9" strokeLinecap="round" />
        <line x1="55.8" y1="80.6" x2="62.2" y2="80.6" stroke="#11241E" strokeWidth="1.9" strokeLinecap="round" />

        {/* Cute Side Gills */}
        <g stroke="#13506E" strokeWidth="2" strokeLinecap="round" opacity="0.65">
          <path d="M 30 58 Q 28 62 30 66" fill="none" />
          <path d="M 34 59 Q 32 62.5 34 66" fill="none" />
        </g>

        {/* Left Pectoral Fin (adapts to crying, fainted, cheer_jump, happy_dance, pirate_salute!) */}
        <g
          className={
            isCrying ||
            isFainted ||
            activeReaction === 'cheer_jump' ||
            activeReaction === 'pirate_salute'
              ? ''
              : 'anime-kibo-fin-l'
          }
          style={
            isCrying
              ? { transform: 'rotate(42deg) translateY(-4px)', transformBox: 'fill-box', transformOrigin: 'right top' }
              : isFainted
                ? { transform: 'rotate(-26deg) translateY(6px)', transformBox: 'fill-box', transformOrigin: 'right top' }
                : activeReaction === 'cheer_jump'
                  ? { transform: 'rotate(54deg) translateY(-6px)', transformBox: 'fill-box', transformOrigin: 'right top' }
                  : activeReaction === 'pirate_salute'
                    ? { transform: 'rotate(62deg) translate(3px, -11px)', transformBox: 'fill-box', transformOrigin: 'right top' }
                    : undefined
          }
        >
          <path
            d="M 28 67 C 16 68, 12 77, 17 83 C 23 86, 30 81, 33 75 Z"
            fill={`url(#kiboBody-${uid})`}
            stroke="#0F2D3A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>

        {/* Right Pectoral Fin (chin-scratch on thinking_pose, raised on cheer/highFive, droopy on fainted!) */}
        <g
          className={
            highFiveRaised ||
            isCrying ||
            isFainted ||
            activeReaction === 'thinking_pose' ||
            activeReaction === 'cheer_jump'
              ? ''
              : 'anime-kibo-fin-r'
          }
          style={
            (highFiveRaised || activeReaction === 'cheer_jump') && !isCrying && !isFainted
              ? { transform: 'rotate(-58deg)', transformBox: 'fill-box', transformOrigin: 'left bottom' }
              : activeReaction === 'thinking_pose'
                ? { transform: 'rotate(-68deg) translate(-10px, -6px)', transformBox: 'fill-box', transformOrigin: 'left top' }
                : isCrying
                  ? { transform: 'rotate(-42deg) translateY(-4px)', transformBox: 'fill-box', transformOrigin: 'left top' }
                  : isFainted
                    ? { transform: 'rotate(24deg) translateY(6px)', transformBox: 'fill-box', transformOrigin: 'left top' }
                    : undefined
          }
        >
          <path
            d="M 89 67 C 101 64, 108 72, 104 79 C 99 84, 91 80, 86 75 Z"
            fill={`url(#kiboBody-${uid})`}
            stroke="#0F2D3A"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          {highFiveRaised && !isCrying && !isFainted && (
            <circle cx="101" cy="70" r="3.5" fill="#FEF08A" opacity="0.9" />
          )}
        </g>

        {/* Rosy Anime Cheeks (puffed bigger when blowing bubbles!) */}
        <ellipse
          cx="37"
          cy="56"
          rx={activeReaction === 'bubble_blow' ? 7 : 5.5}
          ry={activeReaction === 'bubble_blow' ? 4.4 : 3.2}
          fill="#FB7185"
          opacity={
            activeMood === 'giggle' ||
            activeMood === 'excited' ||
            isCrying ||
            activeReaction === 'happy_dance' ||
            activeReaction === 'bubble_blow'
              ? 0.82
              : isFainted
                ? 0.35
                : 0.55
          }
        />
        <ellipse
          cx="81"
          cy="56"
          rx={activeReaction === 'bubble_blow' ? 7 : 5.5}
          ry={activeReaction === 'bubble_blow' ? 4.4 : 3.2}
          fill="#FB7185"
          opacity={
            activeMood === 'giggle' ||
            activeMood === 'excited' ||
            isCrying ||
            activeReaction === 'happy_dance' ||
            activeReaction === 'bubble_blow'
              ? 0.82
              : isFainted
                ? 0.35
                : 0.55
          }
        />

        {/* Expressive Anime Eyes */}
        {isFainted ? (
          /* Dizzy Anime Spiral Eyes (@ @) when AFK Fainted! */
          <g fill="none" stroke="#0F2D3A" strokeWidth="2.4" strokeLinecap="round">
            <circle cx="44" cy="48" r="7.4" fill="#FFFFFF" stroke="#0F2D3A" strokeWidth="2.4" />
            <path d="M 44 48 C 44 46, 47 46, 47 48 C 47 51, 41 51, 41 47.5 C 41 44, 48 43.5, 48.5 48.5" />
            <circle cx="74" cy="48" r="7.4" fill="#FFFFFF" stroke="#0F2D3A" strokeWidth="2.4" />
            <path d="M 74 48 C 74 46, 77 46, 77 48 C 77 51, 71 51, 71 47.5 C 71 44, 78 43.5, 78.5 48.5" />
          </g>
        ) : isCrying ? (
          <g>
            {/* Sad drooping eyebrows */}
            <path d="M 36 39 Q 43 37 49 41" fill="none" stroke="#0F2D3A" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M 82 39 Q 75 37 69 41" fill="none" stroke="#0F2D3A" strokeWidth="2.4" strokeLinecap="round" />
            {/* Big watery shimmering anime eyes */}
            <circle cx="44" cy="48" r="7.8" fill="#0D2230" />
            <circle cx="74" cy="48" r="7.8" fill="#0D2230" />
            {/* Shimmering watery tear pools at bottom of eyes */}
            <ellipse cx="44" cy="52" rx="6" ry="3.2" fill="#7DD3FC" opacity="0.95" />
            <ellipse cx="74" cy="52" rx="6" ry="3.2" fill="#7DD3FC" opacity="0.95" />
            <circle cx="41.5" cy="45" r="3" fill="#FFFFFF" />
            <circle cx="71.5" cy="45" r="3" fill="#FFFFFF" />
            <circle cx="46.5" cy="50.5" r="1.6" fill="#FFFFFF" />
            <circle cx="76.5" cy="50.5" r="1.6" fill="#FFFFFF" />

            {/* Streaming Teardrop Ribbons */}
            <path
              d="M 39 54 C 37 62, 36 72, 38 79"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d="M 79 54 C 81 62, 82 72, 80 79"
              fill="none"
              stroke="#7DD3FC"
              strokeWidth="4.2"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Animated Falling Blue Teardrops */}
            <g className="anime-tear-l">
              <path
                d="M 37 56 C 40 61, 40 65, 37 65 C 34 65, 34 61, 37 56 Z"
                fill="#38BDF8"
                stroke="#E0F2FE"
                strokeWidth="1.2"
              />
            </g>
            <g className="anime-tear-r">
              <path
                d="M 81 56 C 84 61, 84 65, 81 65 C 78 65, 78 61, 81 56 Z"
                fill="#38BDF8"
                stroke="#E0F2FE"
                strokeWidth="1.2"
              />
            </g>
          </g>
        ) : activeReaction === 'pirate_salute' ? (
          /* Confident Pirate Wink Eye! */
          <g>
            <path d="M 38 45 L 48 48 L 38 51" fill="none" stroke="#0F2D3A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="74" cy="47" r="7.2" fill="#0D2230" />
            <ellipse cx="74" cy="50.5" rx="4.2" ry="2.2" fill="#2DD4BF" opacity="0.85" />
            <circle cx="71.8" cy="44.3" r="2.8" fill="#FFFFFF" />
          </g>
        ) : activeMood === 'giggle' || activeReaction === 'happy_dance' ? (
          <g stroke="#0F2D3A" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M 38 49 Q 44 41 50 49" />
            <path d="M 68 49 Q 74 41 80 49" />
          </g>
        ) : activeMood === 'excited' || activeReaction === 'treasure_sparkle' || activeReaction === 'cheer_jump' ? (
          <g>
            <circle cx="44" cy="47" r="7.5" fill="#0D2230" />
            <circle cx="74" cy="47" r="7.5" fill="#0D2230" />
            <path d="M 44 41 L 45.8 45.2 L 50 47 L 45.8 48.8 L 44 53 L 42.2 48.8 L 38 47 L 42.2 45.2 Z" fill="#FEF08A" />
            <path d="M 74 41 L 75.8 45.2 L 80 47 L 75.8 48.8 L 74 53 L 72.2 48.8 L 68 47 L 72.2 45.2 Z" fill="#FEF08A" />
            <circle cx="47.5" cy="43.5" r="1.8" fill="#FFFFFF" />
            <circle cx="77.5" cy="43.5" r="1.8" fill="#FFFFFF" />
          </g>
        ) : activeMood === 'oops' ? (
          <g>
            <circle cx="44" cy="47" r="7.5" fill="#FFFFFF" stroke="#0F2D3A" strokeWidth="2.6" />
            <circle cx="74" cy="47" r="7.5" fill="#FFFFFF" stroke="#0F2D3A" strokeWidth="2.6" />
            <circle cx="44" cy="47" r="3" fill="#0F2D3A" />
            <circle cx="74" cy="47" r="3" fill="#0F2D3A" />
            <path
              d="M 85 33 C 89 39, 89 44, 85 44 C 81 44, 81 39, 85 33 Z"
              fill="#7DD3FC"
              stroke="#0369A1"
              strokeWidth="1.5"
            />
          </g>
        ) : (
          <g className="anime-eye-blink">
            <circle cx="44" cy="47" r="7.2" fill="#0D2230" />
            <circle cx="74" cy="47" r="7.2" fill="#0D2230" />
            <ellipse cx="44" cy="50.5" rx="4.2" ry="2.2" fill="#2DD4BF" opacity="0.85" />
            <ellipse cx="74" cy="50.5" rx="4.2" ry="2.2" fill="#2DD4BF" opacity="0.85" />
            <circle
              cx={activeMood === 'thinking' ? 46.2 : 41.8}
              cy={activeMood === 'thinking' ? 44 : 44.3}
              r="2.8"
              fill="#FFFFFF"
            />
            <circle
              cx={activeMood === 'thinking' ? 76.2 : 71.8}
              cy={activeMood === 'thinking' ? 44 : 44.3}
              r="2.8"
              fill="#FFFFFF"
            />
            <circle cx="46.5" cy="49" r="1.2" fill="#FFFFFF" />
            <circle cx="76.5" cy="49" r="1.2" fill="#FFFFFF" />
          </g>
        )}

        {/* Expressive Mouth */}
        {isFainted ? (
          <g>
            {/* Wobbly knocked-out mouth with cute little tongue sticking out */}
            <path d="M 50 60 Q 59 57 68 60" fill="none" stroke="#0F2D3A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 55 59.5 C 55 67, 63 67, 63 59.5 Z" fill="#FB7185" stroke="#0F2D3A" strokeWidth="1.8" />
          </g>
        ) : isCrying ? (
          <g>
            {/* Wobbly crying open pout mouth */}
            <path
              d="M 49 64 Q 59 54 69 64 Q 59 67 49 64 Z"
              fill="#9F1239"
              stroke="#0F2D3A"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            <ellipse cx="59" cy="63.5" rx="4.5" ry="2" fill="#FB7185" />
          </g>
        ) : activeReaction === 'bubble_blow' ? (
          /* Cute puffed 'o' mouth blowing ocean bubbles */
          <g>
            <circle cx="59" cy="60" r="3.6" fill="#9F1239" stroke="#0F2D3A" strokeWidth="2.2" />
            <circle cx="73" cy="54" r="3.4" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" opacity="0.9" className="anime-bubble-rise" />
            <circle cx="84" cy="42" r="5" fill="#E0F2FE" stroke="#7DD3FC" strokeWidth="1.6" opacity="0.85" className="anime-bubble-rise" style={{ animationDelay: '0.35s' }} />
            <circle cx="94" cy="28" r="3.8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.4" opacity="0.8" className="anime-bubble-rise" style={{ animationDelay: '0.7s' }} />
          </g>
        ) : activeMood === 'oops' ? (
          <path
            d="M 52 60 Q 55.5 57 59 60 Q 62.5 63 66 60"
            fill="none"
            stroke="#0F2D3A"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        ) : activeMood === 'thinking' || activeReaction === 'thinking_pose' ? (
          <g>
            <ellipse cx="59" cy="60" rx="4.5" ry="3.8" fill="#0F2D3A" />
            <text
              x="86"
              y="34"
              fill="#F59E0B"
              fontSize="16"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              ?
            </text>
            {activeReaction === 'thinking_pose' && (
              <circle cx="95" cy="20" r="4" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.5" className="anime-gold-glint" />
            )}
          </g>
        ) : activeMood === 'happy' || activeMood === 'excited' || activeMood === 'giggle' ? (
          <g>
            <path
              d="M 46 56 Q 59 70 72 56 Z"
              fill="#9F1239"
              stroke="#0F2D3A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M 51 56.5 L 54 60 L 57 56.5 L 60 60 L 63 56.5 L 66 60 L 68 56.5" fill="#FFFFFF" />
            <ellipse cx="59" cy="63" rx="5.5" ry="2.6" fill="#FB7185" />
          </g>
        ) : (
          <g>
            <path
              d="M 48 56.5 Q 59 65.5 70 56.5"
              fill="none"
              stroke="#0F2D3A"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <polygon points="54,58.5 56.5,62 59,59" fill="#FFFFFF" />
            <polygon points="60,59 62.5,62 65,58.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Reaction Floating Props (Music Notes, Treasure Sparkles, Surf Splash) */}
        {activeReaction === 'happy_dance' && (
          <g className="anime-kibo-note" fontFamily="sans-serif" fontWeight="900">
            <text x="16" y="34" fill="#FEF08A" stroke="#78350F" strokeWidth="0.6" fontSize="15">♪</text>
            <text x="93" y="30" fill="#FB7185" stroke="#881337" strokeWidth="0.5" fontSize="14">♫</text>
          </g>
        )}
        {activeReaction === 'treasure_sparkle' && (
          <g>
            <path d="M 20 28 L 22.5 33 L 28 35.5 L 22.5 38 L 20 43 L 17.5 38 L 12 35.5 L 17.5 33 Z" fill="#FEF08A" className="anime-gold-glint" />
            <path d="M 98 30 L 100 34 L 104 36 L 100 38 L 98 42 L 96 38 L 92 36 L 96 34 Z" fill="#FBBF24" className="anime-gold-glint" style={{ animationDelay: '0.35s' }} />
          </g>
        )}
        {activeReaction === 'surfer_wave' && (
          <g opacity="0.88">
            <path d="M 10 92 Q 35 80 60 90 T 112 88" fill="none" stroke="#E0F2FE" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="18" cy="80" r="3" fill="#FFFFFF" />
            <circle cx="101" cy="79" r="3.2" fill="#FFFFFF" />
          </g>
        )}
        </g>
      </g>
    </svg>
  );

  const getReactionMotion = () => {
    if (isFainted) {
      return {
        animate: { y: [0, 3, 2], rotate: [0, -4, -3], scaleY: [1, 0.94, 0.96] },
        transition: { duration: 1.6, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const },
      };
    }
    if (isGiggling) {
      return {
        animate: { y: [0, -10, 0, -5, 0], scaleX: [1, 0.92, 1.08, 1], scaleY: [1, 1.1, 0.92, 1] },
        transition: { duration: 0.45, ease: 'easeOut' as const },
      };
    }
    switch (activeReaction) {
      case 'happy_dance':
        return {
          animate: {
            y: [0, -7, 0, -7, 0],
            rotate: [0, -9, 9, -8, 8, 0],
            scaleX: [1, 1.06, 0.95, 1.06, 1],
          },
          transition: { duration: 1.05, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'thinking_pose':
        return {
          animate: { rotate: [0, -7, -5, -7, 0], y: [0, -2, 0] },
          transition: { duration: 1.7, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'cheer_jump':
        return {
          animate: {
            y: [0, -13, 0, -9, 0],
            scaleX: [1, 0.93, 1.08, 0.96, 1],
            scaleY: [1, 1.11, 0.92, 1.06, 1],
          },
          transition: { duration: 0.95, repeat: Infinity, ease: 'easeOut' as const },
        };
      case 'pirate_salute':
        return {
          animate: { rotate: [0, 6, 4, 6, 0], scale: [1, 1.05, 1.03, 1] },
          transition: { duration: 1.35, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'treasure_sparkle':
        return {
          animate: { scale: [1, 1.08, 0.97, 1.07, 1], rotate: [0, -4, 4, -3, 0] },
          transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'bubble_blow':
        return {
          animate: { scaleX: [1, 1.08, 0.98, 1], scaleY: [1, 0.95, 1.03, 1] },
          transition: { duration: 1.3, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'surfer_wave':
        return {
          animate: { rotate: [-10, 9, -8, 6, -10], x: [-2.5, 2.5, -2.5] },
          transition: { duration: 1.35, repeat: Infinity, ease: 'easeInOut' as const },
        };
      case 'cosmic_float':
        return {
          animate: { y: [0, -9, -4, -10, 0], rotate: [0, 5, -5, 0] },
          transition: { duration: 1.9, repeat: Infinity, ease: 'easeInOut' as const },
        };
      default:
        return {
          animate: { y: 0, x: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1 },
          transition: { duration: 0.35, ease: 'easeOut' as const },
        };
    }
  };

  const reactionMotion = getReactionMotion();

  const floatingHearts = petCount > 0 && !isCrying && !isFainted && (
    <div key={petCount} className="pointer-events-none absolute -top-2 inset-x-0 flex justify-center gap-2 z-20">
      <span className="animate-float-heart text-[#FB7185] font-extrabold text-sm drop-shadow">♥</span>
      <span
        className="animate-float-heart text-[#F59E0B] font-extrabold text-sm drop-shadow"
        style={{ animationDelay: '90ms' }}
      >
        ✦
      </span>
    </div>
  );

  if (!interactive || isCrying) {
    return (
      <motion.div
        animate={reactionMotion.animate}
        transition={reactionMotion.transition}
        className={`relative shrink-0 ${sizeClass} border-2 border-[#F5C156]/90 shadow-lg overflow-visible flex items-center justify-center ${className}`}
      >
        <div className="w-full h-full rounded-[inherit] overflow-hidden">{renderSvg()}</div>
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={handlePet}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9, y: 2 }}
      animate={reactionMotion.animate}
      transition={reactionMotion.transition}
      aria-label={isFainted ? 'Kibo pingsan karena menunggu terlalu lama, ketuk untuk membangunkan' : 'Kibo si Hiu Gemoy'}
      className={`relative shrink-0 ${sizeClass} border-2 ${
        isFainted
          ? 'border-[#94A3B8] shadow-md'
          : activeReaction === 'cosmic_float'
            ? 'border-[#E879F9] shadow-[0_0_16px_rgba(232,121,249,0.65)]'
            : 'border-[#F5C156]/90 shadow-lg'
      } cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] ${className}`}
    >
      {floatingHearts}
      <div className="w-full h-full rounded-[inherit] overflow-hidden">{renderSvg()}</div>
    </motion.button>
  );
};
