import React from 'react';
import { ArrowLeft, Award, Sparkles } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { LUMI_PHRASES } from '../content/lumiPhrases';
import { BADGES, COLLECTIBLES } from '../content/worldsAndRewards';
import type { ChildProfile } from '../types';

interface AchievementsScreenProps {
  profile: ChildProfile;
  onBack: () => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ profile, onBack }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Mapa dos Mundos
        </button>
        <h2 style={{ margin: 0 }}>Conquistas e Coleção</h2>
      </div>

      <LumiMascot
        mood="celebrating"
        message={`Você já juntou ${profile.stars} estrelas e desbloqueou ${profile.badges.length} medalha(s)!`}
        spokenText={LUMI_PHRASES.achievements}
        speechRate={profile.speechRate}
      />

      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Award size={20} color="#F59E0B" /> Medalhas de Dedicação
        </h3>
        <div className="grid-3">
          {BADGES.map((b) => {
            const unlocked = profile.badges.includes(b.id);
            return (
              <div
                key={b.id}
                className="card"
                style={{
                  textAlign: 'center',
                  background: unlocked ? 'var(--bg-amber-soft)' : '#F9FAFB',
                  borderColor: unlocked ? '#F59E0B' : 'var(--border-soft)',
                  opacity: unlocked ? 1 : 0.7,
                }}
              >
                <div style={{ fontSize: '2.6rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{b.title}</div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '4px 0 8px' }}>
                  {b.description}
                </p>
                <span className={`pill ${unlocked ? 'pill-green' : 'pill-indigo'}`} style={{ fontSize: '0.78rem' }}>
                  {unlocked ? 'Conquistada!' : b.conditionText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={20} color="#4F46E5" /> Tesouros dos Mundos
        </h3>
        <div className="grid-3">
          {COLLECTIBLES.map((c) => {
            const unlocked =
              profile.collectibles.includes(c.id) || profile.unlockedWorlds.includes(c.world);
            return (
              <div
                key={c.id}
                className="card"
                style={{
                  textAlign: 'center',
                  background: unlocked ? 'var(--bg-indigo-soft)' : '#F9FAFB',
                  opacity: unlocked ? 1 : 0.65,
                }}
              >
                <div style={{ fontSize: '2.5rem', filter: unlocked ? 'none' : 'grayscale(1)' }}>{c.emoji}</div>
                <div style={{ fontWeight: 900, marginTop: 6 }}>{c.name}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {unlocked ? c.description : `Desbloqueado no Mundo ${c.world}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
