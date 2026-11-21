import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Volume2 } from 'lucide-react';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import { SENTENCES_BANK } from '../content/sentences';
import { WORDS_BANK } from '../content/words';
import { checkAnswer } from '../pedagogy/evaluation';
import { playGentleTryAgain, playSuccessChime, playTapSound } from '../services/soundEffects';
import { speakSentence, speakWord } from '../services/speechService';
import type { ChildProfile } from '../types';
import type { GameAttemptPayload } from './SoundAndLetterGames';

interface Props {
  profile: ChildProfile;
  onRecord: (payload: GameAttemptPayload) => Promise<void>;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// JOGO 3 — ROBÔ DO DITADO
export const DictationRobotGame: React.FC<Props> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const target = useMemo(() => {
    const eligible = WORDS_BANK.filter((w) => w.level <= Math.max(4, profile.currentLevel));
    return eligible[(round * 6 + Math.floor(Math.random() * eligible.length)) % eligible.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const speakPrompt = () => {
    speakWord(target.word, Math.max(0.75, profile.speechRate - 0.05));
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setAnswer('');
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) speakPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);

    const res = checkAnswer(target.word, answer);
    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} O robô adorou: ${target.word}!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({
        ok: false,
        msg: nextAttempts >= 2 ? `${res.feedbackMessage} Dica: ${target.hint}.` : res.feedbackMessage,
      });
    }

