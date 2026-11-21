import React from 'react';
import { ArrowLeft, Flame, Star, TrendingUp } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { SimpleBarChart } from '../components/SimpleBarChart';
import { LUMI_PHRASES } from '../content/lumiPhrases';
import type { AttemptLog, ChildProfile, SkillMastery } from '../types';

interface ProgressScreenProps {
  profile: ChildProfile;
  masteries: SkillMastery[];
  attempts: AttemptLog[];
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  profile,
  masteries,
  attempts,
  onBack,
}) => {
  const mastered = masteries.filter((m) => m.status === 'mastered' || m.status === 'needs_review');
  const learning = masteries.filter((m) => m.status === 'learning' || m.status === 'practicing');

  const categoryLabels: Record<string, string> = {
    letter: 'Letras',
    phoneme: 'Sons',
    syllable: 'Sílabas',
    word: 'Palavras',
    sentence: 'Frases',
    story: 'Histórias',
    orthography: 'Escrita e Ortografia',
  };

  const chartData = Object.entries(categoryLabels)
    .map(([cat, label]) => {
      const items = masteries.filter((m) => m.category === cat);
      if (items.length === 0) return null;
      const avg = items.reduce((acc, m) => acc + m.masteryScore, 0) / items.length;
      return {
        label,
        value: avg,
        subtitle: `${Math.round(avg)}% (${items.length} praticadas)`,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Mapa dos Mundos
        </button>
        <h2 style={{ margin: 0 }}>Minha Evolução</h2>
      </div>

      <LumiMascot
        message={`Olha quanto você já caminhou, ${profile.name}! Cada atividade ajuda seu cérebro a ficar mais craque na leitura!`}
        spokenText={LUMI_PHRASES.progress}
        speechRate={profile.speechRate}
      />

      <div className="grid-3">
        <div className="card" style={{ textAlign: 'center', background: 'var(--bg-amber-soft)' }}>
          <Star size={28} color="#D97706" />
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{profile.stars}</div>
          <div style={{ fontWeight: 700, color: '#92400E' }}>Estrelas ganhas</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'var(--bg-green-soft)' }}>
          <TrendingUp size={28} color="#047857" />
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{mastered.length}</div>
          <div style={{ fontWeight: 700, color: '#065F46' }}>Habilidades dominadas</div>
        </div>
        <div className="card" style={{ textAlign: 'center', background: 'var(--bg-indigo-soft)' }}>
          <Flame size={28} color="#4F46E5" />
          <div style={{ fontSize: '2rem', fontWeight: 900 }}>{attempts.length}</div>
          <div style={{ fontWeight: 700, color: '#3730A3' }}>Atividades praticadas</div>
        </div>
      </div>

      <SimpleBarChart
        title="Seu progresso por área"
        data={chartData}
        emptyMessage="Comece a brincar nos mundos ou jogos para ver suas barras de progresso crescerem!"
      />

      {learning.length > 0 && (
        <div className="card">
          <h3 style={{ margin: '0 0 10px' }}>Em treinamento agora:</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {learning.slice(0, 10).map((m) => (
              <span key={m.id} className="pill pill-indigo">
                {m.label} ({m.masteryScore}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
