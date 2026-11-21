import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { GAMES_CATALOG } from '../games/gameCatalog';
import type { ChildProfile, GameId } from '../types';

interface GamesHubScreenProps {
  profile: ChildProfile;
  onStartGame: (gameId: GameId) => void;
  onBack: () => void;
}

export const GamesHubScreen: React.FC<GamesHubScreenProps> = ({
  profile,
  onStartGame,
  onBack,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Mapa dos Mundos
        </button>
        <h2 style={{ margin: 0 }}>Jogos Educativos ({GAMES_CATALOG.length})</h2>
      </div>

      <LumiMascot
        message="Escolha qualquer jogo para brincar e aprender! Cada tentativa vale estrelas!"
        speechRate={profile.speechRate}
      />

      <div className="grid-2">
        {GAMES_CATALOG.map((g) => (
          <button
            key={g.id}
            type="button"
            className="card card-interactive"
            onClick={() => onStartGame(g.id)}
            style={{
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
              borderColor: g.color,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '2.5rem' }}>{g.emoji}</span>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>{g.title}</div>
                <div style={{ fontSize: '0.85rem', color: g.color, fontWeight: 800 }}>
                  Recomendado a partir do Nível {g.minLevel}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{g.shortDesc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: g.color }}>
              <Play size={16} /> Jogar agora
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
