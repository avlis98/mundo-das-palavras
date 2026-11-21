// Serviço de síntese de voz (TTS) em Português Brasileiro
// Usa áudios neurais pré-gerados (Thalita Neural pt-BR) quando disponíveis e faz fallback para Web Speech API.

import { AUDIO_MANIFEST } from '../content/audioManifest';
import { getSpokenSyllableText } from '../content/letters';

let activeAudioElement: HTMLAudioElement | null = null;
let playbackToken = 0;

const FEMALE_NATURAL_KEYWORDS = [
  'francisca',
  'thalita',
  'raquel',
  'leila',
  'leticia',
  'letícia',
  'maria',
  'luciana',
  'camila',
  'vitoria',
  'vitória',
  'fernanda',
  'helena',
  'google português',
  'female',
  'feminina',
  'mulher',
];

const MALE_KEYWORDS = [
  'daniel',
  'antonio',
  'antônio',
  'fabio',
  'fábio',
  'humberto',
  'julio',
  'júlio',
  'nicolau',
  'valerio',
  'valério',
  'donato',
  'male',
  'masculina',
];

let preferredVoiceURI: string | undefined;

export function setPreferredVoiceURI(uri?: string): void {
  preferredVoiceURI = uri;
}

export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  );
}

export function getPtBrVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter((v) => v.lang.toLowerCase().startsWith('pt'));
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;

  if (lang === 'pt-br') score += 40;
  else if (lang.startsWith('pt')) score += 10;

  if (name.includes('natural') || name.includes('online') || name.includes('neural')) {
    score += 50;
  }
  if (FEMALE_NATURAL_KEYWORDS.some((kw) => name.includes(kw))) {
    score += 35;
  }
  if (MALE_KEYWORDS.some((kw) => name.includes(kw))) {
    score -= 60;
  }
  return score;
}

export function getBestPtBrFemaleVoice(customURI?: string): SpeechSynthesisVoice | null {
  const ptVoices = getPtBrVoices();
  if (ptVoices.length === 0) return null;

  const targetURI = customURI ?? preferredVoiceURI;
  if (targetURI) {
    const chosen = ptVoices.find((v) => v.voiceURI === targetURI);
    if (chosen) return chosen;
  }

  const sorted = [...ptVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0] ?? null;
}

export function stopSpeaking(): void {
  playbackToken += 1;
  if (activeAudioElement) {
    try {
      activeAudioElement.onended = null;
      activeAudioElement.onerror = null;
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // ignora
    }
    activeAudioElement = null;
  }
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignora falha em navegadores restritos
  }
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onEnd?: () => void;
  onWordIndex?: (wordIndex: number) => void;
}

function normalizeAudioKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!text.trim()) {
    options.onEnd?.();
    return false;
  }

  // 1. Tenta áudio neural pré-gerado (voz feminina padrão pt-BR-FranciscaNeural)
  const audioSrc = AUDIO_MANIFEST[normalizeAudioKey(text)];
  if (audioSrc && typeof Audio !== 'undefined') {
    try {
      stopSpeaking();
      const myToken = playbackToken;
      const base = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '');
      const resolvedSrc = audioSrc.startsWith('/') ? `${base}${audioSrc}` : audioSrc;
      const audio = new Audio(resolvedSrc);
      activeAudioElement = audio;
      // Áudio já foi gravado em ritmo calmo; no padrão (0.78) toca em 1.0x nativo sem distorção
      const targetRate = options.rate ?? 0.78;
      audio.preservesPitch = true;
      audio.playbackRate = Math.max(0.7, Math.min(1.35, targetRate / 0.78));
      audio.onended = () => {
        if (myToken !== playbackToken) return;
        if (activeAudioElement === audio) activeAudioElement = null;
        options.onEnd?.();
      };
      audio.onerror = () => {
        if (myToken !== playbackToken) return;
        if (activeAudioElement === audio) activeAudioElement = null;
        // Só usa fallback se o token continuar ativo e o arquivo não puder carregar
        fallbackSpeechSynthesis(text, options, myToken);
      };
      audio.play().catch((err: unknown) => {
        if (myToken !== playbackToken) return;
        // Nunca dispara voz robótica duplicada quando o áudio foi interrompido (AbortError) ou bloqueado por autoplay (NotAllowedError)
        const name = err instanceof Error ? err.name : '';
        if (name === 'AbortError' || name === 'NotAllowedError') {
          return;
        }
        fallbackSpeechSynthesis(text, options, myToken);
      });
      return true;
    } catch {
      // Cai no fallback apenas em erro síncrono inesperado
    }
  }

  stopSpeaking();
  return fallbackSpeechSynthesis(text, options, playbackToken);
}

function fallbackSpeechSynthesis(text: string, options: SpeakOptions = {}, token = playbackToken): boolean {
  if (token !== playbackToken) return false;
  if (!isSpeechSynthesisSupported()) {
    options.onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = options.rate ?? 0.78;
    utterance.pitch = options.pitch ?? 1.12;

    const voice = getBestPtBrFemaleVoice(options.voiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    if (options.onWordIndex) {
      const words = text.split(/\s+/);
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const upto = text.slice(0, event.charIndex).trim();
          const idx = upto ? upto.split(/\s+/).length : 0;
          if (idx < words.length) {
            options.onWordIndex?.(idx);
          }
        }
      };
    }

    utterance.onend = () => {
      options.onEnd?.();
    };
    utterance.onerror = () => {
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    options.onEnd?.();
    return false;
  }
}

export function speakLetterSound(phonemeHint: string, anchorWord?: string, rate = 0.74): boolean {
  const phrase = anchorWord ? `${phonemeHint}... como em ${anchorWord}!` : phonemeHint;
  return speak(phrase, { rate, pitch: 1.15 });
}

export function speakWord(word: string, rate = 0.78): boolean {
  return speak(word.toLowerCase(), { rate, pitch: 1.12 });
}

export function speakSyllable(syllable: string, rate = 0.78): boolean {
  const spoken = getSpokenSyllableText(syllable);
  return speak(spoken, { rate, pitch: 1.12 });
}

export function speakSentence(sentence: string, options: SpeakOptions = {}): boolean {
  return speak(sentence, { rate: options.rate ?? 0.78, pitch: options.pitch ?? 1.12, ...options });
}
