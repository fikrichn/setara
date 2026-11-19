import { ChapterDef, SymbolFamily, Term } from './types';

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

export const CHAPTERS: ChapterDef[] = [
  // =========================================================================
  // BAB 0: KHUSUS SIMBOL SAJA (TANPA ANGKA, TANPA HURUF X)
  // =========================================================================
  {
    id: 0,
    title: 'Bab 0: Taman Simbol Dasar',
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
              'Selamat datang di Bab 0! Di sini belum ada angka sama sekali. Tugas kita cuma satu: buat Peti Pusaka berdiri sendirian di satu sisi timbangan!',
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
      {
        id: '0-boss',
        chapterId: 0,
        levelNumber: 5,
        title: 'Bos: Kura-Kura Batu Simbol',
        tip: 'Selesaikan 3 teka-teki simbol berturut-turut untuk mengalahkan Kura-Kura Batu!',
        defaultVisual: 'pure_symbols',
        parMoves: 7,
        isBoss: true,
        initial: {
          left: [v('b0p1_1', 1), sym('b0p1_2', 'leaf', 1), sym('b0p1_3', 'leaf', -1)],
          right: [sym('b0p1_4', 'sun', 1)],
        },
        boss: {
          name: 'Kura-Kura Batu',
          role: 'Penjaga Taman Simbol',
          artwork: BOSS_TURTLE_ART,
          introLine: 'Hoho! Tunjukkan kamu paham rahasia simbol sebelum menyentuh angka!',
          hitLines: [
            'Aduh! Pasangan lawanku hancur!',
            'Kuat juga! Coba selesaikan teka-teki terakhirku!',
          ],
          defeatLine: 'Luar biasa! Kamu lulus ujian simbol dasar dan siap mengenal angka!',
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
  // BAB 1: BATU & LAWAN (MULAI MENGENAL ANGKA)
  // =========================================================================
  {
    id: 1,
    title: 'Bab 1: Batu Angka & Lawan',
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
      {
        id: '1-boss',
        chapterId: 1,
        levelNumber: 6,
        title: 'Bos: Raja Timbangan Kayu',
        tip: 'Kalahkan 3 tantangan batu angka dari Raja Timbangan Kayu!',
        defaultVisual: 'stones',
        parMoves: 7,
        isBoss: true,
        initial: {
          left: [v('b1p1_1', 1), c('b1p1_2', 4)],
          right: [c('b1p1_3', 9)],
        },
        boss: {
          name: 'Raja Timbangan Kayu',
          role: 'Penjaga Bab 1 · Batu Angka',
          artwork: BOSS_OWL_ART,
          introLine: 'Kukira kamu hanya jago simbol! Buktikan keahlianmu dengan batu angka!',
          hitLines: [
            'Hoo! Hitunganmu cepat sekali!',
            'Satu ronde lagi! Jangan sampai lengah!',
          ],
          defeatLine: 'Hebat! Kamu sudah menguasai batu Surya dan Bulan!',
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
              label: 'Fase 3: Campuran Batu',
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
  // BAB 2: PINDAH TAMBAH & KURANG (SIMBOL ALJABAR MURNI)
  // =========================================================================
  {
    id: 2,
    title: 'Bab 2: Pindah Tambah & Kurang',
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
      {
        id: '2-boss',
        chapterId: 2,
        levelNumber: 6,
        title: 'Bos: Penjaga Jembatan Negatif',
        tip: 'Hadapi 3 persamaan simbol berangka negatif untuk menaklukkan Bos Bab 2!',
        defaultVisual: 'symbols',
        parMoves: 7,
        isBoss: true,
        initial: {
          left: [v('b2p1_1', 1), c('b2p1_2', 9)],
          right: [c('b2p1_3', 4)],
        },
        boss: {
          name: 'Penjaga Jembatan',
          role: 'Bos Bab 2 · Bilangan Negatif',
          artwork: BOSS_TURTLE_ART,
          introLine: 'Awas! Di sini angka negatif bisa muncul kapan saja. Jangan sampai salah tanda!',
          hitLines: [
            'Grr! Kamu tidak takut angka negatif ternyata!',
            'Tinggal satu jurus terakhirku — fokus!',
          ],
          defeatLine: 'Mantap! Pindah ruas tambah dan kurang kini sudah di luar kepalamu!',
          phases: [
            {
              label: 'Fase 1: Hasil Negatif',
              tip: 'Pindahkan +9 ke kanan dan gabungkan dengan +4.',
              initial: {
                left: [v('b2p1_1', 1), c('b2p1_2', 9)],
                right: [c('b2p1_3', 4)],
              },
            },
            {
              label: 'Fase 2: Dua Negatif',
              tip: 'Pindahkan −7 ke ruas kiri menjadi +7!',
              initial: {
                left: [c('b2p2_1', -3)],
                right: [v('b2p2_2', 1), c('b2p2_3', -7)],
              },
            },
            {
              label: 'Fase 3: Tiga Suku',
              tip: 'Gabungkan −4 dan +9 dulu, lalu pindahkan ke ruas seberang!',
              initial: {
                left: [v('b2p3_1', 1), c('b2p3_2', -4), c('b2p3_3', 9)],
                right: [c('b2p3_4', 2)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 3: KUMPULKAN SUKU X
  // =========================================================================
  {
    id: 3,
    title: 'Bab 3: Kumpulkan Suku x',
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
      {
        id: '3-boss',
        chapterId: 3,
        levelNumber: 6,
        title: 'Bos: Burung Hantu Kembar',
        tip: 'Taklukkan 3 persamaan dengan variabel x di kedua sisi!',
        defaultVisual: 'symbols',
        parMoves: 10,
        isBoss: true,
        initial: {
          left: [v('b3p1_1', 3)],
          right: [v('b3p1_2', 2), c('b3p1_3', 7)],
        },
        boss: {
          name: 'Burung Hantu Kembar',
          role: 'Bos Bab 3 · Variabel Dua Ruas',
          artwork: BOSS_OWL_ART,
          introLine: 'Hoo-hoo! Aku menggandakan x di kedua sisi jembatan. Bisakah kamu menyatukannya?',
          hitLines: [
            'Kena! Tapi sekarang aku sembunyikan −x!',
            'Tinggal satu fase! Kumpulkan semua x dengan teliti!',
          ],
          defeatLine: 'Brilian! Tidak ada variabel kembar yang bisa mengecohmu!',
          phases: [
            {
              label: 'Fase 1: Satukan x',
              tip: 'Pindahkan 2x ke ruas kiri dan gabungkan dengan 3x.',
              initial: {
                left: [v('b3p1_1', 3)],
                right: [v('b3p1_2', 2), c('b3p1_3', 7)],
              },
            },
            {
              label: 'Fase 2: Jinakkan −x',
              tip: 'Pindahkan +8 ke kanan, lalu balik tanda kedua ruas dengan "Balik ±"!',
              initial: {
                left: [c('b3p2_1', 8), v('b3p2_2', -1)],
                right: [c('b3p2_3', 3)],
              },
            },
            {
              label: 'Fase 3: Tukar Dua Sisi',
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
  // BAB 4: PINDAH KALI & BAGI
  // =========================================================================
  {
    id: 4,
    title: 'Bab 4: Pindah Kali & Bagi',
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
      {
        id: '4-boss',
        chapterId: 4,
        levelNumber: 6,
        title: 'Bos: Penjaga Gerbang Kali-Bagi',
        tip: 'Taklukkan 3 persamaan perkalian dan pembagian beruntun!',
        defaultVisual: 'symbols',
        parMoves: 9,
        isBoss: true,
        initial: {
          left: [v('b4p1_1', 4), c('b4p1_2', -3)],
          right: [c('b4p1_3', 13)],
        },
        boss: {
          name: 'Penjaga Gerbang Kali-Bagi',
          role: 'Bos Bab 4 · Koefisien & Pecahan',
          artwork: BOSS_TURTLE_ART,
          introLine: 'Gerbang ini hanya terbuka bagi yang sanggup menukar kali jadi bagi dan bagi jadi kali!',
          hitLines: [
            'Wah, cangkangku bergetar! Coba hadapi pecahanku!',
            'Satu pukulan lagi dan gerbang akan terbuka!',
          ],
          defeatLine: 'Gerbang terbuka lebar! Menuju Bab 5 — Tantangan Aljabar SMP!',
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
              label: 'Fase 3: Koefisien Negatif',
              tip: 'Pindahkan +4 ke kanan (jadi 9), lalu pindahkan ×(−3) → ÷(−3)!',
              initial: {
                left: [v('b4p3_1', -3), c('b4p3_2', 4)],
                right: [c('b4p3_3', 13)],
              },
            },
          ],
        },
      },
    ],
  },

  // =========================================================================
  // BAB 5: TANTANGAN ALJABAR SMP
  // =========================================================================
  {
    id: 5,
    title: 'Bab 5: Tantangan Aljabar SMP',
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
      {
        id: '5-boss',
        chapterId: 5,
        levelNumber: 6,
        title: 'Bos Akhir: Maharaja Aljabar',
        tip: 'Ujian puncak 3 fase menggabungkan tanda kurung, dua ruas, dan koefisien!',
        defaultVisual: 'symbols',
        parMoves: 13,
        isBoss: true,
        initial: {
          left: [g('b5p1_1', 2, 1, 5)],
          right: [c('b5p1_2', 16)],
        },
        boss: {
          name: 'Maharaja Aljabar',
          role: 'Bos Akhir · Penguasa Timbangan Nusantara',
          artwork: BOSS_OWL_ART,
          introLine: 'Selamat datang di puncak! Tunjukkan semua ilmu pindah ruas yang kamu pelajari bersama Kibo!',
          hitLines: [
            'Mengagumkan! Kurung pertamaku hancur seketika!',
            'Satu persamaan terakhir untuk gelar Juara Setara!',
          ],
          defeatLine: 'Luar biasa! Kamu resmi menaklukkan seluruh Aljabar Pindah Ruas Setara!',
          phases: [
            {
              label: 'Fase 1: Kurung Pembuka',
              tip: 'Buka kurung 2(x + 5) atau langsung pindahkan ×2 ke kanan!',
              initial: {
                left: [g('b5p1_1', 2, 1, 5)],
                right: [c('b5p1_2', 16)],
              },
            },
            {
              label: 'Fase 2: Dua Ruas Seimbang',
              tip: 'Kumpulkan x di kiri (5x − 2x) dan angka di kanan (14 − 5), lalu bagi 3!',
              initial: {
                left: [v('b5p2_1', 5), c('b5p2_2', 5)],
                right: [v('b5p2_3', 2), c('b5p2_4', 14)],
              },
            },
            {
              label: 'Fase 3: Jurus Puncak Kurung',
              tip: 'Buka kurung 3(x − 2) menjadi 3x − 6, lalu kumpulkan x di kiri dan angka di kanan!',
              initial: {
                left: [g('b5p3_1', 3, 1, -2)],
                right: [v('b5p3_2', 1), c('b5p3_3', 4)],
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
