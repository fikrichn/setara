import React, { useState } from 'react';
import { ArrowRightLeft, Play, RotateCcw } from 'lucide-react';
import { KiboAvatar } from './KiboCompanion';

interface PocketGuideProps {
  onStartChapter: (chapterId: number) => void;
}

export const PocketGuide: React.FC<PocketGuideProps> = ({ onStartChapter }) => {
  const [demoMoved, setDemoMoved] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      <div className="rounded-2xl game-panel p-4 sm:p-5 flex items-center gap-4">
        <KiboAvatar size="md" animate />
        <div>
          <p className="text-xs font-bold text-[#FDE68A]">Buku Saku Kibo</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            4 Jurus Pindah Ruas
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-[#C7DDD4]">
            Tanda <strong className="text-[#FDE68A]">=</strong> seperti jembatan timbangan. Buat{' '}
            <strong className="text-[#FDE68A]">x</strong> (atau Peti Pusaka) berdiri sendirian!
          </p>
        </div>
      </div>

      {/* Interactive Mini Sandbox */}
      <section className="rounded-2xl game-panel p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Coba Langsung: Kenapa +3 Menjadi −3?
            </h2>
            <p className="text-xs sm:text-sm text-[#9EC2B5] mt-0.5">
              Ketuk tombol untuk melihat +3 menyeberangi jembatan kesetaraan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDemoMoved((m) => !m)}
            className="game-btn-gold inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {demoMoved ? (
              <>
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Kembalikan</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
                <span>Seberangkan +3</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div className="rounded-2xl bg-[#0C231C] border border-[#285B4A] p-5 flex items-center justify-center gap-3 sm:gap-4 min-h-[112px]">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] text-white font-display font-extrabold italic text-2xl flex items-center justify-center tile-shadow-var">
                x
              </div>
              {!demoMoved && (
                <div className="w-14 h-14 rounded-xl bg-[#0F766E] text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-pos animate-pop-in">
                  +3
                </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#FBBF24] to-[#C88617] text-[#11241E] font-display font-extrabold text-2xl flex items-center justify-center shrink-0">
              =
            </div>

            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-xl bg-[#0F766E] text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-pos">
                +8
              </div>
              {demoMoved && (
                <div className="w-14 h-14 rounded-xl bg-[#B91C1C] text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-neg border-2 border-dashed border-white/50 animate-pop-in">
                  −3
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#D6EAE2] leading-relaxed">
            {!demoMoved ? (
              <>
                <p className="font-bold text-[#FDE68A] font-mono">Awal: x + 3 = 8</p>
                <p>
                  Di ruas kiri ada <strong>+3</strong> di samping <strong>x</strong>. Kurangi kedua
                  ruas dengan 3 secara adil agar <strong>x</strong> sendirian.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-[#5EEAD4] font-mono">Hasil: x = 8 − 3 = 5</p>
                <p>
                  Di kiri <span className="font-mono">+3 − 3 = 0</span> sehingga lenyap, dan di
                  kanan muncul lawannya yaitu <strong className="text-[#FCA5A5]">−3</strong>!
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 4 Game Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            num: 'Jurus 1',
            title: 'Pasangan Lawan Lenyap',
            formula: 'Surya + Lawan Surya → Lenyap (0)',
            desc: 'Simbol atau angka yang berlawanan (seperti +2 dan −2) jika disatukan di ruas yang sama akan saling menghapus!',
            chapterId: 0,
            btn: 'Latih di Bab 0',
          },
          {
            num: 'Jurus 2',
            title: 'Menyeberang Jembatan: + ↔ −',
            formula: 'x − 5 = 4 → x = 4 + 5',
            desc: 'Setiap batu yang melompati jembatan = otomatis berubah tanda: positif jadi negatif, negatif jadi positif.',
            chapterId: 2,
            btn: 'Latih di Bab 2',
          },
          {
            num: 'Jurus 3',
            title: 'Kali & Bagi Saling Tukar: × ↔ ÷',
            formula: '2x = 8 → x = 8 ÷ 2',
            desc: 'Saat 2x atau x/3 sudah sendirian, tarik pengali ×2 ke seberang jadi ÷2, atau tarik ÷3 jadi ×3!',
            chapterId: 4,
            btn: 'Latih di Bab 4',
          },
          {
            num: 'Jurus 4',
            title: 'Buka Kurung & Balik Tanda',
            formula: '2(x + 3) = 10 → 2x + 6 = 10',
            desc: 'Ketuk batu kurung untuk mengalikan angka luar ke dalam, dan gunakan tombol Balik ± jika tersisa −x.',
            chapterId: 5,
            btn: 'Latih di Bab 5',
          },
        ].map((rule) => (
          <article
            key={rule.num}
            className="rounded-2xl game-panel p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs font-bold text-[#FDE68A]">{rule.num}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-white">{rule.title}</h3>
              <p className="mt-1.5 font-mono text-xs font-bold text-[#5EEAD4]">{rule.formula}</p>
              <p className="mt-2 text-xs sm:text-sm text-[#C7DDD4] leading-relaxed">{rule.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => onStartChapter(rule.chapterId)}
              className="game-btn-wood self-start inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#FDE68A]" aria-hidden="true" />
              <span>{rule.btn}</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
