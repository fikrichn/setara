import { EquationState, LevelDef, MoveResult, Side, SmartHint, SymbolFamily, Term } from './types';

let idCounter = 2000;
export function nextTermId(prefix = 't'): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export function cloneState(state: EquationState): EquationState {
  return {
    left: state.left.map((t) => ({ ...t })),
    right: state.right.map((t) => ({ ...t })),
  };
}

export const SYMBOL_NAMES: Record<SymbolFamily, { pos: string; neg: string; glyphPos: string; glyphNeg: string }> = {
  sun: { pos: 'Surya', neg: 'Lawan Surya', glyphPos: '☀', glyphNeg: '☾' },
  shell: { pos: 'Kerang', neg: 'Lawan Kerang', glyphPos: '◈', glyphNeg: '◇' },
  leaf: { pos: 'Daun', neg: 'Lawan Daun', glyphPos: '✦', glyphNeg: '✧' },
};

export function isPureSymbolState(state: EquationState): boolean {
  const all = [...state.left, ...state.right];
  return all.some((t) => t.kind === 'sym');
}

export function formatSingleTerm(term: Term, isFirst: boolean, pureSymbols = false): string {
  if (term.kind === 'sym') {
    const info = SYMBOL_NAMES[term.family];
    const label = term.sign > 0 ? info.pos : info.neg;
    if (isFirst) return label;
    return term.sign > 0 ? `+ ${label}` : `− ${info.pos}`;
  }

  if (term.kind === 'const') {
    const abs = Math.abs(term.value);
    if (isFirst) return term.value < 0 ? `−${abs}` : `${abs}`;
    return term.value < 0 ? `− ${abs}` : `+ ${abs}`;
  }

  if (term.kind === 'var') {
    if (pureSymbols && term.coeff === 1 && term.denom === 1) {
      return isFirst ? 'Peti' : '+ Peti';
    }
    const absCoeff = Math.abs(term.coeff);
    const coeffStr = absCoeff === 1 ? '' : `${absCoeff}`;
    const core = term.denom > 1 ? `(${coeffStr}x / ${term.denom})` : `${coeffStr}x`;
    if (isFirst) return term.coeff < 0 ? `−${core}` : core;
    return term.coeff < 0 ? `− ${core}` : `+ ${core}`;
  }

  const absFactor = Math.abs(term.factor);
  const fStr = absFactor === 1 ? '' : `${absFactor}`;
  const xPart =
    term.innerVar === 1
      ? 'x'
      : term.innerVar === -1
        ? '−x'
        : `${term.innerVar}x`;
  const cPart =
    term.innerConst === 0
      ? ''
      : term.innerConst > 0
        ? ` + ${term.innerConst}`
        : ` − ${Math.abs(term.innerConst)}`;
  const core = `${fStr}(${xPart}${cPart})`;
  if (isFirst) return term.factor < 0 ? `−${core}` : core;
  return term.factor < 0 ? `− ${core}` : `+ ${core}`;
}

export function formatSide(terms: Term[], pureSymbols = false): string {
  if (terms.length === 0) return pureSymbols ? 'Kosong' : '0';
  return terms.map((t, idx) => formatSingleTerm(t, idx === 0, pureSymbols)).join(' ');
}

export function formatEquation(state: EquationState, forcePureSymbols?: boolean): string {
  const pure = forcePureSymbols ?? isPureSymbolState(state);
  return `${formatSide(state.left, pure)} = ${formatSide(state.right, pure)}`;
}

export function formatTermShort(term: Term, pureSymbols = false): string {
  if (term.kind === 'sym') {
    const info = SYMBOL_NAMES[term.family];
    return term.sign > 0 ? info.pos : info.neg;
  }
  if (term.kind === 'const') {
    return term.value >= 0 ? `+${term.value}` : `−${Math.abs(term.value)}`;
  }
  if (term.kind === 'var') {
    if (pureSymbols && term.coeff === 1 && term.denom === 1) return 'Peti Pusaka';
    const absC = Math.abs(term.coeff);
    const cStr = absC === 1 ? '' : `${absC}`;
    const sign = term.coeff >= 0 ? '+' : '−';
    return term.denom > 1 ? `${sign}${cStr}x/${term.denom}` : `${sign}${cStr}x`;
  }
  return formatSingleTerm(term, true, pureSymbols);
}

