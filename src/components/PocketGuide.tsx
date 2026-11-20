import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { sound } from '../game/sound';
import { InlineTermChip } from './AlgebraTile';
import { KiboAvatar } from './KiboCompanion';

interface PocketGuideProps {
  onStartChapter: (chapterId: number) => void;
}

type OpKey = '+' | '-' | 'x' | '/';

interface OpStep {
  label: string;
  leftTokens: Array<{ text: string; tone: 'var' | 'pos' | 'neg' | 'op' }>;
  rightTokens: Array<{ text: string; tone: 'var' | 'pos' | 'neg' | 'op' }>;
  tip: string;
}

const OPERATOR_EXAMPLES: Record<
  OpKey,
  {
    symbol: string;
    name: string;
    rule: string;
    chapterId: number;
    steps: OpStep[];
  }
> = {
  '+': {
    symbol: '+',
    name: 'Tambah',
    rule: 'Tambah (+) pindah ruas menjadi Kurang (−)',
    chapterId: 1,
    steps: [
      {
        label: '1. Persamaan Awal',
        leftTokens: [
          { text: 'x', tone: 'var' },
          { text: '+4', tone: 'pos' },
        ],
        rightTokens: [{ text: '11', tone: 'pos' }],
        tip: 'Kartu +4 menemani x di ruas kiri. Kita ingin x berdiri sendirian!',
      },
      {
        label: '2. Seberangkan +4',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [
          { text: '11', tone: 'pos' },
          { text: '−4', tone: 'neg' },
        ],
        tip: 'Saat +4 melompati jembatan = ke ruas kanan, tandanya berbalik menjadi −4.',
      },
      {
        label: '3. Hitung Hasilnya',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [{ text: '7', tone: 'pos' }],
        tip: 'Gabungkan angka sejenis di ruas kanan: 11 − 4 = 7. Jadi x = 7!',
      },
    ],
  },
  '-': {
    symbol: '−',
    name: 'Kurang',
    rule: 'Kurang (−) pindah ruas menjadi Tambah (+)',
    chapterId: 2,
    steps: [
      {
        label: '1. Persamaan Awal',
        leftTokens: [
          { text: 'x', tone: 'var' },
          { text: '−6', tone: 'neg' },
        ],
        rightTokens: [{ text: '9', tone: 'pos' }],
        tip: 'Di ruas kiri ada kartu negatif −6 bersama x.',
      },
      {
        label: '2. Seberangkan −6',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [
          { text: '9', tone: 'pos' },
          { text: '+6', tone: 'pos' },
        ],
        tip: 'Tarik −6 menyeberangi jembatan = ke kanan sehingga berubah menjadi +6!',
      },
      {
        label: '3. Hitung Hasilnya',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [{ text: '15', tone: 'pos' }],
        tip: 'Satukan angka di ruas kanan: 9 + 6 = 15. Jadi x = 15!',
      },
    ],
  },
  x: {
    symbol: '×',
    name: 'Kali',
    rule: 'Kali (×) pindah ruas menjadi Bagi (÷)',
    chapterId: 3,
    steps: [
      {
        label: '1. Persamaan Awal',
        leftTokens: [
          { text: '3×', tone: 'op' },
          { text: 'x', tone: 'var' },
        ],
        rightTokens: [{ text: '18', tone: 'pos' }],
        tip: 'Angka 3 menempel di depan x artinya 3 × x. Pastikan x sudah sendirian di ruas kiri.',
      },
      {
        label: '2. Seberangkan Pengali ×3',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [
          { text: '18', tone: 'pos' },
          { text: '÷3', tone: 'op' },
        ],
        tip: 'Tarik pengali ×3 menyeberangi jembatan = sehingga berubah menjadi pembagi ÷3!',
      },
      {
        label: '3. Hitung Hasilnya',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [{ text: '6', tone: 'pos' }],
        tip: 'Hitung pembagiannya: 18 ÷ 3 = 6. Selesai, x = 6!',
      },
    ],
  },
  '/': {
    symbol: '÷',
    name: 'Bagi',
    rule: 'Bagi (÷) pindah ruas menjadi Kali (×)',
    chapterId: 3,
    steps: [
      {
        label: '1. Persamaan Awal',
        leftTokens: [
          { text: 'x', tone: 'var' },
          { text: '÷4', tone: 'op' },
        ],
        rightTokens: [{ text: '5', tone: 'pos' }],
        tip: 'Variabel x dibagi 4 di ruas kiri. Kita ingin menghilangkan pembagi ÷4.',
      },
      {
        label: '2. Seberangkan Pembagi ÷4',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [
          { text: '5', tone: 'pos' },
          { text: '×4', tone: 'op' },
        ],
        tip: 'Tarik pembagi ÷4 menyeberangi jembatan = agar berubah menjadi pengali ×4!',
      },
      {
        label: '3. Hitung Hasilnya',
        leftTokens: [{ text: 'x', tone: 'var' }],
        rightTokens: [{ text: '20', tone: 'pos' }],
        tip: 'Kalikan angka di ruas kanan: 5 × 4 = 20. Mantap, x = 20!',
      },
    ],
  },
};

