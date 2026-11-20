import React from 'react';

interface BeachBackdropProps {
  chapterId?: number;
  paused?: boolean;
}

interface ChapterOceanTheme {
  sunInner: string;
  sunOuter: string;
  horizonFill: string;
  wave1Fill: string;
  wave1Stroke: string;
  wave2Fill: string;
  wave2Stroke: string;
  wave3Fill: string;
  shoreTop: string;
  shoreBottom: string;
  floraFill: string;
  fishColor: string;
}

const CHAPTER_OCEAN_THEMES: Record<number, ChapterOceanTheme> = {
  // Bab 0: Sunny Tropical Aqua Lagoon
  0: {
    sunInner: '#FEF08A',
    sunOuter: '#FDE047',
    horizonFill: '#22A7D9',
    wave1Fill: '#0EA5E9',
    wave1Stroke: '#E0F7FF',
    wave2Fill: '#38BDF8',
    wave2Stroke: '#FFFFFF',
    wave3Fill: '#7DD3FC',
    shoreTop: '#F9E0AC',
    shoreBottom: '#F3CE89',
    floraFill: '#0D9488',
    fishColor: '#FB923C',
  },
  // Bab 1: Cerulean Pirate Cove
  1: {
    sunInner: '#FDE047',
    sunOuter: '#F59E0B',
    horizonFill: '#0284C7',
    wave1Fill: '#0369A1',
    wave1Stroke: '#BAE6FD',
    wave2Fill: '#0EA5E9',
    wave2Stroke: '#FEF9C3',
    wave3Fill: '#38BDF8',
    shoreTop: '#F1D499',
    shoreBottom: '#E0BA74',
    floraFill: '#0F766E',
    fishColor: '#FBBF24',
  },
  // Bab 2: Seafoam Turquoise Treasure Bay
  2: {
    sunInner: '#CCFBF1',
    sunOuter: '#5EEAD4',
    horizonFill: '#0891B2',
    wave1Fill: '#0E7490',
    wave1Stroke: '#CCFBF1',
    wave2Fill: '#06B6D4',
    wave2Stroke: '#FFFFFF',
    wave3Fill: '#2DD4BF',
    shoreTop: '#164E63',
    shoreBottom: '#083344',
    floraFill: '#14B8A6',
    fishColor: '#FDE047',
  },
  // Bab 3: Calm Sapphire Misty Lagoon
  3: {
    sunInner: '#E0E7FF',
    sunOuter: '#93C5FD',
    horizonFill: '#3B82F6',
    wave1Fill: '#2563EB',
    wave1Stroke: '#DBEAFE',
    wave2Fill: '#60A5FA',
    wave2Stroke: '#EFF6FF',
    wave3Fill: '#93C5FD',
    shoreTop: '#1D4ED8',
    shoreBottom: '#1E3A8A',
    floraFill: '#1E40AF',
    fishColor: '#BAE6FD',
  },
  // Bab 4: Royal Steel-Cobalt Reef
  4: {
    sunInner: '#BAE6FD',
    sunOuter: '#60A5FA',
    horizonFill: '#1D4ED8',
    wave1Fill: '#1E40AF',
    wave1Stroke: '#93C5FD',
    wave2Fill: '#2563EB',
    wave2Stroke: '#E0F2FE',
    wave3Fill: '#38BDF8',
    shoreTop: '#172554',
    shoreBottom: '#0F172A',
    floraFill: '#0284C7',
    fishColor: '#7DD3FC',
  },
  // Bab 5: Twilight Indigo-Sapphire Cosmic Sea
  5: {
    sunInner: '#C7D2FE',
    sunOuter: '#818CF8',
    horizonFill: '#4338CA',
    wave1Fill: '#3730A3',
    wave1Stroke: '#A5B4FC',
    wave2Fill: '#4F46E5',
    wave2Stroke: '#E0E7FF',
    wave3Fill: '#0EA5E9',
    shoreTop: '#1E1B4B',
    shoreBottom: '#0F172A',
    floraFill: '#312E81',
    fishColor: '#67E8F9',
  },
};