/**
 * Rule 1: Pindah Ruas Penjumlahan / Pengurangan / Simbol
 */
export function transposeTerm(state: EquationState, fromSide: Side, termId: string): MoveResult {
  const next = cloneState(state);
  const sourceList = next[fromSide];
  const targetSide: Side = fromSide === 'left' ? 'right' : 'left';
  const idx = sourceList.findIndex((t) => t.id === termId);
  if (idx === -1) return { ok: false, errorMessage: 'Batu tidak ditemukan.' };

  const term = sourceList[idx];
  if (term.kind === 'group') {
    return {
      ok: false,
      errorMessage: 'Buka kurung dulu atau pindahkan pengali luarnya.',
    };
  }

  sourceList.splice(idx, 1);

  if (term.kind === 'sym') {
    const flippedSign: 1 | -1 = term.sign === 1 ? -1 : 1;
    const info = SYMBOL_NAMES[term.family];
    const oldStr = term.sign > 0 ? info.pos : info.neg;
    const newStr = flippedSign > 0 ? info.pos : info.neg;
    const sideWord = targetSide === 'right' ? 'kanan' : 'kiri';

    next[targetSide].push({
      id: nextTermId('sym'),
      kind: 'sym',
      family: term.family,
      sign: flippedSign,
    });

    return {
      ok: true,
      nextState: next,
      ruleLabel: `${oldStr} → ${newStr}`,
      explanation: `${oldStr} menyeberangi jembatan = ke ruas ${sideWord} dan berubah menjadi lawannya (${newStr})!`,
    };
  }

  if (term.kind === 'const') {
    const flippedVal = -term.value;
    const oldStr = term.value > 0 ? `+${term.value}` : `−${Math.abs(term.value)}`;
    const newStr = flippedVal > 0 ? `+${flippedVal}` : `−${Math.abs(flippedVal)}`;
    const sideWord = targetSide === 'right' ? 'kanan' : 'kiri';
    const balanceWhy =
      term.value > 0
        ? `kedua ruas dikurangi ${term.value}`
        : `kedua ruas ditambah ${Math.abs(term.value)}`;

    next[targetSide].push({
      id: nextTermId('c'),
      kind: 'const',
      value: flippedVal,
    });

    return {
      ok: true,
      nextState: next,
      ruleLabel: `Pindah ${oldStr} → ${newStr}`,
      explanation: `Pindah ruas ke ${sideWord}: ${oldStr} berubah menjadi ${newStr} (${balanceWhy}).`,
    };
  }

  const flippedCoeff = -term.coeff;
  const oldStr = formatTermShort(term);
  const newTerm: Term = {
    id: nextTermId('v'),
    kind: 'var',
    coeff: flippedCoeff,
    denom: term.denom,
  };
  const newStr = formatTermShort(newTerm);
  const sideWord = targetSide === 'right' ? 'kanan' : 'kiri';

  next[targetSide].push(newTerm);

  return {
    ok: true,
    nextState: next,
    ruleLabel: `Pindah ${oldStr} → ${newStr}`,
    explanation: `Variabel ${oldStr} menyeberangi tanda = ke ruas ${sideWord} menjadi ${newStr}.`,
  };
}

/**
 * Checks whether two terms on the same side can be combined/cancelled.
 */
export function canCombineTerms(a: Term, b: Term): boolean {
  if (a.id === b.id) return false;
  if (a.kind === 'sym' && b.kind === 'sym') {
    return a.family === b.family && a.sign === -b.sign;
  }
  if (a.kind === 'const' && b.kind === 'const') return true;
  if (a.kind === 'var' && b.kind === 'var' && a.denom === b.denom) return true;
  return false;
}

/**
 * Rule 2: Gabung Suku Sejenis / Pembatalan Nol
 */
