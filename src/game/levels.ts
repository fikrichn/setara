import { ChapterDef, EquationState, LevelDef, SymbolFamily, Term } from './types';

const c = (id: string, value: number): Term => ({ id, kind: 'const', value });
const v = (id: string, coeff = 1, denom = 1): Term => ({ id, kind: 'var', coeff, denom });
const g = (id: string, factor: number, innerVar: number, innerConst: number): Term => ({
  id,
  kind: 'group',
  factor,
  innerVar,
  innerConst,
});
const sym = (id: string, family: SymbolFamily, sign: 1 | -1 = 1): Term => ({
  id,
  kind: 'sym',
  family,
  sign,
});

const BOSS_TURTLE_ART = '/src/assets/images/boss_penjaga_batu_1795080568852.jpg';
const BOSS_OWL_ART = '/src/assets/images/boss_raja_timbangan_1795080569789.jpg';

// =========================================================================
// CLEAN STRUCTURED STAGE BUILDERS (20 STAGES PER CHAPTER = 120 TOTAL)
// Every single stage is mathematically verified for exact integer solutions.
// =========================================================================

type SymPair = [SymbolFamily, 1 | -1];

function buildBab0ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    petiSide: 'left' | 'right';
    petiExtras: SymPair[];
    otherExtras: SymPair[];
  }> = [
    {
      num: 5,
      title: 'Pasangan Kerang & Lawan',
      tip: 'Gabungkan Kerang dan Lawan Kerang di kiri, lalu pindahkan sisanya!',
      par: 1,
      petiSide: 'left',
      petiExtras: [['shell', 1], ['shell', -1]],
      otherExtras: [['sun', 1], ['leaf', 1]],
    },
    {
      num: 6,
      title: 'Kerang Menyeberang Pantai',
      tip: 'Tarik Kerang dari kiri ke kanan (jadi Lawan Kerang) lalu hapus pasangannya!',
      par: 2,
      petiSide: 'left',
      petiExtras: [['shell', 1]],
      otherExtras: [['leaf', 1], ['shell', 1]],
    },
    {
      num: 7,
      title: 'Lawan Surya Pulang',
      tip: 'Pindahkan Lawan Surya ke kanan agar berubah menjadi Surya asli!',
      par: 1,
      petiSide: 'left',
      petiExtras: [['sun', -1]],
      otherExtras: [['shell', 1], ['leaf', 1]],
    },
    {
      num: 8,
      title: 'Peti di Dermaga Kanan',
      tip: 'Tarik Daun dari kanan ke kiri, lalu hapuskan dengan pasangannya!',
      par: 2,
      petiSide: 'right',
      petiExtras: [['leaf', 1]],
      otherExtras: [['sun', 1], ['leaf', 1]],
    },
    {
      num: 9,
      title: 'Dua Pasangan Saling Hapus',
      tip: 'Hapus dulu pasangan Surya & Lawan Surya di kiri, lalu pindahkan Kerang!',
      par: 2,
      petiSide: 'left',
      petiExtras: [['sun', 1], ['sun', -1], ['shell', -1]],
      otherExtras: [['leaf', 1]],
    },
    {
      num: 10,
      title: 'Jembatan Dua Simbol',
      tip: 'Pindahkan Surya dan Daun dari sisi Peti ke ruas kanan satu per satu.',
      par: 3,
      petiSide: 'left',
      petiExtras: [['sun', 1], ['leaf', 1]],
      otherExtras: [['shell', 1], ['sun', 1]],
    },
    {
      num: 11,
      title: 'Ombak Lawan Kerang',
      tip: 'Pindahkan Lawan Kerang ke ruas kiri agar menjadi Kerang asli dan hapus dengan Lawan Kerang!',
      par: 2,
      petiSide: 'right',
      petiExtras: [['shell', -1]],
      otherExtras: [['sun', 1], ['shell', -1]],
    },
    {
      num: 12,
      title: 'Tiga Batu di Kiri',
      tip: 'Hapus pasangan Daun di kiri dulu, lalu pindahkan Surya ke kanan!',
      par: 3,
      petiSide: 'left',
      petiExtras: [['leaf', 1], ['leaf', -1], ['sun', 1]],
      otherExtras: [['shell', 1], ['sun', 1]],
    },
    {
      num: 13,
      title: 'Peti di Pulau Kanan',
      tip: 'Pindahkan Kerang dan Lawan Daun dari kanan ke kiri, lalu rapikan pasangannya!',
      par: 3,
      petiSide: 'right',
      petiExtras: [['shell', 1], ['leaf', -1]],
      otherExtras: [['shell', 1], ['sun', 1]],
    },
    {
      num: 14,
      title: 'Batu Ganda Sejenis',
      tip: 'Pindahkan kedua batu Surya dari kiri ke kanan, lalu hapuskan dengan Surya di kanan!',
      par: 4,
      petiSide: 'left',
      petiExtras: [['sun', 1], ['sun', 1]],
      otherExtras: [['sun', 1], ['shell', 1], ['sun', 1]],
    },
    {
      num: 15,
      title: 'Hapus di Dua Ruas',
      tip: 'Hapus pasangan lawan yang sudah ada di kanan, lalu pindahkan batu dari sisi Peti!',
      par: 3,
      petiSide: 'left',
      petiExtras: [['leaf', -1], ['shell', 1]],
      otherExtras: [['sun', 1], ['sun', -1], ['shell', 1]],
    },
    {
      num: 16,
      title: 'Tukar Simbol Kembar',
      tip: 'Pindahkan Daun dan Kerang dari kanan ke kiri, lalu hilangkan pasangan yang berlawanan!',
      par: 4,
      petiSide: 'right',
      petiExtras: [['leaf', 1], ['shell', 1]],
      otherExtras: [['leaf', 1], ['shell', 1], ['sun', 1]],
    },
    {
      num: 17,
      title: 'Lawan Ganda Pantai',
      tip: 'Seberangkan Lawan Surya dan Lawan Daun ke kanan, lalu hapus pasangan lawannya!',
      par: 4,
      petiSide: 'left',
      petiExtras: [['sun', -1], ['leaf', -1]],
      otherExtras: [['sun', -1], ['leaf', -1], ['shell', 1]],
    },
    {
      num: 18,
      title: 'Simbol Berantai',
      tip: 'Hapus pasangan Kerang dulu di kanan, baru pindahkan Surya dan Daun ke kiri!',
      par: 4,
      petiSide: 'right',
      petiExtras: [['shell', 1], ['shell', -1], ['sun', 1], ['leaf', -1]],
      otherExtras: [['sun', 1], ['shell', 1]],
    },
    {
      num: 19,
      title: 'Gerbang Sebelum Bos Simbol',
      tip: 'Pindahkan semua simbol dari sisi Peti dan bersihkan setiap pasangan lawan di ruas seberang!',
      par: 5,
      petiSide: 'left',
      petiExtras: [['sun', 1], ['shell', -1], ['leaf', 1]],
      otherExtras: [['sun', 1], ['shell', -1], ['leaf', 1], ['sun', 1]],
    },
  ];

  return specs.map((s) => {
    const pTerms: Term[] = [
      v(`b0s${s.num}_p`, 1),
      ...s.petiExtras.map(([fam, sign], i) => sym(`b0s${s.num}_pe${i}`, fam, sign)),
    ];
    const oTerms: Term[] = s.otherExtras.map(([fam, sign], i) =>
      sym(`b0s${s.num}_oe${i}`, fam, sign)
    );
    return {
      id: `0-${s.num}`,
      chapterId: 0,
      levelNumber: s.num,
      title: s.title,
      tip: s.tip,
      defaultVisual: 'pure_symbols',
      parMoves: s.par,
      initial: s.petiSide === 'left' ? { left: pTerms, right: oTerms } : { left: oTerms, right: pTerms },
    };
  });
}

function buildBab1ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    sol: number;
    init: EquationState;
  }> = [
    {
      num: 6,
      title: 'Batu Bulan di Kanan',
      tip: 'Pindahkan −4 dari ruas kanan ke kiri agar berubah menjadi +4!',
      par: 2,
      sol: 11,
      init: { left: [c('1_6_l1', 7)], right: [v('1_6_r1', 1), c('1_6_r2', -4)] },
    },
    {
      num: 7,
      title: 'Hapus Pasangan +5 & −5',
      tip: 'Gabungkan +5 dan −5 dulu di kiri agar lenyap menjadi 0!',
      par: 1,
      sol: 9,
      init: { left: [v('1_7_l1', 1), c('1_7_l2', 5), c('1_7_l3', -5)], right: [c('1_7_r1', 9)] },
    },
    {
      num: 8,
      title: 'Menyeberang +6',
      tip: 'Tarik +6 menyeberangi jembatan = menjadi −6 lalu gabungkan dengan +13.',
      par: 2,
      sol: 7,
      init: { left: [v('1_8_l1', 1), c('1_8_l2', 6)], right: [c('1_8_r1', 13)] },
    },
    {
      num: 9,
      title: 'Menyeberang −7',
      tip: 'Tarik −7 ke kanan menjadi +7, lalu gabungkan dengan +5!',
      par: 2,
      sol: 12,
      init: { left: [v('1_9_l1', 1), c('1_9_l2', -7)], right: [c('1_9_r1', 5)] },
    },
    {
      num: 10,
      title: 'Dua Batu Surya di Kiri',
      tip: 'Gabungkan +2 dan +3 di ruas kiri menjadi +5, lalu seberangkan ke kanan!',
      par: 3,
      sol: 6,
      init: { left: [v('1_10_l1', 1), c('1_10_l2', 2), c('1_10_l3', 3)], right: [c('1_10_r1', 11)] },
    },
    {
      num: 11,
      title: 'Batu Pusaka di Kanan Lagi',
      tip: 'Pindahkan +8 dari kanan ke kiri menjadi −8, lalu gabungkan dengan +15.',
      par: 2,
      sol: 7,
      init: { left: [c('1_11_l1', 15)], right: [v('1_11_r1', 1), c('1_11_r2', 8)] },
    },
    {
      num: 12,
      title: 'Gabung di Ruas Kanan',
      tip: 'Gabungkan +6 dan +4 di kanan, lalu pindahkan +3 dari kiri ke kanan!',
      par: 3,
      sol: 7,
      init: { left: [v('1_12_l1', 1), c('1_12_l2', 3)], right: [c('1_12_r1', 6), c('1_12_r2', 4)] },
    },
    {
      num: 13,
      title: 'Dua Batu Bulan',
      tip: 'Gabungkan −2 dan −3 di kiri menjadi −5, lalu pindahkan ke kanan!',
      par: 3,
      sol: 12,
      init: { left: [v('1_13_l1', 1), c('1_13_l2', -2), c('1_13_l3', -3)], right: [c('1_13_r1', 7)] },
    },
    {
      num: 14,
      title: 'Surya & Bulan di Kanan',
      tip: 'Gabungkan +6 dan −2 di sisi kanan, lalu pindahkan sisanya ke kiri!',
      par: 3,
      sol: 9,
      init: { left: [c('1_14_l1', 13)], right: [v('1_14_r1', 1), c('1_14_r2', 6), c('1_14_r3', -2)] },
    },
    {
      num: 15,
      title: 'Batu Kembar Seberang',
      tip: 'Pindahkan +9 ke kanan menjadi −9 lalu gabungkan dengan +18!',
      par: 2,
      sol: 9,
      init: { left: [v('1_15_l1', 1), c('1_15_l2', 9)], right: [c('1_15_r1', 18)] },
    },
    {
      num: 16,
      title: 'Batu Pantai Berlapis',
      tip: 'Gabungkan angka di kiri (+7 dan −4) dan di kanan (+8 dan +2), lalu pindah ruas!',
      par: 4,
      sol: 7,
      init: {
        left: [v('1_16_l1', 1), c('1_16_l2', 7), c('1_16_l3', -4)],
        right: [c('1_16_r1', 8), c('1_16_r2', 2)],
      },
    },
    {
      num: 17,
      title: 'Pasangan Nol Tersembunyi',
      tip: 'Hapus dulu +4 dan −4 di kiri, lalu pindahkan −3 ke kanan!',
      par: 3,
      sol: 11,
      init: {
        left: [v('1_17_l1', 1), c('1_17_l2', 4), c('1_17_l3', -4), c('1_17_l4', -3)],
        right: [c('1_17_r1', 8)],
      },
    },
    {
      num: 18,
      title: 'Pantai Kanan Sibuk',
      tip: 'Rapikan −5 dan +2 di kanan menjadi −3, lalu pindahkan ke kiri!',
      par: 4,
      sol: 14,
      init: {
        left: [c('1_18_l1', 6), c('1_18_l2', 5)],
        right: [v('1_18_r1', 1), c('1_18_r2', -5), c('1_18_r3', 2)],
      },
    },
    {
      num: 19,
      title: 'Tantangan Terakhir Batu Angka',
      tip: 'Sederhanakan kedua sisi timbangan, lalu sisakan x sendirian!',
      par: 4,
      sol: 10,
      init: {
        left: [v('1_19_l1', 1), c('1_19_l2', 8), c('1_19_l3', -3)],
        right: [c('1_19_r1', 9), c('1_19_r2', 6)],
      },
    },
  ];

  return specs.map((s) => ({
    id: `1-${s.num}`,
    chapterId: 1,
    levelNumber: s.num,
    title: s.title,
    tip: s.tip,
    defaultVisual: 'stones',
    parMoves: s.par,
    solution: s.sol,
    initial: s.init,
  }));
}