const TOKEN_CLS: Record<'var' | 'pos' | 'neg' | 'op', string> = {
  var: 'bg-gradient-to-b from-[#F59E0B] to-[#D97706] border-[#FEF3C7] text-white',
  pos: 'bg-[#0F766E] border-[#5EEAD4]/70 text-white',
  neg: 'bg-[#B91C1C] border-dashed border-white/75 text-white',
  op: 'bg-[#0369A1] border-[#7DD3FC] text-white',
};

export const PocketGuide: React.FC<PocketGuideProps> = ({ onStartChapter }) => {
  const [demoMoved, setDemoMoved] = useState(false);
  const [activeOp, setActiveOp] = useState<OpKey>('+');
  const [opStepIdx, setOpStepIdx] = useState(0);

  const selectedExample = OPERATOR_EXAMPLES[activeOp];
  const currentStep = selectedExample.steps[opStepIdx];
  const isLastStep = opStepIdx >= selectedExample.steps.length - 1;

  const [kiboTipLine, setKiboTipLine] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-7 space-y-6">
      <div className="rounded-3xl game-panel p-4 sm:p-5 flex items-center gap-4">
        <KiboAvatar
          size="md"
          animate
          interactive
          onInteract={(quip) => setKiboTipLine(quip)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-[#0284C7]">Buku Saku Kibo</p>
          <h1 className="font-display text-xl sm:text-3xl font-extrabold text-[#0D354C]">
            4 Jurus Pindah Ruas
          </h1>
          {(() => {
            const msg =
              kiboTipLine ??
              'Tanda = seperti jembatan timbangan pantai. Buat x (atau Peti Pusaka) berdiri sendirian!';
            return (
              <div
                key={msg}
                className="relative mt-1.5 ml-1.5 rounded-2xl bg-[#EBF8FF] border-2 border-[#7DD3FC] px-3 py-1.5 shadow-sm speech-bubble-pop"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-2 top-3 w-3 h-3 rotate-45 bg-[#EBF8FF] border-l-2 border-b-2 border-[#7DD3FC]"
                />
                <p className="relative z-10 text-xs sm:text-sm font-semibold text-[#0D354C] leading-snug">
                  “{msg}”
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Interactive Mini Sandbox with Real Moving Card Animation */}
      <section className="rounded-3xl game-panel p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#BAE6FD]">
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#0D354C]">
              Coba Langsung: Kenapa +3 Menjadi −3?
            </h2>
            <p className="text-xs sm:text-sm text-[#35637A] mt-0.5">
              Ketuk tombol untuk melihat kartu +3 menyeberangi jembatan kesetaraan.
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
          <div className="rounded-2xl bg-[#E6F7FF] border-2 border-[#7DD3FC] p-5 flex items-center justify-center gap-3 sm:gap-4 min-h-[118px]">
            <div className="flex items-center gap-2">
              <div className="w-15 h-15 rounded-2xl bg-gradient-to-b from-[#F59E0B] to-[#D97706] border-2 border-[#FEF3C7] text-white font-display font-extrabold italic text-2xl flex items-center justify-center tile-shadow-var">
                x
              </div>
              {!demoMoved && (
                <motion.div
                  layoutId="pocket-demo-card"
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="w-15 h-15 rounded-2xl bg-[#0F766E] border-2 border-[#5EEAD4]/60 text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-pos"
                >
                  +3
                </motion.div>
              )}
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#FEF9C3] text-[#291802] font-display font-extrabold text-2xl flex items-center justify-center shrink-0 shadow">
              =
            </div>

            <div className="flex items-center gap-2">
              <div className="w-15 h-15 rounded-2xl bg-[#0F766E] border-2 border-[#5EEAD4]/60 text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-pos">
                +8
              </div>
              {demoMoved && (
                <motion.div
                  layoutId="pocket-demo-card"
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="w-15 h-15 rounded-2xl bg-[#B91C1C] text-white font-display font-extrabold text-xl flex items-center justify-center tile-shadow-neg border-2 border-dashed border-white/75"
                >
                  −3
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#1E4E68] leading-relaxed">
            {!demoMoved ? (
              <>
                <p className="font-bold text-[#B45309] font-mono">Awal: x + 3 = 8</p>
                <p>
                  Di ruas kiri ada <strong>+3</strong> di samping <strong>x</strong>. Kurangi kedua
                  ruas dengan 3 secara adil agar <strong>x</strong> sendirian.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-[#0F766E] font-mono">Hasil: x = 8 − 3 = 5</p>
                <p>
                  Di kiri <span className="font-mono">+3 − 3 = 0</span> sehingga lenyap, dan di
                  kanan muncul kartu lawannya yaitu <strong className="text-[#DC2626]">−3</strong>!
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Operation Symbol Step-by-Step Tips (+, -, ×, ÷) */}
      <section className="rounded-3xl game-panel p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#0D354C]">
              Tips Interaktif Simbol Operasi (+, −, ×, ÷)
            </h2>
            <p className="text-xs sm:text-sm text-[#35637A] mt-0.5">
              Ketuk salah satu simbol operasi untuk melihat contoh langkah pindah ruasnya secara bertahap!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(['+', '-', 'x', '/'] as OpKey[]).map((key) => {
              const op = OPERATOR_EXAMPLES[key];
              const isSelected = activeOp === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    setActiveOp(key);
                    setOpStepIdx(0);
                  }}
                  aria-label={`Contoh pindah ruas operasi ${op.name}`}
                  className={`w-12 h-12 rounded-2xl font-display font-extrabold text-2xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
                    isSelected ? 'game-btn-gold ring-2 ring-[#0284C7]' : 'game-btn-wood'
                  }`}
                >
                  {op.symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stepper Header */}
        <div className="rounded-2xl bg-[#EBF8FF] border-2 border-[#7DD3FC] p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#0284C7]">
                Operasi {selectedExample.name} ({selectedExample.symbol})
              </span>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-[#0D354C]">
                {selectedExample.rule}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedExample.steps.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    sound.playPickup();
                    setOpStepIdx(idx);
                  }}
                  className={`min-w-[34px] h-8 px-2.5 rounded-xl font-mono text-xs font-extrabold transition-colors cursor-pointer ${
                    opStepIdx === idx
                      ? 'bg-[#0284C7] text-white shadow-sm'
                      : idx < opStepIdx
                        ? 'bg-[#CCFBF1] text-[#0F766E] border border-[#5EEAD4]'
                        : 'bg-white text-[#4B7A91] border border-[#BAE6FD]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Cards Equation Stage */}
          <div
            key={`${activeOp}-${opStepIdx}`}
            className="rounded-2xl bg-white/95 border border-[#BAE6FD] p-4 flex flex-wrap items-center justify-center gap-3 min-h-[100px] animate-pop-in"
          >
            <div className="flex items-center gap-2">
              {currentStep.leftTokens.map((tok, i) => (
                <span
                  key={i}
                  className={`min-w-[52px] h-13 px-3 rounded-xl border-2 font-display font-extrabold text-xl flex items-center justify-center shadow-sm tabular-nums ${
                    TOKEN_CLS[tok.tone]
                  }`}
                >
                  {tok.text}
                </span>
              ))}
            </div>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#FDE047] to-[#F59E0B] border border-[#FEF9C3] text-[#291802] font-display font-extrabold text-xl flex items-center justify-center shadow">
              =
            </div>

            <div className="flex items-center gap-2">
              {currentStep.rightTokens.map((tok, i) => (
                <span
                  key={i}
                  className={`min-w-[52px] h-13 px-3 rounded-xl border-2 font-display font-extrabold text-xl flex items-center justify-center shadow-sm tabular-nums ${
                    TOKEN_CLS[tok.tone]
                  }`}
                >
                  {tok.text}
                </span>
              ))}
            </div>
          </div>

          {/* Step Explanation & Next Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#B45309]">{currentStep.label}</div>
              <p className="text-sm text-[#1E4E68] font-medium leading-relaxed mt-0.5">
                {currentStep.tip}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (isLastStep) {
                    sound.playPickup();
                    setOpStepIdx(0);
                  } else {
                    sound.playTranspose();
                    setOpStepIdx((idx) => idx + 1);
                  }
                }}
                className="game-btn-gold inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap cursor-pointer"
              >
                {isLastStep ? (
                  <>
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Ulangi Langkah</span>
                  </>
                ) : (
                  <>
                    <span>Langkah Berikutnya</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Game Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            num: 'Jurus 1',
            title: 'Pasangan Lawan Lenyap',
            visualFormula: (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <InlineTermChip term={{ id: 'g1', kind: 'sym', family: 'sun', sign: 1 }} size="sm" />
                <span className="font-bold text-[#4B7A91]">+</span>
                <InlineTermChip term={{ id: 'g2', kind: 'sym', family: 'sun', sign: -1 }} size="sm" />
                <span className="font-bold text-[#B45309] text-xs ml-1">→ Lenyap (0)</span>
              </div>
            ),
            desc: 'Kartu simbol atau angka yang berlawanan jika disatukan di ruas yang sama akan saling menghapus!',
            chapterId: 0,
            btn: 'Latih di Bab 0',
          },
          {
            num: 'Jurus 2',
            title: 'Menyeberang Jembatan: + ↔ −',
            formula: 'x − 5 = 4 → x = 4 + 5',
            desc: 'Setiap kartu yang melompati jembatan = otomatis berubah tanda: positif jadi negatif, negatif jadi positif.',
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
            desc: 'Ketuk kartu kurung untuk mengalikan angka luar ke dalam, dan gunakan tombol Balik ± jika tersisa −x.',
            chapterId: 5,
            btn: 'Latih di Bab 5',
          },
        ].map((rule) => (
          <article
            key={rule.num}
            className="rounded-3xl game-panel p-5 flex flex-col justify-between gap-4"
          >
            <div>
              <p className="text-xs font-extrabold text-[#0284C7]">{rule.num}</p>
              <h3 className="mt-1 font-display text-lg font-extrabold text-[#0D354C]">
                {rule.title}
              </h3>
              {'visualFormula' in rule && rule.visualFormula ? (
                rule.visualFormula
              ) : (
                <p className="mt-1.5 font-mono text-xs font-bold text-[#B45309]">{rule.formula}</p>
              )}
              <p className="mt-2 text-xs sm:text-sm text-[#35637A] leading-relaxed">{rule.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => onStartChapter(rule.chapterId)}
              className="game-btn-emerald self-start inline-flex items-center gap-1.5 min-h-[42px] px-4 rounded-xl text-xs font-extrabold cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{rule.btn}</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
