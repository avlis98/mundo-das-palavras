import React, { useState } from 'react';
import { Plus, UserCheck } from 'lucide-react';
import { LumiMascot } from '../components/LumiMascot';
import { AVATARS } from '../content/worldsAndRewards';
import { getTodayDateKey } from '../pedagogy/dailyMission';
import type { ChildProfile } from '../types';

interface ProfilesScreenProps {
  profiles: ChildProfile[];
  activeChildId: string | null;
  onSelectProfile: (childId: string) => void;
  onCreateProfile: (profile: ChildProfile) => Promise<void>;
}

export const ProfilesScreen: React.FC<ProfilesScreenProps> = ({
  profiles,
  activeChildId,
  onSelectProfile,
  onCreateProfile,
}) => {
  const [creating, setCreating] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [age, setAge] = useState(8);
  const [avatarId, setAvatarId] = useState('owl');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: ChildProfile = {
      id: `child-${Date.now()}`,
      name: name.trim(),
      age,
      avatarId,
      createdAt: Date.now(),
      dailyGoalMinutes,
      diagnosticCompleted: false,
      currentLevel: 1,
      stars: 0,
      streakDays: 1,
      lastActiveDate: getTodayDateKey(),
      unlockedWorlds: [1],
      badges: [],
      collectibles: ['col-lumi'],
      speechRate: 0.78,
      soundEnabled: true,
      voiceRecognitionEnabled: true,
    };

    await onCreateProfile(newProfile);
    setName('');
    setCreating(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, margin: '0 auto' }}>
      <LumiMascot message="Quem vai explorar o Mundo das Palavras hoje? Você pode criar um perfil para cada criança!" />

      {profiles.length > 0 && !creating && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ margin: 0 }}>Perfis de Aprendizagem</h2>
            <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
              <Plus size={18} /> Novo perfil
            </button>
          </div>

          <div className="grid-2">
            {profiles.map((p) => {
              const av = AVATARS.find((a) => a.id === p.avatarId) ?? AVATARS[0];
              const isActive = p.id === activeChildId;
              return (
                <button
                  key={p.id}
                  type="button"
                  className="card card-interactive"
                  onClick={() => onSelectProfile(p.id)}
                  style={{
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    borderColor: isActive ? 'var(--primary)' : 'var(--border-soft)',
                    background: isActive ? 'var(--bg-indigo-soft)' : 'var(--bg-surface)',
                  }}
                >
                  <span style={{ fontSize: '3rem' }}>{av.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{p.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                      {p.age} anos • Nível {p.currentLevel} • ⭐ {p.stars}
                    </div>
                  </div>
                  <UserCheck size={22} color={isActive ? '#4F46E5' : '#9CA3AF'} />
                </button>
              );
            })}
          </div>
        </>
      )}

      {creating && (
        <form className="card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Criar Perfil da Criança</h2>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
              Como a criança se chama?
            </label>
            <input
              type="text"
              className="input-lg"
              placeholder="Ex.: Lucas, Sofia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
              autoFocus
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>Idade</label>
              <select
                className="input-lg"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              >
                {[6, 7, 8, 9, 10, 11].map((a) => (
                  <option key={a} value={a}>
                    {a} anos
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
                Meta diária recomendada
              </label>
              <select
                className="input-lg"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              >
                <option value={15}>15 minutos por dia (recomendado)</option>
                <option value={20}>20 minutos por dia</option>
                <option value={10}>10 minutos por dia</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 8 }}>Escolha um amigo avatar:</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  className={`tile-btn ${avatarId === av.id ? 'selected' : ''}`}
                  style={{ flexDirection: 'column', padding: '10px 14px', minWidth: 88 }}
                  onClick={() => setAvatarId(av.id)}
                >
                  <span style={{ fontSize: '2rem' }}>{av.emoji}</span>
                  <span style={{ fontSize: '0.75rem' }}>{av.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {profiles.length > 0 && (
              <button type="button" className="btn btn-outline" onClick={() => setCreating(false)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={!name.trim()}>
              Salvar e começar!
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