function buildBab2ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    sol: number;
    init: EquationState;
  }> = [
    {
      num: 6,
      title: 'Kurang Jadi Tambah',
      tip: 'Pindahkan −8 ke kanan menjadi +8 lalu gabungkan dengan −2!',
      par: 2,
      sol: 6,
      init: { left: [v('2_6_l1', 1), c('2_6_l2', -8)], right: [c('2_6_r1', -2)] },
    },
    {
      num: 7,
      title: 'Menyelam ke Negatif',
      tip: 'Pindahkan +9 ke kanan menjadi −9 lalu gabungkan dengan +4.',
      par: 2,
      sol: -5,
      init: { left: [v('2_7_l1', 1), c('2_7_l2', 9)], right: [c('2_7_r1', 4)] },
    },
    {
      num: 8,
      title: 'Dua Bilangan Negatif',
      tip: 'Pindahkan +6 ke kanan menjadi −6, gabungkan dengan −3 menjadi −9!',
      par: 2,
      sol: -9,
      init: { left: [v('2_8_l1', 1), c('2_8_l2', 6)], right: [c('2_8_r1', -3)] },
    },
    {
      num: 9,
      title: 'Variabel di Kanan Negatif',
      tip: 'Pindahkan +7 dari kanan ke kiri (jadi −7) lalu gabungkan dengan +2!',
      par: 2,
      sol: -5,
      init: { left: [c('2_9_l1', 2)], right: [v('2_9_r1', 1), c('2_9_r2', 7)] },
    },
    {
      num: 10,
      title: 'Kembali ke Nol Lagi',
      tip: 'Pindahkan −7 ke kanan menjadi +7 — lihat ia saling menghapus dengan −7!',
      par: 2,
      sol: 0,
      init: { left: [v('2_10_l1', 1), c('2_10_l2', -7)], right: [c('2_10_r1', -7)] },
    },
    {
      num: 11,
      title: 'Dari Nol Menyeberang',
      tip: 'Ruas kanan kosong (0). Pindahkan +8 ke kanan agar x = −8!',
      par: 1,
      sol: -8,
      init: { left: [v('2_11_l1', 1), c('2_11_l2', 8)], right: [] },
    },
    {
      num: 12,
      title: 'Menyeberang ke Kosong',
      tip: 'Ruas kiri kosong (0). Pindahkan −11 ke kiri menjadi +11!',
      par: 1,
      sol: 11,
      init: { left: [], right: [v('2_12_r1', 1), c('2_12_r2', -11)] },
    },
    {
      num: 13,
      title: 'Kombinasi Negatif Kiri',
      tip: 'Gabungkan −5 dan −4 di kiri dulu menjadi −9, lalu pindah ke kanan!',
      par: 3,
      sol: 5,
      init: { left: [v('2_13_l1', 1), c('2_13_l2', -5), c('2_13_l3', -4)], right: [c('2_13_r1', -4)] },
    },
    {
      num: 14,
      title: 'Tiga Suku Negatif',
      tip: 'Gabungkan +10 dan −4 di kiri (jadi +6), lalu pindahkan ke kanan!',
      par: 3,
      sol: -8,
      init: { left: [v('2_14_l1', 1), c('2_14_l2', 10), c('2_14_l3', -4)], right: [c('2_14_r1', -2)] },
    },
    {
      num: 15,
      title: 'Angka Kembar Dua Sisi',
      tip: 'Gabungkan −6 dan +2 di kanan, lalu pindahkan +5 dari kiri!',
      par: 3,
      sol: -9,
      init: { left: [v('2_15_l1', 1), c('2_15_l2', 5)], right: [c('2_15_r1', -6), c('2_15_r2', 2)] },
    },
    {
      num: 16,
      title: 'Jembatan −12',
      tip: 'Pindahkan −12 dari kanan ke kiri menjadi +12, lalu gabungkan dengan −5!',
      par: 2,
      sol: 7,
      init: { left: [c('2_16_l1', -5)], right: [v('2_16_r1', 1), c('2_16_r2', -12)] },
    },
    {
      num: 17,
      title: 'Rapikan Kiri & Kanan',
      tip: 'Sederhanakan angka di kedua ruas sebelum menyeberang jembatan =.',
      par: 4,
      sol: -3,
      init: {
        left: [v('2_17_l1', 1), c('2_17_l2', 9), c('2_17_l3', -2)],
        right: [c('2_17_r1', 8), c('2_17_r2', -4)],
      },
    },
    {
      num: 18,
      title: 'Adu Angka Besar',
      tip: 'Gabungkan −8 dan +3 di kanan (jadi −5), lalu pindahkan ke kiri!',
      par: 4,
      sol: 3,
      init: {
        left: [c('2_18_l1', -9), c('2_18_l2', 7)],
        right: [v('2_18_r1', 1), c('2_18_r2', -8), c('2_18_r3', 3)],
      },
    },
    {
      num: 19,
      title: 'Ujian Akhir Tambah Kurang',
      tip: 'Gabungkan semua angka sejenis dengan teliti lalu pindahkan agar x sendirian!',
      par: 4,
      sol: -6,
      init: {
        left: [v('2_19_l1', 1), c('2_19_l2', 11), c('2_19_l3', -3)],
        right: [c('2_19_r1', 7), c('2_19_r2', -5)],
      },
    },
  ];

  return specs.map((s) => ({
    id: `2-${s.num}`,
    chapterId: 2,
    levelNumber: s.num,
    title: s.title,
    tip: s.tip,
    defaultVisual: 'symbols',
    parMoves: s.par,
    solution: s.sol,
    initial: s.init,
  }));
}

