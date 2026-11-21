import { analyzeChildAdaptation } from '../adaptive/engine';
import type {
  AttemptLog,
  ChildProfile,
  ConfusionPair,
  DailyMission,
  GameId,
  LearningLevel,
  MissionBlock,
  SkillMastery,
} from '../types';

export function getTodayDateKey(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function chooseAdaptiveGame(level: LearningLevel, hasConfusions: boolean): GameId {
  if (hasConfusions && level <= 2) return 'sound-hunter';
  if (level === 1) return 'sound-hunter';
  if (level === 2) return 'initial-sound';
  if (level === 3) return 'word-factory';
  if (level === 4) return 'incomplete-word';
  if (level === 5) return 'sentence-builder';
  if (level === 6) return 'story-detective';
  return 'dictation-robot';
}

function chooseReadWriteGame(level: LearningLevel): GameId {
  if (level <= 2) return 'initial-sound';
  if (level === 3) return 'mystery-word';
  if (level === 4) return 'listen-and-write';
  if (level === 5) return 'sentence-builder';
  if (level === 6) return 'story-detective';
  return 'dictation-robot';
}

export function generateDailyMission(
  profile: ChildProfile,
  masteries: SkillMastery[],
  confusions: ConfusionPair[],
  attempts: AttemptLog[],
  dateKey = getTodayDateKey()
): DailyMission {
  const totalGoal = Math.max(10, Math.min(40, profile.dailyGoalMinutes || 15));
  const scale = totalGoal / 20;

  const mins = (base: number) => Math.max(1, Math.round(base * scale));
  const adaptation = analyzeChildAdaptation(profile, masteries, confusions, attempts);

  const reviewSkills = adaptation.dueForReview.slice(0, 3).map((m) => m.skillId);
  const hasConfusions = adaptation.topConfusions.length > 0;
  const reviewDesc = hasConfusions
    ? `Vamos revisar sons parecidos (${adaptation.topConfusions[0].expected} e ${adaptation.topConfusions[0].confused}) com calma!`
    : reviewSkills.length > 0
      ? 'Hora de relembrar o que você já aprendeu antes!'
      : 'Aquecimento rápido com sons e letras divertidas!';

  const blocks: MissionBlock[] = [
    {
      id: 'block-review',
      type: 'review',
      title: '1. Revisão Esperta',
      description: reviewDesc,
      minutes: mins(3),
      gameId: profile.currentLevel <= 2 ? 'sound-hunter' : 'incomplete-word',
      targetLevel: Math.max(1, profile.currentLevel - 1) as LearningLevel,
      targetSkillIds: reviewSkills,
      completed: false,
    },
    {
      id: 'block-learn',
      type: 'learn',
      title: '2. Descoberta do Dia',
      description: `Explorar uma atividade no Nível ${profile.currentLevel}.`,
      minutes: mins(5),
      targetLevel: profile.currentLevel,
      targetSkillIds: adaptation.focusSkillIds,
      completed: false,
    },
    {
      id: 'block-game',
      type: 'game',
      title: '3. Hora do Jogo',
      description: 'Brincar e ganhar estrelas praticando!',
      minutes: mins(5),
      gameId: chooseAdaptiveGame(profile.currentLevel, hasConfusions),
      targetLevel: profile.currentLevel,
      targetSkillIds: adaptation.focusSkillIds,
      completed: false,
    },
    {
      id: 'block-read-write',
      type: 'read_write',
      title: '4. Leitura e Escrita',
      description:
        profile.currentLevel >= 5
          ? 'Ler com atenção e montar ideias!'
          : 'Ouvir e escrever ou montar palavras!',
      minutes: mins(5),
      gameId: chooseReadWriteGame(profile.currentLevel),
      targetLevel: profile.currentLevel,
      targetSkillIds: [],
      completed: false,
    },
    {
      id: 'block-reward',
      type: 'reward',
      title: '5. Baú de Estrelas',
      description: 'Comemorar o esforço de hoje e encerrar bem!',
      minutes: mins(2),
      targetLevel: profile.currentLevel,
      targetSkillIds: [],
      completed: false,
    },
  ];

  return {
    id: `${profile.id}:${dateKey}`,
    childId: profile.id,
    date: dateKey,
    totalMinutesGoal: totalGoal,
    blocks,
    earnedStars: 0,
  };
}