export function combineTerms(
  state: EquationState,
  side: Side,
  sourceId: string,
  targetId: string
): MoveResult {
  const next = cloneState(state);
  const list = next[side];
  const sIdx = list.findIndex((t) => t.id === sourceId);
  const tIdx = list.findIndex((t) => t.id === targetId);
  if (sIdx === -1 || tIdx === -1 || sIdx === tIdx) {
    return { ok: false, errorMessage: 'Pilih dua batu berbeda pada ruas yang sama.' };
  }

  const a = list[sIdx];
  const b = list[tIdx];

  if (!canCombineTerms(a, b)) {
    if (a.kind === 'sym' && b.kind === 'sym') {
      return {
        ok: false,
        errorMessage: 'Hanya simbol yang sejenis DAN berlawanan (Asli + Lawannya) yang saling menghapus!',
      };
    }
    return {
      ok: false,
      errorMessage: 'Hanya suku sejenis yang bisa digabung (angka dengan angka, atau x dengan x).',
    };
  }

  if (a.kind === 'sym' && b.kind === 'sym') {
    const info = SYMBOL_NAMES[a.family];
    next[side] = list.filter((t) => t.id !== sourceId && t.id !== targetId);
    return {
      ok: true,
      nextState: next,
      cancelledToZero: true,
      cancelledSide: side,
      ruleLabel: `Pasangan ${info.pos} Lenyap!`,
      explanation: `${info.pos} dan ${info.neg} adalah pasangan lawan — keduanya saling meniadakan dan lenyap!`,
    };
  }

  if (a.kind === 'const' && b.kind === 'const') {
    const sum = a.value + b.value;
    const aStr = formatTermShort(a);
    const bStr = formatTermShort(b);

    const filtered = list.filter((t) => t.id !== sourceId && t.id !== targetId);
    if (sum !== 0) {
      const insertAt = Math.min(sIdx, tIdx);
      filtered.splice(insertAt, 0, {
        id: nextTermId('c'),
        kind: 'const',
        value: sum,
      });
      next[side] = filtered;
      return {
        ok: true,
        nextState: next,
        ruleLabel: `Gabung ${bStr} dan ${aStr}`,
        explanation: `Suku sejenis digabungkan: ${bStr} ${aStr} = ${sum > 0 ? `+${sum}` : `−${Math.abs(sum)}`}.`,
      };
    }

    next[side] = filtered;
    return {
      ok: true,
      nextState: next,
      cancelledToZero: true,
      cancelledSide: side,
      ruleLabel: `Lawan Saling Menghapus (0)`,
      explanation: `${bStr} dan ${aStr} adalah pasangan lawan, hasilnya 0 sehingga lenyap!`,
    };
  }

  if (a.kind === 'var' && b.kind === 'var' && a.denom === b.denom) {
    const sumCoeff = a.coeff + b.coeff;
    const aStr = formatTermShort(a);
    const bStr = formatTermShort(b);
    const filtered = list.filter((t) => t.id !== sourceId && t.id !== targetId);

    if (sumCoeff !== 0) {
      const insertAt = Math.min(sIdx, tIdx);
      const merged: Term = {
        id: nextTermId('v'),
        kind: 'var',
        coeff: sumCoeff,
        denom: a.denom,
      };
      filtered.splice(insertAt, 0, merged);
      next[side] = filtered;
      return {
        ok: true,
        nextState: next,
        ruleLabel: `Gabung ${bStr} dan ${aStr}`,
        explanation: `Variabel sejenis digabungkan menjadi ${formatTermShort(merged)}.`,
      };
    }

    next[side] = filtered;
    return {
      ok: true,
      nextState: next,
      cancelledToZero: true,
      cancelledSide: side,
      ruleLabel: `Variabel Saling Menghapus (0)`,
      explanation: `${bStr} dan ${aStr} saling meniadakan menjadi 0!`,
    };
  }

  return { ok: false, errorMessage: 'Kedua batu ini tidak sejenis.' };
}

/**
 * Rule 3: Pindah Ruas Perkalian -> Pembagian
 */
