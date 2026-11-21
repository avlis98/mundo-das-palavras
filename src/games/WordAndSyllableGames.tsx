import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RotateCcw, Volume2 } from 'lucide-react';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import { SIMPLE_SYLLABLES } from '../content/letters';
import { WORDS_BANK } from '../content/words';
import { checkAnswer, normalizeWithoutAccents } from '../pedagogy/evaluation';
import { playGentleTryAgain, playSuccessChime, playTapSound } from '../services/soundEffects';
import { speakSyllable, speakWord } from '../services/speechService';
import type { ChildProfile, WordItem } from '../types';
import type { GameAttemptPayload } from './SoundAndLetterGames';

interface WordGameProps {
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

// JOGO 2 — FÁBRICA DE PALAVRAS (Sílabas embaralhadas)
export const WordFactoryGame: React.FC<WordGameProps> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [chosenIndices, setChosenIndices] = useState<number[]>([]);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const { targetWord, pool } = useMemo(() => {
    const eligible = WORDS_BANK.filter((w) => w.level <= Math.max(4, profile.currentLevel));
    const word = eligible[(round * 3 + Math.floor(Math.random() * eligible.length)) % eligible.length];
    const extras = shuffle(
      SIMPLE_SYLLABLES.filter((s) => !word.syllables.includes(s))
    ).slice(0, 2);
    return {
      targetWord: word,
      pool: shuffle([...word.syllables, ...extras]),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setChosenIndices([]);
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) {
      speakWord(targetWord.word, profile.speechRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const assembled = chosenIndices.map((idx) => pool[idx]).join('');

  const toggleSyllable = (idx: number) => {
    if (feedback?.ok) return;
    playTapSound(profile.soundEnabled);
    speakSyllable(pool[idx], profile.speechRate);
    setChosenIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleCheck = async () => {
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    const res = checkAnswer(targetWord.word, assembled);

    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakWord(targetWord.word, profile.speechRate);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} Você montou ${targetWord.word}!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: res.feedbackMessage });
    }

    await onRecord({
      gameId: 'word-factory',
      level: targetWord.level,
      skillId: `syllable:${targetWord.syllables.join('-')}`,
      skillLabel: `Montar ${targetWord.word}`,
      skillCategory: 'syllable',
      prompt: `Organizar sílabas de ${targetWord.word}`,
      expectedAnswer: targetWord.word,
      userAnswer: assembled,
      isCorrect: res.isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
      detectedConfusion: res.detectedConfusion,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '3rem' }}>{targetWord.emoji}</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Monte a palavra:</div>
            <div style={{ color: 'var(--text-muted)' }}>{targetWord.hint}</div>
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => speakWord(targetWord.word, profile.speechRate)}>
          <Volume2 size={20} /> Ouvir palavra
        </button>
      </div>

      {/* Área da palavra montada */}
      <div
        style={{
          minHeight: 74,
          padding: 14,
          borderRadius: 18,
          background: 'var(--bg-indigo-soft)',
          border: '2px dashed var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        {chosenIndices.length === 0 ? (
          <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
            Toque nas sílabas abaixo na ordem certa...
          </span>
        ) : (
          chosenIndices.map((idx) => (
            <button
              key={`chosen-${idx}`}
              type="button"
              className="tile-btn selected"
              onClick={() => toggleSyllable(idx)}
            >
              {pool[idx]}
            </button>
          ))
        )}
      </div>

      {/* Banco de sílabas */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pool.map((syl, idx) => {
          const used = chosenIndices.includes(idx);
          return (
            <button
              key={`${syl}-${idx}`}
              type="button"
              className="tile-btn"
              disabled={used || Boolean(feedback?.ok)}
              onClick={() => toggleSyllable(idx)}
              style={{ opacity: used ? 0.35 : 1 }}
            >
              {syl}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-outline" onClick={() => setChosenIndices([])} disabled={Boolean(feedback?.ok)}>
          <RotateCcw size={18} /> Limpar
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          disabled={chosenIndices.length === 0 || Boolean(feedback?.ok)}
          onClick={handleCheck}
        >
          <Check size={20} /> Verificar
        </button>
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
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

// JOGO 5 — PALAVRA MISTERIOSA (Imagem + Dica -> Escrever palavra)
export const MysteryWordGame: React.FC<WordGameProps> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState('');
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const targetWord: WordItem = useMemo(() => {
    const eligible = WORDS_BANK.filter((w) => w.level <= Math.max(4, profile.currentLevel));
    return eligible[(round * 7 + Math.floor(Math.random() * eligible.length)) % eligible.length];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setAnswer('');
    setFeedback(null);
    setAttemptsTaken(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback?.ok) return;

    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    const res = checkAnswer(targetWord.word, answer);

    if (res.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakWord(targetWord.word, profile.speechRate);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} A palavra misteriosa era ${targetWord.word}!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      const hintFirst =
        nextAttempts >= 2
          ? ` Dica extra: começa com "${targetWord.word[0]}" e tem ${targetWord.word.length} letras.`
          : '';
      setFeedback({ ok: false, msg: `${res.feedbackMessage}${hintFirst}` });
    }

    await onRecord({
      gameId: 'mystery-word',
      level: targetWord.level,
      skillId: `word:${targetWord.word}`,
      skillLabel: `Escrita de ${targetWord.word}`,
      skillCategory: 'word',
      prompt: `Palavra misteriosa: ${targetWord.hint}`,
      expectedAnswer: targetWord.word,
      userAnswer: answer.trim().toUpperCase(),
      isCorrect: res.isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
      detectedConfusion: res.detectedConfusion,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ textAlign: 'center', background: 'var(--bg-amber-soft)', borderColor: '#FCD34D' }}>
        <div style={{ fontSize: '4rem', lineHeight: 1.1 }}>{targetWord.emoji}</div>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', marginTop: 8 }}>{targetWord.hint}</div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {Array.from(targetWord.word).map((_, i) => (
            <span
              key={i}
              style={{
                width: 28,
                height: 34,
                borderBottom: '3px solid var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
              }}
            >
              {answer[i]?.toUpperCase() ?? ''}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-lg"
          style={{ flex: 1, minWidth: 200, textTransform: 'uppercase' }}
          placeholder="Digite a palavra aqui..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={Boolean(feedback?.ok)}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary btn-lg" disabled={!answer.trim() || Boolean(feedback?.ok)}>
          <Check size={20} /> Responder
        </button>
      </form>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-outline" onClick={() => speakWord(targetWord.word, profile.speechRate)}>
          <Volume2 size={18} /> Preciso de ajuda (ouvir palavra)
        </button>
        <button type="button" className="btn btn-outline" onClick={() => setShowCanvas((v) => !v)}>
          ✏️ {showCanvas ? 'Esconder rascunho' : 'Treinar escrita com o dedo'}
        </button>
      </div>

      {showCanvas && (
        <HandwritingCanvas
          guideText={feedback?.ok ? targetWord.word : undefined}
          onRecognizedText={(text) => {
            if (!feedback?.ok) setAnswer(text);
          }}
          recognizeButtonLabel="Ler lousa e preencher"
        />
      )}

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
              Próximo mistério <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// JOGO 7 — PALAVRA INCOMPLETA (Letras ou dígrafos faltantes)
export const IncompleteWordGame: React.FC<WordGameProps> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const puzzle = useMemo(() => {
    const eligible = WORDS_BANK.filter((w) => w.level <= Math.max(4, profile.currentLevel));
    const item = eligible[(round * 4 + Math.floor(Math.random() * eligible.length)) % eligible.length];

    // Detecta dígrafo ou letra-chave para esconder
    const digraphs = ['CH', 'LH', 'NH', 'RR', 'SS', 'QU', 'GU'];
    let missing = '';
    for (const d of digraphs) {
      if (item.word.includes(d)) {
        missing = d;
        break;
      }
    }
    if (!missing) {
      // Escolhe consoante interna ou inicial
      const idx = item.word.length > 3 ? 2 : 0;
      missing = item.word[idx];
    }

    const masked = item.word.replace(missing, '___');
    const distractorMap: Record<string, string[]> = {
      CH: ['X', 'LH', 'NH'],
      LH: ['LI', 'NH', 'CH'],
      NH: ['NI', 'LH', 'M'],
      RR: ['R', 'SS', 'L'],
      SS: ['S', 'Ç', 'Z'],
      QU: ['C', 'GU', 'K'],
      GU: ['G', 'QU', 'J'],
      M: ['N', 'B', 'P'],
      N: ['M', 'L', 'R'],
    };

    const rawDistractors = distractorMap[normalizeWithoutAccents(missing)] ?? ['B', 'M', 'S', 'T', 'L'];
    const opts = shuffle([missing, ...rawDistractors.filter((d) => d !== missing).slice(0, 3)]);

    return { item, missing, masked, options: opts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedOpt(null);
    setFeedback(null);
    setAttemptsTaken(0);
    if (profile.soundEnabled) {
      speakWord(puzzle.item.word, profile.speechRate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const handleChoose = async (opt: string) => {
    if (feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    setSelectedOpt(opt);

    const isCorrect = opt === puzzle.missing;
    const res = checkAnswer(puzzle.missing, opt);

    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakWord(puzzle.item.word, profile.speechRate);
      setFeedback({ ok: true, msg: `${res.feedbackMessage} A palavra completa é ${puzzle.item.word}!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: res.feedbackMessage });
    }

    const primaryPattern = puzzle.item.patterns[0] ?? 'CV';
    await onRecord({
      gameId: 'incomplete-word',
      level: puzzle.item.level,
      skillId: `pattern:${primaryPattern}`,
      skillLabel: `Padrão ${primaryPattern} (${puzzle.item.word})`,
      skillCategory: 'orthography',
      prompt: `Completar ${puzzle.masked}`,
      expectedAnswer: puzzle.missing,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
      detectedConfusion: res.detectedConfusion,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span className="pill pill-amber">Complete o pedacinho que falta</span>
        <button type="button" className="btn btn-secondary" onClick={() => speakWord(puzzle.item.word, profile.speechRate)}>
          <Volume2 size={18} /> Ouvir palavra
        </button>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: '3.5rem' }}>{puzzle.item.emoji}</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: 4, marginTop: 8 }}>
          {feedback?.ok ? puzzle.item.word : puzzle.masked}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {puzzle.options.map((opt) => {
          const isSel = selectedOpt === opt;
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
              style={{ minWidth: 86, minHeight: 68 }}
              onClick={() => handleChoose(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
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
