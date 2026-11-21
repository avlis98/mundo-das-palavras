// Serviço opcional de reconhecimento de fala (Web Speech API)
// Regra pedagógica: nunca punir a criança por falha de microfone, ruído ou sotaque.

export interface SpeechRecognitionResultData {
  status: 'matched' | 'uncertain' | 'no-speech' | 'unsupported' | 'error';
  transcript: string;
  confidence: number;
}

interface BrowserSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionConstructor(): (new () => BrowserSpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionConstructor() !== null;
}

export function normalizePortugueseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function isSpokenMatch(transcript: string, expected: string): boolean {
  const normSpoken = normalizePortugueseText(transcript);
  const normExpected = normalizePortugueseText(expected);
  if (!normSpoken || !normExpected) return false;
  if (normSpoken === normExpected || normSpoken.includes(normExpected)) return true;

  // Tolerância fonética leve para pronúncia infantil
  const words = normSpoken.split(/\s+/);
  for (const w of words) {
    const maxDist = normExpected.length <= 4 ? 1 : 2;
    if (levenshtein(w, normExpected) <= maxDist) return true;
  }
  return false;
}

export function listenForSpeech(expectedText: string, timeoutMs = 6000): Promise<SpeechRecognitionResultData> {
  const Recognition = getRecognitionConstructor();
  if (!Recognition) {
    return Promise.resolve({ status: 'unsupported', transcript: '', confidence: 0 });
  }

  return new Promise((resolve) => {
    let settled = false;
    const rec = new Recognition();
    rec.lang = 'pt-BR';
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;

    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          rec.stop();
        } catch {
          // ignore
        }
        resolve({ status: 'no-speech', transcript: '', confidence: 0 });
      }
    }, timeoutMs);

    rec.onresult = (event) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);

      const firstList = event.results?.[0];
      if (!firstList || firstList.length === 0) {
        resolve({ status: 'no-speech', transcript: '', confidence: 0 });
        return;
      }

      let bestTranscript = firstList[0].transcript || '';
      let bestConfidence = firstList[0].confidence ?? 0.5;

      for (let i = 0; i < firstList.length; i++) {
        const alt = firstList[i];
        if (isSpokenMatch(alt.transcript, expectedText)) {
          resolve({
            status: 'matched',
            transcript: alt.transcript,
            confidence: alt.confidence ?? 0.8,
          });
          return;
        }
      }

      resolve({
        status: 'uncertain',
        transcript: bestTranscript,
        confidence: bestConfidence,
      });
    };

    rec.onerror = (ev) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (ev.error === 'no-speech') {
        resolve({ status: 'no-speech', transcript: '', confidence: 0 });
      } else {
        resolve({ status: 'error', transcript: '', confidence: 0 });
      }
    };

    rec.onend = () => {
      if (!settled) {
        settled = true;
        window.clearTimeout(timer);
        resolve({ status: 'no-speech', transcript: '', confidence: 0 });
      }
    };

    try {
      rec.start();
    } catch {
      if (!settled) {
        settled = true;
        window.clearTimeout(timer);
        resolve({ status: 'error', transcript: '', confidence: 0 });
      }
    }
  });
}
