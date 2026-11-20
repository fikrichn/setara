export type TimeSlot = 'late_night' | 'morning' | 'afternoon' | 'evening_study';

export function getTimeSlot(date = new Date()): TimeSlot {
  const hour = date.getHours();
  // Past 10 PM (22:00) up to 4 AM (03:59) -> remind player to rest or sleep
  if (hour >= 22 || hour < 4) return 'late_night';
  if (hour >= 4 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening_study';
}

export function isRestTime(date = new Date()): boolean {
  return getTimeSlot(date) === 'late_night';
}

export const TIME_BASED_KIBO_LINES: Record<TimeSlot, string[]> = {
  late_night: [
    'Hooaaam... Sudah lewat jam 10 malam nih! Kibo dan ikan-ikan sudah mengantuk, yuk istirahat dan tidur biar besok semangat lagi!',
    'Malam sudah larut sekali (lewat 22.00)! Matamu butuh istirahat — simpan petualanganmu dan lanjutkan besok pagi ya!',
    'Sst... bintang laut sudah tidur semua! Jangan begadang terlalu malam, tidur cukup bikin otak aljabarmu makin encer besok!',
    'Waktunya istirahat dulu! Kibo jaga pantainya malam ini, kamu bobo nyenyak ya supaya besok bisa kalahkan Bos lebih cepat!',
  ],
  morning: [
    'Selamat pagi! Udara Pantai Setara segar banget buat olahraga otak pindah ruas pagi ini!',
    'Pagi yang cerah! Waktu terbaik berburu bintang & menyelesaikan misi harian bersama Kibo!',
    'Semangat pagi, Kapten! Otak segar di pagi hari bikin angka dan simbol cepat tertata!',
  ],
  afternoon: [
    'Selamat siang/sore! Ombak lagi tenang dan pas banget buat menaklukkan stage baru!',
    'Siang yang produktif! Coba aktifkan mode Speed Run kalau mau kejar Medali Speedster!',
    'Waktunya berlatih fokus! Satu kartu menyeberang jembatan = langsung berbalik tanda!',
  ],
  evening_study: [
    'Selamat malam! Jam belajar produktif — yuk selesaikan 1–2 stage lagi sebelum jam tidur!',
    'Malam yang tenang di Pantai Setara! Lentera dermaga menyala menemanimu berlatih aljabar!',
    'Fokus malam makin mantap! Selesaikan misi harianmu sebelum jam 10 malam tiba ya!',
  ],
};

export const CHAPTER_KIBO_QUIPS: Record<number, string[]> = {
  0: [
    'Blub-blub! Di Bab 0 kita main simbol pantai tanpa angka — buat Peti Pusaka berdiri sendirian!',
    'Kalau simbol Surya & Lawan Surya bertemu di satu sisi, mereka langsung lenyap!',
    'Ingat ya: Peti Pusaka kalau menyeberangi jembatan = terbuka menjadi Lawan Peti, bukan -x!',
    'Pantai awal ini seru banget buat melatih mata melihat pasangan lawan!',
    'Ayo hadapi Cumi Cilik di ujung Bab 0, Kibo siap bersorak buatmu!',
  ],
  1: [
    'Siap kapten! Di Bab 1 ingat jurus emas: + pindah ruas jadi −, − pindah ruas jadi +!',
    'Wiuuu! Ombak Bab 1 makin asyik buat pindah ruas angka positif & negatif!',
    'Kalau angka berlawanan bertemu di ruas yang sama, langsung hilang jadi 0!',
    'Hati-hati sama Kapten Buntal di Stage 20 Bab 1, waktunya suka mengebut saat 1 HP!',
    'Ketuk batu angka kalau mau pindah dengan cepat, atau seret langsung melintasi =!',
  ],
  2: [
    'Kilau emas Bab 2! Gabungkan angka sejenis biar papan timbangan makin rapi!',
    'Hmm... angka negatif dan positif kalau digabung bisa saling meringankan hitungan!',
    'Hiu-hiu! Harta karun aljabar Bab 2 dijaga Kepiting Emas dengan banyak angka!',
    'Jangan buru-buru: bersihkan dulu angka yang bisa digabung di ruas yang sama!',
    'Semakin sedikit langkahmu, semakin mudah meraih 3 Bintang di Bab 2!',
  ],
  3: [
    'Awas Bab 3! Pengali × di depan x kalau pindah ruas berubah menjadi pembagi ÷!',
    'Pecahan pembagi ÷ kalau menyeberangi jembatan = langsung berubah menjadi kali ×!',
    'Tenang dan teliti ya! Di ujung Bab 3 ada Kura Meriam yang benci langkah salah!',
    'Pastikan x beserta pengalinya sudah sendirian sebelum memindahkan angka pengali/pembagi!',
    'Kibo percaya kamu bisa menaklukkan Bab 3 dengan mulus!',
  ],
  4: [
    'Keren! Di Bab 4 kumpulkan semua x di satu ruas dan angka di ruas seberangnya!',
    'Lawan ombak Bab 4 dengan tenang — pindahkan x kecil ke sisi x yang lebih besar!',
    'Siap hormat kapten! Di Bab 4 nanti Kapten Orca punya kejutan pulih HP lho!',
    'Variabel di kedua ruas? Satukan dulu biar tinggal satu suku x yang rapi!',
    'Hebat banget kamu sudah sampai Kepulauan Bab 4!',
  ],
  5: [
    'Wuuush! Melayang di dimensi kosmik Bab 5! Buka kurung dulu atau pindah pengali luarnya!',
    'Tanda kurung di Bab 5 bukan penghalang buat jagoan pindah ruas sepertimu!',
    'Di puncak Bab 5 menanti Cthulhu Samudra — jangan sentuh badannya biar waktumu aman!',
    'Gunakan sifat distributif dengan ketuk kartu kurung → Buka Kurung!',
    'Bab terakhir penuh bintang kosmik! Kibo bangga punya sahabat sepintar kamu!',
  ],
};

export function getContextualKiboPool(chapterId = 0, date = new Date()): string[] {
  const slot = getTimeSlot(date);
  const timeLines = TIME_BASED_KIBO_LINES[slot];
  const chapLines = CHAPTER_KIBO_QUIPS[chapterId] ?? CHAPTER_KIBO_QUIPS[0];
  if (slot === 'late_night') {
    // Prioritize rest reminder lines while keeping a couple of chapter tips
    return [...timeLines, chapLines[0], chapLines[1]];
  }
  return [...chapLines, ...timeLines];
}

export function getInitialLobbyKiboLine(
  chapterId: number,
  completedCount: number,
  bossesDefeated: number,
  date = new Date()
): string {
  const slot = getTimeSlot(date);
  if (slot === 'late_night') {
    return TIME_BASED_KIBO_LINES.late_night[0];
  }
  if (completedCount === 0) {
    if (slot === 'morning') {
      return 'Selamat pagi! Ayo main di Pantai Bab 0 dulu — seru belajar simbol tanpa angka!';
    }
    if (slot === 'evening_study') {
      return 'Selamat malam! Yuk mulai petualangan Pantai Bab 0 sebelum waktunya tidur!';
    }
    return 'Halo! Ayo main di Pantai Bab 0 dulu — seru belajar simbol tanpa angka!';
  }
  if (slot === 'morning') {
    return `Selamat pagi! Kamu sudah tuntas ${completedCount} stage & ${bossesDefeated} Bos! Ayo lanjut ke Bab ${chapterId}!`;
  }
  if (slot === 'evening_study') {
    return `Belajar malam bareng Kibo! Sudah ${completedCount} stage tuntas — yuk tambah lagi sebelum jam 10 malam!`;
  }
  return `Keren! Kamu sudah tuntas ${completedCount} stage & ${bossesDefeated} Bos! Lanjut berlayar di Bab ${chapterId} yuk!`;
}