export function transposeCoefficient(state: EquationState, fromSide: Side, termId: string): MoveResult {
  const next = cloneState(state);
  const sourceList = next[fromSide];
  const targetSide: Side = fromSide === 'left' ? 'right' : 'left';
  const targetList = next[targetSide];

  if (sourceList.length !== 1) {
    return {
      ok: false,
      errorMessage: 'Pindahkan dulu batu lain di ruas ini agar suku pengali sendirian sebelum membagi.',
    };
  }

  const term = sourceList[0];
  if (term.id !== termId) {
    return { ok: false, errorMessage: 'Batu tidak cocok.' };
  }

  let divisor = 1;
  if (term.kind === 'var') {
    if (Math.abs(term.coeff) <= 1) {
      return { ok: false, errorMessage: 'Koefisien sudah 1.' };
    }
    divisor = term.coeff;
  } else if (term.kind === 'group') {
    if (Math.abs(term.factor) <= 1) {
      return { ok: false, errorMessage: 'Pengali sudah 1.' };
    }
    divisor = term.factor;
  } else {
    return { ok: false, errorMessage: 'Hanya pengali variabel yang bisa pindah menjadi pembagi.' };
  }

  const allDivisible = targetList.every((t) => {
    if (t.kind === 'const') return t.value % divisor === 0;
    if (t.kind === 'var') return t.coeff % divisor === 0;
    if (t.kind === 'group') return t.factor % divisor === 0;
    return false;
  });

  if (!allDivisible) {
    const constCount = targetList.filter((t) => t.kind === 'const').length;
    const varCount = targetList.filter((t) => t.kind === 'var').length;
    if (constCount >= 2 || varCount >= 2) {
      return {
        ok: false,
        errorMessage: `Gabungkan dulu suku di ruas ${targetSide === 'right' ? 'kanan' : 'kiri'} agar habis dibagi ${divisor}!`,
      };
    }
    return {
      ok: false,
      errorMessage: `Ruas seberang belum habis dibagi ${divisor}. Coba gabungkan atau pindahkan suku lain dulu.`,
    };
  }

  next[targetSide] = targetList.map((t) => {
    if (t.kind === 'const') {
      return { ...t, id: nextTermId('c'), value: t.value / divisor };
    }
    if (t.kind === 'var') {
      return { ...t, id: nextTermId('v'), coeff: t.coeff / divisor };
    }
    if (t.kind === 'group') {
      return { ...t, id: nextTermId('g'), factor: t.factor / divisor };
    }
    return t;
  });

  if (term.kind === 'var') {
    next[fromSide] = [
      {
        id: nextTermId('v'),
        kind: 'var',
        coeff: 1,
        denom: term.denom,
      },
    ];
  } else if (term.kind === 'group') {
    const unpacked: Term[] = [
      { id: nextTermId('v'), kind: 'var', coeff: term.innerVar, denom: 1 },
    ];
    if (term.innerConst !== 0) {
      unpacked.push({ id: nextTermId('c'), kind: 'const', value: term.innerConst });
    }
    next[fromSide] = unpacked;
  }

  const divDisplay = divisor < 0 ? `(−${Math.abs(divisor)})` : `${divisor}`;
  return {
    ok: true,
    nextState: next,
    ruleLabel: `Pindah ×${divDisplay} → ÷${divDisplay}`,
    explanation: `Perkalian ×${divDisplay} pindah ruas menjadi pembagian ÷${divDisplay} (kedua ruas dibagi ${divDisplay}).`,
  };
}

/**
 * Rule 4: Pindah Ruas Pembagian -> Perkalian
 */
export function transposeDenominator(state: EquationState, fromSide: Side, termId: string): MoveResult {
  const next = cloneState(state);
  const sourceList = next[fromSide];
  const targetSide: Side = fromSide === 'left' ? 'right' : 'left';
  const targetList = next[targetSide];

  if (sourceList.length !== 1) {
    return {
      ok: false,
      errorMessage: 'Pindahkan dulu batu lain di ruas ini agar pecahan x sendirian sebelum mengalikan.',
    };
  }

  const term = sourceList[0];
  if (term.id !== termId || term.kind !== 'var' || term.denom <= 1) {
    return { ok: false, errorMessage: 'Tidak ada penyebut pembagian untuk dipindahkan.' };
  }

  const mult = term.denom;
  next[fromSide] = [
    {
      id: nextTermId('v'),
      kind: 'var',
      coeff: term.coeff,
      denom: 1,
    },
  ];

  next[targetSide] = targetList.map((t) => {
    if (t.kind === 'const') {
      return { ...t, id: nextTermId('c'), value: t.value * mult };
    }
    if (t.kind === 'var') {
      if (t.denom > 1 && t.denom % mult === 0) {
        return { ...t, id: nextTermId('v'), denom: t.denom / mult };
      }
      return { ...t, id: nextTermId('v'), coeff: t.coeff * mult };
    }
    if (t.kind === 'group') {
      return { ...t, id: nextTermId('g'), factor: t.factor * mult };
    }
    return t;
  });

  return {
    ok: true,
    nextState: next,
    ruleLabel: `Pindah ÷${mult} → ×${mult}`,
    explanation: `Pembagian ÷${mult} pindah ruas menjadi perkalian ×${mult} (kedua ruas dikali ${mult}).`,
  };
}

