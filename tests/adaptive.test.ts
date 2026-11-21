import { describe, expect, it } from 'vitest';
import {
  analyzeChildAdaptation,
  shouldUnlockNextWorld,
  updateSkillMastery,
} from '../src/adaptive/engine';
import { generateDailyMission } from '../src/pedagogy/dailyMission';
import type { ChildProfile, SkillMastery } from '../src/types';

const mockProfile: ChildProfile = {
  id: 'child-1',
  name: 'Sofia',
  age: 8,
  avatarId: 'owl',
  createdAt: Date.now(),
  dailyGoalMinutes: 20,
  diagnosticCompleted: true,
  currentLevel: 1,
  stars: 10,
  streakDays: 2,
  lastActiveDate: '2026-11-19',
  unlockedWorlds: [1],
  badges: [],
  collectibles: ['col-lumi'],
  speechRate: 0.9,
  soundEnabled: true,
  voiceRecognitionEnabled: true,
};

describe('Motor de Aprendizagem Adaptativa', () => {
  it('não marca habilidade como dominada após apenas uma tentativa correta', () => {
    const m1 = updateSkillMastery({
      childId: 'child-1',
      skillId: 'letter:M',
      label: 'Letra M',
      category: 'letter',
      level: 1,
      isCorrect: true,
      responseMs: 2500,
    });
    expect(m1.attempts).toBe(1);
    expect(m1.status).not.toBe('mastered');
  });

  it('marca habilidade como dominada após 3 tentativas consistentes e agenda repetição espaçada', () => {
    const now = 1_700_000_000_000;
    let m: SkillMastery | undefined;
    for (let i = 0; i < 3; i++) {
      m = updateSkillMastery({
        childId: 'child-1',
        skillId: 'letter:M',
        label: 'Letra M',
        category: 'letter',
        level: 1,
        isCorrect: true,
        responseMs: 2000,
        existing: m,
        now: now + i * 1000,
      });
    }
    expect(m!.status).toBe('mastered');
    expect(m!.masteryScore).toBeGreaterThanOrEqual(80);
    expect(m!.nextReviewAt).toBeGreaterThan(now);
  });

  it('desbloqueia o próximo mundo somente quando há pelo menos 3 habilidades dominadas no nível atual', () => {
    const twoMastered: SkillMastery[] = ['A', 'E'].map((l) => ({
      id: `child-1:letter:${l}`,
      childId: 'child-1',
      skillId: `letter:${l}`,
      label: `Letra ${l}`,
      category: 'letter',
      level: 1,
      attempts: 3,
      correctCount: 3,
      consecutiveCorrect: 3,
      recentHistory: [true, true, true],
      masteryScore: 100,
      status: 'mastered',
      nextReviewAt: Date.now() + 86400000,
      lastPracticedAt: Date.now(),
      avgResponseMs: 2000,
    }));
    expect(shouldUnlockNextWorld(mockProfile, twoMastered)).toBeNull();

    const threeMastered = [
      ...twoMastered,
      { ...twoMastered[0], id: 'child-1:letter:I', skillId: 'letter:I', label: 'Letra I' },
    ];
    expect(shouldUnlockNextWorld(mockProfile, threeMastered)).toBe(2);
  });

  it('identifica confusões recorrentes e gera recomendações práticas e missão diária de 5 blocos', () => {
    const confusions = [
      { id: 'c1', childId: 'child-1', expected: 'M', confused: 'N', count: 3, lastSeenAt: Date.now() },
    ];
    const adaptation = analyzeChildAdaptation(mockProfile, [], confusions, []);
    expect(adaptation.topConfusions[0].expected).toBe('M');
    expect(adaptation.parentTips[0]).toContain('M');

    const mission = generateDailyMission(mockProfile, [], confusions, [], '2026-11-19');
    expect(mission.blocks).toHaveLength(5);
    expect(mission.blocks[0].description).toContain('M');
  });
});
