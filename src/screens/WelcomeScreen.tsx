import React from 'react';
import { ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { InstallAppButton } from '../components/InstallAppButton';
import { IslandIllustration } from '../components/IslandIllustration';
import { LumiMascot } from '../components/LumiMascot';
import { speak } from '../services/speechService';

interface WelcomeScreenProps {
  hasProfiles: boolean;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ hasProfiles, onStart }) => {
  const greeting =
    'Olá! Eu sou a Lumi! Que alegria ter você aqui no Mundo das Palavras! Vamos brincar com letras, sons, sílabas e histórias incríveis juntos?';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 760, margin: '20px auto' }}>
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '28px 24px',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 55%, #FEF3C7 100%)',
          borderColor: '#38BDF8',
          borderWidth: 3,
          borderBottomWidth: 6,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxWidth: 480, margin: '0 auto 10px' }}>
          <IslandIllustration level={1} />
          <IslandIllustration level={3} />
          <IslandIllustration level={6} />
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: '2.2rem', color: '#1E1B4B' }}>
          Mundo das Palavras
        </h1>
        <p style={{ margin: '0 auto 20px', maxWidth: 520, fontSize: '1.15rem', color: 'var(--text-muted)' }}>
          Uma aventura inteligente e acolhedora para descobrir os sons, ler com confiança e escrever palavras novas todos os dias.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-lg" onClick={onStart}>
            <Sparkles size={22} /> {hasProfiles ? 'Escolher meu perfil' : 'Começar Aventura'}
          </button>
          <button type="button" className="btn btn-outline btn-lg" onClick={() => speak(greeting, { rate: 0.78, pitch: 1.15 })}>
            <Volume2 size={20} /> Ouvir a Lumi
          </button>
          <InstallAppButton />
        </div>
      </div>

      <LumiMascot message={greeting} mood="happy" />

      <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#F9FAFB' }}>
        <ShieldCheck size={28} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>Ambiente seguro e privado (LGPD):</strong>{' '}
          Sem anúncios, sem chat aberto, sem rankings competitivos. Todo o progresso fica salvo localmente no seu dispositivo e a área dos responsáveis é protegida por PIN.
        </div>
      </div>
    </div>
  );
};