/**
 * Rule 5: Buka Kurung (Distributif)
 */
export function expandGroupTerm(state: EquationState, side: Side, termId: string): MoveResult {
  const next = cloneState(state);
  const list = next[side];
  const idx = list.findIndex((t) => t.id === termId);
  if (idx === -1) return { ok: false, errorMessage: 'Kurung tidak ditemukan.' };

  const term = list[idx];
  if (term.kind !== 'group') {
    return { ok: false, errorMessage: 'Batu ini bukan bentuk kurung.' };
  }

  const newTerms: Term[] = [];
  const varCoeff = term.factor * term.innerVar;
  const constVal = term.factor * term.innerConst;

  if (varCoeff !== 0) {
    newTerms.push({ id: nextTermId('v'), kind: 'var', coeff: varCoeff, denom: 1 });
  }
  if (constVal !== 0) {
    newTerms.push({ id: nextTermId('c'), kind: 'const', value: constVal });
  }

  list.splice(idx, 1, ...newTerms);

  const origText = formatSingleTerm(term, true);
  const expandedText = newTerms.map((t, i) => formatSingleTerm(t, i === 0)).join(' ');

  return {
    ok: true,
    nextState: next,
    ruleLabel: `Buka Kurung`,
    explanation: `Sifat distributif: ${origText} dikalikan ke dalam menjadi ${expandedText}.`,
  };
}

/**
 * Rule 6: Balik Tanda Kedua Ruas (× -1)
 */
export function flipBothSides(state: EquationState): MoveResult {
  const next = cloneState(state);
  const flipTerm = (t: Term): Term => {
    if (t.kind === 'sym') return { ...t, id: nextTermId('sym'), sign: t.sign === 1 ? -1 : 1 };
    if (t.kind === 'const') return { ...t, id: nextTermId('c'), value: -t.value };
    if (t.kind === 'var') return { ...t, id: nextTermId('v'), coeff: -t.coeff };
    return { ...t, id: nextTermId('g'), factor: -t.factor };
  };

  next.left = next.left.map(flipTerm);
  next.right = next.right.map(flipTerm);

  return {
    ok: true,
    nextState: next,
    ruleLabel: `Balik Tanda (× −1)`,
    explanation: `Kedua ruas dibalik secara adil sehingga semua tanda positif dan negatif bertukar.`,
  };
}

function hasAnyCombinablePair(list: Term[]): boolean {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (canCombineTerms(list[i], list[j])) return true;
    }
  }
  return false;
}

/**
 * Checks if x / Peti Pusaka is completely isolated and the opposite side is simplified.
 */
