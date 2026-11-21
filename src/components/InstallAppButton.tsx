import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppButtonProps {
  compact?: boolean;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({ compact = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const isIOS =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowGuide(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className={compact ? 'btn btn-secondary' : 'btn btn-success btn-lg'}
        style={compact ? { padding: '6px 12px', minHeight: 40, fontSize: '0.88rem' } : undefined}
        onClick={handleClick}
        title="Baixar e instalar o Mundo das Palavras no seu dispositivo"
      >
        <Download size={compact ? 16 : 20} />
        <span>{compact ? 'Instalar' : 'Instalar Aplicativo'}</span>
      </button>

      {showGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Como instalar o Mundo das Palavras"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15, 16, 53, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 420, width: '100%', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={22} color="#4F46E5" />
                <h3 style={{ margin: 0 }}>Instalar o Aplicativo</h3>
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => setShowGuide(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            {isIOS ? (
              <ol style={{ margin: '0 0 14px', paddingLeft: 20, lineHeight: 1.65 }}>
                <li>Toque no ícone <strong>Compartilhar</strong> (quadrado com seta para cima) no Safari.</li>
                <li>Role e toque em <strong>Adicionar à Tela de Início</strong>.</li>
                <li>Confirme tocando em <strong>Adicionar</strong>!</li>
              </ol>
            ) : (
              <ol style={{ margin: '0 0 14px', paddingLeft: 20, lineHeight: 1.65 }}>
                <li>Abra este aplicativo no <strong>Chrome</strong> ou <strong>Edge</strong> (em endereço HTTPS).</li>
                <li>Toque no menu <strong>⋮</strong> (ou no ícone de instalação na barra de endereço).</li>
                <li>Escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
              </ol>
            )}

            <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Depois de instalado, o <strong>Mundo das Palavras</strong> abre em tela cheia como um app nativo e funciona até sem internet!
            </p>

            <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowGuide(false)}>
              Entendi!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
