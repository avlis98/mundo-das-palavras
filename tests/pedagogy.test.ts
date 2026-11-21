import { describe, expect, it } from 'vitest';
import {
  checkAnswer,
  computeDiagnosticPlacement,
  detectConfusionPattern,
} from '../src/pedagogy/evaluation';
import { isSpokenMatch } from '../src/services/recognitionService';

describe('Regras Pedagógicas e Correção', () => {
  it('aceita resposta correta independente de maiúsculas/minúsculas e espaços', () => {
    const res = checkAnswer('BOLA', '  bola ');
    expect(res.isCorrect).toBe(true);
    expect(res.almostCorrect).toBe(false);
  });

  it('reconhece resposta sem acento como válida no modo padrão e sinaliza no modo estrito', () => {
    const relaxed = checkAnswer('MAÇÃ', 'MACA');
    expect(relaxed.isCorrect).toBe(true);
    expect(relaxed.almostCorrect).toBe(true);

    const strict = checkAnswer('MAÇÃ', 'MACA', { requireExactAccents: true });
    expect(strict.isCorrect).toBe(false);
    expect(strict.almostCorrect).toBe(true);
  });

  it('detecta confusões fonéticas/ortográficas comuns como M/N, CH/X e RR/R', () => {
    expect(detectConfusionPattern('M', 'N')).toEqual({ expected: 'M', confused: 'N' });
    expect(detectConfusionPattern('CHUVA', 'XUVA')).toEqual({ expected: 'CH', confused: 'X' });
    expect(detectConfusionPattern('CARRO', 'CARO')).toEqual({ expected: 'RR', confused: 'R' });
  });

  it('calcula posicionamento inicial adaptativo na avaliação diagnóstica', () => {
    const placement = computeDiagnosticPlacement([
      { level: 1, isCorrect: true },
      { level: 2, isCorrect: true },
      { level: 3, isCorrect: true },
      { level: 4, isCorrect: false },
    ]);
    expect(placement.recommendedLevel).toBe(3);
    expect(placement.unlockedWorlds).toEqual([1, 2, 3]);
  });

  it('tolera pequenas variações fonéticas no reconhecimento de fala infantil', () => {
    expect(isSpokenMatch('cachorro', 'CACHORRO')).toBe(true);
    expect(isSpokenMatch('pássaro', 'PASSARO')).toBe(true);
    expect(isSpokenMatch('bola azul', 'BOLA')).toBe(true);
  });
});