export function checkSolved(
  state: EquationState,
  pureSymbolsMode = false
): { solved: boolean; value: number | null; displayResult: string | null; xSide: Side | null } {
  const isPureX = (list: Term[]) =>
    list.length === 1 && list[0].kind === 'var' && list[0].coeff === 1 && list[0].denom === 1;

  const pure = pureSymbolsMode || isPureSymbolState(state);

  if (pure) {
    const isSimplifiedSymSide = (list: Term[]) => {
      if (list.some((t) => t.kind === 'var' || t.kind === 'group')) return false;
      return !hasAnyCombinablePair(list);
    };

    if (isPureX(state.left) && isSimplifiedSymSide(state.right)) {
      return {
        solved: true,
        value: null,
        displayResult: `Peti = ${formatSide(state.right, true)}`,
        xSide: 'left',
      };
    }
    if (isPureX(state.right) && isSimplifiedSymSide(state.left)) {
      return {
        solved: true,
        value: null,
        displayResult: `Peti = ${formatSide(state.left, true)}`,
        xSide: 'right',
      };
    }
    return { solved: false, value: null, displayResult: null, xSide: null };
  }

  const getSimplifiedConst = (list: Term[]): number | null => {
    if (list.length === 0) return 0;
    if (list.length === 1 && list[0].kind === 'const') return list[0].value;
    return null;
  };

  if (isPureX(state.left)) {
    const val = getSimplifiedConst(state.right);
    if (val !== null) {
      return {
        solved: true,
        value: val,
        displayResult: `x = ${val < 0 ? `−${Math.abs(val)}` : val}`,
        xSide: 'left',
      };
    }
  }

  if (isPureX(state.right)) {
    const val = getSimplifiedConst(state.left);
    if (val !== null) {
      return {
        solved: true,
        value: val,
        displayResult: `x = ${val < 0 ? `−${Math.abs(val)}` : val}`,
        xSide: 'right',
      };
    }
  }

  return { solved: false, value: null, displayResult: null, xSide: null };
}

/**
 * Context-aware pedagogical hint system (supports Bab 0 Pure Symbols + Bab 1-5 Algebra)
 */
