import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';

interface PinModalProps {
  expectedPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({ expectedPin, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === expectedPin) {
      onSuccess();
    } else {
      setError('PIN não confere. Dica: o PIN padrão inicial é 1234.');
      setPin('');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Acesso dos Responsáveis"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(30, 27, 75, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={22} color="#4F46E5" />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Área dos Responsáveis</h2>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>
          Digite o PIN de acesso para visualizar relatórios, recomendações e configurações.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            className="input-lg"
            placeholder="PIN (padrão: 1234)"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && (
            <div style={{ color: '#B45309', background: '#FEF3C7', padding: '8px 12px', borderRadius: 10, fontWeight: 600 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
