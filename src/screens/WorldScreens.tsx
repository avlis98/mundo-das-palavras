import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Gamepad2, Volume2 } from 'lucide-react';
import { HandwritingCanvas } from '../components/HandwritingCanvas';
import { LumiMascot } from '../components/LumiMascot';
import {
  INTONATION_LAB,
  INTONATION_LAB_EXPLANATION,
  ORTHOGRAPHY_EXERCISES,
  PUNCTUATION_EXERCISES,
  PUNCTUATION_GUIDE,
  READING_CLUB_TEXTS,
} from '../content/advancedWorlds';
import { ALPHABET } from '../content/letters';
import { SENTENCES_BANK } from '../content/sentences';
import { STORIES_BANK } from '../content/stories';
import { WORDS_BANK } from '../content/words';
import { WORLDS } from '../content/worldsAndRewards';
import { playGentleTryAgain, playSuccessChime, playTapSound } from '../services/soundEffects';
import { speakLetterSound, speakSentence, speakSyllable, speakWord } from '../services/speechService';
import type { ChildProfile, GameId, LearningLevel } from '../types';
import type { GameAttemptPayload } from '../games/SoundAndLetterGames';

function shuffleOptions<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface WorldScreensProps {
  level: LearningLevel;
  profile: ChildProfile;
  onBack: () => void;
  onLaunchGame: (gameId: GameId) => void;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
}

export const WorldScreens: React.FC<WorldScreensProps> = ({
  level,
  profile,
  onBack,
  onLaunchGame,
  onRecordAttempt,
}) => {
  const world = WORLDS.find((w) => w.level === level)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Mapa dos Mundos
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '2rem' }}>{world.emoji}</span>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: world.color }}>{world.subtitle}</div>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>{world.title}</h2>
          </div>
        </div>
      </div>

      <LumiMascot message={world.goal} speechRate={profile.speechRate} />

      {level === 1 && <World1Letters profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 2 && <World2Sounds profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 3 && <World3Syllables profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 4 && <World4Words profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 5 && <World5Sentences profile={profile} onLaunchGame={onLaunchGame} onRecordAttempt={onRecordAttempt} />}
      {level === 6 && <World6Stories profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 7 && <World7Writing profile={profile} onLaunchGame={onLaunchGame} />}
      {level === 8 && <World8Orthography profile={profile} onRecordAttempt={onRecordAttempt} />}
      {level === 9 && <World9Punctuation profile={profile} onRecordAttempt={onRecordAttempt} />}
      {level === 10 && <World10ReadingClub profile={profile} onRecordAttempt={onRecordAttempt} />}
    </div>
  );
};

// NÍVEL 1 — MUNDO DAS LETRAS
const World1Letters: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const [filter, setFilter] = useState<'all' | 'vowels' | 'consonants'>('all');
  const [selected, setSelected] = useState(ALPHABET[0]);

  const list = ALPHABET.filter((item) => {
    if (filter === 'vowels') return item.isVowel;
    if (filter === 'consonants') return !item.isVowel;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>
            Todas (26)
          </button>
          <button type="button" className={`btn ${filter === 'vowels' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('vowels')}>
            Vogais (5)
          </button>
          <button type="button" className={`btn ${filter === 'consonants' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('consonants')}>
            Consoantes (21)
          </button>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('sound-hunter')}>
          <Gamepad2 size={18} /> Jogar Caçadora de Sons
        </button>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, background: 'var(--bg-indigo-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>
            {selected.letter} {selected.lowercase}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>
              {selected.isVowel ? 'Vogal' : 'Consoante'} • Som: {selected.phonemeDisplay}
            </div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
              {selected.anchorEmoji} {selected.anchorWord} • Nome da letra: "{selected.name}"
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => speakLetterSound(selected.phonemeHint, selected.anchorWord, profile.speechRate)}
        >
          <Volume2 size={20} /> Ouvir som da letra
        </button>
      </div>

      <div className="grid-letters">
        {list.map((item) => (
          <button
            key={item.letter}
            type="button"
            className={`tile-btn ${selected.letter === item.letter ? 'selected' : ''}`}
            onClick={() => {
              setSelected(item);
              playTapSound(profile.soundEnabled);
              speakLetterSound(item.phonemeHint, item.anchorWord, profile.speechRate);
            }}
          >
            {item.letter}
          </button>
        ))}
      </div>
    </div>
  );
};

