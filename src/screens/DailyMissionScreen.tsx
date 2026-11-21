import React from 'react';
import { ArrowLeft, CheckCircle2, Clock, Play, Trophy } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { LUMI_PHRASES } from '../content/lumiPhrases';
import type { ChildProfile, DailyMission, GameId, LearningLevel, MissionBlock, ScreenId } from '../types';

interface DailyMissionScreenProps {
  profile: ChildProfile;
  mission: DailyMission;
  onStartGame: (gameId: GameId) => void;
  onOpenWorld: (level: LearningLevel) => void;
  onToggleBlockComplete: (blockId: string) => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

export const DailyMissionScreen: React.FC<DailyMissionScreenProps> = ({
  profile,
  mission,
  onStartGame,
  onOpenWorld,
  onToggleBlockComplete,
  onNavigate,
}) => {
  const completedCount = mission.blocks.filter((b) => b.completed).length;
  const allDone = completedCount === mission.blocks.length;

  const handleAction = async (block: MissionBlock) => {
    if (block.type === 'reward') {
      await onToggleBlockComplete(block.id);
      return;
    }
    if (block.gameId) {
      onStartGame(block.gameId);
    } else {
      onOpenWorld(block.targetLevel);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={() => onNavigate('map')}>
          <ArrowLeft size={18} /> Mapa dos Mundos
        </button>
        <span className="pill pill-indigo">
          <Clock size={16} /> Meta de hoje: {mission.totalMinutesGoal} minutos
        </span>
      </div>

      <LumiMascot
        mood={allDone ? 'celebrating' : 'happy'}
        message={
          allDone
            ? `Parabéns, ${profile.name}! Você completou toda a Missão Diária de hoje! Que orgulho!`
            : LUMI_PHRASES.dailyMissionIntro
        }
        spokenText={allDone ? LUMI_PHRASES.dailyMissionDone : LUMI_PHRASES.dailyMissionIntro}
        speechRate={profile.speechRate}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mission.blocks.map((block) => (
          <div
            key={block.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              background: block.completed ? 'var(--bg-green-soft)' : 'var(--bg-surface)',
              borderColor: block.completed ? 'var(--success)' : 'var(--border-soft)',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>{block.title}</span>
                <span className="pill pill-amber" style={{ padding: '2px 10px', fontSize: '0.8rem' }}>
                  ~{block.minutes} min
                </span>
              </div>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>{block.description}</p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAction(block)}
              >
                {block.type === 'reward' ? (
                  <>
                    <Trophy size={18} /> Receber Bônus
                  </>
                ) : (
                  <>
                    <Play size={18} /> Praticar
                  </>
                )}
              </button>

              <button
                type="button"
                className={`btn ${block.completed ? 'btn-success' : 'btn-outline'}`}
                onClick={() => onToggleBlockComplete(block.id)}
                title={block.completed ? 'Concluído' : 'Marcar como concluído'}
              >
                <CheckCircle2 size={18} /> {block.completed ? 'Feito' : 'Concluir'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
