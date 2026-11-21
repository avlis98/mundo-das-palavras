import React from 'react';
import { CalendarCheck, Gamepad2, Lock, Sparkles, Star } from 'lucide-react';
import { IslandIllustration } from '../components/IslandIllustration';
import { LumiMascot } from '../components/LumiMascot';
import { LUMI_PHRASES } from '../content/lumiPhrases';
import { WORLDS } from '../content/worldsAndRewards';
import type { ChildProfile, DailyMission, ScreenId, SkillMastery } from '../types';

interface MapScreenProps {
  profile: ChildProfile;
  mission: DailyMission | null;
  masteries: SkillMastery[];
  onNavigate: (screen: ScreenId) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  profile,
  mission,
  masteries,
  onNavigate,
}) => {
  const completedBlocks = mission?.blocks.filter((b) => b.completed).length ?? 0;
  const totalBlocks = mission?.blocks.length ?? 5;
  const masteredCount = masteries.filter((m) => m.status === 'mastered').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <LumiMascot
        message={`Oi, ${profile.name}! Hoje você está no Nível ${profile.currentLevel} e já dominou ${masteredCount} habilidade(s). Qual mundo vamos explorar?`}
        spokenText={LUMI_PHRASES.mapGreeting}
        speechRate={profile.speechRate}
      />

      {/* Cartão da Missão Diária */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)',
          color: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '0.95rem', opacity: 0.92 }}>
            <CalendarCheck size={18} /> MISSÃO DIÁRIA ({profile.dailyGoalMinutes} MIN)
          </div>
          <h2 style={{ margin: '4px 0 8px', fontSize: '1.45rem' }}>
            {completedBlocks === totalBlocks
              ? 'Missão de hoje concluída! 🎉'
              : `Faltam ${totalBlocks - completedBlocks} passo(s) na aventura de hoje`}
          </h2>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,0.28)' }}>
            <div
              className="progress-fill"
              style={{
                width: `${(completedBlocks / totalBlocks) * 100}%`,
                background: '#FACC15',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => onNavigate('daily-mission')}
          >
            <Sparkles size={20} /> Abrir Missão
          </button>
          <button
            type="button"
            className="btn btn-outline btn-lg"
            style={{ background: 'rgba(255,255,255,0.14)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}
            onClick={() => onNavigate('games')}
          >
            <Gamepad2 size={20} /> 10 Jogos
          </button>
        </div>
      </div>

      {/* Mapa dos 7 Mundos em formato Arquipélago de Ilhas */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="ocean-heading" style={{ margin: 0, fontSize: '1.45rem' }}>
            🏝️ Arquipélago dos 10 Mundos
          </h2>
          <span className="pill pill-amber" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <Star size={15} fill="#F59E0B" color="#F59E0B" /> {profile.stars} estrelas
          </span>
        </div>

        <div className="grid-2">
          {WORLDS.map((w, idx) => {
            const isUnlocked = profile.unlockedWorlds.includes(w.level) || w.level <= profile.currentLevel;
            const worldMasteries = masteries.filter((m) => m.level === w.level);
            const worldMastered = worldMasteries.filter((m) => m.status === 'mastered').length;

            return (
              <button
                key={w.level}
                type="button"
                className="card card-interactive"
                onClick={() => onNavigate(w.screenId)}
                style={{
                  textAlign: 'left',
                  background: isUnlocked
                    ? 'rgba(255, 255, 255, 0.96)'
                    : 'rgba(241, 245, 249, 0.88)',
                  borderColor: isUnlocked ? w.color : '#94A3B8',
                  borderWidth: 3,
                  borderBottomWidth: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 16,
                  animation: idx % 2 === 0 ? 'floatGentle 4.2s ease-in-out infinite' : 'floatGentle 4.8s ease-in-out 0.6s infinite',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span
                    className="pill"
                    style={{ background: w.color, color: '#FFFFFF', fontSize: '0.8rem' }}
                  >
                    {w.emoji} Nível {w.level}
                  </span>
                  {isUnlocked ? (
                    <span className="pill pill-green" style={{ fontSize: '0.8rem' }}>
                      {worldMastered > 0 ? `${worldMastered} dominada(s)` : 'Aberto'}
                    </span>
                  ) : (
                    <span className="pill" style={{ background: '#E2E8F0', color: '#475569', fontSize: '0.8rem' }}>
                      <Lock size={13} /> Em breve
                    </span>
                  )}
                </div>

                <IslandIllustration level={w.level} locked={!isUnlocked} />

                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E1B4B' }}>{w.title}</div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {w.goal}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