function buildBab3ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    sol: number;
    init: EquationState;
  }> = [
    {
      num: 6,
      title: 'Tiga x Lawan Dua x',
      tip: 'Pindahkan 2x dari kanan ke kiri menjadi −2x, lalu gabungkan dengan 3x!',
      par: 2,
      sol: 8,
      init: { left: [v('3_6_l1', 3)], right: [v('3_6_r1', 2), c('3_6_r2', 8)] },
    },
    {
      num: 7,
      title: 'Pindah x ke Kanan',
      tip: 'Pindahkan 2x dari kiri ke kanan menjadi −2x agar di kanan tersisa +x!',
      par: 2,
      sol: 6,
      init: { left: [v('3_7_l1', 2), c('3_7_l2', 6)], right: [v('3_7_r1', 3)] },
    },
    {
      num: 8,
      title: 'Balik Tanda −x',
      tip: 'Pindahkan +9 ke kanan (jadi −5), lalu tekan "Balik ±" agar −x jadi +x!',
      par: 3,
      sol: 5,
      init: { left: [c('3_8_l1', 9), v('3_8_l2', -1)], right: [c('3_8_r1', 4)] },
    },
    {
      num: 9,
      title: 'Tukar Suku Seberang',
      tip: 'Pindahkan 2x ke kiri dan +3 ke kanan, lalu gabungkan suku sejenis!',
      par: 4,
      sol: 4,
      init: { left: [v('3_9_l1', 3), c('3_9_l2', 3)], right: [v('3_9_r1', 2), c('3_9_r2', 7)] },
    },
    {
      num: 10,
      title: 'Hasil Negatif Dua Sisi',
      tip: 'Pindahkan 3x ke kiri (jadi x) dan +8 ke kanan (jadi −3)!',
      par: 4,
      sol: -3,
      init: { left: [v('3_10_l1', 4), c('3_10_l2', 8)], right: [v('3_10_r1', 3), c('3_10_r2', 5)] },
    },
    {
      num: 11,
      title: 'Kumpulkan x di Kanan',
      tip: 'Pindahkan 3x ke kanan dan −4 ke kiri agar koefisien x positif!',
      par: 4,
      sol: 9,
      init: { left: [v('3_11_l1', 3), c('3_11_l2', 5)], right: [v('3_11_r1', 4), c('3_11_r2', -4)] },
    },
    {
      num: 12,
      title: 'Menjinakkan −x di Kanan',
      tip: 'Pindahkan −x ke kiri menjadi +x, dan pindahkan +3 ke kanan!',
      par: 3,
      sol: 7,
      init: { left: [c('3_12_l1', 3)], right: [c('3_12_r1', 10), v('3_12_r2', -1)] },
    },
    {
      num: 13,
      title: 'Lima x & Empat x',
      tip: 'Tarik 4x ke kiri dan −6 ke kanan lalu gabungkan keduanya!',
      par: 4,
      sol: 10,
      init: { left: [v('3_13_l1', 5), c('3_13_l2', -6)], right: [v('3_13_r1', 4), c('3_13_r2', 4)] },
    },
    {
      num: 14,
      title: 'Gabung x di Ruas Sama',
      tip: 'Gabungkan dulu 2x dan +x di kiri menjadi 3x, lalu kurangi dengan 2x dari kanan!',
      par: 4,
      sol: 6,
      init: {
        left: [v('3_14_l1', 2), v('3_14_l2', 1)],
        right: [v('3_14_r1', 2), c('3_14_r2', 6)],
      },
    },
    {
      num: 15,
      title: 'Variabel Negatif Bertemu',
      tip: 'Pindahkan −2x dari kanan ke kiri agar berubah menjadi +2x lalu gabungkan dengan −x!',
      par: 4,
      sol: 5,
      init: {
        left: [v('3_15_l1', -1), c('3_15_l2', 3)],
        right: [v('3_15_r1', -2), c('3_15_r2', 8)],
      },
    },
    {
      num: 16,
      title: 'Dua Suku x di Kanan',
      tip: 'Gabungkan 4x dan −x di kanan dulu menjadi 3x, lalu kumpulkan dengan 2x!',
      par: 5,
      sol: -4,
      init: {
        left: [v('3_16_l1', 2), c('3_16_l2', -1)],
        right: [v('3_16_r1', 4), v('3_16_r2', -1), c('3_16_r3', 3)],
      },
    },
    {
      num: 17,
      title: 'Menuju Nol Dua Ruas',
      tip: 'Kumpulkan x di kiri dan angka di kanan — lihat hasilnya saling menghapus jadi 0!',
      par: 4,
      sol: 0,
      init: { left: [v('3_17_l1', 5), c('3_17_l2', 7)], right: [v('3_17_r1', 4), c('3_17_r2', 7)] },
    },
    {
      num: 18,
      title: 'Enam x Lawan Lima x',
      tip: 'Pindahkan 5x ke kiri dan +9 ke kanan, perhatikan hasil negatifnya!',
      par: 4,
      sol: -6,
      init: { left: [v('3_18_l1', 6), c('3_18_l2', 9)], right: [v('3_18_r1', 5), c('3_18_r2', 3)] },
    },
    {
      num: 19,
      title: 'Gerbang Bos Variabel',
      tip: 'Gabungkan suku x di kiri dulu, lalu kumpulkan semua x di satu sisi dan angka di sisi lain!',
      par: 5,
      sol: 7,
      init: {
        left: [v('3_19_l1', 3), v('3_19_l2', 2), c('3_19_l3', -4)],
        right: [v('3_19_r1', 4), c('3_19_r2', 3)],
      },
    },
  ];

  return specs.map((s) => ({
    id: `3-${s.num}`,
    chapterId: 3,
    levelNumber: s.num,
    title: s.title,
    tip: s.tip,
    defaultVisual: 'symbols',
    parMoves: s.par,
    solution: s.sol,
    initial: s.init,
  }));
}

function buildBab4ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    sol: number;
    init: EquationState;
  }> = [
    {
      num: 6,
      title: 'Pengali Tiga',
      tip: 'Tarik pengali ×3 ke kanan agar membagi 15 menjadi 5!',
      par: 1,
      sol: 5,
      init: { left: [v('4_6_l1', 3)], right: [c('4_6_r1', 15)] },
    },
    {
      num: 7,
      title: 'Pembagi Empat',
      tip: 'Tarik penyebut ÷4 ke kanan agar berubah menjadi ×4!',
      par: 1,
      sol: 12,
      init: { left: [v('4_7_l1', 1, 4)], right: [c('4_7_r1', 3)] },
    },
    {
      num: 8,
      title: 'Kurang Dulu, Lalu Bagi',
      tip: 'Pindahkan −4 ke kanan dulu (jadi 10), baru pindahkan ×2 → ÷2!',
      par: 3,
      sol: 5,
      init: { left: [v('4_8_l1', 2), c('4_8_l2', -4)], right: [c('4_8_r1', 6)] },
    },
    {
      num: 9,
      title: 'Pecahan dengan Kurang',
      tip: 'Pindahkan −2 ke kanan (jadi 5), lalu pindahkan ÷3 → ×3!',
      par: 3,
      sol: 15,
      init: { left: [v('4_9_l1', 1, 3), c('4_9_l2', -2)], right: [c('4_9_r1', 3)] },
    },
    {
      num: 10,
      title: 'Koefisien di Ruas Kanan',
      tip: 'Pindahkan +5 ke kiri dulu (jadi 12), lalu pindahkan ×4 dari kanan ke kiri!',
      par: 3,
      sol: 3,
      init: { left: [c('4_10_l1', 17)], right: [v('4_10_r1', 4), c('4_10_r2', 5)] },
    },
    {
      num: 11,
      title: 'Hasil Negatif Perkalian',
      tip: 'Pindahkan +9 ke kanan (jadi −6), lalu pindahkan ×3 → ÷3!',
      par: 3,
      sol: -2,
      init: { left: [v('4_11_l1', 3), c('4_11_l2', 9)], right: [c('4_11_r1', 3)] },
    },
    {
      num: 12,
      title: 'Pecahan Hasil Negatif',
      tip: 'Pindahkan +5 ke kanan (jadi −3), lalu pindahkan ÷4 → ×4!',
      par: 3,
      sol: -12,
      init: { left: [v('4_12_l1', 1, 4), c('4_12_l2', 5)], right: [c('4_12_r1', 2)] },
    },
    {
      num: 13,
      title: 'Pengali Lima',
      tip: 'Pindahkan −7 ke kanan (jadi 20), lalu pindahkan ×5 → ÷5!',
      par: 3,
      sol: 4,
      init: { left: [v('4_13_l1', 5), c('4_13_l2', -7)], right: [c('4_13_r1', 13)] },
    },
    {
      num: 14,
      title: 'Bagi Lima di Kanan',
      tip: 'Pindahkan +4 dari kanan ke kiri (jadi 3), lalu pindahkan ÷5 → ×5!',
      par: 3,
      sol: 15,
      init: { left: [c('4_14_l1', 7)], right: [v('4_14_r1', 1, 5), c('4_14_r2', 4)] },
    },
    {
      num: 15,
      title: 'Koefisien Negatif −3',
      tip: 'Pindahkan +2 ke kanan (jadi 12), lalu pindahkan ×(−3) → ÷(−3)!',
      par: 3,
      sol: -4,
      init: { left: [v('4_15_l1', -3), c('4_15_l2', 2)], right: [c('4_15_r1', 14)] },
    },
    {
      num: 16,
      title: 'Bagi Dua Negatif',
      tip: 'Pindahkan +1 ke kanan (jadi 4), pindahkan ÷2 → ×2, lalu tekan Balik ±!',
      par: 4,
      sol: -8,
      init: { left: [v('4_16_l1', -1, 2), c('4_16_l2', 1)], right: [c('4_16_r1', 5)] },
    },
    {
      num: 17,
      title: 'Gabung Dulu Baru Bagi',
      tip: 'Gabungkan 2x dan 2x di kiri menjadi 4x, lalu bagi 20 dengan 4!',
      par: 2,
      sol: 5,
      init: { left: [v('4_17_l1', 2), v('4_17_l2', 2)], right: [c('4_17_r1', 20)] },
    },
    {
      num: 18,
      title: 'Pengali −4 di Kanan',
      tip: 'Pindahkan −6 ke kiri (jadi 16), lalu pindahkan ×(−4) → ÷(−4)!',
      par: 3,
      sol: -4,
      init: { left: [c('4_18_l1', 10)], right: [v('4_18_r1', -4), c('4_18_r2', -6)] },
    },
    {
      num: 19,
      title: 'Ujian Gerbang Kali-Bagi',
      tip: 'Gabungkan angka di kedua ruas, lalu bagi dengan pengali 6!',
      par: 4,
      sol: 3,
      init: {
        left: [v('4_19_l1', 6), c('4_19_l2', -5)],
        right: [c('4_19_r1', 9), c('4_19_r2', 4)],
      },
    },
  ];

  return specs.map((s) => ({
    id: `4-${s.num}`,
    chapterId: 4,
    levelNumber: s.num,
    title: s.title,
    tip: s.tip,
    defaultVisual: 'symbols',
    parMoves: s.par,
    solution: s.sol,
    initial: s.init,
  }));
}

