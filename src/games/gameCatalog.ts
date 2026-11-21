import type { GameId, LearningLevel } from '../types';

export interface GameMetadata {
  id: GameId;
  title: string;
  emoji: string;
  shortDesc: string;
  instructions: string;
  minLevel: LearningLevel;
  color: string;
}

export const GAMES_CATALOG: GameMetadata[] = [
  {
    id: 'sound-hunter',
    title: 'Caçadora de Sons',
    emoji: '🎧',
    shortDesc: 'Ouça o som e encontre a letra certa!',
    instructions: 'Toque no botão de som, escute com atenção e escolha a letra que faz esse som.',
    minLevel: 1,
    color: '#4F46E5',
  },
  {
    id: 'initial-sound',
    title: 'Qual é o Som Inicial?',
    emoji: '🔍',
    shortDesc: 'Descubra qual palavra começa com o som!',
    instructions: 'Ouça o som apresentado e toque na imagem que começa com ele.',
    minLevel: 1,
    color: '#0EA5E9',
  },
  {
    id: 'word-factory',
    title: 'Fábrica de Palavras',
    emoji: '🏭',
    shortDesc: 'Organize as sílabas na ordem certa!',
    instructions: 'Toque nas sílabas na ordem correta para montar a palavra da imagem.',
    minLevel: 3,
    color: '#10B981',
  },
  {
    id: 'incomplete-word',
    title: 'Palavra Incompleta',
    emoji: '🧩',
    shortDesc: 'Complete as letras que estão faltando!',
    instructions: 'Veja a imagem, ouça a palavra e escolha a letra ou pedacinho que falta.',
    minLevel: 3,
    color: '#F59E0B',
  },
  {
    id: 'mystery-word',
    title: 'Palavra Misteriosa',
    emoji: '🕵️',
    shortDesc: 'Veja a imagem e escreva a palavra!',
    instructions: 'Observe a imagem e a dica, depois escreva a palavra secreta.',
    minLevel: 4,
    color: '#8B5CF6',
  },
  {
    id: 'dictation-robot',
    title: 'Robô do Ditado',
    emoji: '🤖',
    shortDesc: 'O robô fala uma palavra e você escreve!',
    instructions: 'Aperte para ouvir o robô falar e digite a palavra com calma.',
    minLevel: 4,
    color: '#EC4899',
  },
  {
    id: 'sentence-builder',
    title: 'Construtor de Frases',
    emoji: '🚂',
    shortDesc: 'Coloque as palavras em ordem!',
    instructions: 'Toque nas palavras para montar uma frase com sentido completo.',
    minLevel: 5,
    color: '#14B8A6',
  },
  {
    id: 'story-detective',
    title: 'Detetive das Histórias',
    emoji: '📖',
    shortDesc: 'Leia a história e desvende as perguntas!',
    instructions: 'Leia ou ouça a história e responda às perguntas de compreensão.',
    minLevel: 6,
    color: '#6366F1',
  },
  {
    id: 'timed-reading',
    title: 'Leitura em Aventura',
    emoji: '⏱️',
    shortDesc: 'Pratique ler palavras no seu ritmo!',
    instructions: 'Leia as palavras em voz alta ou para você mesmo. Sem pressa e sem punição!',
    minLevel: 4,
    color: '#F97316',
  },
  {
    id: 'listen-and-write',
    title: 'Escuta e Escreve',
    emoji: '✍️',
    shortDesc: 'Ouça palavras ou frases e escreva!',
    instructions: 'Escute o áudio quantas vezes quiser e escreva o que ouviu.',
    minLevel: 5,
    color: '#E11D48',
  },
];
