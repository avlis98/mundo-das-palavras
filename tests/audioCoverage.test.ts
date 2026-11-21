import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  INTONATION_LAB,
  INTONATION_LAB_EXPLANATION,
  ORTHOGRAPHY_EXERCISES,
  PUNCTUATION_EXERCISES,
  PUNCTUATION_GUIDE,
  READING_CLUB_TEXTS,
} from '../src/content/advancedWorlds';
import { AUDIO_MANIFEST } from '../src/content/audioManifest';
import { ALPHABET, getSpokenSyllableText, SIMPLE_SYLLABLES } from '../src/content/letters';
import { LUMI_PHRASES } from '../src/content/lumiPhrases';
import { SENTENCES_BANK } from '../src/content/sentences';
import { STORIES_BANK } from '../src/content/stories';
import { WORDS_BANK } from '../src/content/words';
import { DIAGNOSTIC_QUESTIONS, WORLDS } from '../src/content/worldsAndRewards';
import { GAMES_CATALOG } from '../src/games/gameCatalog';

function normalizeKey(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

describe('Cobertura 100% dos áudios neurais (pt-BR-FranciscaNeural)', () => {
  const publicDir = path.resolve(process.cwd(), 'public');

  const requiredTexts: string[] = [
    ...Object.values(LUMI_PHRASES),
    ...WORLDS.map((w) => w.goal),
    ...DIAGNOSTIC_QUESTIONS.map((q) => q.spokenText),
    ...GAMES_CATALOG.map((g) => g.instructions),
    ...ALPHABET.flatMap((l) => [
      `${l.phonemeHint}... como em ${l.anchorWord}!`,
      l.phonemeHint,
      `Qual palavra começa com o som da letra ${l.letter}? ${l.phonemeHint}`,
    ]),
    ...SIMPLE_SYLLABLES.map((s) => getSpokenSyllableText(s)),
    ...['B', 'C', 'D', 'F', 'G', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V'].flatMap((c) =>
      ['A', 'E', 'I', 'O', 'U'].map((v) => getSpokenSyllableText(`${c}${v}`))
    ),
    ...WORDS_BANK.flatMap((w) => [w.word.toLowerCase(), ...w.syllables.map((s) => getSpokenSyllableText(s))]),
    ...SENTENCES_BANK.map((s) => s.text),
    ...STORIES_BANK.flatMap((st) => [...st.sentences, st.sentences.join(' ')]),
    ...ORTHOGRAPHY_EXERCISES.map((o) => o.fullWord.toLowerCase()),
    ...PUNCTUATION_GUIDE.flatMap((p) => [p.example, p.spokenExplanation]),
    INTONATION_LAB_EXPLANATION,
    ...INTONATION_LAB.flatMap((lab) => lab.variants.map((v) => v.text)),
    ...PUNCTUATION_EXERCISES.map((p) => p.spokenSentence),
    ...READING_CLUB_TEXTS.flatMap((rc) => [...rc.lines, rc.lines.join(' ')]),
  ];

  it('todas as falas, letras, sílabas, palavras, frases, histórias e mundos 8-10 existem no AUDIO_MANIFEST e em public/audio/', () => {
    const missingFromManifest: string[] = [];
    const missingFiles: string[] = [];

    for (const text of requiredTexts) {
      const key = normalizeKey(text);
      const audioUrl = AUDIO_MANIFEST[key];
      if (!audioUrl) {
        missingFromManifest.push(text);
        continue;
      }
      const absPath = path.join(publicDir, audioUrl.replace(/^\//, ''));
      if (!fs.existsSync(absPath) || fs.statSync(absPath).size < 500) {
        missingFiles.push(`${text} -> ${audioUrl}`);
      }
    }

    expect(missingFromManifest).toEqual([]);
    expect(missingFiles).toEqual([]);
  });
});
