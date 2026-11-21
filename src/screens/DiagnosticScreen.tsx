import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Sparkles, Volume2 } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { LUMI_PHRASES } from '../content/lumiPhrases';
import { DIAGNOSTIC_QUESTIONS } from '../content/worldsAndRewards';
import { checkAnswer, computeDiagnosticPlacement } from '../pedagogy/evaluation';
import { playGentleTryAgain, playSuccessChime } from '../services/soundEffects';
import { speak } from '../services/speechService';
import type { ChildProfile, LearningLevel } from '../types';
import type { GameAttemptPayload } from '../games/SoundAndLetterGames';

interface DiagnosticScreenProps {
  profile: ChildProfile;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
  onComplete: (recommendedLevel: LearningLevel, unlockedWorlds: LearningLevel[]) => Promise<void>;
  onSkip: () => Promise<void>;
}

export const DiagnosticScreen: React.FC<DiagnosticScreenProps> = ({
  profile,
  onRecordAttempt,
  onComplete,
  onSkip,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const [results, setResults] = useState<Array<{ level: LearningLevel; isCorrect: boolean }>>([]);
  const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<{
    recommendedLevel: LearningLevel;
    unlockedWorlds: LearningLevel[];
    summary: string;
  } | null>(null);

  const startRef = useRef(Date.now());
  const currentQ = DIAGNOSTIC_QUESTIONS[stepIdx];

  useEffect(() => {
    startRef.current = Date.now();
    setSelectedSyllables([]);
    setTypedAnswer('');
    setFeedback(null);
    if (currentQ && profile.soundEnabled) {
      speak(currentQ.spokenText, { rate: profile.speechRate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const submitStep = async (answer: string) => {
    if (!currentQ || feedback) return;
    const check = checkAnswer(currentQ.expectedAnswer, answer);
    const nextResults = [...results, { level: currentQ.level, isCorrect: check.isCorrect }];
    setResults(nextResults);

    if (check.isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback('Muito bem! Vamos para o próximo desafio!');
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback('Ótimo! A Lumi anotou isso para preparar brincadeiras sob medida para você.');
    }

    await onRecordAttempt({
      gameId: 'diagnostic' as never,
      level: currentQ.level,
      skillId: currentQ.skillId,
      skillLabel: `Exploração inicial (Nível ${currentQ.level})`,
      skillCategory: currentQ.skillCategory,
      prompt: currentQ.prompt,
      expectedAnswer: currentQ.expectedAnswer,
      userAnswer: answer,
      isCorrect: check.isCorrect,
      attemptsTaken: 1,
      responseMs: Date.now() - startRef.current,
      detectedConfusion: check.detectedConfusion,
    });

    // Adaptação: se errar 2 seguidas nos níveis iniciais, já define o ponto de partida sem cansar a criança
    const recentTwo = nextResults.slice(-2);
    const shouldStopEarly =
      nextResults.length >= 2 && recentTwo.every((r) => !r.isCorrect);

    window.setTimeout(() => {
      if (shouldStopEarly || stepIdx + 1 >= DIAGNOSTIC_QUESTIONS.length) {
        const placement = computeDiagnosticPlacement(nextResults);
        setFinishedSummary(placement);
      } else {
        setStepIdx((i) => i + 1);
      }
    }, 950);
  };

  if (finishedSummary) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <LumiMascot message={finishedSummary.summary} spokenText={LUMI_PHRASES.diagnosticDone} mood="celebrating" />
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: '3.5rem' }}>🎉</div>
          <h2 style={{ margin: '8px 0' }}>Tudo pronto, {profile.name}!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Começaremos no <strong>Nível {finishedSummary.recommendedLevel}</strong>, mas você pode explorar os mundos no seu próprio ritmo.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => onComplete(finishedSummary.recommendedLevel, finishedSummary.unlockedWorlds)}
          >
            <Sparkles size={20} /> Abrir o Mapa dos Mundos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span className="pill pill-indigo">
          Exploração Inicial • Passo {stepIdx + 1} de {DIAGNOSTIC_QUESTIONS.length}
        </span>
        <button type="button" className="btn btn-ghost" onClick={onSkip}>
          Pular e começar no Nível 1
        </button>
      </div>

      <LumiMascot message="Vamos brincar um pouquinho para eu conhecer o que você já sabe! Não é uma prova — é só diversão!" />

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
            {currentQ.emoji ? `${currentQ.emoji} ` : ''}
            {currentQ.prompt}
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => speak(currentQ.spokenText, { rate: profile.speechRate })}
          >
            <Volume2 size={18} /> Ouvir
          </button>
        </div>

        {currentQ.options && (
          <div className="grid-2">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="tile-btn"
                style={{ minHeight: 68 }}
                disabled={Boolean(feedback)}
                onClick={() => submitStep(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ.type === 'syllable-build' && currentQ.syllablePool && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 14, borderRadius: 14, background: 'var(--bg-indigo-soft)', textAlign: 'center', fontWeight: 900, fontSize: '1.5rem' }}>
              {selectedSyllables.join('') || '...'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {currentQ.syllablePool.map((syl, idx) => (
                <button
                  key={`${syl}-${idx}`}
                  type="button"
                  className="tile-btn"
                  disabled={Boolean(feedback)}
                  onClick={() => setSelectedSyllables((prev) => [...prev, syl])}
                >
                  {syl}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedSyllables([])}>
                Limpar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedSyllables.length === 0 || Boolean(feedback)}
                onClick={() => submitStep(selectedSyllables.join(''))}
              >
                Confirmar <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {currentQ.type === 'word-write' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedAnswer.trim()) submitStep(typedAnswer);
            }}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
          >
            <input
              type="text"
              className="input-lg"
              style={{ flex: 1, textTransform: 'uppercase' }}
              placeholder="Digite aqui..."
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              disabled={Boolean(feedback)}
            />
            <button type="submit" className="btn btn-primary btn-lg" disabled={!typedAnswer.trim() || Boolean(feedback)}>
              <Check size={20} /> Enviar
            </button>
          </form>
        )}

        {feedback && (
          <div className="feedback-banner feedback-positive">
            <span style={{ fontWeight: 700 }}>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
