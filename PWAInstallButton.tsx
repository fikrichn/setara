import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'header'
            ? 'game-btn-emerald inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer'
            : 'game-btn-emerald inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-2.5 rounded-2xl text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer'
        }
      >
        <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Pasang di HP</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="game-btn-wood inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Share className="w-4 h-4 shrink-0 text-[#FDE68A]" aria-hidden="true" />
          <span>Pasang HP</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-sm rounded-3xl game-panel p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <h3 id="ios-install-title" className="text-lg font-bold text-[#FDE68A]">
                  Pasang Setara di Layar Utama
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-h-[40px] min-w-[40px] -mt-2 -mr-2 flex items-center justify-center rounded-lg text-[#9EC2B5] hover:bg-white/10"
                  aria-label="Tutup panduan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm text-[#D6EAE2] list-decimal list-inside">
                <li>
                  Ketuk tombol <strong>Bagikan (Share)</strong> pada Safari.
                </li>
                <li>
                  Pilih <strong>Tambah ke Layar Utama</strong>.
                </li>
                <li>
                  Ketuk <strong>Tambah</strong> untuk main tanpa internet.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="game-btn-gold mt-6 w-full min-h-[44px] rounded-xl text-sm font-extrabold cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
