import React from 'react';
import { Volume2 } from 'lucide-react';
import { speak } from '../services/speechService';

interface LumiMascotProps {
  message: string;
  spokenText?: string;
  mood?: 'happy' | 'encouraging' | 'celebrating' | 'listening';
  speakable?: boolean;
  speechRate?: number;
}

export const LumiMascot: React.FC<LumiMascotProps> = ({
  message,
  spokenText,
  mood = 'happy',
  speakable = true,
  speechRate = 0.78,
}) => {
  const eyeColor = mood === 'celebrating' ? '#F59E0B' : '#1E1B4B';

  return (
    <div className="lumi-box" role="region" aria-label="Guia Lumi">
      <div className="animate-float" style={{ flexShrink: 0 }}>
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="42" r="32" fill="#F97316" stroke="#1E1B4B" strokeWidth="3" />
          <ellipse cx="40" cy="52" rx="20" ry="16" fill="#FED7AA" />
          {/* Orelhas de coruja */}
          <path d="M16 20L26 12L28 24Z" fill="#EA580C" stroke="#1E1B4B" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M64 20L54 12L52 24Z" fill="#EA580C" stroke="#1E1B4B" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Olhos */}
          <circle cx="29" cy="34" r="10" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="51" cy="34" r="10" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
          {mood === 'celebrating' ? (
            <>
              <path d="M25 34C27 30 31 30 33 34" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M47 34C49 30 53 30 55 34" stroke={eyeColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="30" cy="34" r="4.5" fill={eyeColor} />
              <circle cx="50" cy="34" r="4.5" fill={eyeColor} />
              <circle cx="31.5" cy="32.5" r="1.5" fill="#FFFFFF" />
              <circle cx="51.5" cy="32.5" r="1.5" fill="#FFFFFF" />
            </>
          )}
          {/* Bico */}
          <path d="M35 41L40 48L45 41H35Z" fill="#FACC15" stroke="#1E1B4B" strokeWidth="2" strokeLinejoin="round" />
          {mood === 'listening' && (
            <circle cx="66" cy="18" r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          )}
        </svg>
      </div>
      <div className="lumi-bubble">
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4F46E5', marginBottom: 2 }}>
          Lumi, sua guia
        </div>
        <div>{message}</div>
      </div>
      {speakable && (
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: '8px 12px', minHeight: 44 }}
          onClick={() => speak(spokenText ?? message, { rate: speechRate })}
          aria-label="Ouvir mensagem da Lumi"
          title="Ouvir"
        >
          <Volume2 size={20} />
        </button>
      )}
    </div>
  );
};
