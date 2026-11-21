import type {
  AttemptLog,
  ChildProfile,
  ConfusionPair,
  LearningLevel,
  MasteryStatus,
  SkillCategory,
  SkillMastery,
} from '../types';

export const MASTERY_CONFIG = {
  minAttemptsForMastery: 3,
  masteryScoreThreshold: 80,
  recentWindowSize: 6,
  spacedIntervalsDays: [1, 3, 7, 14] as const,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateMasteryScore(recentHistory: boolean[], totalCorrect: number, totalAttempts: number): number {
  if (totalAttempts === 0) return 0;
  const recentRate =
    recentHistory.length > 0
      ? recentHistory.filter(Boolean).length / recentHistory.length
      : 0;
  const overallRate = totalCorrect / totalAttempts;
  // 70% peso no desempenho recente, 30% no histórico total
  const raw = (recentRate * 0.7 + overallRate * 0.3) * 100;
  // Penalidade suave se ainda tiver poucas tentativas para evitar falso domínio com 1 acerto
  const confidenceFactor = Math.min(1, totalAttempts / MASTERY_CONFIG.minAttemptsForMastery);
  return Math.round(raw * confidenceFactor);
}

export function determineMasteryStatus(
  attempts: number,
  consecutiveCorrect: number,
  masteryScore: number,
  nextReviewAt: number,
  now = Date.now()
): MasteryStatus {
  if (attempts === 0) return 'new';
  if (
    attempts >= MASTERY_CONFIG.minAttemptsForMastery &&
    masteryScore >= MASTERY_CONFIG.masteryScoreThreshold &&
    consecutiveCorrect >= 2
  ) {
    if (nextReviewAt > 0 && now >= nextReviewAt) {
      return 'needs_review';
    }
    return 'mastered';
  }
  if (masteryScore >= 50) return 'practicing';
  return 'learning';
}

export function computeNextReviewAt(consecutiveCorrect: number, isCorrect: boolean, now = Date.now()): number {
  if (!isCorrect) {
    // Revisar em breve (em ~4 horas) quando houve dificuldade
    return now + 4 * 60 * 60 * 1000;
  }
  const idx = Math.min(
    MASTERY_CONFIG.spacedIntervalsDays.length - 1,
    Math.max(0, consecutiveCorrect - 1)
  );
  return now + MASTERY_CONFIG.spacedIntervalsDays[idx] * DAY_MS;
}

export interface UpdateSkillInput {
  childId: string;
  skillId: string;
  label: string;
  category: SkillCategory;
  level: LearningLevel;
  isCorrect: boolean;
  responseMs: number;
  existing?: SkillMastery;
  now?: number;
}

export function updateSkillMastery(input: UpdateSkillInput): SkillMastery {
  const now = input.now ?? Date.now();
  const prev = input.existing;

  const attempts = (prev?.attempts ?? 0) + 1;
  const correctCount = (prev?.correctCount ?? 0) + (input.isCorrect ? 1 : 0);
  const consecutiveCorrect = input.isCorrect ? (prev?.consecutiveCorrect ?? 0) + 1 : 0;

  const recentHistory = [...(prev?.recentHistory ?? []), input.isCorrect].slice(
    -MASTERY_CONFIG.recentWindowSize
  );

  const masteryScore = calculateMasteryScore(recentHistory, correctCount, attempts);
  const nextReviewAt = computeNextReviewAt(consecutiveCorrect, input.isCorrect, now);
  const status = determineMasteryStatus(attempts, consecutiveCorrect, masteryScore, nextReviewAt, now);

  const prevAvg = prev?.avgResponseMs ?? input.responseMs;
  const avgResponseMs = prev
    ? Math.round((prevAvg * prev.attempts + input.responseMs) / attempts)
    : input.responseMs;

  return {
    id: `${input.childId}:${input.skillId}`,
    childId: input.childId,
    skillId: input.skillId,
    label: input.label,
    category: input.category,
    level: input.level,
    attempts,
    correctCount,
    consecutiveCorrect,
    recentHistory,
    masteryScore,
    status,
    nextReviewAt,
    lastPracticedAt: now,
    avgResponseMs,
  };
}

export function shouldUnlockNextWorld(
  profile: ChildProfile,
  masteries: SkillMastery[]
): LearningLevel | null {
  const current = profile.currentLevel;
  if (current >= 10) return null;

  const levelMasteries = masteries.filter((m) => m.level === current);
  const masteredCount = levelMasteries.filter(
    (m) => m.status === 'mastered' || m.status === 'needs_review'
  ).length;

  // Critério: pelo menos 3 habilidades dominadas no nível atual (não basta 1 acerto)
  if (masteredCount >= 3) {
    return (current + 1) as LearningLevel;
  }
  return null;
}

export interface AdaptiveRecommendation {
  focusSkillIds: string[];
  dueForReview: SkillMastery[];
  topConfusions: ConfusionPair[];
  difficultWords: Array<{ word: string; errorCount: number }>;
  parentTips: string[];
  suggestedLevel: LearningLevel;
}

export function analyzeChildAdaptation(
  profile: ChildProfile,
  masteries: SkillMastery[],
  confusions: ConfusionPair[],
  attempts: AttemptLog[],
  now = Date.now()
): AdaptiveRecommendation {
  const dueForReview = masteries
    .filter((m) => m.nextReviewAt <= now && m.attempts > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const struggling = masteries
    .filter((m) => m.status === 'learning' && m.attempts >= 2)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const topConfusions = [...confusions]
    .filter((c) => c.count >= 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const wordErrors = new Map<string, number>();
  for (const att of attempts) {
    if (!att.isCorrect && att.expectedAnswer.length >= 2) {
      const key = att.expectedAnswer.toUpperCase();
      wordErrors.set(key, (wordErrors.get(key) ?? 0) + 1);
    }
  }

  const difficultWords = Array.from(wordErrors.entries())
    .map(([word, errorCount]) => ({ word, errorCount }))
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 6);

  const focusSkillIds = Array.from(
    new Set([
      ...struggling.slice(0, 3).map((s) => s.skillId),
      ...dueForReview.slice(0, 3).map((s) => s.skillId),
    ])
  );

  const parentTips: string[] = [];
  if (topConfusions.length > 0) {
    const c = topConfusions[0];
    parentTips.push(
      `Praticar a diferenciação entre "${c.expected}" e "${c.confused}" com exemplos em voz alta (ex.: ${c.expected} x ${c.confused}).`
    );
  }
  if (dueForReview.length > 0) {
    parentTips.push(
      `Há ${dueForReview.length} conteúdo(s) prontos para revisão espaçada na Missão Diária de hoje.`
    );
  }
  if (difficultWords.length > 0) {
    parentTips.push(
      `Brincar de montar ou ditar as palavras: ${difficultWords
        .slice(0, 3)
        .map((d) => d.word)
        .join(', ')}.`
    );
  }
  if (parentTips.length === 0) {
    parentTips.push(
      'Manter a rotina leve de 15 minutos por dia, alternando jogos de sons, sílabas e leitura de histórias.'
    );
  }

  return {
    focusSkillIds,
    dueForReview: dueForReview.slice(0, 6),
    topConfusions,
    difficultWords,
    parentTips,
    suggestedLevel: profile.currentLevel,
  };
}
