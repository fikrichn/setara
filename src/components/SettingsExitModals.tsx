import React from 'react';
import { motion } from 'motion/react';
import { Film, Home, LogOut, Music, Play, Settings, Volume2, X } from 'lucide-react';
import { sound } from '../game/sound';
import { AnimatedKibo } from './AnimatedKibo';

interface SettingsModalProps {
  open: boolean;
  musicVolume: number; // 0.15 .. 1.0
  sfxVolume: number; // 0 .. 1.0
  canReturnToMenu: boolean;
  onChangeMusicVolume: (val: number) => void;
  onChangeSfxVolume: (val: number) => void;
  onReturnToMenu: () => void;
  onReplayIntro?: () => void;
  onRequestExit: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  musicVolume,
  sfxVolume,
  canReturnToMenu,
  onChangeMusicVolume,
  onChangeSfxVolume,
  onReturnToMenu,
  onReplayIntro,
  onRequestExit,
  onClose,
}) => {
  if (!open) return null;

  const musicPercent = Math.round(musicVolume * 100);
  const sfxPercent = Math.round(sfxVolume * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
        className="w-full max-w-md rounded-3xl game-panel p-5 sm:p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#BAE6FD]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#38BDF8] to-[#0284C7] text-white flex items-center justify-center shadow">
              <Settings className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="settings-title" className="font-display text-xl font-extrabold text-[#0D354C]">
                Pengaturan
              </h2>
              <p className="text-xs font-semibold text-[#3C6E85]">Atur suara & navigasi game</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPickup();
              onClose();
            }}
            className="game-btn-wood min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl cursor-pointer"
            aria-label="Tutup pengaturan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="mt-5 space-y-4">
          {/* Music Volume (always active: min 15%) */}
          <div className="rounded-2xl bg-[#EBF8FF] border border-[#BAE6FD] p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="music-vol-slider"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0D354C]"
              >
                <Music className="w-4 h-4 text-[#0284C7]" aria-hidden="true" />
                <span>Volume Musik</span>
              </label>
              <span className="font-mono text-xs font-extrabold text-[#0284C7] tabular-nums">
                {musicPercent}%
              </span>
            </div>
            <input
              id="music-vol-slider"
              type="range"
              min={15}
              max={100}
              step={5}
              value={musicPercent}
              onChange={(e) => onChangeMusicVolume(Number(e.target.value) / 100)}
              className="beach-slider w-full cursor-pointer"
            />
            <p className="mt-1.5 text-[11px] font-semibold text-[#48788E]">
              Musik pantai & Phonk Bos selalu aktif menemanimu bermain.
            </p>
          </div>

          {/* SFX Volume */}
          <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label
                htmlFor="sfx-vol-slider"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0D354C]"
              >
                <Volume2 className="w-4 h-4 text-[#D97706]" aria-hidden="true" />
                <span>Volume Efek Suara</span>
              </label>
              <span className="font-mono text-xs font-extrabold text-[#B45309] tabular-nums">
                {sfxPercent}%
              </span>
            </div>
            <input
              id="sfx-vol-slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={sfxPercent}
              onChange={(e) => {
                const next = Number(e.target.value) / 100;
                onChangeSfxVolume(next);
              }}
              onPointerUp={() => sound.playPickup()}
              className="beach-slider w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Navigation & Exit Actions */}
        <div className="mt-5 space-y-2.5">
          {canReturnToMenu && (
            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                onReturnToMenu();
              }}
              className="game-btn-emerald w-full min-h-[48px] px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Kembali ke Menu Utama</span>
            </button>
          )}

          {onReplayIntro && (
            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                onReplayIntro();
              }}
              className="game-btn-wood w-full min-h-[46px] px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Film className="w-4 h-4 shrink-0 text-[#0284C7]" aria-hidden="true" />
              <span>Putar Intro Kibo</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playKiboCry();
              onRequestExit();
            }}
            className="game-btn-coral w-full min-h-[48px] px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Keluar Game</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPickup();
              onClose();
            }}
            className="game-btn-gold w-full min-h-[48px] px-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
            <span>Lanjut Bermain</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface ExitConfirmModalProps {
  open: boolean;
  onStay: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  open,
  onStay,
  onConfirmExit,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#09324A]/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-kibo-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.84, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="w-full max-w-md rounded-3xl game-panel border-2 border-[#7DD3FC] p-6 text-center shadow-2xl"
      >
        <div className="flex flex-col items-center">
          <AnimatedKibo
            size="xl"
            mood="crying"
            interactive={false}
            className="border-3 border-[#7DD3FC] shadow-xl"
          />

          <h2
            id="exit-kibo-title"
            className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-[#0D354C]"
          >
            Hiks... Mau Keluar?
          </h2>

          <div className="mt-2.5 rounded-2xl bg-[#EBF8FF] border border-[#BAE6FD] px-4 py-3 text-sm text-[#1E4E68] leading-relaxed">
            <strong className="text-[#0284C7]">Kibo:</strong> “Jangan pergi dulu dong... hiks...
            Nanti Kibo sendirian main pasir di pantai tanpa kamu...”
          </div>

          <div className="mt-5 w-full flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => {
                sound.playKiboGiggle();
                onStay();
              }}
              className="game-btn-gold flex-1 min-h-[50px] px-4 rounded-2xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
            >
              Tetap Main Sama Kibo!
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPickup();
                onConfirmExit();
              }}
              className="game-btn-coral sm:w-auto min-h-[50px] px-5 rounded-2xl text-sm font-extrabold whitespace-nowrap cursor-pointer"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
