import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../game/sound';

export type EasterEggKind = 'starfish' | 'conch' | 'pearl' | 'coral';

interface BeachEasterEggsProps {
  variant: 'lobby' | 'game' | 'map';
  chapterId?: number;
  onTriggerKibo: (quip: string) => void;
}

const EGG_OBJECTS: Array<{
  kind: EasterEggKind;
  label: string;
  quips: (chapterId: number) => string[];
  mapSpots: string[];
  lobbySpots: string[];
  gameSpots: string[];
}> = [
  {
    kind: 'starfish',
    label: 'Bintang Laut Tersembunyi',
    quips: (ch) => [
      `Cling! Kamu nemu Bintang Laut di Bab ${ch}! Kibo kasih semangat ekstra!`,
      'Yeay! Bintang Laut ini berpindah tempat sambil berkilau menyemangatimu!',
    ],
    mapSpots: [
      'bottom-3 left-4 sm:bottom-5 sm:left-8',
      'top-24 left-3 sm:top-28 sm:left-5',
      'bottom-28 right-3 sm:bottom-36 sm:right-5',
      'top-[48%] left-2 sm:left-3',
      'bottom-4 left-1/3',
    ],
    lobbySpots: [
      'bottom-24 left-3 sm:bottom-7 sm:left-6',
      'bottom-28 left-20 sm:bottom-12 sm:left-24',
      'bottom-20 left-8 sm:bottom-5 sm:left-1/4',
      'top-24 left-4 sm:top-24 sm:left-10',
    ],
    gameSpots: [
      'bottom-20 left-2 sm:bottom-4 sm:left-4',
      'bottom-28 left-4 sm:bottom-10 sm:left-14',
      'top-20 left-2 sm:top-24 sm:left-4',
    ],
  },
  {
    kind: 'conch',
    label: 'Kerang Bisikan Pantai',
    quips: () => [
      'Tink! Kerang membisikkan rahasia: menyeberangi jembatan = selalu membalik tanda!',
      'Dengar suara ombak dari kerang ini? Pelan-pelan tapi pasti, semua soal pasti tuntas!',
    ],
    mapSpots: [
      'bottom-3 right-14 sm:bottom-4 sm:right-20',
      'top-28 right-3 sm:top-32 sm:right-5',
      'bottom-14 left-3 sm:bottom-20 sm:left-4',
      'top-[62%] right-2 sm:right-4',
      'bottom-5 left-[55%]',
    ],
    lobbySpots: [
      'bottom-24 right-3 sm:bottom-7 sm:right-6',
      'bottom-28 right-16 sm:bottom-12 sm:right-24',
      'bottom-20 right-10 sm:bottom-5 sm:right-1/4',
      'top-24 right-4 sm:top-24 sm:right-10',
    ],
    gameSpots: [
      'bottom-20 right-2 sm:bottom-4 sm:right-4',
      'bottom-28 right-4 sm:bottom-10 sm:right-14',
      'top-20 right-2 sm:top-24 sm:right-4',
    ],
  },
  {
    kind: 'pearl',
    label: 'Mutiara Laut Kibo',
    quips: () => [
      'Blub-blub! Kamu menemukan Mutiara Laut favorit Kibo! Pasangan lawan saling melenyapkan!',
      'Kilau mutiara! Kalau dua angka kembar beda tanda bertemu, mereka langsung jadi 0!',
    ],
    mapSpots: [
      'top-32 right-3 sm:top-36 sm:right-6',
      'bottom-16 left-3 sm:bottom-24 sm:left-5',
      'top-[52%] right-2.5 sm:right-4',
      'bottom-3 left-20 sm:bottom-4 sm:left-28',
      'top-[34%] left-2.5 sm:left-4',
    ],
    lobbySpots: [
      'top-20 left-3 sm:top-22 sm:left-8',
      'top-28 left-12 sm:top-32 sm:left-20',
      'bottom-32 left-4 sm:bottom-16 sm:left-10',
      'top-24 left-[42%]',
    ],
    gameSpots: [
      'top-18 left-2 sm:top-22 sm:left-5 hidden sm:inline-flex',
      'bottom-12 left-10 sm:bottom-14 sm:left-20 hidden sm:inline-flex',
      'top-36 left-3 hidden sm:inline-flex',
    ],
  },
  {
    kind: 'coral',
    label: 'Koral Mini Pantai',
    quips: (ch) => [
      `Hore! Kibo joget senang lihat kamu menemukan Koral Rahasia di Bab ${ch}!`,
      'Wuuush! Koral laut menjaga keseimbangan ruas kiri dan kanan timbangan!',
    ],
    mapSpots: [
      'bottom-4 right-3 sm:bottom-6 sm:right-6',
      'top-[42%] left-2 sm:left-4',
      'top-24 right-14 sm:top-26 sm:right-24',
      'bottom-24 right-3 sm:bottom-28 sm:right-5',
      'bottom-3 left-[42%]',
    ],
    lobbySpots: [
      'top-20 right-3 sm:top-22 sm:right-8',
      'top-28 right-12 sm:top-32 sm:right-20',
      'bottom-32 right-4 sm:bottom-16 sm:right-10',
      'bottom-10 left-[46%]',
    ],
    gameSpots: [
      'top-18 right-2 sm:top-22 sm:right-5 hidden sm:inline-flex',
      'bottom-12 right-10 sm:bottom-14 sm:right-20 hidden sm:inline-flex',
      'top-36 right-3 hidden sm:inline-flex',
    ],
  },
];

