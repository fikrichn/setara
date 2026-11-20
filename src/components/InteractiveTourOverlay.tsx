import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, X } from 'lucide-react';
import { sound } from '../game/sound';
import { AnimatedKibo } from './AnimatedKibo';

export type TourScreenTarget = 'LOBBY' | 'MAP' | 'ARCADE';

interface TourStep {
  id: string;
  screen: TourScreenTarget;
  selector: string;
  title: string;
  body: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'lobby-play',
    screen: 'LOBBY',
    selector: '[data-tour="lobby-play"]',
    title: 'Lobi Utama · Mulai Petualangan',
    body: 'Di sini kamu bisa langsung melanjutkan stage aljabar bersama Kibo dari tombol emas utama ini!',
  },
  {
    id: 'lobby-nav',
    screen: 'LOBBY',
    selector: '[data-tour="lobby-nav"]',
    title: 'Menu Game Tanpa Scroll',
    body: 'Peta Bab, Misi Harian, Latihan Acak, Buku Saku, dan Badge (termasuk Stats & Cutscene) semua tinggal sekali ketuk!',
  },
  {
    id: 'map-trail',
    screen: 'MAP',
    selector: '[data-tour="map-trail"]',
    title: 'Peta Harta Karun & Bos Bab',
    body: 'Pilih Bab 0–5, ikuti jalur merah putus-putus menuju Bos di Stage 20, dan intip juga bayangan misterius Bab 6 Segera Hadir!',
  },
  {
    id: 'arcade-tiers',
    screen: 'ARCADE',
    selector: '[data-tour="arcade-tiers"]',
    title: 'Arena Latihan Acak',
    body: 'Butuh soal cepat tanpa batas? Mesin matematika acak akan membuat soal Mudah, Sedang, atau Tantangan kapan saja!',
  },
];

interface InteractiveTourOverlayProps {
  open: boolean;
  onSwitchScreen: (screen: TourScreenTarget) => void;
  onComplete: () => void;
}

export const InteractiveTourOverlay: React.FC<InteractiveTourOverlayProps> = ({
  open,
  onSwitchScreen,
  onComplete,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null
  );

  const currentStep = TOUR_STEPS[stepIdx] ?? TOUR_STEPS[0];

  const measureTarget = useCallback(() => {
    if (!open || !currentStep) return;
    const el = document.querySelector(currentStep.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = 8;
    setRect({
      top: Math.max(8, r.top - pad),
      left: Math.max(8, r.left - pad),
      width: Math.min(window.innerWidth - 16, r.width + pad * 2),
      height: Math.min(window.innerHeight - 16, r.height + pad * 2),
    });
  }, [open, currentStep]);

  useEffect(() => {
    if (!open) return;
    setStepIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open || !currentStep) return;
    onSwitchScreen(currentStep.screen);

    let raf1 = 0;
    const t1 = window.setTimeout(() => {
      const el = document.querySelector(currentStep.selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
      raf1 = window.requestAnimationFrame(measureTarget);
    }, 90);

    const t2 = window.setTimeout(measureTarget, 260);
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget, { passive: true });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.cancelAnimationFrame(raf1);
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget);
    };
  }, [open, currentStep, onSwitchScreen, measureTarget]);

  if (!open) return null;

  const isLast = stepIdx === TOUR_STEPS.length - 1;

  // Decide whether tooltip goes below or above the spotlight box cleanly
  const placeTooltipTop = rect ? rect.top > window.innerHeight * 0.54 : false;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Tur Interaktif Setara"
    >
      {/* Dimming backdrop around highlighted rect (fallback full scrim if element still lazy-loading) */}
      {rect ? (
        <div
          className="fixed rounded-2xl border-3 border-[#FDE047] shadow-[0_0_0_9999px_rgba(4,24,42,0.72),0_0_26px_rgba(253,224,71,0.85)] pointer-events-none transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-[#04182A]/75" />
      )}

      {/* Floating Kibo Speech Card */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md z-10 transition-all duration-300 ${
          placeTooltipTop ? 'top-4 sm:top-8' : 'bottom-4 sm:bottom-8'
        }`}
      >
        <div className="rounded-3xl game-panel border-3 border-[#FDE047] p-4 sm:p-5 shadow-2xl animate-pop-in">
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#BAE6FD]">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0284C7]">
              <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                Tur Pemandu Setara · Langkah {stepIdx + 1}/{TOUR_STEPS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                onComplete();
              }}
              aria-label="Lewati tur"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#64748B] hover:text-[#0D354C] cursor-pointer"
            >
              <span>Lewati</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <AnimatedKibo
              size="sm"
              mood="excited"
              interactive={false}
              className="shrink-0 border-2 border-[#38BDF8]"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display font-extrabold text-base text-[#0D354C]">
                {currentStep.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#1E4E68] font-medium leading-relaxed">
                {currentStep.body}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {/* Step Progress Dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {TOUR_STEPS.map((s, idx) => (
                <span
                  key={s.id}
                  className={`h-2 rounded-full transition-all ${
                    idx === stepIdx
                      ? 'w-5 bg-[#F59E0B]'
                      : idx < stepIdx
                        ? 'w-2 bg-[#0284C7]'
                        : 'w-2 bg-[#CBD5E1]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {stepIdx > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    setStepIdx((i) => Math.max(0, i - 1));
                  }}
                  className="game-btn-wood inline-flex items-center gap-1 min-h-[40px] px-3 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sebelumnya</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sound.playPickup();
                  if (isLast) {
                    onSwitchScreen('LOBBY');
                    onComplete();
                  } else {
                    setStepIdx((i) => Math.min(TOUR_STEPS.length - 1, i + 1));
                  }
                }}
                className="game-btn-gold inline-flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                {isLast ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Siap Main!</span>
                  </>
                ) : (
                  <>
                    <span>Lanjut</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
