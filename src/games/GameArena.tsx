import React, { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import type { ChildProfile, ConfusionPair, GameId } from '../types';
import { DictationRobotGame, ListenAndWriteGame, SentenceBuilderGame } from './DictationAndSentenceGames';
import { GAMES_CATALOG } from './gameCatalog';
import { StoryDetectiveGame, TimedReadingGame } from './ReadingAndStoryGames';
import { InitialSoundGame, SoundHunterGame, type GameAttemptPayload } from './SoundAndLetterGames';
import { IncompleteWordGame, MysteryWordGame, WordFactoryGame } from './WordAndSyllableGames';

interface GameArenaProps {
  gameId: GameId;
  profile: ChildProfile;
  confusions: ConfusionPair[];
  onRecordAttempt: (payload: GameAttemptPayload) => Promise<{ starsEarned: number }>;
  onExit: () => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  gameId,
  profile,
  confusions,
  onRecordAttempt,
  onExit,
}) => {
  const [sessionStars, setSessionStars] = useState(0);
  const meta = GAMES_CATALOG.find((g) => g.id === gameId)!;

  const handleRecord = async (payload: GameAttemptPayload) => {
    const res = await onRecordAttempt(payload);
    setSessionStars((s) => s + res.starsEarned);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onExit}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.75rem' }}>{meta.emoji}</span>
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>{meta.title}</h2>
        </div>
        <span className="pill pill-amber">
          <Star size={16} fill="#F59E0B" color="#F59E0B" /> +{sessionStars} nesta partida
        </span>
      </div>

      <LumiMascot message={meta.instructions} speechRate={profile.speechRate} />

      <div className="card">
        {gameId === 'sound-hunter' && (
          <SoundHunterGame profile={profile} confusions={confusions} onRecord={handleRecord} />
        )}
        {gameId === 'initial-sound' && (
          <InitialSoundGame profile={profile} confusions={confusions} onRecord={handleRecord} />
        )}
        {gameId === 'word-factory' && <WordFactoryGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'incomplete-word' && <IncompleteWordGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'mystery-word' && <MysteryWordGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'dictation-robot' && <DictationRobotGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'sentence-builder' && <SentenceBuilderGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'story-detective' && <StoryDetectiveGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'timed-reading' && <TimedReadingGame profile={profile} onRecord={handleRecord} />}
        {gameId === 'listen-and-write' && <ListenAndWriteGame profile={profile} onRecord={handleRecord} />}
      </div>
    </div>
  );
};