function renderEggSvg(kind: EasterEggKind) {
  if (kind === 'starfish') {
    return (
      <svg viewBox="0 0 36 36" className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" fill="none" aria-hidden="true">
        <path
          d="M18 3.5 L21.8 12.2 L31.2 13.1 L24 19.3 L26.2 28.5 L18 23.6 L9.8 28.5 L12 19.3 L4.8 13.1 L14.2 12.2 Z"
          fill="#FBBF24"
          stroke="#B45309"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="15.5" cy="16.5" r="1.2" fill="#78350F" />
        <circle cx="20.5" cy="16.5" r="1.2" fill="#78350F" />
        <path d="M16 19.5 Q18 21 20 19.5" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'conch') {
    return (
      <svg viewBox="0 0 36 36" className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" fill="none" aria-hidden="true">
        <path
          d="M18 6 C10 6 5.5 12 7 20 L11 28 H25 L29 20 C30.5 12 26 6 18 6 Z"
          fill="#FDBA74"
          stroke="#C2410C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M18 6 V28 M12 8.5 L14.5 28 M24 8.5 L21.5 28" stroke="#EA580C" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'pearl') {
    return (
      <svg viewBox="0 0 36 36" className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" fill="none" aria-hidden="true">
        <path
          d="M6 21 C6 13 11.5 8 18 8 C24.5 8 30 13 30 21 C26 24 10 24 6 21 Z"
          fill="#7DD3FC"
          stroke="#0369A1"
          strokeWidth="2"
        />
        <circle cx="18" cy="19" r="5.5" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.8" />
        <circle cx="16.2" cy="17.2" r="1.5" fill="#FFFFFF" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" fill="none" aria-hidden="true">
      <path
        d="M18 30 V16 M18 22 C13 20 10 16 10 11 M18 19 C23 17 26 13 26 9 M18 16 C16 11 16 8 18 5"
        stroke="#FB7185"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M18 30 V16 M18 22 C13 20 10 16 10 11 M18 19 C23 17 26 13 26 9 M18 16 C16 11 16 8 18 5"
        stroke="#FFE4E6"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const BeachEasterEggs: React.FC<BeachEasterEggsProps> = ({
  variant,
  chapterId = 0,
  onTriggerKibo,
}) => {
  const [poppingKind, setPoppingKind] = useState<EasterEggKind | null>(null);
  const [spotSteps, setSpotSteps] = useState<Record<EasterEggKind, number>>({
    starfish: 0,
    conch: 0,
    pearl: 0,
    coral: 0,
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleTap = (obj: (typeof EGG_OBJECTS)[number]) => {
    if (obj.kind === 'starfish') sound.playCombine();
    else if (obj.kind === 'conch') sound.playTranspose();
    else if (obj.kind === 'pearl') sound.playExpand();
    else sound.playKiboGiggle();

    setPoppingKind(obj.kind);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setPoppingKind(null);
      setSpotSteps((prev) => ({
        ...prev,
        [obj.kind]: prev[obj.kind] + 1,
      }));
    }, 320);

    const pool = obj.quips(chapterId);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    onTriggerKibo(chosen);
  };

  const renderButtons = (zClass: string) =>
    EGG_OBJECTS.map((obj, idx) => {
      const spots =
        variant === 'map' ? obj.mapSpots : variant === 'lobby' ? obj.lobbySpots : obj.gameSpots;
      const step = spotSteps[obj.kind] ?? 0;
      const pos = spots[(chapterId + idx + step) % spots.length];
      const isPopping = poppingKind === obj.kind;
      return (
        <button
          key={obj.kind}
          type="button"
          onClick={() => handleTap(obj)}
          title={obj.label}
          aria-label={`${obj.label} — sentuh untuk berinteraksi dengan Kibo`}
          className={`pointer-events-auto absolute ${zClass} ${pos} w-10 h-10 inline-flex items-center justify-center rounded-full opacity-80 hover:opacity-100 hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer select-none ${
            isPopping ? 'easter-egg-pop opacity-100' : ''
          }`}
        >
          {renderEggSvg(obj.kind)}
        </button>
      );
    });

  if (variant === 'map') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-[4]">
        {renderButtons('z-[4]')}
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-[2]">
      {renderButtons('z-[2]')}
    </div>
  );
};
