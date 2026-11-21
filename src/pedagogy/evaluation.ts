import type { LearningLevel } from '../types';

const POSITIVE_MESSAGES = [
  'Brilhante! Você conseguiu!',
  'Muito bem! Cada palavra nova deixa você mais forte!',
  'Incrível! A Lumi está muito orgulhosa!',
  'Show! Você está evoluindo super rápido!',
  'Parabéns! Você descobriu certinho!',
];

const ENCOURAGEMENT_MESSAGES = [
  'Quase lá! Vamos tentar novamente?',
  'Muito bem, você está aprendendo! Que tal ouvir de novo?',
  'Excelente tentativa! Vamos descobrir juntos?',
  'Boa tentativa! Olhe com calma e tente mais uma vez!',
];

export function getPositiveMessage(seed = Math.random()): string {
  const idx = Math.floor(seed * POSITIVE_MESSAGES.length) % POSITIVE_MESSAGES.length;
  return POSITIVE_MESSAGES[idx];
}

export function getEncouragementMessage(seed = Math.random()): string {
  const idx = Math.floor(seed * ENCOURAGEMENT_MESSAGES.length) % ENCOURAGEMENT_MESSAGES.length;
  return ENCOURAGEMENT_MESSAGES[idx];
}

export function normalizeStrict(text: string): string {
  return text.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function normalizeWithoutAccents(text: string): string {
  return normalizeStrict(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface AnswerCheckResult {
  isCorrect: boolean;
  almostCorrect: boolean; // Ex: acertou letras mas faltou acento
  detectedConfusion?: { expected: string; confused: string };
  feedbackMessage: string;
}

const KNOWN_CONFUSION_PAIRS: Array<[string, string]> = [
  ['M', 'N'],
  ['B', 'P'],
  ['B', 'D'],
  ['F', 'V'],
  ['T', 'D'],
  ['C', 'G'],
  ['S', 'Z'],
  ['CH', 'X'],
  ['LH', 'LI'],
  ['NH', 'NI'],
  ['RR', 'R'],
  ['SS', 'S'],
  ['Ç', 'S'],
  ['Ç', 'SS'],
  ['QU', 'C'],
];

export function detectConfusionPattern(expected: string, userAnswer: string): { expected: string; confused: string } | undefined {
  const exp = normalizeWithoutAccents(expected);
  const ans = normalizeWithoutAccents(userAnswer);
  if (!exp || !ans || exp === ans) return undefined;

  // Comparação direta de letras/sílabas
  if (exp.length <= 3 && ans.length <= 3) {
    for (const [a, b] of KNOWN_CONFUSION_PAIRS) {
      if ((exp === a && ans === b) || (exp === b && ans === a)) {
        return { expected: exp, confused: ans };
      }
    }
  }

  // Comparação dentro de palavras (ex: CHUVA vs XUVA, CARRO vs CARO, CASA vs CAZA)
  for (const [a, b] of KNOWN_CONFUSION_PAIRS) {
    if (exp.includes(a) && ans.includes(b) && exp.replace(a, b) === ans) {
      return { expected: a, confused: b };
    }
    if (exp.includes(b) && ans.includes(a) && exp.replace(b, a) === ans) {
      return { expected: b, confused: a };
    }
  }

  return undefined;
}

export function checkAnswer(
  expected: string,
  userAnswer: string,
  options: { requireExactAccents?: boolean } = {}
): AnswerCheckResult {
  const expStrict = normalizeStrict(expected);
  const ansStrict = normalizeStrict(userAnswer);

  if (expStrict === ansStrict) {
    return {
      isCorrect: true,
      almostCorrect: false,
      feedbackMessage: getPositiveMessage(),
    };
  }

  const expNoAcc = normalizeWithoutAccents(expected);
  const ansNoAcc = normalizeWithoutAccents(userAnswer);

  if (expNoAcc === ansNoAcc && expNoAcc.length > 0) {
    if (options.requireExactAccents) {
      return {
        isCorrect: false,
        almostCorrect: true,
        feedbackMessage: 'Quase lá! Atenção especial ao acento ou cedilha!',
      };
    }
    return {
      isCorrect: true,
      almostCorrect: true,
      feedbackMessage: `Muito bem! Lembre-se da grafia completa: ${expStrict}.`,
    };
  }

  const detectedConfusion = detectConfusionPattern(expected, userAnswer);
  return {
    isCorrect: false,
    almostCorrect: false,
    detectedConfusion,
    feedbackMessage: getEncouragementMessage(),
  };
}

export function computeDiagnosticPlacement(
  results: Array<{ level: LearningLevel; isCorrect: boolean }>
): { recommendedLevel: LearningLevel; unlockedWorlds: LearningLevel[]; summary: string } {
  if (results.length === 0) {
    return {
      recommendedLevel: 1,
      unlockedWorlds: [1],
      summary: 'Vamos começar pelo Mundo das Letras para construir uma base bem firme!',
    };
  }

  let highestPassed: LearningLevel = 1;
  const byLevel = new Map<LearningLevel, { total: number; ok: number }>();

  for (const r of results) {
    const prev = byLevel.get(r.level) ?? { total: 0, ok: 0 };
    byLevel.set(r.level, { total: prev.total + 1, ok: prev.ok + (r.isCorrect ? 1 : 0) });
  }

  const levels: LearningLevel[] = [1, 2, 3, 4, 5, 6];
  for (const lvl of levels) {
    const stat = byLevel.get(lvl);
    if (stat && stat.ok >= Math.ceil(stat.total * 0.6)) {
      highestPassed = lvl;
    } else if (stat && stat.ok === 0) {
      break;
    }
  }

  const totalCorrect = results.filter((r) => r.isCorrect).length;
  const recommendedLevel: LearningLevel =
    totalCorrect === results.length ? Math.min(6, highestPassed + 1) as LearningLevel : highestPassed;

  const unlockedWorlds: LearningLevel[] = [];
  for (let l = 1; l <= recommendedLevel; l++) {
    unlockedWorlds.push(l as LearningLevel);
  }
  if (!unlockedWorlds.includes(1)) unlockedWorlds.unshift(1);

  return {
    recommendedLevel,
    unlockedWorlds,
    summary: `Excelente exploração! A Lumi preparou seu caminho começando no Nível ${recommendedLevel}, com ${unlockedWorlds.length} mundo(s) abertos para você brincar.`,
  };
}