// NÍVEL 2 — MUNDO DOS SONS
const World2Sounds: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const [page, setPage] = useState(0);
  const allWords = WORDS_BANK.filter((w) => w.level <= 4);
  const pageSize = 9;
  const totalPages = Math.ceil(allWords.length / pageSize);
  const sampleWords = allWords.slice(page * pageSize, page * pageSize + pageSize);
  const [activeWord, setActiveWord] = useState(allWords[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Estúdio de Sons e Sílabas ({allWords.length} palavras)</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPage((p) => (p + 1) % totalPages)}
            >
              Trocar palavras ({page + 1}/{totalPages})
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('initial-sound')}>
              <Gamepad2 size={18} /> Jogar Som Inicial
            </button>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
          Toque em uma palavra para ouvir e contar quantos pedacinhos sonoros ela tem:
        </p>

        <div className="grid-3">
          {sampleWords.map((w) => (
            <button
              key={w.id}
              type="button"
              className={`tile-btn ${activeWord.id === w.id ? 'selected' : ''}`}
              style={{ flexDirection: 'column', padding: 12, fontSize: '1.1rem' }}
              onClick={() => {
                setActiveWord(w);
                speakWord(w.word, profile.speechRate);
              }}
            >
              <span style={{ fontSize: '2rem' }}>{w.emoji}</span>
              <span>{w.word}</span>
            </button>
          ))}
        </div>

        <div className="card" style={{ marginTop: 16, background: 'var(--bg-sky-soft)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {activeWord.emoji} {activeWord.word} tem {activeWord.syllables.length} pedacinho(s):
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            {activeWord.syllables.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="tile-btn"
                onClick={() => speakSyllable(s, profile.speechRate)}
              >
                👏 {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// NÍVEL 3 — FÁBRICA DE SÍLABAS
const World3Syllables: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const consonants = ['B', 'C', 'D', 'F', 'G', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V'];
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const [cons, setCons] = useState('B');
  const [vow, setVow] = useState('A');

  const formed = `${cons}${vow}`;

  const combine = (c: string, v: string) => {
    setCons(c);
    setVow(v);
    playTapSound(profile.soundEnabled);
    speakSyllable(`${c}${v}`, profile.speechRate);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>Máquina de Juntar Sons</h3>
          <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('word-factory')}>
            <Gamepad2 size={18} /> Jogar Fábrica de Palavras
          </button>
        </div>

        <div className="card" style={{ background: 'var(--bg-green-soft)', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>
            {cons} + {vow} = <span style={{ color: '#047857', fontSize: '2.6rem' }}>{formed}</span>
          </div>
          <button
            type="button"
            className="btn btn-success"
            style={{ marginTop: 10 }}
            onClick={() => speakSyllable(formed, profile.speechRate)}
          >
            <Volume2 size={18} /> Ouvir sílaba {formed}
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>1. Escolha uma consoante:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {consonants.map((c) => (
              <button
                key={c}
                type="button"
                className={`tile-btn ${cons === c ? 'selected' : ''}`}
                onClick={() => combine(c, vow)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>2. Junte com uma vogal:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {vowels.map((v) => (
              <button
                key={v}
                type="button"
                className={`tile-btn ${vow === v ? 'selected' : ''}`}
                onClick={() => combine(cons, v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// NÍVEL 4 — CONSTRUINDO PALAVRAS
const World4Words: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const patterns = ['CV', 'CH', 'LH', 'NH', 'RR', 'SS', 'QU', 'GU'];
  const [pattern, setPattern] = useState('CV');
  const filtered = WORDS_BANK.filter((w) => w.patterns.includes(pattern));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Desafios Ortográficos Passo a Passo</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('incomplete-word')}>
              <Gamepad2 size={18} /> Palavra Incompleta
            </button>
            <button type="button" className="btn btn-primary" onClick={() => onLaunchGame('mystery-word')}>
              <Gamepad2 size={18} /> Palavra Misteriosa
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {patterns.map((p) => (
            <button
              key={p}
              type="button"
              className={`btn ${pattern === p ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPattern(p)}
            >
              {p === 'CV' ? 'Simples' : p}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {filtered.map((w) => (
            <button
              key={w.id}
              type="button"
              className="card card-interactive"
              style={{ textAlign: 'center' }}
              onClick={() => speakWord(w.word, profile.speechRate)}
            >
              <div style={{ fontSize: '2.4rem' }}>{w.emoji}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, marginTop: 4 }}>{w.word}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {w.syllables.join(' • ')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// NÍVEL 5 — LEITURA DE FRASES
const World5Sentences: React.FC<{
  profile: ChildProfile;
  onLaunchGame: (g: GameId) => void;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
}> = ({ profile, onLaunchGame, onRecordAttempt }) => {
  const [idx, setIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const sentence = SENTENCES_BANK[idx % SENTENCES_BANK.length];
  const shuffledSentenceOpts = useMemo(() => shuffleOptions(sentence.options), [sentence]);

  const handleAnswer = async (opt: string) => {
    setSelectedOpt(opt);
    const isCorrect = opt === sentence.correctOption;
    if (isCorrect) {
      setOk(true);
      playSuccessChime(profile.soundEnabled);
    }
    await onRecordAttempt({
      gameId: 'world-activity' as never,
      level: 5,
      skillId: `sentence:${sentence.id}`,
      skillLabel: 'Leitura de frase',
      skillCategory: 'sentence',
      prompt: sentence.question,
      expectedAnswer: sentence.correctOption,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: 1,
      responseMs: 3000,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span className="pill pill-indigo">Frase {idx + 1} de {SENTENCES_BANK.length}</span>
          <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('sentence-builder')}>
            <Gamepad2 size={18} /> Construtor de Frases
          </button>
        </div>

        <div style={{ textAlign: 'center', margin: '18px 0' }}>
          <div style={{ fontSize: '3rem' }}>{sentence.emoji}</div>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '8px 0' }}>{sentence.text}</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => speakSentence(sentence.text, { rate: profile.speechRate })}
          >
            <Volume2 size={18} /> Ouvir frase
          </button>
        </div>

        <div style={{ borderTop: '2px solid var(--border-soft)', paddingTop: 14 }}>
          <h4 style={{ margin: '0 0 10px' }}>{sentence.question}</h4>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {shuffledSentenceOpts.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`tile-btn ${
                  selectedOpt === opt ? (opt === sentence.correctOption ? 'correct' : 'try-again') : ''
                }`}
                style={{ fontSize: '1.05rem' }}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          {ok && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: 14 }}
              onClick={() => {
                setIdx((i) => i + 1);
                setSelectedOpt(null);
                setOk(false);
              }}
            >
              Próxima frase
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// NÍVEL 6 — BIBLIOTECA DE HISTÓRIAS
const World6Stories: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const [selectedStory, setSelectedStory] = useState(STORIES_BANK[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ margin: 0 }}>Biblioteca de Histórias Originais</h3>
        <button type="button" className="btn btn-secondary" onClick={() => onLaunchGame('story-detective')}>
          <Gamepad2 size={18} /> Jogar Detetive das Histórias
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {STORIES_BANK.map((st) => (
          <button
            key={st.id}
            type="button"
            className={`btn ${selectedStory.id === st.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedStory(st)}
          >
            {st.emoji} {st.title}
          </button>
        ))}
      </div>

      <div className="card" style={{ background: '#F5F3FF', borderColor: '#DDD6FE' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>{selectedStory.emoji} {selectedStory.title}</h3>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{selectedStory.theme}</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => speakSentence(selectedStory.sentences.join(' '), { rate: profile.speechRate })}
          >
            <Volume2 size={18} /> Ouvir história inteira
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '1.15rem', lineHeight: 1.7 }}>
          {selectedStory.sentences.map((s, idx) => (
            <p
              key={idx}
              onClick={() => speakSentence(s, { rate: profile.speechRate })}
              style={{ margin: 0, cursor: 'pointer' }}
            >
              {s}
            </p>
          ))}
        </div>

        <div className="card" style={{ marginTop: 16, background: '#FFFFFF' }}>
          <strong>💭 Para conversar depois da leitura:</strong>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{selectedStory.interpretationPrompt}</p>
        </div>
      </div>
    </div>
  );
};

// NÍVEL 7 — ESCRITA E ORTOGRAFIA
const World7Writing: React.FC<{ profile: ChildProfile; onLaunchGame: (g: GameId) => void }> = ({
  profile,
  onLaunchGame,
}) => {
  const [storyDraft, setStoryDraft] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-2">
        <button type="button" className="card card-interactive" style={{ textAlign: 'left' }} onClick={() => onLaunchGame('dictation-robot')}>
          <div style={{ fontSize: '2.2rem' }}>🤖</div>
          <h3 style={{ margin: '6px 0 4px' }}>Robô do Ditado</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Pratique escrever palavras com ortografia correta.</p>
        </button>

        <button type="button" className="card card-interactive" style={{ textAlign: 'left' }} onClick={() => onLaunchGame('listen-and-write')}>
          <div style={{ fontSize: '2.2rem' }}>✍️</div>
          <h3 style={{ margin: '6px 0 4px' }}>Escuta e Escreve</h3>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Ouça frases e palavras e treine sua escrita.</p>
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0 }}>📝 Crie sua própria minihistória!</h3>
        <textarea
          rows={4}
          className="input-lg"
          style={{ fontSize: '1.05rem', resize: 'vertical' }}
          placeholder="Era uma vez um..."
          value={storyDraft}
          onChange={(e) => setStoryDraft(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!storyDraft.trim()}
            onClick={() => speakSentence(storyDraft, { rate: profile.speechRate })}
          >
            <Volume2 size={18} /> Ouvir minha história
          </button>
        </div>
        <HandwritingCanvas
          onRecognizedText={(text) =>
            setStoryDraft((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
          }
          recognizeButtonLabel="Ler lousa e adicionar ao texto"
        />
      </div>
    </div>
  );
};

// NÍVEL 8 — OFICINA DE ORTOGRAFIA (M ANTES DE P E B, R/RR, S/SS, Ç)
const World8Orthography: React.FC<{
  profile: ChildProfile;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
}> = ({ profile, onRecordAttempt }) => {
  const [ruleFilter, setRuleFilter] = useState<'ALL' | 'M_PB' | 'R_RR' | 'S_SS_Z' | 'C_CC'>('ALL');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const filtered =
    ruleFilter === 'ALL'
      ? ORTHOGRAPHY_EXERCISES
      : ORTHOGRAPHY_EXERCISES.filter((e) => e.rule === ruleFilter);

  const ex = filtered[idx % filtered.length];
  const options = useMemo(() => shuffleOptions(ex.options), [ex]);

  const changeFilter = (next: 'ALL' | 'M_PB' | 'R_RR' | 'S_SS_Z' | 'C_CC') => {
    setRuleFilter(next);
    setIdx(0);
    setSelected(null);
    setFeedback(null);
  };

  const handleChoose = async (opt: string) => {
    if (feedback?.ok) return;
    setSelected(opt);
    const isCorrect = opt === ex.correctOption;
    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakWord(ex.fullWord, profile.speechRate);
      setFeedback({ ok: true, msg: `Perfeito! ${ex.explanation}` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: `Quase lá! Dica: ${ex.ruleTip}` });
    }

    await onRecordAttempt({
      gameId: 'world-activity' as never,
      level: 8,
      skillId: `ortho-rule:${ex.rule}`,
      skillLabel: ex.ruleTitle,
      skillCategory: 'orthography',
      prompt: `Completar ${ex.maskedWord}`,
      expectedAnswer: ex.correctOption,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: 1,
      responseMs: 2500,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className={`btn ${ruleFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`} onClick={() => changeFilter('ALL')}>
          Todas ({ORTHOGRAPHY_EXERCISES.length})
        </button>
        <button type="button" className={`btn ${ruleFilter === 'M_PB' ? 'btn-primary' : 'btn-outline'}`} onClick={() => changeFilter('M_PB')}>
          M antes de P e B
        </button>
        <button type="button" className={`btn ${ruleFilter === 'R_RR' ? 'btn-primary' : 'btn-outline'}`} onClick={() => changeFilter('R_RR')}>
          R ou RR
        </button>
        <button type="button" className={`btn ${ruleFilter === 'S_SS_Z' ? 'btn-primary' : 'btn-outline'}`} onClick={() => changeFilter('S_SS_Z')}>
          S, SS ou Z
        </button>
        <button type="button" className={`btn ${ruleFilter === 'C_CC' ? 'btn-primary' : 'btn-outline'}`} onClick={() => changeFilter('C_CC')}>
          C ou Ç
        </button>
      </div>

      <div className="card" style={{ background: '#F0FDFA', borderColor: '#5EEAD4' }}>
        <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0F766E' }}>
          🛡️ {ex.ruleTitle}
        </div>
        <p style={{ margin: '6px 0 0', fontWeight: 700, color: '#1E1B4B' }}>{ex.ruleTip}</p>
      </div>

      <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span className="pill pill-indigo">Desafio {(idx % filtered.length) + 1} de {filtered.length}</span>
          <button type="button" className="btn btn-secondary" onClick={() => speakWord(ex.fullWord, profile.speechRate)}>
            <Volume2 size={18} /> Ouvir palavra
          </button>
        </div>

        <div style={{ fontSize: '3.5rem' }}>{ex.emoji}</div>
        <div style={{ fontSize: '2.3rem', fontWeight: 900, letterSpacing: 4 }}>
          {feedback?.ok ? ex.fullWord : ex.maskedWord}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`tile-btn ${
                selected === opt ? (feedback?.ok ? 'correct' : 'try-again') : ''
              }`}
              style={{ minWidth: 90, minHeight: 70 }}
              onClick={() => handleChoose(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
            <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
            {feedback.ok && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIdx((i) => i + 1);
                  setSelected(null);
                  setFeedback(null);
                }}
              >
                Próximo desafio <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// NÍVEL 9 — ILHA DA PONTUAÇÃO (GUIA PRÁTICO + LABORATÓRIO DE ENTONAÇÃO + DESAFIO)
const World9Punctuation: React.FC<{
  profile: ChildProfile;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
}> = ({ profile, onRecordAttempt }) => {
  const [tab, setTab] = useState<'guide' | 'lab' | 'practice'>('guide');
  const [exIdx, setExIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const ex = PUNCTUATION_EXERCISES[exIdx % PUNCTUATION_EXERCISES.length];
  const options = useMemo(() => shuffleOptions(ex.options), [ex]);

  const handleChoose = async (opt: string) => {
    if (feedback?.ok) return;
    setSelected(opt);
    const isCorrect = opt === ex.correctOption;
    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      speakSentence(ex.spokenSentence, { rate: profile.speechRate });
      setFeedback({ ok: true, msg: `Muito bem! ${ex.explanation}` });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: 'Quase lá! Ouça a entonação da frase novamente e pense no que ela quer expressar.' });
    }

    await onRecordAttempt({
      gameId: 'world-activity' as never,
      level: 9,
      skillId: `punctuation:${ex.correctOption}`,
      skillLabel: `Pontuação (${ex.correctOption})`,
      skillCategory: 'sentence',
      prompt: ex.displaySentence,
      expectedAnswer: ex.correctOption,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: 1,
      responseMs: 2500,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className={`btn ${tab === 'guide' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('guide')}>
          1. Para que serve cada sinal?
        </button>
        <button type="button" className={`btn ${tab === 'lab' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('lab')}>
          2. Laboratório de Entonação
        </button>
        <button type="button" className={`btn ${tab === 'practice' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('practice')}>
          3. Praticar Pontuação
        </button>
      </div>

      {tab === 'guide' && (
        <div className="grid-2">
          {PUNCTUATION_GUIDE.map((item) => (
            <div key={item.symbol} className="card" style={{ borderColor: item.color, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: item.color }}>{item.symbol}</span>
                <span className="pill" style={{ background: item.color, color: '#FFFFFF', fontSize: '0.8rem' }}>
                  {item.nickname}
                </span>
              </div>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
              <p style={{ margin: 0, fontWeight: 700 }}>{item.purpose}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Quando usar:</strong> {item.whenToUse}
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, minWidth: 150 }}
                  onClick={() => speakSentence(item.spokenExplanation, { rate: profile.speechRate })}
                >
                  <Volume2 size={16} /> Ouvir explicação
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, minWidth: 150 }}
                  onClick={() => speakSentence(item.example, { rate: profile.speechRate })}
                >
                  <Volume2 size={16} /> "{item.example}"
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'lab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ background: 'var(--bg-indigo-soft)', borderColor: '#C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>🎧 Como funciona o Laboratório de Entonação?</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--text-main)' }}>{INTONATION_LAB_EXPLANATION}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => speakSentence(INTONATION_LAB_EXPLANATION, { rate: profile.speechRate })}
            >
              <Volume2 size={18} /> Ouvir explicação
            </button>
          </div>
          {INTONATION_LAB.map((lab) => (
            <div key={lab.base} className="card">
              <h3 style={{ margin: '0 0 10px' }}>Ouça como a mesma frase muda com cada sinal:</h3>
              <div className="grid-3">
                {lab.variants.map((v) => (
                  <button
                    key={v.symbol}
                    type="button"
                    className="tile-btn"
                    style={{ flexDirection: 'column', padding: 14, fontSize: '1.05rem' }}
                    onClick={() => speakSentence(v.text, { rate: profile.speechRate })}
                  >
                    <span style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{v.symbol}</span>
                    <span>{v.text}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'practice' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className="pill pill-indigo">Frase {exIdx + 1} de {PUNCTUATION_EXERCISES.length}</span>
            <button type="button" className="btn btn-secondary" onClick={() => speakSentence(ex.spokenSentence, { rate: profile.speechRate })}>
              <Volume2 size={18} /> Ouvir entonação da frase
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: 900, padding: '14px 8px' }}>
            {feedback?.ok ? ex.spokenSentence : ex.displaySentence}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`tile-btn ${
                  selected === opt ? (feedback?.ok ? 'correct' : 'try-again') : ''
                }`}
                style={{ minWidth: 88, minHeight: 72, fontSize: '2rem' }}
                onClick={() => handleChoose(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
              <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
              {feedback.ok && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setExIdx((i) => i + 1);
                    setSelected(null);
                    setFeedback(null);
                  }}
                >
                  Próxima frase <ArrowRight size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// NÍVEL 10 — CLUBE DOS LEITORES (INTERPRETAÇÃO AVANÇADA)
const World10ReadingClub: React.FC<{
  profile: ChildProfile;
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<void>;
}> = ({ profile, onRecordAttempt }) => {
  const [textIdx, setTextIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const item = READING_CLUB_TEXTS[textIdx % READING_CLUB_TEXTS.length];
  const question = item.questions[qIdx % item.questions.length];
  const options = useMemo(() => shuffleOptions(question.options), [question]);

  const handleChoose = async (opt: string) => {
    if (feedback?.ok) return;
    setSelected(opt);
    const isCorrect = opt === question.correctOption;
    if (isCorrect) {
      playSuccessChime(profile.soundEnabled);
      setFeedback({ ok: true, msg: 'Excelente interpretação! Você entendeu perfeitamente o sentido do texto!' });
    } else {
      playGentleTryAgain(profile.soundEnabled);
      setFeedback({ ok: false, msg: 'Boa tentativa! Releia ou ouça o texto com calma para achar a pista certa.' });
    }

    await onRecordAttempt({
      gameId: 'world-activity' as never,
      level: 10,
      skillId: `reading-club:${item.id}`,
      skillLabel: `Interpretação: ${item.title}`,
      skillCategory: 'story',
      prompt: question.question,
      expectedAnswer: question.correctOption,
      userAnswer: opt,
      isCorrect,
      attemptsTaken: 1,
      responseMs: 3500,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {READING_CLUB_TEXTS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`btn ${textIdx === i ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setTextIdx(i);
              setQIdx(0);
              setSelected(null);
              setFeedback(null);
            }}
          >
            {t.emoji} {t.genre}: {t.title}
          </button>
        ))}
      </div>

      <div className="card" style={{ background: '#F5F3FF', borderColor: '#C4B5FD' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div>
            <span className="pill pill-indigo">{item.genre}</span>
            <h3 style={{ margin: '6px 0 0' }}>{item.emoji} {item.title}</h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => speakSentence(item.lines.join(' '), { rate: profile.speechRate })}
          >
            <Volume2 size={18} /> Ouvir texto
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '1.12rem', lineHeight: 1.7 }}>
          {item.lines.map((line, i) => (
            <p
              key={i}
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => speakSentence(line, { rate: profile.speechRate })}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span className="pill pill-amber" style={{ alignSelf: 'flex-start' }}>
          Habilidade: {question.skillTag}
        </span>
        <h4 style={{ margin: 0, fontSize: '1.12rem' }}>{question.question}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`tile-btn ${selected === opt ? (feedback?.ok ? 'correct' : 'try-again') : ''}`}
              style={{ justifyContent: 'flex-start', fontSize: '1.02rem', padding: '12px 16px' }}
              onClick={() => handleChoose(opt)}
            >
              {opt}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.ok ? 'feedback-positive' : 'feedback-encourage'}`}>
            <div style={{ fontWeight: 700 }}>{feedback.msg}</div>
            {feedback.ok && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (qIdx + 1 < item.questions.length) {
                    setQIdx((q) => q + 1);
                  } else {
                    setQIdx(0);
                    setTextIdx((t) => (t + 1) % READING_CLUB_TEXTS.length);
                  }
                  setSelected(null);
                  setFeedback(null);
                }}
              >
                Continuar <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