export function getSmartHint(state: EquationState, pureSymbolsMode = false): SmartHint {
  const pure = pureSymbolsMode || isPureSymbolState(state);

  // 1. Check for parentheses/group terms
  for (const side of ['left', 'right'] as Side[]) {
    const grp = state[side].find((t) => t.kind === 'group');
    if (grp && grp.kind === 'group') {
      return {
        message: `Ketuk batu ${formatSingleTerm(grp, true)} lalu tekan "Buka Kurung" untuk mengalikan ${grp.factor} ke dalam kurung.`,
        highlightIds: [grp.id],
        actionType: 'expand',
      };
    }
  }

  // 2. Check for combinable / opposite pairs on either side
  for (const side of ['left', 'right'] as Side[]) {
    const list = state[side];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        if (canCombineTerms(a, b)) {
          const sideLabel = side === 'left' ? 'ruas kiri' : 'ruas kanan';
          if (a.kind === 'sym' && b.kind === 'sym') {
            return {
              message: `Tarik ${formatTermShort(a, true)} ke atas ${formatTermShort(b, true)} di ${sideLabel} — pasangan lawan langsung lenyap!`,
              highlightIds: [a.id, b.id],
              actionType: 'combine',
            };
          }
          const isZeroPair =
            (a.kind === 'const' && b.kind === 'const' && a.value + b.value === 0) ||
            (a.kind === 'var' && b.kind === 'var' && a.coeff + b.coeff === 0);
          if (isZeroPair) {
            return {
              message: `Tarik ${formatTermShort(a)} ke atas ${formatTermShort(b)} di ${sideLabel} — pasangan lawan saling menghapus jadi 0!`,
              highlightIds: [a.id, b.id],
              actionType: 'combine',
            };
          }
          return {
            message: `Gabungkan ${formatTermShort(a)} dan ${formatTermShort(b)} di ${sideLabel} (tarik salah satu ke atas yang lain).`,
            highlightIds: [a.id, b.id],
            actionType: 'combine',
          };
        }
      }
    }
  }

  // 3. Check if x exists on both sides
  const leftVars = state.left.filter((t): t is Extract<Term, { kind: 'var' }> => t.kind === 'var');
  const rightVars = state.right.filter((t): t is Extract<Term, { kind: 'var' }> => t.kind === 'var');

  if (leftVars.length > 0 && rightVars.length > 0) {
    const lv = leftVars[0];
    const rv = rightVars[0];
    if (lv.coeff >= rv.coeff) {
      return {
        message: `Pindahkan ${formatTermShort(rv)} ke ruas kiri agar semua suku x berkumpul (tandanya berubah saat lewat jembatan =).`,
        highlightIds: [rv.id],
        actionType: 'transpose',
      };
    } else {
      return {
        message: `Pindahkan ${formatTermShort(lv)} ke ruas kanan agar semua suku x berkumpul di satu sisi.`,
        highlightIds: [lv.id],
        actionType: 'transpose',
      };
    }
  }

  const xSide: Side = leftVars.length > 0 ? 'left' : 'right';
  const otherSide: Side = xSide === 'left' ? 'right' : 'left';
  const otherWord = otherSide === 'right' ? 'kanan' : 'kiri';

  // 4. If pure symbol sits on Peti's side, move it across!
  const symOnXSide = state[xSide].find((t) => t.kind === 'sym');
  if (symOnXSide && symOnXSide.kind === 'sym') {
    const info = SYMBOL_NAMES[symOnXSide.family];
    const curName = symOnXSide.sign > 0 ? info.pos : info.neg;
    const nextName = symOnXSide.sign > 0 ? info.neg : info.pos;
    return {
      message: `Tarik ${curName} menyeberangi jembatan = ke ruas ${otherWord} agar berubah jadi ${nextName} dan Peti Pusaka sendirian!`,
      highlightIds: [symOnXSide.id],
      actionType: 'transpose',
    };
  }

  // 5. If constant sits on x's side, move it across
  const constOnXSide = state[xSide].find((t) => t.kind === 'const');
  if (constOnXSide && constOnXSide.kind === 'const') {
    const flipped = -constOnXSide.value;
    const flippedStr = flipped > 0 ? `+${flipped}` : `−${Math.abs(flipped)}`;
    return {
      message: `Tarik ${formatTermShort(constOnXSide)} menyeberangi jembatan = ke ruas ${otherWord} (berubah jadi ${flippedStr}) agar ${pure ? 'Peti' : 'x'} sendirian.`,
      highlightIds: [constOnXSide.id],
      actionType: 'transpose',
    };
  }

  // 6. Now x is alone on xSide! Check denominator, negative sign, or coefficient
  const soloX = state[xSide][0];
  if (soloX && soloX.kind === 'var') {
    if (soloX.denom > 1) {
      return {
        message: `Tarik tanda ÷${soloX.denom} pada batu x ke ruas ${otherWord} (atau ketuk batu lalu pilih "Pindah ÷${soloX.denom} → ×${soloX.denom}").`,
        highlightIds: [soloX.id],
        actionType: 'denom',
      };
    }
    if (soloX.coeff === -1) {
      return {
        message: `x masih bertanda negatif (−x). Tekan tombol "Balik Tanda (±)" di bawah agar menjadi +x.`,
        highlightIds: [soloX.id],
        actionType: 'flip',
      };
    }
    if (Math.abs(soloX.coeff) > 1) {
      const cStr = soloX.coeff < 0 ? `(−${Math.abs(soloX.coeff)})` : `${soloX.coeff}`;
      return {
        message: `Tarik pengali ×${cStr} ke ruas ${otherWord} (atau ketuk batu lalu pilih "Pindah ×${cStr} → ÷${cStr}") agar x sendirian!`,
        highlightIds: [soloX.id],
        actionType: 'coeff',
      };
    }
  }

  return {
    message: pure
      ? 'Sisakan Peti Pusaka sendirian di satu ruas dan hapus semua pasangan simbol lawan!'
      : 'Susun batu agar x berdiri sendiri di satu ruas dan angka di ruas seberang.',
    highlightIds: [],
    actionType: 'transpose',
  };
}

/**
 * Procedural Offline Practice Generator
 */