    await onRecord({
      gameId: 'dictation-robot',
      level: target.level,
      skillId: `dictation:${target.word}`,
      skillLabel: `Ditado: ${target.word}`,
      skillCategory: 'orthography',
      prompt: `Ditado da palavra ${target.word}`,
      expectedAnswer: target.word,
      userAnswer: answer.trim().toUpperCase(),
      isCorrect: res.isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
      detectedConfusion: res.detectedConfusion,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#FDF2F8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '3rem' }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>Robô Bip-Bop diz:</div>
            <div style={{ color: 'var(--text-muted)' }}>Escute a palavra e escreva com calma!</div>
          </div>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={speakPrompt}>
          <Volume2 size={22} /> Ouvir palavra
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-lg"
          style={{ flex: 1, minWidth: 200, textTransform: 'uppercase' }}
          placeholder="Escreva o que o robô falou..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={Boolean(feedback?.ok)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-success btn-lg" disabled={!answer.trim() || Boolean(feedback?.ok)}>
          <Check size={20} /> Conferir
        </button>
      </form>

      <div>
        <button type="button" className="btn btn-outline" onClick={() => setShowCanvas((v) => !v)}>
          ✏️ {showCanvas ? 'Esconder lousa' : 'Usar lousa de traçado'}
        </button>
      </div>
      {showCanvas && (
        <HandwritingCanvas
          guideText={feedback?.ok ? target.word : undefined}
          onRecognizedText={(text) => {
            if (!feedback?.ok) setAnswer(text);
          }}
          recognizeButtonLabel="Ler lousa e preencher"
        />
      )}

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>
            {feedback.ok ? `${target.emoji} ` : ''}
            {feedback.msg}
          </div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próxima palavra <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// JOGO 8 — CONSTRUTOR DE FRASES
export const SentenceBuilderGame: React.FC<Props> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [chosenIndices, setChosenIndices] = useState<number[]>([]);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { sentence, shuffledWords } = useMemo(() => {
    const item = SENTENCES_BANK[round % SENTENCES_BANK.length];
    return {
      sentence: item,
      shuffledWords: shuffle(item.words),
    };
  }, [round]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setChosenIndices([]);
    setFeedback(null);
    setAttemptsTaken(0);
  }, [round]);

  const builtSentence = chosenIndices.map((i) => shuffledWords[i]).join(' ');

  const toggleWord = (idx: number) => {
    if (feedback?.ok) return;
    playTapSound(profile.soundEnabled);
    setChosenIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleCheck = async () => {
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    const res = checkAnswer(sentence.text, builtSentence);

    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakSentence(sentence.text, { rate: profile.speechRate });
      setFeedback({ ok: true, msg: `${res.feedbackMessage} "${sentence.text}"` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: res.feedbackMessage });
    }

    await onRecord({
      gameId: 'sentence-builder',
      level: sentence.level,
      skillId: `sentence:${sentence.id}`,
      skillLabel: 'Construção de frase',
      skillCategory: 'sentence',
      prompt: `Montar frase: ${sentence.text}`,
      expectedAnswer: sentence.text,
      userAnswer: builtSentence,
      isCorrect: res.isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '2.5rem' }}>{sentence.emoji}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>Organize as palavras na ordem certa</div>
            <div style={{ color: 'var(--text-muted)' }}>Dica: frases começam com letra maiúscula e terminam com ponto!</div>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => speakSentence(sentence.text, { rate: profile.speechRate })}>
          <Volume2 size={18} /> Ouvir frase
        </button>
      </div>

      <div
        style={{
          minHeight: 74,
          padding: 14,
          borderRadius: 16,
          background: 'var(--bg-sky-soft)',
          border: '2px dashed var(--sky)',
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {chosenIndices.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Toque nas palavras abaixo para montar a frase...</span>
        ) : (
          chosenIndices.map((idx) => (
            <button key={`built-${idx}`} type="button" className="tile-btn selected" style={{ fontSize: '1.15rem' }} onClick={() => toggleWord(idx)}>
              {shuffledWords[idx]}
            </button>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {shuffledWords.map((w, idx) => {
          const used = chosenIndices.includes(idx);
          return (
            <button
              key={`${w}-${idx}`}
              type="button"
              className="tile-btn"
              style={{ fontSize: '1.15rem', opacity: used ? 0.35 : 1 }}
              disabled={used || Boolean(feedback?.ok)}
              onClick={() => toggleWord(idx)}
            >
              {w}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button type="button" className="btn btn-outline" onClick={() => setChosenIndices([])} disabled={Boolean(feedback?.ok)}>
          <RotateCcw size={18} /> Recomeçar
        </button>
        <button type="button" className="btn btn-primary btn-lg" disabled={chosenIndices.length === 0 || Boolean(feedback?.ok)} onClick={handleCheck}>
          <Check size={20} /> Verificar frase
        </button>
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próxima frase <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// JOGO 10 — ESCUTA E ESCREVE (Palavras e frases)
export const ListenAndWriteGame: React.FC<Props> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const challenge = useMemo(() => {
    const isSentence = round % 2 === 1;
    if (isSentence) {
      const s = SENTENCES_BANK[Math.floor(round / 2) % SENTENCES_BANK.length];
      return { text: s.text.replace(/\.$/, ''), displayText: s.text, level: s.level, isSentence: true, emoji: s.emoji };
    }
    const w = WORDS_BANK[(round * 3) % WORDS_BANK.length];
    return { text: w.word, displayText: w.word, level: w.level, isSentence: false, emoji: w.emoji };
  }, [round]);

  const playAudio = () => {
    speakSentence(challenge.displayText, { rate: Math.max(0.75, profile.speechRate - 0.05) });
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setAnswer('');
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) playAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);

    const cleanedUser = answer.trim().replace(/\.$/, '');
    const res = checkAnswer(challenge.text, cleanedUser);

    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} Escreveu certinho: "${challenge.displayText}"!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: res.feedbackMessage });
    }

    await onRecord({
      gameId: 'listen-and-write',
      level: challenge.level,
      skillId: challenge.isSentence ? `listen-sentence:${round}` : `listen-word:${challenge.text}`,
      skillLabel: challenge.isSentence ? 'Escuta e escrita de frase' : `Escuta e escrita: ${challenge.text}`,
      skillCategory: challenge.isSentence ? 'sentence' : 'orthography',
      prompt: `Escrever o que ouviu: ${challenge.displayText}`,
      expectedAnswer: challenge.text,
      userAnswer: cleanedUser.toUpperCase(),
      isCorrect: res.isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
      detectedConfusion: res.detectedConfusion,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="pill pill-indigo">{challenge.isSentence ? 'Frase curta' : 'Palavra'}</span>
          <h3 style={{ margin: '8px 0 0' }}>Ouça com atenção e escreva o que escutou!</h3>
        </div>
        <button type="button" className="btn btn-secondary btn-lg" onClick={playAudio}>
          <Volume2 size={22} /> Ouvir áudio
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-lg"
          style={{ flex: 1, minWidth: 220 }}
          placeholder={challenge.isSentence ? 'Digite a frase aqui...' : 'Digite a palavra aqui...'}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={Boolean(feedback?.ok)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={!answer.trim() || Boolean(feedback?.ok)}>
          <Check size={20} /> Conferir
        </button>
      </form>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>
            {feedback.ok ? `${challenge.emoji} ` : ''}
            {feedback.msg}
          </div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próximo áudio <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
