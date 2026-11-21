import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, RotateCcw, Volume2 } from 'lucide-react';
import { ALPHABET } from '../content/letters';
import { WORDS_BANK } from '../content/words';
import { checkAnswer } from '../pedagogy/evaluation';
import { playGentleTryAgain, playSuccessChime } from '../services/soundEffects';
import { speakLetterSound, speakWord, stopSpeaking } from '../services/speechService';
import type { ChildProfile, ConfusionPair, GameId, LearningLevel, SkillCategory, WordItem } from '../types';

export interface GameAttemptPayload {
  gameId: GameId;
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

interface SoundGameProps {
  profile: ChildProfile;
  confusions: ConfusionPair[];
  onRecord: (payload: GameAttemptPayload) => Promise<void>;
  onRoundComplete?: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// JOGO 1 — CAÇADORA DE SONS
export const SoundHunterGame: React.FC<SoundGameProps> = ({
  profile,
  confusions,
  onRecord,
}) => {
  const [round, setRound] = useState(0);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const target = useMemo(() => {
    // Se houver confusão recorrente (ex: M vs N), prioriza essas letras!
    const topConfusion = confusions[0];
    if (topConfusion && round % 2 === 0) {
      const found = ALPHABET.find((l) => l.letter === topConfusion.expected);
      if (found) return found;
    }
    const pool = ALPHABET.filter((l) => l.letter !== 'H');
    return pool[(round * 7 + Math.floor(Math.random() * pool.length)) % pool.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const options = useMemo(() => {
    const distractors = new Set<string>();
    for (const sim of target.similarLetters) {
      if (sim !== target.letter && distractors.size < 2) {
        distractors.add(sim);
      }
    }
    const others = shuffle(ALPHABET.filter((l) => l.letter !== target.letter));
    for (const o of others) {
      if (distractors.size >= 3) break;
      distractors.add(o.letter);
    }
    return shuffle([target.letter, ...Array.from(distractors)]);
  }, [target]);

  const playTargetAudio = () => {
    speakLetterSound(target.phonemeHint, target.anchorWord, profile.speechRate);
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelected(null);
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) {
      playTargetAudio();
    }
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleChoose = async (letter: string) => {
    if (feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    setSelected(letter);

    const res = checkAnswer(target.letter, letter);
    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} A letra ${target.letter} faz o som ${target.phonemeDisplay}!` });
      await onRecord({
        gameId: 'sound-hunter',
        level: target.level,
        skillId: `phoneme:${target.letter}`,
        skillLabel: `Som da letra ${target.letter}`,
        skillCategory: 'phoneme',
        prompt: `Encontrar a letra do som ${target.phonemeDisplay}`,
        expectedAnswer: target.letter,
        userAnswer: letter,
        isCorrect: true,
        attemptsTaken: nextAttempts,
        responseMs: Date.now() - startTimeRef.current,
      });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: res.feedbackMessage });
      await onRecord({
        gameId: 'sound-hunter',
        level: target.level,
        skillId: `phoneme:${target.letter}`,
        skillLabel: `Som da letra ${target.letter}`,
        skillCategory: 'phoneme',
        prompt: `Encontrar a letra do som ${target.phonemeDisplay}`,
        expectedAnswer: target.letter,
        userAnswer: letter,
        isCorrect: false,
        attemptsTaken: nextAttempts,
        responseMs: Date.now() - startTimeRef.current,
        detectedConfusion: res.detectedConfusion,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="pill pill-indigo">Som alvo: {target.phonemeDisplay}</span>
          <h3 style={{ margin: '8px 0 0', fontSize: '1.25rem' }}>
            Qual letra faz este som?
          </h3>
        </div>
        <button type="button" className="btn btn-secondary btn-lg" onClick={playTargetAudio}>
          <Volume2 size={22} /> Ouvir som novamente
        </button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {options.map((opt) => {
          const isSel = selected === opt;
          const cls = isSel
            ? feedback?.ok
              ? 'tile-btn correct'
              : 'tile-btn try-again'
            : 'tile-btn';
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              style={{ minHeight: 84, fontSize: '2rem' }}
              onClick={() => handleChoose(opt)}
            >
              {opt} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>{opt.toLowerCase()}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {feedback.ok ? `${target.anchorEmoji} ` : ''}
            {feedback.msg}
          </div>
          {feedback.ok ? (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próximo som <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-outline" onClick={playTargetAudio}>
              <RotateCcw size={16} /> Ouvir de novo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// JOGO 6 — QUAL É O SOM INICIAL?
export const InitialSoundGame: React.FC<SoundGameProps> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { targetWord, options } = useMemo(() => {
    const simpleWords = WORDS_BANK.filter((w) => w.level <= 4);
    const target = simpleWords[(round * 5 + Math.floor(Math.random() * simpleWords.length)) % simpleWords.length];
    const targetInitial = target.word[0];
    const distractors = shuffle(
      simpleWords.filter((w) => w.word[0] !== targetInitial)
    ).slice(0, 3);
    return {
      targetWord: target,
      options: shuffle([target, ...distractors]),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const targetLetter = ALPHABET.find((l) => l.letter === targetWord.word[0]);

  const playInstruction = () => {
    if (targetLetter) {
      speakLetterSound(
        `Qual palavra começa com o som da letra ${targetLetter.letter}? ${targetLetter.phonemeHint}`,
        undefined,
        profile.speechRate
      );
    }
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedId(null);
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) {
      playInstruction();
    }
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handlePick = async (item: WordItem) => {
    if (feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    setSelectedId(item.id);
    speakWord(item.word, profile.speechRate);

    const isCorrect = item.word[0] === targetWord.word[0];
    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({
        ok: true,
        msg: `Isso mesmo! ${item.word} começa com o som da letra ${targetWord.word[0]}!`,
      });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({
        ok: false,
        msg: `Boa tentativa! ${item.word} começa com ${item.word[0]}. Vamos tentar novamente?`,
      });
    }

    await onRecord({
      gameId: 'initial-sound',
      level: 2,
      skillId: `initial:${targetWord.word[0]}`,
      skillLabel: `Som inicial ${targetWord.word[0]}`,
      skillCategory: 'phoneme',
      prompt: `Qual palavra começa com ${targetWord.word[0]}?`,
      expectedAnswer: targetWord.word,
      userAnswer: item.word,
      isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="pill pill-indigo">
            Som inicial: {targetWord.word[0]} ({targetLetter?.phonemeDisplay ?? ''})
          </span>
          <h3 style={{ margin: '8px 0 0', fontSize: '1.25rem' }}>
            Qual imagem começa com o som da letra <strong>{targetWord.word[0]}</strong>?
          </h3>
        </div>
        <button type="button" className="btn btn-secondary" onClick={playInstruction}>
          <Volume2 size={20} /> Ouvir novamente
        </button>
      </div>

      <div className="grid-2">
        {options.map((item) => {
          const isSel = selectedId === item.id;
          const cls = isSel
            ? feedback?.ok
              ? 'tile-btn correct'
              : 'tile-btn try-again'
            : 'tile-btn';
          return (
            <button
              key={item.id}
              type="button"
              className={cls}
              style={{ flexDirection: 'column', minHeight: 110, padding: 14 }}
              onClick={() => handlePick(item)}
            >
              <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
              <span style={{ fontSize: '1.1rem' }}>{item.word}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próxima rodada <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
