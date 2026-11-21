// Efeitos sonoros gentis sintetizados localmente via Web Audio API

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(freq: number, durationSec: number, delaySec = 0, type: OscillatorType = 'sine', volume = 0.12): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

export function playSuccessChime(enabled = true): void {
  if (!enabled) return;
  playTone(523.25, 0.14, 0, 'triangle', 0.13); // Dó
  playTone(659.25, 0.16, 0.1, 'triangle', 0.13); // Mi
  playTone(783.99, 0.25, 0.2, 'triangle', 0.14); // Sol
}

export function playGentleTryAgain(enabled = true): void {
  if (!enabled) return;
  playTone(392.0, 0.16, 0, 'sine', 0.08);
  playTone(440.0, 0.18, 0.12, 'sine', 0.08);
}

export function playTapSound(enabled = true): void {
  if (!enabled) return;
  playTone(620, 0.06, 0, 'sine', 0.06);
}

export function playCelebrationFanfare(enabled = true): void {
  if (!enabled) return;
  playTone(523.25, 0.14, 0, 'triangle', 0.14);
  playTone(659.25, 0.14, 0.11, 'triangle', 0.14);
  playTone(783.99, 0.14, 0.22, 'triangle', 0.14);
  playTone(1046.5, 0.35, 0.34, 'triangle', 0.15);
}