export function generatePracticeLevel(difficulty: 'mudah' | 'sedang' | 'tantangan'): LevelDef {
  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;
  const pickNonZero = (min: number, max: number) => {
    let v = 0;
    while (v === 0) v = randInt(min, max);
    return v;
  };

  const sol = randInt(-6, 9);

  if (difficulty === 'mudah') {
    const b = pickNonZero(-8, 9);
    const c = sol + b;
    const swapSides = Math.random() > 0.7;
    const xSideTerms: Term[] = [
      { id: nextTermId('v'), kind: 'var', coeff: 1, denom: 1 },
      { id: nextTermId('c'), kind: 'const', value: b },
    ];
    const cSideTerms: Term[] =
      c === 0 ? [] : [{ id: nextTermId('c'), kind: 'const', value: c }];

    return {
      id: `practice_${Date.now()}`,
      chapterId: 0,
      levelNumber: 0,
      title: 'Latihan Mudah',
      tip: 'Pindahkan angka menyeberangi jembatan = agar x sendirian.',
      defaultVisual: 'symbols',
      parMoves: c === 0 ? 1 : 2,
      solution: sol,
      initial: swapSides
        ? { left: cSideTerms, right: xSideTerms }
        : { left: xSideTerms, right: cSideTerms },
      isPractice: true,
    };
  }

  if (difficulty === 'sedang') {
    const useDiv = Math.random() > 0.65;
    if (useDiv) {
      const d = randInt(2, 5);
      const q = randInt(-4, 6);
      const xSol = q * d;
      const b = pickNonZero(-6, 7);
      const c = q + b;
      return {
        id: `practice_${Date.now()}`,
        chapterId: 0,
        levelNumber: 0,
        title: 'Latihan Sedang',
        tip: 'Pindahkan dulu angka tambah/kurang, lalu pindahkan pembagian ÷ menjadi perkalian ×.',
        defaultVisual: 'symbols',
        parMoves: 3,
        solution: xSol,
        initial: {
          left: [
            { id: nextTermId('v'), kind: 'var', coeff: 1, denom: d },
            { id: nextTermId('c'), kind: 'const', value: b },
          ],
          right: c === 0 ? [] : [{ id: nextTermId('c'), kind: 'const', value: c }],
        },
        isPractice: true,
      };
    }

    const a = randInt(2, 5);
    const b = pickNonZero(-8, 9);
    const c = a * sol + b;
    return {
      id: `practice_${Date.now()}`,
      chapterId: 0,
      levelNumber: 0,
      title: 'Latihan Sedang',
      tip: 'Pindahkan angka tetap ke kanan, gabungkan, lalu pindahkan pengali x menjadi pembagi.',
      defaultVisual: 'symbols',
      parMoves: 3,
      solution: sol,
      initial: {
        left: [
          { id: nextTermId('v'), kind: 'var', coeff: a, denom: 1 },
          { id: nextTermId('c'), kind: 'const', value: b },
        ],
        right: c === 0 ? [] : [{ id: nextTermId('c'), kind: 'const', value: c }],
      },
      isPractice: true,
    };
  }

  const useGroup = Math.random() > 0.5;
  if (useGroup) {
    const k = randInt(2, 4);
    const m = pickNonZero(-5, 6);
    const c = k * (sol + m);
    return {
      id: `practice_${Date.now()}`,
      chapterId: 0,
      levelNumber: 0,
      title: 'Latihan Tantangan',
      tip: 'Bisa buka kurung dulu, atau langsung pindahkan pengali luar menyeberangi jembatan =.',
      defaultVisual: 'symbols',
      parMoves: 3,
      solution: sol,
      initial: {
        left: [{ id: nextTermId('g'), kind: 'group', factor: k, innerVar: 1, innerConst: m }],
        right: c === 0 ? [] : [{ id: nextTermId('c'), kind: 'const', value: c }],
      },
      isPractice: true,
    };
  }

  const diff = randInt(1, 3);
  const d = randInt(1, 3);
  const a = d + diff;
  const b = pickNonZero(-7, 7);
  const e = diff * sol + b;

  return {
    id: `practice_${Date.now()}`,
    chapterId: 0,
    levelNumber: 0,
    title: 'Latihan Tantangan',
    tip: 'Kumpulkan semua suku x di satu ruas dan semua angka di ruas seberang.',
    defaultVisual: 'symbols',
    parMoves: diff === 1 ? 4 : 5,
    solution: sol,
    initial: {
      left: [
        { id: nextTermId('v'), kind: 'var', coeff: a, denom: 1 },
        { id: nextTermId('c'), kind: 'const', value: b },
      ],
      right: [
        { id: nextTermId('v'), kind: 'var', coeff: d, denom: 1 },
        ...(e === 0 ? [] : [{ id: nextTermId('c'), kind: 'const' as const, value: e }]),
      ],
    },
    isPractice: true,
  };
}
