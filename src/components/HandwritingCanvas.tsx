import React, { useEffect, useRef, useState } from 'react';
import { Eraser, Sparkles } from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface HandwritingCanvasProps {
  guideText?: string;
  onRecognizedText?: (text: string) => void;
  recognizeButtonLabel?: string;
}

export const HandwritingCanvas: React.FC<HandwritingCanvasProps> = ({
  guideText,
  onRecognizedText,
  recognizeButtonLabel = 'Ler minha escrita',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedPreview, setRecognizedPreview] = useState<string | null>(null);

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Linha de caderno suave
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, canvas.height * 0.72);
    ctx.lineTo(canvas.width - 16, canvas.height * 0.72);
    ctx.stroke();

    if (guideText) {
      ctx.save();
      ctx.fillStyle = 'rgba(79, 70, 229, 0.14)';
      ctx.font = 'bold 54px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(guideText, canvas.width / 2, canvas.height * 0.5);
      ctx.restore();
    }

    // Limpa camada limpa de tinta usada para OCR
    const ink = inkCanvasRef.current;
    if (ink) {
      const ictx = ink.getContext('2d');
      if (ictx) {
        ictx.fillStyle = '#FFFFFF';
        ictx.fillRect(0, 0, ink.width, ink.height);
      }
    }
    setHasInk(false);
    setRecognizedPreview(null);
  };

  useEffect(() => {
    drawGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideText]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ink = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ictx = ink?.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getPos(e);

    for (const c of [ctx, ictx]) {
      if (!c) continue;
      c.strokeStyle = '#000000';
      c.lineWidth = 8;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(x, y);
    }
    setDrawing(true);
    setHasInk(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ink = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ictx = ink?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPos(e);
    for (const c of [ctx, ictx]) {
      if (!c) continue;
      c.lineTo(x, y);
      c.stroke();
    }
  };

  const handlePointerUp = () => {
    setDrawing(false);
  };

  const handleRecognize = async () => {
    const ink = inkCanvasRef.current;
    if (!ink || !hasInk || recognizing) return;
    setRecognizing(true);
    setRecognizedPreview(null);

    try {
      const worker = await createWorker('por');
      const {
        data: { text },
      } = await worker.recognize(ink);
      await worker.terminate();

      const cleaned = text
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

      if (cleaned) {
        setRecognizedPreview(cleaned);
        onRecognizedText?.(cleaned);
      } else {
        setRecognizedPreview('Não consegui identificar ainda — tente letras grandes e separadas!');
      }
    } catch {
      setRecognizedPreview('Ops! Tente escrever mais devagar ou use o teclado.');
    } finally {
      setRecognizing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Escreva com letras de fôrma grandes na lousa:
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {onRecognizedText && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 14px', minHeight: 40 }}
              disabled={!hasInk || recognizing}
              onClick={handleRecognize}
            >
              <Sparkles size={16} /> {recognizing ? 'Lendo escrita...' : recognizeButtonLabel}
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '6px 12px', minHeight: 40 }}
            onClick={drawGuide}
          >
            <Eraser size={16} /> Limpar traço
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={560}
        height={170}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          width: '100%',
          height: 165,
          background: '#FFFFFF',
          border: '2px dashed #6366F1',
          borderRadius: 16,
          touchAction: 'none',
          cursor: 'crosshair',
        }}
      />

      {/* Canvas oculto somente com traços pretos sobre fundo branco puro para OCR mais preciso */}
      <canvas ref={inkCanvasRef} width={560} height={170} style={{ display: 'none' }} />

      {recognizedPreview && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 12,
            background: 'var(--bg-indigo-soft)',
            fontWeight: 700,
            fontSize: '0.92rem',
            color: 'var(--text-main)',
          }}
        >
          🦉 A Lumi leu na lousa: <strong>{recognizedPreview}</strong>
        </div>
      )}
    </div>
  );
};