function buildBab5ExtraStages(): LevelDef[] {
  const specs: Array<{
    num: number;
    title: string;
    tip: string;
    par: number;
    sol: number;
    init: EquationState;
  }> = [
    {
      num: 6,
      title: 'Kurung Empat Kali',
      tip: 'Pindahkan pengali ×4 ke kanan (jadi 5), atau buka kurung 4(x + 2) dulu!',
      par: 3,
      sol: 3,
      init: { left: [g('5_6_l1', 4, 1, 2)], right: [c('5_6_r1', 20)] },
    },
    {
      num: 7,
      title: 'Kurung di Ruas Kanan',
      tip: 'Buka kurung 2(x − 4) di kanan atau langsung bagi 14 dengan 2!',
      par: 3,
      sol: 11,
      init: { left: [c('5_7_l1', 14)], right: [g('5_7_r1', 2, 1, -4)] },
    },
    {
      num: 8,
      title: 'Dua Ruas Hasil Negatif',
      tip: 'Kumpulkan x di kiri (5x − 3x = 2x) dan angka di kanan (3 − 11 = −8), lalu bagi 2!',
      par: 5,
      sol: -4,
      init: { left: [v('5_8_l1', 5), c('5_8_l2', 11)], right: [v('5_8_r1', 3), c('5_8_r2', 3)] },
    },
    {
      num: 9,
      title: 'Kurung Hasil Negatif',
      tip: 'Bagi −9 dengan 3 (jadi −3), lalu pindahkan +2 ke kanan!',
      par: 3,
      sol: -5,
      init: { left: [g('5_9_l1', 3, 1, 2)], right: [c('5_9_r1', -9)] },
    },
    {
      num: 10,
      title: 'Kurung + Konstanta Luar',
      tip: 'Buka kurung 2(x + 3) jadi 2x + 6, gabungkan dengan +4, lalu pindah ke kanan!',
      par: 5,
      sol: 3,
      init: { left: [g('5_10_l1', 2, 1, 3), c('5_10_l2', 4)], right: [c('5_10_r1', 16)] },
    },
    {
      num: 11,
      title: 'Tiga Kali Kurung vs x',
      tip: 'Buka kurung 3(x + 1) menjadi 3x + 3, lalu kumpulkan x di kiri dan angka di kanan!',
      par: 6,
      sol: 4,
      init: { left: [g('5_11_l1', 3, 1, 1)], right: [v('5_11_r1', 1), c('5_11_r2', 11)] },
    },
    {
      num: 12,
      title: 'Pengali Negatif di Luar',
      tip: 'Buka kurung −2(x + 3) menjadi −2x − 6, atau langsung bagi 10 dengan −2!',
      par: 3,
      sol: -8,
      init: { left: [g('5_12_l1', -2, 1, 3)], right: [c('5_12_r1', 10)] },
    },
    {
      num: 13,
      title: 'Enam x Lawan Dua x',
      tip: 'Pindahkan 2x ke kiri (jadi 4x) dan −7 ke kanan (jadi 16), lalu bagi 4!',
      par: 5,
      sol: 4,
      init: { left: [v('5_13_l1', 6), c('5_13_l2', -7)], right: [v('5_13_r1', 2), c('5_13_r2', 9)] },
    },
    {
      num: 14,
      title: 'Kurung Koefisien Dalam 2x',
      tip: 'Pindahkan ×2 ke kanan (jadi 9) atau buka kurung 2(2x + 1) menjadi 4x + 2!',
      par: 4,
      sol: 4,
      init: { left: [g('5_14_l1', 2, 2, 1)], right: [c('5_14_r1', 18)] },
    },
    {
      num: 15,
      title: 'Kurung Pengurangan vs 2x',
      tip: 'Buka kurung 4(x − 2) menjadi 4x − 8, lalu kumpulkan x di kiri!',
      par: 6,
      sol: 6,
      init: { left: [g('5_15_l1', 4, 1, -2)], right: [v('5_15_r1', 2), c('5_15_r2', 4)] },
    },
    {
      num: 16,
      title: 'Pengali Negatif −3',
      tip: 'Pindahkan ×(−3) ke kanan untuk membagi 15 (jadi −5), lalu pindahkan −4!',
      par: 3,
      sol: -1,
      init: { left: [g('5_16_l1', -3, 1, -4)], right: [c('5_16_r1', 15)] },
    },
    {
      num: 17,
      title: 'Kurung & Angka Kiri Kanan',
      tip: 'Buka kurung 3(x − 1) = 3x − 3, gabungkan dengan +5, lalu selesaikan!',
      par: 5,
      sol: 5,
      init: { left: [g('5_17_l1', 3, 1, -1), c('5_17_l2', 5)], right: [c('5_17_r1', 17)] },
    },
    {
      num: 18,
      title: 'Dua Sisi Koefisien Besar',
      tip: 'Kumpulkan x di kiri (7x − 3x = 4x) dan angka di kanan (−6 − 10 = −16), lalu bagi 4!',
      par: 5,
      sol: -4,
      init: { left: [v('5_18_l1', 7), c('5_18_l2', 10)], right: [v('5_18_r1', 3), c('5_18_r2', -6)] },
    },
    {
      num: 19,
      title: 'Gerbang Maharaja Aljabar',
      tip: 'Buka kurung 2(2x − 3) menjadi 4x − 6, lalu kumpulkan x di kiri dan angka di kanan!',
      par: 6,
      sol: 5,
      init: { left: [g('5_19_l1', 2, 2, -3)], right: [v('5_19_r1', 1), c('5_19_r2', 9)] },
    },
  ];

  return specs.map((s) => ({
    id: `5-${s.num}`,
    chapterId: 5,
    levelNumber: s.num,
    title: s.title,
    tip: s.tip,
    defaultVisual: 'symbols',
    parMoves: s.par,
    solution: s.sol,
    initial: s.init,
  }));
}

