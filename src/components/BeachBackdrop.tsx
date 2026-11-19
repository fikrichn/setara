import React from 'react';

/**
 * Lightweight, soothing kid-friendly tropical ocean, clouds, palm silhouettes & sandy beach backdrop.
 * Pure GPU SVG positioned softly behind the UI so content stays crisp and comfortable on the eyes.
 */
export const BeachBackdrop: React.FC = () => {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Warm Soft Sun Glow */}
      <div className="absolute -top-10 right-8 sm:right-20 w-36 h-36 sm:w-48 sm:h-48 rounded-full bg-[#FEF08A]/55 blur-2xl" />
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Soft Puffy Clouds */}
        <g fill="#FFFFFF" opacity="0.58">
          <ellipse cx="190" cy="110" rx="68" ry="22" />
          <ellipse cx="230" cy="98" rx="44" ry="20" />
          <ellipse cx="155" cy="104" rx="34" ry="16" />

          <ellipse cx="1090" cy="140" rx="76" ry="23" />
          <ellipse cx="1135" cy="126" rx="46" ry="20" />
          <ellipse cx="1048" cy="134" rx="36" ry="15" />

          <ellipse cx="640" cy="86" rx="54" ry="16" opacity="0.65" />
          <ellipse cx="672" cy="78" rx="32" ry="14" opacity="0.65" />
        </g>

        {/* Distant Turquoise Ocean Horizon */}
        <path
          d="M 0 560 Q 360 538, 720 560 T 1440 555 L 1440 900 L 0 900 Z"
          fill="#22A7D9"
          opacity="0.34"
        />

        {/* Animated Gentle Ocean Wave 1 */}
        <g className="anime-wave-slow">
          <path
            d="M -60 630 Q 180 600, 420 630 T 900 630 T 1500 630 L 1500 900 L -60 900 Z"
            fill="#0EA5E9"
            opacity="0.35"
          />
          <path
            d="M -60 630 Q 180 600, 420 630 T 900 630 T 1500 630"
            fill="none"
            stroke="#E0F7FF"
            strokeWidth="5"
            opacity="0.6"
          />
        </g>

        {/* Animated Gentle Ocean Wave 2 + Sea Foam */}
        <g className="anime-wave-mid">
          <path
            d="M -80 712 Q 200 682, 480 712 T 1040 712 T 1520 712 L 1520 900 L -80 900 Z"
            fill="#38BDF8"
            opacity="0.42"
          />
          <path
            d="M -80 712 Q 200 682, 480 712 T 1040 712 T 1520 712"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            opacity="0.72"
          />
        </g>

        {/* Warm Golden Sandy Beach Curve */}
        <path
          d="M 0 792 Q 380 748, 760 784 T 1440 764 L 1440 900 L 0 900 Z"
          fill="#F9E0AC"
        />
        <path
          d="M 0 822 Q 440 786, 860 818 T 1440 798 L 1440 900 L 0 900 Z"
          fill="#F3CE89"
          opacity="0.75"
        />

        {/* Cute Tiny Beach Starfish & Seashells */}
        <g opacity="0.62">
          {/* Starfish left */}
          <path
            d="M 118 836 L 123 848 L 136 849 L 126 857 L 129 870 L 118 862 L 107 870 L 110 857 L 100 849 L 113 848 Z"
            fill="#FB7185"
          />
          {/* Little Shell right */}
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

        {/* Gentle Tropical Palm Fronds Framing Left & Right Corners */}
        <g fill="#0D9488" opacity="0.14">
          <path d="M -20 510 C 40 430, 120 400, 185 415 C 125 430, 75 460, 25 520 Z" />
          <path d="M -25 465 C 50 375, 135 350, 210 370 C 135 390, 75 420, 15 480 Z" />
          <path d="M 1460 500 C 1395 415, 1315 390, 1245 410 C 1310 425, 1365 455, 1415 515 Z" />
          <path d="M 1465 455 C 1390 365, 1300 345, 1225 368 C 1300 385, 1365 415, 1425 475 Z" />
        </g>
      </svg>
    </div>
  );
};