/**
 * Lightweight animated ocean wallpaper with per-chapter blue-theory palettes.
 * Uses pure GPU SVG transforms (no CSS blur filters or box-shadow animations)
 * so low-end devices like MediaTek Helio P35 stay consistently 60fps.
 */
export const BeachBackdrop: React.FC<BeachBackdropProps> = React.memo(
  ({ chapterId = 0, paused = false }) => {
    const theme = CHAPTER_OCEAN_THEMES[chapterId] ?? CHAPTER_OCEAN_THEMES[0];

    return (
      <div
        className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none ${
          paused ? 'backdrop-paused' : ''
        }`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id={`oceanSun-${chapterId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.sunInner} stopOpacity="0.82" />
              <stop offset="55%" stopColor={theme.sunOuter} stopOpacity="0.32" />
              <stop offset="100%" stopColor={theme.sunOuter} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Warm Crisp Sun / Moon Halo (no blur filter needed) */}
          <circle cx="1260" cy="110" r="145" fill={`url(#oceanSun-${chapterId})`} />

          {/* Chapter-Specific Atmospheric Sky Accents */}
          {chapterId === 1 && (
            <g opacity="0.22" fill="#FEF08A">
              <polygon points="1260,110 920,560 1040,560" />
              <polygon points="1260,110 1120,560 1240,560" />
            </g>
          )}

          {chapterId === 5 && (
            <g fill="#E0E7FF">
              <circle cx="220" cy="95" r="2.8" opacity="0.7" />
              <circle cx="430" cy="64" r="2.2" opacity="0.55" />
              <circle cx="760" cy="115" r="3" opacity="0.65" />
              <circle cx="960" cy="72" r="2.4" opacity="0.6" />
              <circle cx="1110" cy="185" r="2.6" opacity="0.5" />
            </g>
          )}

          {/* Soft Drifting Clouds */}
          <g className="anime-cloud-drift" fill="#FFFFFF" opacity={chapterId === 5 ? 0.32 : 0.56}>
            <ellipse cx="190" cy="110" rx="68" ry="22" />
            <ellipse cx="230" cy="98" rx="44" ry="20" />
            <ellipse cx="155" cy="104" rx="34" ry="16" />

            <ellipse cx="1060" cy="145" rx="74" ry="22" />
            <ellipse cx="1105" cy="131" rx="44" ry="19" />
            <ellipse cx="1020" cy="139" rx="34" ry="15" />

            <ellipse cx="640" cy="86" rx="54" ry="16" opacity="0.7" />
            <ellipse cx="672" cy="78" rx="32" ry="14" opacity="0.7" />
          </g>

          {/* Bab 1 Distant Pirate Arch Silhouette */}
          {chapterId === 1 && (
            <path
              d="M 1180 570 C 1200 480, 1295 475, 1320 570 L 1280 570 C 1272 528, 1230 528, 1222 570 Z"
              fill="#0369A1"
              opacity="0.22"
            />
          )}

          {/* Bab 3 Misty Lagoon Veil */}
          {chapterId === 3 && (
            <ellipse cx="720" cy="545" rx="620" ry="34" fill="#EFF6FF" opacity="0.28" />
          )}

          {/* Distant Ocean Horizon */}
          <path
            d="M 0 560 Q 360 538, 720 560 T 1440 555 L 1440 900 L 0 900 Z"
            fill={theme.horizonFill}
            opacity="0.34"
          />

          {/* Swimming Ocean Wildlife & Bubbles Layer */}
          <g className="anime-ocean-swim" opacity="0.45">
            <path
              d="M 220 658 C 236 644, 260 644, 274 658 C 260 672, 236 672, 220 658 Z"
              fill={theme.fishColor}
            />
            <polygon points="222,658 206,648 210,658 206,668" fill={theme.fishColor} />
            <circle cx="262" cy="655" r="2.2" fill="#0D354C" />
            <circle cx="286" cy="642" r="3" fill="#FFFFFF" opacity="0.7" />
          </g>

          {/* Animated Ocean Wave Layer 1 */}
          <g className="anime-wave-slow">
            <path
              d="M -60 622 Q 180 592, 420 622 T 900 622 T 1500 622 L 1500 900 L -60 900 Z"
              fill={theme.wave1Fill}
              opacity="0.36"
            />
            <path
              d="M -60 622 Q 180 592, 420 622 T 900 622 T 1500 622"
              fill="none"
              stroke={theme.wave1Stroke}
              strokeWidth="4.5"
              opacity="0.58"
            />
          </g>

          {/* Animated Ocean Wave Layer 2 + Sea Foam */}
          <g className="anime-wave-mid">
            <path
              d="M -80 698 Q 200 668, 480 698 T 1040 698 T 1520 698 L 1520 900 L -80 900 Z"
              fill={theme.wave2Fill}
              opacity="0.44"
            />
            <path
              d="M -80 698 Q 200 668, 480 698 T 1040 698 T 1520 698"
              fill="none"
              stroke={theme.wave2Stroke}
              strokeWidth="5.5"
              opacity="0.7"
            />
          </g>

          {/* Animated Ocean Wave Crest Layer 3 */}
          <g className="anime-wave-crest">
            <path
              d="M -60 756 Q 190 732, 430 756 T 940 756 T 1500 756 L 1500 900 L -60 900 Z"
              fill={theme.wave3Fill}
              opacity="0.32"
            />
          </g>

          {/* Chapter Floor: Sandy Beach (Bab 0-1) or Reef/Abyss Shelf (Bab 2-5) */}
          <path
            d="M 0 794 Q 380 752, 760 786 T 1440 768 L 1440 900 L 0 900 Z"
            fill={theme.shoreTop}
          />
          <path
            d="M 0 824 Q 440 788, 860 820 T 1440 800 L 1440 900 L 0 900 Z"
            fill={theme.shoreBottom}
            opacity="0.82"
          />

          {/* Bab 0 & 1 Cute Beach Starfish & Seashell */}
          {(chapterId === 0 || chapterId === 1) && (
            <g opacity="0.65">
              <path
                d="M 118 836 L 123 848 L 136 849 L 126 857 L 129 870 L 118 862 L 107 870 L 110 857 L 100 849 L 113 848 Z"
                fill="#FB7185"
              />
              <path
                d="M 1315 842 C 1315 824, 1345 824, 1345 842 C 1340 850, 1320 850, 1315 842 Z"
                fill="#FDBA74"
              />
              <path
                d="M 1330 828 L 1330 848 M 1322 832 L 1326 848 M 1338 832 L 1334 848"
                stroke="#FFF7ED"
                strokeWidth="1.8"
              />
            </g>
          )}

          {/* Bab 2-5 Sparkling Treasure Coins / Glowing Reef Orbs */}
          {chapterId >= 2 && (
            <g opacity="0.55">
              <circle
                cx="140"
                cy="842"
                r="7"
                fill={chapterId === 2 ? '#FDE047' : chapterId === 5 ? '#67E8F9' : '#93C5FD'}
              />
              <circle
                cx="172"
                cy="856"
                r="4.5"
                fill={chapterId === 2 ? '#FBBF24' : '#E0F2FE'}
              />
              <circle
                cx="1310"
                cy="838"
                r="6.5"
                fill={chapterId === 2 ? '#FDE047' : chapterId === 5 ? '#A5B4FC' : '#7DD3FC'}
              />
            </g>
          )}

          {/* Soft Coral / Palm Fronds Framing Left & Right Corners */}
          <g fill={theme.floraFill} opacity={chapterId >= 3 ? 0.22 : 0.14}>
            <path d="M -20 510 C 40 430, 120 400, 185 415 C 125 430, 75 460, 25 520 Z" />
            <path d="M -25 465 C 50 375, 135 350, 210 370 C 135 390, 75 420, 15 480 Z" />
            <path d="M 1460 500 C 1395 415, 1315 390, 1245 410 C 1310 425, 1365 455, 1415 515 Z" />
            <path d="M 1465 455 C 1390 365, 1300 345, 1225 368 C 1300 385, 1365 415, 1425 475 Z" />
          </g>
        </svg>
      </div>
    );
  }
);

BeachBackdrop.displayName = 'BeachBackdrop';
