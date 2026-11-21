import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Mic, Volume2 } from 'lucide-react';
import { STORIES_BANK } from '../content/stories';
import { WORDS_BANK } from '../content/words';
import { getPositiveMessage } from '../pedagogy/evaluation';
import { isSpeechRecognitionSupported, listenForSpeech } from '../services/recognitionService';
import { playGentleTryAgain, playSuccessChime } from '../services/soundEffects';
import { speakSentence, speakWord, stopSpeaking } from '../services/speechService';
import type { ChildProfile } from '../types';
import type { GameAttemptPayload } from './SoundAndLetterGames';

interface Props {
  profile: ChildProfile;
  onRecord: (payload: GameAttemptPayload) => Promise<void>;
}

// JOGO 4 — DETETIVE DAS HISTÓRIAS
export const StoryDetectiveGame: React.FC<Props> = ({ profile, onRecord }) => {
  const [storyIdx, setStoryIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [attemptsTaken, setAttemptsTaken] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const story = STORIES_BANK[storyIdx % STORIES_BANK.length];
  const question = story.questions[qIdx % story.questions.length];

  const shuffledOptions = useMemo(() => {
    const copy = [...question.options];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [question]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedOpt(null);
    setFeedback(null);
    setAttemptsTaken(0);
    return () => stopSpeaking();
  }, [storyIdx, qIdx]);

  const readStoryAloud = () => {
    let idx = 0;
    const readNext = () => {
      if (idx >= story.sentences.length) {
        setActiveSentenceIdx(null);
        return;
      }
      setActiveSentenceIdx(idx);
      const currentText = story.sentences[idx];
      idx += 1;
      speakSentence(currentText, {
        rate: profile.speechRate,
        onEnd: readNext,
      });
    };
    readNext();
  };

  const handleChoose = async (opt: string) => {
    if (feedback?.ok) return;
    const nextAttempts = attemptsTaken + 1;
    setAttemptsTaken(nextAttempts);
    setSelectedOpt(opt);
    const isCorrect = opt === question.correctOption;

    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({ ok: true, msg: `${getPositiveMessage()} Você desvendou esta pista da história!` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: 'Quase lá! Que tal reler ou ouvir a história novamente?' });
    }

    await onRecord({
      gameId: 'story-detective',
      level: story.level,
      skillId: `story:${story.id}`,
      skillLabel: `Compreensão: ${story.title}`,
      skillCategory: 'story',
      prompt: question.question,
      expectedAnswer: question.correctOption,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: nextAttempts,
      responseMs: Date.now() - startTimeRef.current,
    });
  };

  const nextStep = () => {
    if (qIdx + 1 < story.questions.length) {
      setQIdx((q) => q + 1);
    } else {
      setQIdx(0);
      setStoryIdx((s) => s + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '2.4rem' }}>{story.emoji}</span>
            <div>
              <h3 style={{ margin: 0 }}>{story.title}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{story.theme}</span>
            </div>
          </div>
          <button type="button" className="btn btn-secondary" onClick={readStoryAloud}>
            <Volume2 size={18} /> Ouvir história
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '1.15rem', lineHeight: 1.65 }}>
          {story.sentences.map((s, idx) => (
            <p
              key={idx}
              onClick={() => speakSentence(s, { rate: profile.speechRate })}
              style={{
                margin: 0,
                padding: '6px 10px',
                borderRadius: 10,
                cursor: 'pointer',
                background: activeSentenceIdx === idx ? '#FDE68A' : 'transparent',
                fontWeight: activeSentenceIdx === idx ? 700 : 500,
              }}
              title="Toque para ouvir esta frase"
            >
              {s}
            </p>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>
          🔎 Pergunta {qIdx + 1} de {story.questions.length}: {question.question}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shuffledOptions.map((opt) => {
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
                style={{ justifyContent: 'flex-start', fontSize: '1.05rem', padding: '12px 18px' }}
                onClick={() => handleChoose(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {feedback && (
        <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
          <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
          {feedback.ok && (
            <button type="button" className="btn btn-primary" onClick={nextStep}>
              {qIdx + 1 < story.questions.length ? 'Próxima pergunta' : 'Próxima história'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// JOGO 9 — LEITURA EM AVENTURA (Fluência sem pressão ou punição)
export const TimedReadingGame: React.FC<Props> = ({ profile, onRecord }) => {
  const [round, setRound] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [listening, setListening] = useState(false);
  const [speechNote, setSpeechNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  const word = useMemo(() => {
    const eligible = WORDS_BANK.filter((w) => w.level <= Math.max(4, profile.currentLevel));
    return eligible[(round * 5) % eligible.length];
  }, [round, profile.currentLevel]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setElapsedSec(0);
    setDone(false);
    setSpeechNote(null);
    const id = window.setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [round]);

  const markRead = async (method: string) => {
    if (done) return;
    setDone(true);
    playSuccessChime(profile.soundEnabled);
    await onRecord({
      gameId: 'timed-reading',
      level: word.level,
      skillId: `fluency:${word.word}`,
      skillLabel: `Fluência: ${word.word}`,
      skillCategory: 'word',
      prompt: `Leitura da palavra ${word.word}`,
      expectedAnswer: word.word,
      userAnswer: method,
      isCorrect: true,
      attemptsTaken: 1,
      responseMs: Date.now() - startTimeRef.current,
    });
  };

  const handleMicRead = async () => {
    setListening(true);
    setSpeechNote('Estou ouvindo você ler...');
    const res = await listenForSpeech(word.word);
    setListening(false);

    if (res.status === 'matched') {
      setSpeechNote(`Que leitura bonita! Ouvi "${res.transcript}".`);
      await markRead(word.word);
    } else if (res.status === 'unsupported') {
      setSpeechNote('Seu navegador não tem microfone ativo aqui. Leia em voz alta e toque em "Já li!"');
    } else {
      // Nunca classifica automaticamente como erro!
      setSpeechNote('Não consegui ouvir com clareza — sem problema! Você pode tentar falar de novo ou clicar em "Já li!".');
    }
  };

  const asrAvailable = profile.voiceRecognitionEnabled && isSpeechRecognitionSupported();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span className="pill pill-green">Prática leve de fluência • Sem pressão!</span>
        <span className="pill pill-indigo">⏱️ Tempo nesta palavra: {elapsedSec}s</span>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 28, background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <div style={{ fontSize: '3.2rem' }}>{word.emoji}</div>
        <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: 3, marginTop: 8 }}>{word.word}</div>
        <div style={{ color: 'var(--text-muted)', marginTop: 6, fontWeight: 700 }}>
          Sílabas: {word.syllables.join(' • ')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-outline" onClick={() => speakWord(word.word, profile.speechRate)}>
          <Volume2 size={18} /> Ouvir exemplo
        </button>

        {asrAvailable && !done && (
          <button type="button" className="btn btn-secondary" onClick={handleMicRead} disabled={listening}>
            <Mic size={18} /> {listening ? 'Ouvindo...' : 'Ler no microfone'}
          </button>
        )}

        {!done && (
          <button type="button" className="btn btn-success btn-lg" onClick={() => markRead(word.word)}>
            <CheckCircle2 size={20} /> Já li!
          </button>
        )}
      </div>

      {speechNote && (
        <div className="feedback-banner feedback-encourage">
          <div style={{ fontWeight: 700 }}>{speechNote}</div>
        </div>
      )}

      {done && (
        <div className="feedback-banner feedback-positive">
          <div style={{ fontWeight: 700 }}>Muito bem! Cada leitura deixa seus olhos e sua voz mais rápidos!</div>
          <button type="button" className="btn btn-primary" onClick={() => setRound((r) => r + 1)}>
            Próxima palavra <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
