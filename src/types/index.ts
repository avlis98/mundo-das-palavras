export type LearningLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SkillCategory =
  | 'letter'
  | 'phoneme'
  | 'syllable'
  | 'word'
  | 'sentence'
  | 'story'
  | 'orthography';

export type MasteryStatus =
  | 'new'
  | 'learning'
  | 'practicing'
  | 'mastered'
  | 'needs_review';

export type ScreenId =
  | 'welcome'
  | 'profiles'
  | 'diagnostic'
  | 'map'
  | 'daily-mission'
  | 'world-1'
  | 'world-2'
  | 'world-3'
  | 'world-4'
  | 'world-5'
  | 'world-6'
  | 'world-7'
  | 'world-8'
  | 'world-9'
  | 'world-10'
  | 'games'
  | 'achievements'
  | 'progress'
  | 'parent-dashboard'
  | 'settings';

export type GameId =
  | 'sound-hunter'       // Jogo 1: Caçadora de Sons
  | 'word-factory'       // Jogo 2: Fábrica de Palavras
  | 'dictation-robot'    // Jogo 3: Robô do Ditado
  | 'story-detective'    // Jogo 4: Detetive das Histórias
  | 'mystery-word'       // Jogo 5: Palavra Misteriosa
  | 'initial-sound'      // Jogo 6: Qual é o Som Inicial?
  | 'incomplete-word'    // Jogo 7: Palavra Incompleta
  | 'sentence-builder'   // Jogo 8: Construtor de Frases
  | 'timed-reading'      // Jogo 9: Leitura Contra o Relógio (sem punição)
  | 'listen-and-write';  // Jogo 10: Escuta e Escreve

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarId: string;
  createdAt: number;
  dailyGoalMinutes: number;
  diagnosticCompleted: boolean;
  currentLevel: LearningLevel;
  stars: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  unlockedWorlds: LearningLevel[];
  badges: string[];
  collectibles: string[];
  speechRate: number; // 0.55 to 1.15
  preferredVoiceURI?: string;
  soundEnabled: boolean;
  voiceRecognitionEnabled: boolean;
}

export interface SkillMastery {
  id: string; // `${childId}:${skillId}`
  childId: string;
  skillId: string;
  label: string;
  category: SkillCategory;
  level: LearningLevel;
  attempts: number;
  correctCount: number;
  consecutiveCorrect: number;
  recentHistory: boolean[]; // últimas 6 tentativas
  masteryScore: number; // 0-100
  status: MasteryStatus;
  nextReviewAt: number; // epoch ms (repetição espaçada)
  lastPracticedAt: number;
  avgResponseMs: number;
}

export interface ConfusionPair {
  id: string; // `${childId}:${expected}:${confused}`
  childId: string;
  expected: string;
  confused: string;
  count: number;
  lastSeenAt: number;
}

export interface AttemptLog {
  id: string;
  childId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  gameId: GameId | 'diagnostic' | 'world-activity';
  level: LearningLevel;
  skillIds: string[];
  prompt: string;
  expectedAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  attemptsTaken: number;
  responseMs: number;
  errorPattern?: string;
}

export type MissionBlockType = 'review' | 'learn' | 'game' | 'read_write' | 'reward';

export interface MissionBlock {
  id: string;
  type: MissionBlockType;
  title: string;
  description: string;
  minutes: number;
  gameId?: GameId;
  targetLevel: LearningLevel;
  targetSkillIds: string[];
  completed: boolean;
}

export interface DailyMission {
  id: string; // `${childId}:${date}`
  childId: string;
  date: string; // YYYY-MM-DD
  totalMinutesGoal: number;
  blocks: MissionBlock[];
  earnedStars: number;
  completedAt?: number;
}

export interface AppSettings {
  id: 'global';
  parentPin: string;
  activeChildId: string | null;
}

// --- Content Bank Types ---

export interface LetterItem {
  letter: string;
  lowercase: string;
  name: string;
  phonemeHint: string; // Como o TTS deve pronunciar o som aproximado
  phonemeDisplay: string; // Ex: "/m/"
  isVowel: boolean;
  anchorWord: string;
  anchorEmoji: string;
  similarLetters: string[];
  level: LearningLevel;
}

export interface WordItem {
  id: string;
  word: string;
  syllables: string[];
  emoji: string;
  hint: string;
  level: LearningLevel;
  patterns: string[]; // ex: ['CV', 'CH', 'LH', 'NH', 'RR', 'SS', 'QU', 'GU', 'R_RR', 'S_Z', 'C_CC']
  rhymeGroup?: string;
  category: string;
}

export interface SentenceItem {
  id: string;
  text: string;
  words: string[];
  emoji: string;
  level: LearningLevel;
  question: string;
  options: string[];
  correctOption: string;
  missingWord?: string;
}

export interface StoryQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: string;
  type: 'literal' | 'inferential' | 'vocabulary';
}

export interface StoryItem {
  id: string;
  title: string;
  theme: string;
  emoji: string;
  level: LearningLevel;
  sentences: string[];
  questions: StoryQuestion[];
  interpretationPrompt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  emoji: string;
  conditionText: string;
}

export interface CollectibleDefinition {
  id: string;
  name: string;
  emoji: string;
  world: LearningLevel;
  description: string;
}

export interface WorldDefinition {
  level: LearningLevel;
  screenId: ScreenId;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bgGradient: string;
  goal: string;
}

export interface DiagnosticQuestion {
  id: string;
  level: LearningLevel;
  skillId: string;
  skillCategory: SkillCategory;
  type: 'letter-sound' | 'rhyme' | 'syllable-build' | 'word-read' | 'word-write' | 'sentence-comprehension';
  prompt: string;
  spokenText: string;
  emoji?: string;
  options?: string[];
  syllablePool?: string[];
  expectedAnswer: string;
}

export interface ExportBundle {
  version: number;
  exportedAt: string;
  profile: ChildProfile;
  masteries: SkillMastery[];
  confusions: ConfusionPair[];
  attempts: AttemptLog[];
  missions: DailyMission[];
}
