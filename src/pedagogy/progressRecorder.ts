import { shouldUnlockNextWorld, updateSkillMastery } from '../adaptive/engine';
import { COLLECTIBLES } from '../content/worldsAndRewards';
import {
  getAttemptsByChild,
  getConfusionsByChild,
  getMasteriesByChild,
  saveAttempt,
  saveConfusion,
  saveMastery,
  saveProfile,
} from '../services/db';
import type {
  AttemptLog,
  ChildProfile,
  GameId,
  LearningLevel,
  SkillCategory,
} from '../types';
import { getTodayDateKey } from './dailyMission';

export interface RecordAttemptInput {
  profile: ChildProfile;
  gameId: GameId | 'diagnostic' | 'world-activity';
  level: LearningLevel;
  skillId: string;
  skillLabel: string;
  skillCategory: SkillCategory;
  prompt: string;
  expectedAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  attemptsTaken: number;
  responseMs: number;
  detectedConfusion?: { expected: string; confused: string };
}

export interface RecordAttemptOutcome {
  updatedProfile: ChildProfile;
  starsEarned: number;
  unlockedWorld: LearningLevel | null;
  newBadges: string[];
}

export async function recordActivityAttempt(
  input: RecordAttemptInput
): Promise<RecordAttemptOutcome> {
  const now = Date.now();
  const today = getTodayDateKey(new Date(now));

  const attempt: AttemptLog = {
    id: `att-${now}-${Math.random().toString(36).slice(2, 7)}`,
    childId: input.profile.id,
    timestamp: now,
    date: today,
    gameId: input.gameId,
    level: input.level,
    skillIds: [input.skillId],
    prompt: input.prompt,
    expectedAnswer: input.expectedAnswer,
    userAnswer: input.userAnswer,
    isCorrect: input.isCorrect,
    attemptsTaken: input.attemptsTaken,
    responseMs: input.responseMs,
    errorPattern: input.detectedConfusion
      ? `${input.detectedConfusion.expected}->${input.detectedConfusion.confused}`
      : undefined,
  };

  await saveAttempt(attempt);

  const [masteries, confusions, allAttempts] = await Promise.all([
    getMasteriesByChild(input.profile.id),
    getConfusionsByChild(input.profile.id),
    getAttemptsByChild(input.profile.id),
  ]);

  const existingMastery = masteries.find((m) => m.skillId === input.skillId);
  const updatedMastery = updateSkillMastery({
    childId: input.profile.id,
    skillId: input.skillId,
    label: input.skillLabel,
    category: input.skillCategory,
    level: input.level,
    isCorrect: input.isCorrect,
    responseMs: input.responseMs,
    existing: existingMastery,
    now,
  });
  await saveMastery(updatedMastery);

  const mergedMasteries = masteries.some((m) => m.id === updatedMastery.id)
    ? masteries.map((m) => (m.id === updatedMastery.id ? updatedMastery : m))
    : [...masteries, updatedMastery];

  if (input.detectedConfusion) {
    const confId = `${input.profile.id}:${input.detectedConfusion.expected}:${input.detectedConfusion.confused}`;
    const existingConf = confusions.find((c) => c.id === confId);
    await saveConfusion({
      id: confId,
      childId: input.profile.id,
      expected: input.detectedConfusion.expected,
      confused: input.detectedConfusion.confused,
      count: (existingConf?.count ?? 0) + 1,
      lastSeenAt: now,
    });
  }

  // Recompensa valoriza o esforço (1 estrela por tentativa concluída, +2 se acertou)
  const starsEarned = input.isCorrect ? (input.attemptsTaken === 1 ? 3 : 2) : 1;

  // Sequência de dias
  let streakDays = input.profile.streakDays || 0;
  if (input.profile.lastActiveDate !== today) {
    const yesterday = new Date(now - 86400000);
    const yKey = getTodayDateKey(yesterday);
    streakDays = input.profile.lastActiveDate === yKey ? streakDays + 1 : 1;
  }

  let updatedProfile: ChildProfile = {
    ...input.profile,
    stars: input.profile.stars + starsEarned,
    streakDays,
    lastActiveDate: today,
  };

  // Verifica desbloqueio de próximo mundo
  const unlockedWorld = shouldUnlockNextWorld(updatedProfile, mergedMasteries);
  if (unlockedWorld && !updatedProfile.unlockedWorlds.includes(unlockedWorld)) {
    const newCol = COLLECTIBLES.find((c) => c.world === unlockedWorld);
    updatedProfile = {
      ...updatedProfile,
      currentLevel: unlockedWorld,
      unlockedWorlds: [...updatedProfile.unlockedWorlds, unlockedWorld],
      collectibles:
        newCol && !updatedProfile.collectibles.includes(newCol.id)
          ? [...updatedProfile.collectibles, newCol.id]
          : updatedProfile.collectibles,
    };
  }

  // Verifica novas medalhas
  const newBadges: string[] = [];
  const addBadge = (id: string) => {
    if (!updatedProfile.badges.includes(id)) {
      updatedProfile = { ...updatedProfile, badges: [...updatedProfile.badges, id] };
      newBadges.push(id);
    }
  };

  if (updatedProfile.stars >= 20) addBadge('star-collector-20');
  if (allAttempts.length >= 15) addBadge('persistent-learner');
  if (mergedMasteries.filter((m) => m.status === 'mastered').length >= 5) {
    addBadge('syllable-master');
  }
  if (input.gameId === 'story-detective' || input.level === 6) {
    addBadge('story-explorer');
  }

  await saveProfile(updatedProfile);

  return {
    updatedProfile,
    starsEarned,
    unlockedWorld,
    newBadges,
  };
}
