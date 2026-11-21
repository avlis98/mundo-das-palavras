import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Shield, Volume2 } from 'lucide-react';
import { isSpeechRecognitionSupported } from '../services/recognitionService';
import {
  getBestPtBrFemaleVoice,
  getPtBrVoices,
  isSpeechSynthesisSupported,
  setPreferredVoiceURI,
  speak,
} from '../services/speechService';
import type { AppSettings, ChildProfile } from '../types';

interface SettingsScreenProps {
  profile: ChildProfile;
  settings: AppSettings;
  onUpdateProfile: (updated: ChildProfile) => Promise<void>;
  onUpdatePin: (newPin: string) => Promise<void>;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  settings,
  onUpdateProfile,
  onUpdatePin,
  onBack,
}) => {
  const [newPin, setNewPin] = useState(settings.parentPin);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getPtBrVoices());

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;
    const update = () => setVoices(getPtBrVoices());
    update();
    window.speechSynthesis.addEventListener?.('voiceschanged', update);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', update);
  }, []);

  const bestAutoVoice = getBestPtBrFemaleVoice(undefined);

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setSavedMsg('O PIN deve ter pelo menos 4 dígitos.');
      return;
    }
    await onUpdatePin(newPin.trim());
    setSavedMsg('PIN dos responsáveis atualizado!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </button>
        <h2 style={{ margin: 0 }}>Configurações</h2>
      </div>

      {savedMsg && (
        <div className="feedback-banner feedback-positive">
          <strong>{savedMsg}</strong>
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ margin: 0 }}>Áudio, Voz e Rotina de {profile.name}</h3>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Voz da Lumi (Feminina e Expressiva)
          </label>
          <select
            className="input-lg"
            value={profile.preferredVoiceURI ?? ''}
            onChange={(e) => {
              const uri = e.target.value || undefined;
              setPreferredVoiceURI(uri);
              onUpdateProfile({ ...profile, preferredVoiceURI: uri });
            }}
          >
            <option value="">
              Automática (melhor voz feminina{bestAutoVoice ? `: ${bestAutoVoice.name}` : ''})
            </option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Velocidade da fala da Lumi ({profile.speechRate.toFixed(2)}x — mais devagar ajuda na leitura)
          </label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="range"
              min="0.55"
              max="1.10"
              step="0.05"
              value={profile.speechRate}
              onChange={(e) =>
                onUpdateProfile({ ...profile, speechRate: Number(e.target.value) })
              }
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                speak('Olá! Que alegria aprender com você hoje! Assim está ótima a minha voz?', {
                  rate: profile.speechRate,
                  pitch: 1.15,
                  voiceURI: profile.preferredVoiceURI,
                })
              }
            >
              <Volume2 size={18} /> Testar voz
            </button>
          </div>
          {!isSpeechSynthesisSupported() && (
            <p style={{ color: '#B45309', fontSize: '0.88rem' }}>
              Este navegador não possui síntese de voz ativa; o aplicativo usará apoio visual automático.
            </p>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={profile.soundEnabled}
            onChange={(e) => onUpdateProfile({ ...profile, soundEnabled: e.target.checked })}
            style={{ width: 20, height: 20 }}
          />
          Ativar efeitos sonoros e leitura automática nas atividades
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={profile.voiceRecognitionEnabled}
            onChange={(e) => onUpdateProfile({ ...profile, voiceRecognitionEnabled: e.target.checked })}
            style={{ width: 20, height: 20 }}
          />
          Permitir botão opcional de microfone na leitura em voz alta
          {!isSpeechRecognitionSupported() && ' (indisponível neste navegador)'}
        </label>

        <div>
          <label style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>
            Tempo recomendado da Missão Diária
          </label>
          <select
            className="input-lg"
            value={profile.dailyGoalMinutes}
            onChange={(e) =>
              onUpdateProfile({ ...profile, dailyGoalMinutes: Number(e.target.value) })
            }
          >
            <option value={10}>10 minutos por dia</option>
            <option value={15}>15 minutos por dia (recomendado)</option>
            <option value={20}>20 minutos por dia</option>
            <option value={25}>25 minutos por dia</option>
          </select>
        </div>
      </div>

      <form className="card" onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 style={{ margin: 0 }}>PIN da Área dos Responsáveis</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={8}
            className="input-lg"
            style={{ maxWidth: 220 }}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Check size={18} /> Salvar PIN
          </button>
        </div>
      </form>

      <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#F9FAFB' }}>
        <Shield size={24} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <strong>Privacidade e LGPD:</strong> Todos os dados de aprendizagem são armazenados localmente no IndexedDB do seu dispositivo. Nenhuma gravação de voz ou dado pessoal da criança é enviado para servidores externos por esta aplicação.
        </div>
      </div>
    </div>
  );
};
