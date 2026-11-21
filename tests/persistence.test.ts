import { beforeEach, describe, expect, it } from 'vitest';
import { recordActivityAttempt } from '../src/pedagogy/progressRecorder';
import {
  exportChildBundle,
  getAttemptsByChild,
  getConfusionsByChild,
  getMasteriesByChild,
  getProfile,
  importChildBundle,
  resetChildProgress,
  resetDBConnectionForTests,
  saveProfile,
} from '../src/services/db';
import type { ChildProfile } from '../src/types';

describe('Persistência em IndexedDB e Evolução', () => {
  const profile: ChildProfile = {
    id: 'child-db-test',
    name: 'Lucas',
    age: 8,
    avatarId: 'fox',
    createdAt: Date.now(),
    dailyGoalMinutes: 15,
    diagnosticCompleted: true,
    currentLevel: 1,
    stars: 0,
    streakDays: 1,
    lastActiveDate: '2026-11-19',
    unlockedWorlds: [1],
    badges: [],
    collectibles: ['col-lumi'],
    speechRate: 0.9,
    soundEnabled: true,
    voiceRecognitionEnabled: true,
  };

  beforeEach(async () => {
    resetDBConnectionForTests();
    await saveProfile(profile);
  });

  it('salva tentativas, atualiza maestria, registra confusões e exporta/importa dados', async () => {
    const res1 = await recordActivityAttempt({
      profile,
      gameId: 'sound-hunter',
      level: 1,
      skillId: 'phoneme:M',
      skillLabel: 'Som da letra M',
      skillCategory: 'phoneme',
      prompt: 'Encontrar som /m/',
      expectedAnswer: 'M',
      userAnswer: 'N',
      isCorrect: false,
      attemptsTaken: 1,
      responseMs: 3200,
      detectedConfusion: { expected: 'M', confused: 'N' },
    });

    expect(res1.starsEarned).toBe(1); // Valoriza o esforço
    const confs = await getConfusionsByChild(profile.id);
    expect(confs).toHaveLength(1);
    expect(confs[0].expected).toBe('M');

    const attempts = await getAttemptsByChild(profile.id);
    expect(attempts).toHaveLength(1);

    const masteries = await getMasteriesByChild(profile.id);
    expect(masteries).toHaveLength(1);

    const bundle = await exportChildBundle(profile.id);
    expect(bundle).not.toBeNull();
    expect(bundle!.attempts).toHaveLength(1);

    const reset = await resetChildProgress(profile.id);
    expect(reset!.stars).toBe(0);
    expect(await getAttemptsByChild(profile.id)).toHaveLength(0);

    await importChildBundle(bundle!);
    const restored = await getProfile(profile.id);
    expect(restored!.stars).toBe(1);
    expect(await getAttemptsByChild(profile.id)).toHaveLength(1);
  });
});