export const CHAPTERS: ChapterDef[] = [
  // =========================================================================
  // BAB 0: KHUSUS SIMBOL SAJA (20 STAGES)
  // =========================================================================
  {
    id: 0,
    title: 'Bab 0: Pantai Simbol Dasar',
    subtitle: 'Pahami konsep pindah ruas dan pasangan lawan tanpa angka sama sekali!',
    focusRule: 'Simbol Murni · Konsep Dasar',
    artwork: '/src/assets/images/chapter_batu_lawan_1795079216185.jpg',
    levels: [
      {
        id: '0-1',
        chapterId: 0,
        levelNumber: 1,
        title: 'Mengenal Peti & Pasangan Lawan',
        tip: 'Tarik batu Surya ke atas Lawan Surya agar saling menghapus dan Peti Pusaka sendirian!',
        defaultVisual: 'pure_symbols',
        parMoves: 1,
        initial: {
          left: [v('l1', 1), sym('l2', 'sun', 1), sym('l3', 'sun', -1)],
          right: [sym('r1', 'shell', 1)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Halo! Aku Kibo si Hiu Gemoy!',
            message:
              'Selamat datang di Pantai Bab 0! Di sini belum ada angka sama sekali. Tugas kita cuma satu: buat Peti Pusaka berdiri sendirian di satu sisi timbangan!',
            highlightIds: ['l1'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Pasangan Lawan Saling Menghapus!',
            message:
              'Lihat di samping Peti ada Surya (hijau) dan Lawan Surya (merah putus-putus). Tarik Surya ke atas Lawan Surya — keduanya langsung lenyap!',
            highlightIds: ['l2', 'l3'],
            buttonLabel: 'Ayo Coba!',
          },
        ],
      },
      {
        id: '0-2',
        chapterId: 0,
        levelNumber: 2,
        title: 'Menyeberang Jembatan Simbol',
        tip: 'Tarik Surya dari kiri menyeberangi jembatan = ke kanan (jadi Lawan Surya), lalu hapus pasangannya!',
        defaultVisual: 'pure_symbols',
        parMoves: 2,
        initial: {
          left: [v('l1', 1), sym('l2', 'sun', 1)],
          right: [sym('r1', 'shell', 1), sym('r2', 'sun', 1)],
        },
      },
      {
        id: '0-3',
        chapterId: 0,
        levelNumber: 3,
        title: 'Lawan Berubah Jadi Asli',
        tip: 'Tarik Lawan Daun menyeberangi jembatan = ke kanan agar berubah menjadi Daun asli!',
        defaultVisual: 'pure_symbols',
        parMoves: 1,
        initial: {
          left: [v('l1', 1), sym('l2', 'leaf', -1)],
          right: [sym('r1', 'shell', 1)],
        },
      },
      {
        id: '0-4',
        chapterId: 0,
        levelNumber: 4,
        title: 'Peti di Ruas Kanan',
        tip: 'Peti Pusaka juga boleh sendirian di ruas kanan! Pindahkan Surya dan Lawan Daun ke ruas kiri.',
        defaultVisual: 'pure_symbols',
        parMoves: 3,
        initial: {
          left: [sym('l1', 'sun', 1), sym('l2', 'shell', 1)],
          right: [v('r1', 1), sym('r2', 'sun', 1), sym('r3', 'leaf', -1)],
        },
      },
      ...buildBab0ExtraStages(),
      {
        id: '0-boss',
        chapterId: 0,
        levelNumber: 20,
        title: 'Bos: Cumi Cilik Simbol',
        tip: 'Selesaikan 3 teka-teki simbol berturut-turut untuk mengalahkan Cumi Cilik!',
        defaultVisual: 'pure_symbols',
        parMoves: 7,
        isBoss: true,
        initial: {
          left: [v('b0p1_1', 1), sym('b0p1_2', 'leaf', 1), sym('b0p1_3', 'leaf', -1)],
          right: [sym('b0p1_4', 'sun', 1)],
        },
        boss: {
          name: 'Cumi Cilik',
          role: 'Bos Bab 0 · Cumi Pantai Simbol',
          personality: 'Penakut',
          gimmick: 'normal',
          gimmickLabel: 'Gimmick: Biasa',
          gimmickDesc: 'Pertarungan simbol santai tanpa jebakan waktu.',
          timeLimitSeconds: 90,
          artwork: BOSS_TURTLE_ART,
          introLine: 'E-eeh?! Kamu mau mendekat?! Jangan galak-galak ya... pecahkan simbolnya pelan-pelan saja!',
          tauntLines: [
            'Kyaaa! Jangan colek tentakelku, aku geli dan takut!',
            'H-hiu Kibo jangan gigit aku ya... aku cuma cumi kecil!',
            'Waduh, jantung cumiku deg-degan! Pelan-pelan dong mainnya!',
          ],
          hitLines: [
            'Waaah! Pasangan simbolku hilang, aku makin gemetar!',
            'Aduh mamaa! Tinggal satu nyawa lagi, jangan cepat-cepat dong!',
          ],
          defeatLine: 'Huhu aku nyerah! Kamu jago banget... nanti aku latihan biar jadi besar dan berani!',
          timeoutLine: 'H-hah?! Waktunya habis?! Horeee aku selamat! Ternyata aku nggak perlu takut sama kamu, wleee!',
          kiboLines: {
            intro: 'Ssst, Cumi Cilik ini penakut tapi baik hati! Tenang saja, belum ada jebakan aneh di sini.',
            tapLines: [
              'Hihi, lihat deh Cumi Cilik langsung sembunyi tiap kali kita tatap!',
              'Tenang Cumi Cilik, aku cuma hiu gemoy ramah kok, nggak bakal gigit!',
              'Fokus pisahkan Peti Pusaka ya, si Cumi nggak punya jebakan waktu!',
            ],
            gimmickAlert: 'Cumi Cilik cuma gemetar di tempat—lanjutkan ritme santaimu!',
            hitCheer: 'Kena! Cumi Cilik kaget sampai menyemburkan tinta mini!',
            victoryPreTos: 'Horeee! Cumi Cilik menyerah dengan sopan! Ayo tos sirip dulu buat kemenangan pertamamu!',
            victoryPostTos: 'TOS MANTAP! Bab 0 tuntas! Si Cumi janji mau latihan biar lebih berani suatu hari nanti!',
            defeatEncourage: 'Hihi, Cumi Cilik kabur duluan karena waktunya habis! Yuk kejar lagi, pasti langsung menang!',
          },
          phases: [
            {
              label: 'Fase 1: Hapus Pasangan',
              tip: 'Gabungkan Daun dan Lawan Daun agar Peti Pusaka sendirian!',
              initial: {
                left: [v('b0p1_1', 1), sym('b0p1_2', 'leaf', 1), sym('b0p1_3', 'leaf', -1)],
                right: [sym('b0p1_4', 'sun', 1)],
              },
            },
            {
              label: 'Fase 2: Seberangi Jembatan',
              tip: 'Pindahkan Kerang ke ruas kanan lalu hapus dengan pasangannya!',
              initial: {
                left: [v('b0p2_1', 1), sym('b0p2_2', 'shell', 1)],
                right: [sym('b0p2_3', 'leaf', 1), sym('b0p2_4', 'shell', 1)],
              },
            },
            {
              label: 'Fase 3: Ujian Dua Simbol',
              tip: 'Pindahkan Surya dan Lawan Daun dari sisi Peti agar Peti sendirian!',
              initial: {
                left: [sym('b0p3_1', 'sun', 1), sym('b0p3_2', 'shell', 1)],
                right: [v('b0p3_3', 1), sym('b0p3_4', 'sun', 1), sym('b0p3_5', 'leaf', -1)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 1: BATU ANGKA & LAWAN (20 STAGES)
  // =========================================================================
  {
    id: 1,
    title: 'Bab 1: Pulau Batu Angka',
    subtitle: 'Saatnya batu simbol membawa nilai angka! Gabungkan dan hapus menuju nol.',
    focusRule: 'Pembatalan Nol & Angka Awal',
    artwork: '/src/assets/images/chapter_jembatan_ruas_1795079216463.jpg',
    levels: [
      {
        id: '1-1',
        chapterId: 1,
        levelNumber: 1,
        title: 'Pasangan +2 dan −2',
        tip: 'Batu Surya (+2) dan Batu Bulan (−2) saling meniadakan menjadi 0. Tarik salah satu ke atas yang lain!',
        defaultVisual: 'stones',
        parMoves: 1,
        solution: 4,
        initial: {
          left: [v('l1', 1), c('l2', 2), c('l3', -2)],
          right: [c('r1', 4)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Kibo Kembali! Sekarang Pakai Angka!',
            message:
              'Ingat Peti Pusaka tadi? Sekarang ia punya nama keren: x! Dan batu Surya & Bulan kini membawa angka positif (+) dan negatif (−).',
            highlightIds: ['l1'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Aturannya Tetap Sama Persis!',
            message:
              'Tarik +2 ke atas −2 untuk menghapusnya menjadi 0! Setelah itu x sendirian dan kamu langsung tahu nilainya.',
            highlightIds: ['l2', 'l3'],
            buttonLabel: 'Ayo Mulai!',
          },
        ],
      },
      {
        id: '1-2',
        chapterId: 1,
        levelNumber: 2,
        title: 'Menyeberang Jembatan Angka',
        tip: 'Tarik Batu Surya (+3) menyeberangi jembatan = ke ruas kanan. Lihat tandanya berubah jadi −3!',
        defaultVisual: 'stones',
        parMoves: 2,
        solution: 5,
        initial: {
          left: [v('l1', 1), c('l2', 3)],
          right: [c('r1', 8)],
        },
      },
      {
        id: '1-3',
        chapterId: 1,
        levelNumber: 3,
        title: 'Batu Bulan Menyeberang',
        tip: 'Tarik Batu Bulan (−2) ke ruas kanan agar berubah menjadi +2, lalu gabungkan dengan +4!',
        defaultVisual: 'stones',
        parMoves: 2,
        solution: 6,
        initial: {
          left: [v('l1', 1), c('l2', -2)],
          right: [c('r1', 4)],
        },
      },
      {
        id: '1-4',
        chapterId: 1,
        levelNumber: 4,
        title: 'Rapikan Dua Sisi',
        tip: 'Gabungkan batu sejenis di ruas kiri dulu (+4 dan −1), lalu pindahkan ke ruas kanan.',
        defaultVisual: 'stones',
        parMoves: 3,
        solution: 5,
        initial: {
          left: [v('l1', 1), c('l2', 4), c('l3', -1)],
          right: [c('r1', 8)],
        },
      },
      {
        id: '1-5',
        chapterId: 1,
        levelNumber: 5,
        title: 'Batu Pusaka di Kanan',
        tip: 'Batu Pusaka x boleh sendirian di ruas kanan. Pindahkan +3 ke kiri!',
        defaultVisual: 'stones',
        parMoves: 2,
        solution: 7,
        initial: {
          left: [c('l1', 10)],
          right: [v('r1', 1), c('r2', 3)],
        },
      },
      ...buildBab1ExtraStages(),
      {
        id: '1-boss',
        chapterId: 1,
        levelNumber: 20,
        title: 'Bos: Kapten Buntal Bajak Laut',
        tip: 'Kalahkan 3 tantangan batu angka dari Kapten Buntal bertopi bajak laut!',
        defaultVisual: 'stones',
        parMoves: 7,
        isBoss: true,
        initial: {
          left: [v('b1p1_1', 1), c('b1p1_2', 4)],
          right: [c('b1p1_3', 9)],
        },
        boss: {
          name: 'Kapten Buntal',
          role: 'Bos Bab 1 · Ikan Buntal Bajak Laut',
          personality: 'Iri',
          gimmick: 'speed_enrage',
          gimmickLabel: 'Gimmick: Waktu 2× Saat 1 HP',
          gimmickDesc: 'Saat tersisa 1 HP, Kapten Buntal mempercepat waktu 2× lipat!',
          timeLimitSeconds: 100,
          enrageGimmickLine: 'TIDAK ADIL!! Tinggal 1 HP?! Kuputar jam pasir bajak lautku jadi 2× LEBIH CEPAT biar kamu panik!',
          artwork: BOSS_OWL_ART,
          introLine: 'Hmph! Enak banget kamu punya teman lucu kayak Kibo dan pintar berhitung! Aku juga mau dipuji!',
          tauntLines: [
            'Jangan pamer bintangmu di depanku, bikin aku iri saja!',
            'Kenapa sih Kibo selalu dukung kamu? Topi bajak lautku padahal lebih keren!',
            'Huh! Kamu di Bab 0 kemarin pasti cuma lagi beruntung saja!',
          ],
          hitLines: [
            'Iiih! Kok kamu bisa cepat banget?! Aku jadi makin iri!',
            'TIDAK ADIL!! Sisa 1 HP?! Kuputar jam pasir bajak lautku jadi 2× LEBIH CEPAT!',
          ],
          defeatLine: 'Pffft... aku kempes deh. Oke-oke, aku akui kamu memang lebih hebat dariku!',
          timeoutLine: 'Aha! Waktunya habis! Nah kan, kamu nggak sehebat yang Kibo banggakan! Sekarang giliran aku yang dipuji, hmph!',
          kiboLines: {
            intro: 'Waduh, Kapten Buntal iri banget melihat kita kompak! Hati-hati kalau HP-nya tinggal 1 ya!',
            tapLines: [
              'Psst! Kapten Buntal suka ngambek dan mempercepat jam saat tinggal 1 HP!',
              'Topi bajak lautnya keren sih, tapi kepintaranmu bikin dia makin iri!',
              'Jangan panik kalau dia menggembung bulat, tetap tenang pindah ruas!',
            ],
            gimmickAlert: 'AWAS!! Kapten Buntal panik di 1 HP — waktu sekarang berjalan 2× LEBIH CEPAT! Gaspol!',
            hitCheer: 'DUAR! Kapten Buntal makin iri dan pipinya tambah gembung!',
            victoryPreTos: 'PFFFT! Kapten Buntal kempes seperti balon pantai! Ayo tos dulu sama Kibo!',
            victoryPostTos: 'TOS JUARA! Bahkan jam pasir 2× cepatnya nggak sanggup mengalahkan kecepatanmu!',
            defeatEncourage: 'Ups, jam pasir Kapten Buntal tadi kencang banget! Yuk balas biar dia nggak pamer lagi!',
          },
          phases: [
            {
              label: 'Fase 1: Pindah Surya',
              tip: 'Pindahkan +4 ke ruas kanan lalu gabungkan dengan +9!',
              initial: {
                left: [v('b1p1_1', 1), c('b1p1_2', 4)],
                right: [c('b1p1_3', 9)],
              },
            },
            {
              label: 'Fase 2: Pindah Bulan',
              tip: 'Pindahkan −6 dari kanan ke kiri agar berubah menjadi +6!',
              initial: {
                left: [c('b1p2_1', 5)],
                right: [v('b1p2_2', 1), c('b1p2_3', -6)],
              },
            },
            {
              label: 'Fase 3: Jam Pasir 2× Cepat!',
              tip: 'Gabungkan +5 dan −2 di kiri, lalu pindahkan sisanya ke kanan!',
              initial: {
                left: [v('b1p3_1', 1), c('b1p3_2', 5), c('b1p3_3', -2)],
                right: [c('b1p3_4', 10)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 2: PINDAH TAMBAH & KURANG (20 STAGES)
  // =========================================================================
  {
    id: 2,
    title: 'Bab 2: Teluk Tambah & Kurang',
    subtitle: 'Beralih ke simbol aljabar murni dan kuasai bilangan negatif serta nol.',
    focusRule: 'Pindah Ruas + ↔ −',
    levels: [
      {
        id: '2-1',
        chapterId: 2,
        levelNumber: 1,
        title: 'Simbol Aljabar Pertama',
        tip: 'Pindahkan +6 ke kanan menjadi −6, lalu gabungkan dengan 11.',
        defaultVisual: 'symbols',
        parMoves: 2,
        solution: 5,
        initial: {
          left: [v('l1', 1), c('l2', 6)],
          right: [c('r1', 11)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Kibo Punya Kabar Seru!',
            message:
              'Selamat naik ke Bab 2! Sekarang tampilannya sudah seperti soal aljabar asli di sekolah, tapi cara mainnya 100% sama!',
            highlightIds: ['l1', 'l2'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Pindah +6 Melewati Jembatan =',
            message:
              'Tarik +6 ke ruas kanan. Perhatikan saat melompati jembatan =, ia berubah menjadi −6, lalu gabungkan dengan +11!',
            highlightIds: ['l2'],
            buttonLabel: 'Siap, Kibo!',
          },
        ],
      },
      {
        id: '2-2',
        chapterId: 2,
        levelNumber: 2,
        title: 'Hasil Negatif',
        tip: 'Hasil x boleh negatif! Pindahkan +7 ke ruas kanan, lalu gabungkan 3 dan −7.',
        defaultVisual: 'symbols',
        parMoves: 2,
        solution: -4,
        initial: {
          left: [v('l1', 1), c('l2', 7)],
          right: [c('r1', 3)],
        },
      },
      {
        id: '2-3',
        chapterId: 2,
        levelNumber: 3,
        title: 'Tukar Arah Ruas',
        tip: 'Pindahkan −5 dari ruas kanan ke ruas kiri agar menjadi +5.',
        defaultVisual: 'symbols',
        parMoves: 2,
        solution: 9,
        initial: {
          left: [c('l1', 4)],
          right: [v('r1', 1), c('r2', -5)],
        },
      },
      {
        id: '2-4',
        chapterId: 2,
        levelNumber: 4,
        title: 'Tiga Angka Berpadu',
        tip: 'Sederhanakan angka yang berada di ruas yang sama sebelum atau sesudah pindah ruas.',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 2,
        initial: {
          left: [v('l1', 1), c('l2', -3), c('l3', 8)],
          right: [c('r1', 7)],
        },
      },
      {
        id: '2-5',
        chapterId: 2,
        levelNumber: 5,
        title: 'Menuju Nol',
        tip: 'Jika semua angka di ruas kanan saling menghapus, hasilnya adalah 0!',
        defaultVisual: 'symbols',
        parMoves: 2,
        solution: 0,
        initial: {
          left: [v('l1', 1), c('l2', 5)],
          right: [c('r1', 5)],
        },
      },
      ...buildBab2ExtraStages(),
      {
        id: '2-boss',
        chapterId: 2,
        levelNumber: 20,
        title: 'Bos: Kepiting Manik-Manik Emas',
        tip: 'Hadapi banjir angka super banyak dari Kepiting Emas yang kikir!',
        defaultVisual: 'symbols',
        parMoves: 24,
        isBoss: true,
        initial: {
          left: [
            v('b2p1_1', 1),
            c('b2p1_2', 12),
            c('b2p1_3', -5),
            c('b2p1_4', 8),
            c('b2p1_5', -3),
          ],
          right: [c('b2p1_6', 15), c('b2p1_7', -7), c('b2p1_8', 9), c('b2p1_9', -2)],
        },
        boss: {
          name: 'Kepiting Emas',
          role: 'Bos Bab 2 · Kepiting Manik-Manik Emas',
          personality: 'Kikir',
          gimmick: 'many_numbers',
          gimmickLabel: 'Gimmick: Banjir Angka Emas',
          gimmickDesc: 'Kepiting Kikir menumpuk sangat banyak kartu angka di kedua ruas!',
          timeLimitSeconds: 140,
          artwork: BOSS_TURTLE_ART,
          introLine: 'Klak-klak! Awas jangan sentuh manik-manik emasku! Kutumpuk SEMUA koin angkaku di papan biar kamu pusing!',
          tauntLines: [
            'Hei! Jangan ketuk-ketuk, nanti manik-manik emasku lecet!',
            'Semuanya milikku! Lihat tumpukan angkaku—sebanyak harta karunku!',
            'Klak! Mau lewat? Hitung dulu segunung angka emasku tanpa keliru!',
          ],
          hitLines: [
            'Aduh! Tumpukan koin pertamaku beres?! Rugi besar aku! Nih, kutambah lebih banyak lagi!',
            'JANGAN! Brankas emas terakhirku tinggal 1 HP—kubanjiri papan dengan semua angka simpananku!',
          ],
          defeatLine: 'Klak... bangkrut sudah aku! Ambil saja bintangnya, tapi manik-manik emasku tetap kubawa pulang!',
          timeoutLine: 'Klak-klak-klak! Waktu habis! Kebanyakan angka ya? Semua koin emas tetap milikku sendiri!',
          kiboLines: {
            intro: 'WAAAH! Kepiting Emas pelit banget sampai menumpuk segunung angka di papan! Ayo rapikan satu per satu!',
            tapLines: [
              'Gila, angka emasnya banyak banget! Gabungkan angka di sisi yang sama biar cepat rapi!',
              'Jangan silau sama manik-manik emasnya ya, fokus sisakan x sendirian!',
              'Kepiting kikir itu mengira kita bakal bingung dengan tumpukan angka sebanyak ini!',
            ],
            gimmickAlert: 'BANJIR ANGKA! Kepiting Emas menumpuk banyak sekali angka emas di kedua ruas!',
            hitCheer: 'KEREN! Gunung angka Kepiting Emas langsung ludes kamu bereskan!',
            victoryPreTos: 'YEAY! Brankas angka Kepiting Emas berhasil kamu bongkar tuntas! Tos dulu yuk!',
            victoryPostTos: 'TOS BERKILAU! Meski angkanya segunung, ketelitianmu tetap tak terkalahkan!',
            defeatEncourage: 'Wah, angka Kepiting Emas memang super ramai! Coba gabungkan yang seruas dulu di percobaan berikut ya!',
          },
          phases: [
            {
              label: 'Fase 1: Tumpukan Koin Emas',
              tip: 'Gabungkan semua angka di ruas kiri dan kanan dulu sebelum pindah ruas!',
              initial: {
                left: [
                  v('b2p1_1', 1),
                  c('b2p1_2', 12),
                  c('b2p1_3', -5),
                  c('b2p1_4', 8),
                  c('b2p1_5', -3),
                ],
                right: [c('b2p1_6', 15), c('b2p1_7', -7), c('b2p1_8', 9), c('b2p1_9', -2)],
              },
            },
            {
              label: 'Fase 2: Gudang Manik Negatif',
              tip: 'Sederhanakan tumpukan angka di kedua ruas, lalu sisakan x sendirian di kanan!',
              initial: {
                left: [
                  c('b2p2_1', 14),
                  c('b2p2_2', -9),
                  c('b2p2_3', 6),
                  c('b2p2_4', -11),
                  c('b2p2_5', 4),
                ],
                right: [
                  v('b2p2_6', 1),
                  c('b2p2_7', 10),
                  c('b2p2_8', -6),
                  c('b2p2_9', 8),
                  c('b2p2_10', -5),
                ],
              },
            },
            {
              label: 'Fase 3: Brankas Harta Raksasa',
              tip: 'Gabungkan seluruh gunung angka di kiri dan kanan lalu seberangkan sisanya!',
              initial: {
                left: [
                  v('b2p3_1', 1),
                  c('b2p3_2', 20),
                  c('b2p3_3', -8),
                  c('b2p3_4', 15),
                  c('b2p3_5', -12),
                  c('b2p3_6', 6),
                ],
                right: [
                  c('b2p3_7', 18),
                  c('b2p3_8', -9),
                  c('b2p3_9', 14),
                  c('b2p3_10', -6),
                  c('b2p3_11', 10),
                ],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 3: KUMPULKAN SUKU X (20 STAGES)
  // =========================================================================
  {
    id: 3,
    title: 'Bab 3: Laguna Suku x',
    subtitle: 'Variabel x muncul di kedua ruas. Satukan semua x di satu sisi!',
    focusRule: 'Pindah Variabel & Balik Tanda',
    levels: [
      {
        id: '3-1',
        chapterId: 3,
        levelNumber: 1,
        title: 'Dua Sisi Ber-x',
        tip: 'Tarik +x dari ruas kanan ke ruas kiri (jadi −x), lalu gabungkan dengan 2x!',
        defaultVisual: 'symbols',
        parMoves: 2,
        solution: 5,
        initial: {
          left: [v('l1', 2)],
          right: [v('r1', 1), c('r2', 5)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Eh, Ada x di Kiri DAN Kanan!',
            message:
              'Jangan bingung! Kibo punya rahasianya: batu x juga bisa menyeberangi jembatan = sama seperti batu angka!',
            highlightIds: ['l1', 'r1'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Kumpulkan x di Satu Sisi',
            message:
              'Tarik +x dari ruas kanan ke ruas kiri (berubah jadi −x), lalu gabungkan dengan 2x menjadi x sendirian!',
            highlightIds: ['r1'],
            buttonLabel: 'Ayo Kumpulkan!',
          },
        ],
      },
      {
        id: '3-2',
        chapterId: 3,
        levelNumber: 2,
        title: 'Tukar Tempat x dan Angka',
        tip: 'Pindahkan 2x ke kiri dan −2 ke kanan, lalu gabungkan suku sejenis di tiap ruas.',
        defaultVisual: 'symbols',
        parMoves: 4,
        solution: 6,
        initial: {
          left: [v('l1', 3), c('l2', -2)],
          right: [v('r1', 2), c('r2', 4)],
        },
      },
      {
        id: '3-3',
        chapterId: 3,
        levelNumber: 3,
        title: 'Lebih Besar di Kanan',
        tip: 'Kumpulkan x di ruas kanan (pindahkan x dari kiri ke kanan) agar koefisien x tetap positif!',
        defaultVisual: 'symbols',
        parMoves: 4,
        solution: 5,
        initial: {
          left: [v('l1', 1), c('l2', 6)],
          right: [v('r1', 2), c('r2', 1)],
        },
      },
      {
        id: '3-4',
        chapterId: 3,
        levelNumber: 4,
        title: 'Menjinakkan −x',
        tip: 'Jika tersisa −x di kiri, kamu bisa pindahkan −x ke kanan, atau tekan "Balik ±"!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 3,
        initial: {
          left: [c('l1', 5), v('l2', -1)],
          right: [c('r1', 2)],
        },
      },
      {
        id: '3-5',
        chapterId: 3,
        levelNumber: 5,
        title: 'Adu Variabel Negatif',
        tip: 'Pindahkan 3x ke kiri menjadi −3x, dan pindahkan −5 ke kanan menjadi +5.',
        defaultVisual: 'symbols',
        parMoves: 4,
        solution: 3,
        initial: {
          left: [v('l1', 4), c('l2', -5)],
          right: [v('r1', 3), c('r2', -2)],
        },
      },
      ...buildBab3ExtraStages(),
      {
        id: '3-boss',
        chapterId: 3,
        levelNumber: 20,
        title: 'Bos: Kura-Kura Meriam Tempurung',
        tip: 'Taklukkan 3 persamaan variabel x di kedua sisi dari Kura Meriam!',
        defaultVisual: 'symbols',
        parMoves: 10,
        isBoss: true,
        initial: {
          left: [v('b3p1_1', 3)],
          right: [v('b3p1_2', 2), c('b3p1_3', 7)],
        },
        boss: {
          name: 'Kura Meriam',
          role: 'Bos Bab 3 · Kura-Kura Cannon Tempurung',
          personality: 'Malas',
          gimmick: 'freeze_penalty',
          gimmickLabel: 'Gimmick: Waktu Beku · Salah −30 dtk',
          gimmickDesc: 'Waktu membeku diam, tapi salah pindah memotong 30 detik (maks 4× salah)!',
          timeLimitSeconds: 120,
          maxMistakes: 4,
          penaltySeconds: 30,
          artwork: BOSS_OWL_ART,
          introLine: 'Huaaahm... aku malas menghitung detik, jadi waktunya kubekukan saja. Tapi kalau kamu salah pindah, kupotong 30 detik ya...',
          tauntLines: [
            'Zzz... jangan ganggu dong, aku lagi enak rebahan di tempurung...',
            'Santai saja, jamnya beku kok... asal jangan sampai salah pindah 4 kali ya, hoaaam...',
            'Boleh nggak kita tunda besok? Meriam tempurungku saja malas nembak...',
          ],
          hitLines: [
            'Hoaaam... kena ya? Aduh malas banget bangun buat fase kedua...',
            'Ugh, kamu teliti banget sih... satu lagi deh biar aku bisa lanjut tidur.',
          ],
          defeatLine: 'Akhirnya selesai juga... terima kasih ya, sekarang aku bisa tidur siang dengan tenang. Zzz...',
          timeoutLine: 'Huaaahm... 4 kali salah pindah dan waktu habis tuh! Padahal jamnya sudah kubekukan lho. Tidur lagi ah, zzz...',
          kiboLines: {
            intro: 'Asyik, waktu Kura Meriam nge-freeze! Tapi JANGAN asal pindah ya — tiap salah pindah dipotong 30 detik (maks 4× salah)!',
            tapLines: [
              'Sst, mumpung waktunya beku, pikir dulu baik-baik sebelum menggeser batu!',
              'Hati-hati! Kura Meriam cuma membolehkan maksimal 4 kali salah memindahkan!',
              'Kura-kura ini malas banget sampai jamnya ikut tidur, manfaatkan buat teliti!',
            ],
            gimmickAlert: 'ADUH! Salah pindah ruas — Kura Meriam langsung memotong 30 detik waktumu! Pikir tenang ya!',
            hitCheer: 'TEPAT SEKALI! Kura Meriam sampai menguap lebar kena tembakan telitimu!',
            victoryPreTos: 'MANTAP! Tanpa terburu-buru kamu sukses menaklukkan Kura Meriam! Ayo tos santai sama Kibo!',
            victoryPostTos: 'TOS TELITI! Biarkan Kura Meriam lanjut tidur siang sementara kita melaju ke Bab 4!',
            defeatEncourage: 'Ups, salah pindah 4 kali bikin waktunya langsung habis! Karena jamnya beku, kita bisa pelan-pelan mikir di percobaan berikut!',
          },
          phases: [
            {
              label: 'Fase 1: Satukan x (Waktu Beku)',
              tip: 'Pindahkan 2x ke ruas kiri dan gabungkan dengan 3x.',
              initial: {
                left: [v('b3p1_1', 3)],
                right: [v('b3p1_2', 2), c('b3p1_3', 7)],
              },
            },
            {
              label: 'Fase 2: Jinakkan −x (Waktu Beku)',
              tip: 'Pindahkan +8 ke kanan, lalu balik tanda kedua ruas dengan "Balik ±"!',
              initial: {
                left: [c('b3p2_1', 8), v('b3p2_2', -1)],
                right: [c('b3p2_3', 3)],
              },
            },
            {
              label: 'Fase 3: Tukar Dua Sisi (Waktu Beku)',
              tip: 'Kumpulkan x di kiri dan angka di kanan!',
              initial: {
                left: [v('b3p3_1', 4), c('b3p3_2', -3)],
                right: [v('b3p3_3', 3), c('b3p3_4', 5)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 4: PINDAH KALI & BAGI (20 STAGES)
  // =========================================================================
  {
    id: 4,
    title: 'Bab 4: Karang Kali & Bagi',
    subtitle: 'Saat x dikali koefisien atau dibagi penyebut, seberangkan pengalinya!',
    focusRule: 'Pindah Ruas × ↔ ÷',
    levels: [
      {
        id: '4-1',
        chapterId: 4,
        levelNumber: 1,
        title: 'Kali Menjadi Bagi',
        tip: 'Tarik tanda ×2 pada batu 2x menyeberangi jembatan = (atau ketuk 2x lalu pilih Pindah ×2 → ÷2)!',
        defaultVisual: 'symbols',
        parMoves: 1,
        solution: 4,
        initial: {
          left: [v('l1', 2)],
          right: [c('r1', 8)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Kibo Bawa Jurus Baru: Kali ↔ Bagi!',
            message:
              'Di batu 2x, angka 2 menempel sebagai pengali (2 × x). Untuk melepasnya, cukup tarik kotak kecil "2×" menyeberangi jembatan =!',
            highlightIds: ['l1'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Tarik 2× ke Ruas Kanan!',
            message:
              'Saat 2× melewati jembatan =, ia berubah jadi ÷2 dan langsung membagi 8 menjadi 4! Kamu juga bisa mengetuk batu 2x lalu tekan tombol "Pindah ×2 → ÷2".',
            highlightIds: ['l1'],
            buttonLabel: 'Ayo Coba!',
          },
        ],
      },
      {
        id: '4-2',
        chapterId: 4,
        levelNumber: 2,
        title: 'Tambah Dulu, Lalu Bagi',
        tip: 'Pindahkan +2 ke kanan dulu dan gabungkan (11 − 2 = 9), baru pindahkan ×3 menjadi ÷3!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 3,
        initial: {
          left: [v('l1', 3), c('l2', 2)],
          right: [c('r1', 11)],
        },
      },
      {
        id: '4-3',
        chapterId: 4,
        levelNumber: 3,
        title: 'Bagi Menjadi Kali',
        tip: 'Batu x dibagi 3 (x/3). Tarik tanda ÷3 menyeberangi jembatan = agar menjadi ×3!',
        defaultVisual: 'symbols',
        parMoves: 1,
        solution: 12,
        initial: {
          left: [v('l1', 1, 3)],
          right: [c('r1', 4)],
        },
      },
      {
        id: '4-4',
        chapterId: 4,
        levelNumber: 4,
        title: 'Pecahan dan Tambah',
        tip: 'Pindahkan +3 ke ruas kanan dulu (7 − 3 = 4), baru seberangkan ÷2 menjadi ×2!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 8,
        initial: {
          left: [v('l1', 1, 2), c('l2', 3)],
          right: [c('r1', 7)],
        },
      },
      {
        id: '4-5',
        chapterId: 4,
        levelNumber: 5,
        title: 'Koefisien Negatif',
        tip: 'Pindahkan −5 ke kanan dulu, gabungkan, lalu pindahkan ×(−2) menjadi ÷(−2)!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: -6,
        initial: {
          left: [v('l1', -2), c('l2', -5)],
          right: [c('r1', 7)],
        },
      },
      ...buildBab4ExtraStages(),
      {
        id: '4-boss',
        chapterId: 4,
        levelNumber: 20,
        title: 'Bos: Kapten Orca Mata Satu',
        tip: 'Taklukkan 3 persamaan perkalian dan pembagian beruntun dari Kapten Orca!',
        defaultVisual: 'symbols',
        parMoves: 15,
        isBoss: true,
        initial: {
          left: [v('b4p1_1', 4), c('b4p1_2', -3)],
          right: [c('b4p1_3', 13)],
        },
        boss: {
          name: 'Kapten Orca',
          role: 'Bos Bab 4 · Orca Bermata Satu',
          personality: 'Angkuh',
          gimmick: 'heal_once',
          gimmickLabel: 'Gimmick: Pulih Penuh Saat 1 HP',
          gimmickDesc: 'Saat sisa 1 HP, Kapten Orca kesal dan memulihkan seluruh HP-nya kembali penuh!',
          timeLimitSeconds: 165,
          healLine: 'CIH!! Aku KESAL!! Masa penguasa samudra tinggal 1 HP?! Kuaktifkan aura angkuh—HP-KU PULIH PENUH LAGI!!',
          artwork: BOSS_TURTLE_ART,
          introLine: 'Heh, cuma penantang kecil? Dengan satu mata tertutup pun aku seratus kali lebih cerdas dari semua ikan di samudra!',
          tauntLines: [
            'Beraninya menyentuh penguasa samudra! Tatap wibawaku yang tak tertandingi!',
            'Hmph, jurus kali dan bagimu masih terlalu lemah untuk levelku!',
            'Akulah yang terkuat di lautan—kamu hanyalah remahan ombak!',
          ],
          hitLines: [
            'Tch! Cuma kebetulan semata! Jangan besar kepala dulu!',
            'CIH!! Aku KESAL! HP-ku pulih penuh lagi—hadapi keseriusanku!',
            'Grr! Masih berani menyerang setelah aku pulih?!',
            'Mustahil! Bagaimana mungkin penantang kecil membuatku terdesak lagi?!',
          ],
          defeatLine: 'Hmph... tak kusangka ada yang sanggup menandingiku meski aku sudah pulih penuh. Baiklah, kau pantas kuhormati.',
          timeoutLine: 'Hahaha! Waktu habis! Sudah kuduga, kelas kita terlalu jauh berbeda. Pulang dan berlatihlah lagi sebelum menantangku!',
          kiboLines: {
            intro: 'Wih, Kapten Orca sombong banget! Firasat hiuku bilang dia nggak bakal rela kalah begitu saja saat sisa 1 HP...',
            tapLines: [
              'Lihat tuh gayanya angkuh banget! Jangan kaget kalau dia kesal dan memulihkan HP-nya!',
              'Tenang, jurus × ↔ ÷ kamu sudah makin mantap buat mematahkan kesombongannya!',
              'Kalau dia memulihkan HP, tetap semangat ya — dia cuma bisa melakukannya sekali!',
            ],
            gimmickAlert: 'WAAAH!! Kapten Orca kesal banget sampai MEMULIHKAN HP-nya penuh lagi! Tenang, cuma sekali kok—ayo hantam lagi!',
            hitCheer: 'BOOOM! Kesombongan Kapten Orca langsung goyah kena jurus kali-bagimu!',
            victoryPreTos: 'GOKIL!! Kapten Orca sudah memulihkan HP penuh tapi TETAP kamu kalahkan! Tos dulu!',
            victoryPostTos: 'TOS PENGUASA LAUTAN! Akhirnya Kapten Orca mengakui kehebatanmu dan Kibo!',
            defeatEncourage: 'Curang tuh Kapten Orca pakai pulih HP segala! Yuk tantang lagi, sekarang kita sudah tahu triknya!',
          },
          phases: [
            {
              label: 'Fase 1: Kali Menjadi Bagi',
              tip: 'Pindahkan −3 ke kanan dulu (jadi 16), lalu pindahkan ×4 → ÷4!',
              initial: {
                left: [v('b4p1_1', 4), c('b4p1_2', -3)],
                right: [c('b4p1_3', 13)],
              },
            },
            {
              label: 'Fase 2: Bagi Menjadi Kali',
              tip: 'Pindahkan −2 ke kanan (jadi 5), lalu pindahkan ÷3 → ×3!',
              initial: {
                left: [v('b4p2_1', 1, 3), c('b4p2_2', -2)],
                right: [c('b4p2_3', 3)],
              },
            },
            {
              label: 'Fase 3 (Pulih!): Pengali Lima',
              tip: 'Pindahkan +4 ke kanan (jadi 15), lalu pindahkan ×5 → ÷5!',
              initial: {
                left: [v('b4p3_1', 5), c('b4p3_2', 4)],
                right: [c('b4p3_3', 19)],
              },
            },
            {
              label: 'Fase 4 (Pulih!): Pecahan Empat',
              tip: 'Pindahkan +3 ke kanan (jadi 3), lalu pindahkan ÷4 → ×4!',
              initial: {
                left: [v('b4p4_1', 1, 4), c('b4p4_2', 3)],
                right: [c('b4p4_3', 6)],
              },
            },
            {
              label: 'Fase 5: Koefisien Negatif Pamungkas',
              tip: 'Pindahkan +4 ke kanan (jadi 9), lalu pindahkan ×(−3) → ÷(−3)!',
              initial: {
                left: [v('b4p5_1', -3), c('b4p5_2', 4)],
                right: [c('b4p5_3', 13)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 5: TANTANGAN SAMUDRA ALJABAR (20 STAGES)
  // =========================================================================
  {
    id: 5,
    title: 'Bab 5: Samudra Aljabar',
    subtitle: 'Gabungkan tanda kurung, distribusi, dan pindah ruas bertingkat.',
    focusRule: 'Distribusi Kurung & Multi-Langkah',
    levels: [
      {
        id: '5-1',
        chapterId: 5,
        levelNumber: 1,
        title: 'Membuka Kurung Pertama',
        tip: 'Ketuk 2(x + 3) lalu tekan "Buka Kurung" menjadi 2x + 6 — atau langsung pindahkan ×2 ke kanan!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 2,
        initial: {
          left: [g('l1', 2, 1, 3)],
          right: [c('r1', 10)],
        },
        tutorialSteps: [
          {
            mood: 'wave',
            title: 'Bab Terakhir! Kibo Bangga Padamu!',
            message:
              'Sekarang kita bertemu batu Tanda Kurung: 2(x + 3). Artinya angka 2 mengalikan semua yang ada di dalam kurung!',
            highlightIds: ['l1'],
            buttonLabel: 'Lanjut',
          },
          {
            mood: 'point',
            title: 'Dua Cara Cerdas Memecahkannya',
            message:
              'Ketuk batu 2(x + 3) lalu tekan "Buka Kurung" supaya berubah menjadi 2x + 6 — ATAU langsung tarik pengali 2× ke ruas kanan untuk membagi 10!',
            highlightIds: ['l1'],
            buttonLabel: 'Ayo Pecahkan!',
          },
        ],
      },
      {
        id: '5-2',
        chapterId: 5,
        levelNumber: 2,
        title: 'Kurung Pengurangan',
        tip: 'Kamu bisa bagi kedua ruas dengan 3, atau buka kurung 3(x − 2) menjadi 3x − 6!',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: 5,
        initial: {
          left: [g('l1', 3, 1, -2)],
          right: [c('r1', 9)],
        },
      },
      {
        id: '5-3',
        chapterId: 5,
        levelNumber: 3,
        title: 'Dua Ruas & Koefisien',
        tip: 'Kumpulkan x di kiri (4x − 2x = 2x), kumpulkan angka di kanan (11 − 3 = 8), lalu bagi 2!',
        defaultVisual: 'symbols',
        parMoves: 5,
        solution: 4,
        initial: {
          left: [v('l1', 4), c('l2', 3)],
          right: [v('r1', 2), c('r2', 11)],
        },
      },
      {
        id: '5-4',
        chapterId: 5,
        levelNumber: 4,
        title: 'Tantangan Lima Langkah',
        tip: 'Satukan 5x dengan −2x di kiri dan 8 dengan +4 di kanan, lalu pindahkan pengali 3.',
        defaultVisual: 'symbols',
        parMoves: 5,
        solution: 4,
        initial: {
          left: [v('l1', 5), c('l2', -4)],
          right: [v('r1', 2), c('r2', 8)],
        },
      },
      {
        id: '5-5',
        chapterId: 5,
        levelNumber: 5,
        title: 'Ujian Jembatan Nusantara',
        tip: 'Buka kurung 2(x + 4) menjadi 2x + 8, lalu kumpulkan x di kiri dan angka di kanan!',
        defaultVisual: 'symbols',
        parMoves: 5,
        solution: 5,
        initial: {
          left: [g('l1', 2, 1, 4)],
          right: [v('r1', 1), c('r2', 13)],
        },
      },
      ...buildBab5ExtraStages(),
      {
        id: '5-boss',
        chapterId: 5,
        levelNumber: 20,
        title: 'Bos Akhir: Cthulhu Evolusi Cumi Cilik',
        tip: 'Ujian puncak 6 HP melawan Cthulhu kosmik — wujud evolusi raksasa dari Cumi Cilik Bab 0!',
        defaultVisual: 'symbols',
        parMoves: 26,
        isBoss: true,
        initial: {
          left: [g('b5p1_1', 2, 1, 5)],
          right: [c('b5p1_2', 16)],
        },
        boss: {
          name: 'Cthulhu Samudra',
          role: 'Bos Akhir · Evolusi Cumi Cilik Bab 0',
          personality: 'Marah',
          gimmick: 'cosmic_many_hp',
          gimmickLabel: 'Gimmick: 6 HP · Kosmik & Waktu 2× (1 HP)',
          gimmickDesc: 'HP super banyak (6 HP)! Saat sisa 1 HP, dimensi kosmik terbuka dan waktu berjalan 2× lebih cepat!',
          timeLimitSeconds: 180,
          enrageGimmickLine: 'ROAAAAR!! SATU NYAWA TERAKHIR?! KUBUKA DIMENSI KOSMIK DAN KUPERCEPAT WAKTU 2× LIPAT!!',
          artwork: BOSS_OWL_ART,
          introLine: 'ROAAAR! INGAT AKU?! CUMI CILIK BAB 0 KINI BEREVOLUSI DENGAN 6 HP PENUH AMARAH! RASAKAN KEKUATAN CTHULHU!',
          tauntLines: [
            'BERANINYA KAU MENYENTUHKU LAGI?! AMARAH KOSMIKKU AKAN MENGGUNCANG PAPANMU!',
            'AKU TIDAK PENAKUT LAGI! ENAM NYAWAKU TAK AKAN MUDAH RUNTUH!',
            'JANGAN SENYUM-SENYUM! TUNGGU SAAT DIMENSI KOSMIKKU TERBUKA!',
          ],
          hitLines: [
            'GRRRR!! Baru 1 HP hilang dari 6 nyawaku! Tidak mempan!!',
            'ARGH!! Jangan meremehkan wujud evolusiku!!',
            'ROAAR!! Amarah samudraku baru saja memanas!!',
            'TIDAK MUNGKIN!! Tinggal 2 nyawa?! Rasakan getaran galaksi!!',
            'ROAAAAR!! SATU NYAWA TERAKHIR?! DIMENSI KOSMIK TERBUKA — WAKTU 2× LEBIH CEPAT!!',
          ],
          defeatLine: 'Grrr... huff... amarah kosmikku padam. Baiklah... meski sudah berevolusi, kamu tetap juara sejati!',
          timeoutLine: 'MWUAHAHAHA!! WAKTU HABIS!! RASAKAN BALAS DENDAM KOSMIK CUMI CILIK YANG KINI MENJADI CTHULHU!',
          kiboLines: {
            intro: 'ASTAGA!! Cumi Cilik Bab 0 berevolusi jadi Cthulhu dengan 6 HP!! Aku di sisimu—kita pasti sanggup menaklukkannya!',
            tapLines: [
              'Jangan gentar lihat 6 nyawanya! Setiap fase selesai kita dapat tambahan waktu!',
              'Ingat waktu dia masih Cumi Cilik yang penakut? Sekarang amarahnya sampai bikin aura kosmik!',
              'Hati-hati di HP terakhirnya nanti—dimensi kosmiknya bikin waktu melesat 2× cepat!',
            ],
            gimmickAlert: 'DIMENSI KOSMIK TERBUKA!! Cthulhu tinggal 1 HP dan waktu melesat 2× CEPAT! Satu serangan terakhir lagi!!',
            hitCheer: 'Luar biasa! Satu lagi perisai energi Cthulhu hancur berkeping-keping!',
            victoryPreTos: 'LEGENDA!! Kamu menaklukkan 6 HP dan Mode Kosmik Cthulhu Samudra!! AYO TOS PALING EPOK SAMA KIBO!!',
            victoryPostTos: 'TOS GALAKSI!! Kamu resmi jadi Juara Tertinggi Samudra Aljabar! Kibo bangga banget sama kamu!',
            defeatEncourage: 'Cthulhu dengan 6 HP dan mode kosmiknya memang dahsyat! Tarik napas dulu—kita hantam lagi sampai menang!',
          },
          phases: [
            {
              label: 'Fase 1/6: Kurung Pembuka',
              tip: 'Buka kurung 2(x + 5) atau langsung pindahkan ×2 ke kanan!',
              initial: {
                left: [g('b5p1_1', 2, 1, 5)],
                right: [c('b5p1_2', 16)],
              },
            },
            {
              label: 'Fase 2/6: Dua Ruas Seimbang',
              tip: 'Kumpulkan x di kiri (5x − 2x) dan angka di kanan (14 − 5), lalu bagi 3!',
              initial: {
                left: [v('b5p2_1', 5), c('b5p2_2', 5)],
                right: [v('b5p2_3', 2), c('b5p2_4', 14)],
              },
            },
            {
              label: 'Fase 3/6: Kurung Tiga Kali',
              tip: 'Pindahkan ×3 ke kanan (jadi 5) atau buka kurung 3(x − 2)!',
              initial: {
                left: [g('b5p3_1', 3, 1, -2)],
                right: [c('b5p3_2', 15)],
              },
            },
            {
              label: 'Fase 4/6: Adu Variabel Samudra',
              tip: 'Kumpulkan x di kiri (4x − x = 3x) dan angka di kanan (8 + 7 = 15)!',
              initial: {
                left: [v('b5p4_1', 4), c('b5p4_2', -7)],
                right: [v('b5p4_3', 1), c('b5p4_4', 8)],
              },
            },
            {
              label: 'Fase 5/6: Gerbang Kosmik',
              tip: 'Buka kurung 2(x + 4) menjadi 2x + 8, lalu kumpulkan x di kiri!',
              initial: {
                left: [g('b5p5_1', 2, 1, 4)],
                right: [v('b5p5_2', 1), c('b5p5_3', 13)],
              },
            },
            {
              label: 'Fase 6/6: MODE KOSMIK · 2× CEPAT!',
              tip: 'Buka kurung 3(x − 2) menjadi 3x − 6, lalu kumpulkan x di kiri dan angka di kanan!',
              initial: {
                left: [g('b5p6_1', 3, 1, -2)],
                right: [v('b5p6_2', 1), c('b5p6_3', 4)],
              },
            },
          ],
        },
      },
    ],
  },
];

export const ALL_LEVELS = CHAPTERS.flatMap((ch) => ch.levels);

export function getNextLevel(currentId: string) {
  const idx = ALL_LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx + 1 >= ALL_LEVELS.length) return null;
  return ALL_LEVELS[idx + 1];
}
