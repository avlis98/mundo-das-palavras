import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outAudioDir = path.join(rootDir, 'public', 'audio');
const manifestPath = path.join(rootDir, 'src', 'content', 'audioManifest.ts');

fs.mkdirSync(outAudioDir, { recursive: true });

function normalizeAudioKey(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function readTsArrayStrings(filePath, regex) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  let m;
  while ((m = regex.exec(content)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

const SYLLABLE_PHONETIC_MAP = {
  BA: 'bá', BE: 'bé', BI: 'bi', BO: 'bó', BU: 'bu',
  CA: 'cá', CE: 'cé', CI: 'ci', CO: 'có', CU: 'cu',
  DA: 'dá', DE: 'dé', DI: 'di', DO: 'dó', DU: 'du',
  FA: 'fá', FE: 'fé', FI: 'fi', FO: 'fó', FU: 'fu',
  GA: 'gá', GE: 'gé', GI: 'gi', GO: 'gó', GU: 'gu',
  JA: 'já', JE: 'jé', JI: 'ji', JO: 'jó', JU: 'ju',
  LA: 'lá', LE: 'lé', LI: 'li', LO: 'ló', LU: 'lu',
  MA: 'má', ME: 'mé', MI: 'mi', MO: 'mó', MU: 'mu',
  NA: 'ná', NE: 'né', NI: 'ni', NO: 'nó', NU: 'nu',
  PA: 'pá', PE: 'pé', PI: 'pi', PO: 'pó', PU: 'pu',
  RA: 'rá', RE: 'ré', RI: 'ri', RO: 'ró', RU: 'ru',
  SA: 'sá', SE: 'sé', SI: 'si', SO: 'só', SU: 'su',
  TA: 'tá', TE: 'té', TI: 'ti', TO: 'tó', TU: 'tu',
  VA: 'vá', VE: 'vé', VI: 'vi', VO: 'vó', VU: 'vu',
  ZA: 'zá', ZE: 'zé', ZI: 'zi', ZO: 'zó', ZU: 'zu',
  CHA: 'chá', CHE: 'ché', CHI: 'chi', CHO: 'chó', CHU: 'chu',
  LHA: 'lhá', LHE: 'lhé', LHI: 'lhi', LHO: 'lhó', LHU: 'lhu',
  NHA: 'nhá', NHE: 'nhé', NHI: 'nhi', NHO: 'nhó', NHU: 'nhu',
};

function spokenSyllable(syl) {
  const upper = syl.trim().toUpperCase();
  return SYLLABLE_PHONETIC_MAP[upper] ?? upper.toLowerCase();
}

// Mapa: texto normalizado -> { text, rate }
const itemsMap = new Map();
function addItem(text, rate = '-8%') {
  const key = normalizeAudioKey(text);
  if (!key) return;
  // Se já existe como história lenta (-18%), mantém o mais lento
  if (itemsMap.has(key) && itemsMap.get(key).rate === '-18%') return;
  itemsMap.set(key, { text, rate });
}

// 1. Falas da Lumi
for (const p of readTsArrayStrings(path.join(rootDir, 'src', 'content', 'lumiPhrases.ts'), /:\s*\r?\n?\s*'([^']+)'/g)) {
  addItem(p, '-8%');
}

// 2. Letras, fonemas revisados e perguntas de som inicial
const lettersContent = fs.readFileSync(path.join(rootDir, 'src', 'content', 'letters.ts'), 'utf8');
const letterRegex = /letter:\s*'([A-Z])'[^}]+phonemeHint:\s*'([^']+)'[^}]+anchorWord:\s*'([^']+)'/g;
let lm;
while ((lm = letterRegex.exec(lettersContent)) !== null) {
  const letter = lm[1];
  const hint = lm[2];
  const anchor = lm[3];
  addItem(`${hint}... como em ${anchor}!`, '-10%');
  addItem(hint, '-10%');
  addItem(`Qual palavra começa com o som da letra ${letter}? ${hint}`, '-8%');
}

// 3. Todas as sílabas simples + combinações da Fábrica de Sílabas (com grafia fonética limpa)
const simpleSylMatch = lettersContent.match(/SIMPLE_SYLLABLES:\s*string\[\]\s*=\s*\[([\s\S]*?)\];/);
if (simpleSylMatch) {
  for (const s of simpleSylMatch[1].matchAll(/'([^']+)'/g)) {
    addItem(spokenSyllable(s[1]), '-10%');
  }
}
for (const c of ['B', 'C', 'D', 'F', 'G', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V']) {
  for (const v of ['A', 'E', 'I', 'O', 'U']) {
    addItem(spokenSyllable(`${c}${v}`), '-10%');
  }
}

// 4. Palavras e suas sílabas individuais
const wordsContent = fs.readFileSync(path.join(rootDir, 'src', 'content', 'words.ts'), 'utf8');
for (const w of readTsArrayStrings(path.join(rootDir, 'src', 'content', 'words.ts'), /word:\s*'([^']+)'/g)) {
  addItem(w.toLowerCase(), '-10%');
}
for (const blockMatch of wordsContent.matchAll(/syllables:\s*\[([^\]]+)\]/g)) {
  for (const s of blockMatch[1].matchAll(/'([^']+)'/g)) {
    addItem(spokenSyllable(s[1]), '-10%');
  }
}

// 5. Frases (Mundo 5 e jogos)
for (const s of readTsArrayStrings(path.join(rootDir, 'src', 'content', 'sentences.ts'), /text:\s*'([^']+)'/g)) {
  addItem(s, '-12%');
}

// 6. Pequenas Histórias (velocidade mais calma: -18% nativo!)
const storiesContent = fs.readFileSync(path.join(rootDir, 'src', 'content', 'stories.ts'), 'utf8');
const sentencesBlockRegex = /sentences:\s*\[([\s\S]*?)\]/g;
let sm;
while ((sm = sentencesBlockRegex.exec(storiesContent)) !== null) {
  const block = sm[1];
  const itemRegex = /'([^']+)'/g;
  const storySentences = [];
  let im;
  while ((im = itemRegex.exec(block)) !== null) {
    addItem(im[1], '-18%');
    storySentences.push(im[1]);
  }
  if (storySentences.length > 0) {
    addItem(storySentences.join(' '), '-18%');
  }
}

// 7. Mundos 8, 9 e 10 (src/content/advancedWorlds.ts)
const advPath = path.join(rootDir, 'src', 'content', 'advancedWorlds.ts');
const advContent = fs.readFileSync(advPath, 'utf8');
for (const w of readTsArrayStrings(advPath, /fullWord:\s*'([^']+)'/g)) {
  addItem(w.toLowerCase(), '-10%');
}
for (const ex of readTsArrayStrings(advPath, /(?:example|spokenSentence|text):\s*'([^']+)'/g)) {
  addItem(ex, '-12%');
}
for (const exp of readTsArrayStrings(advPath, /(?:spokenExplanation:|INTONATION_LAB_EXPLANATION\s*=)\s*\r?\n?\s*'([^']+)'/g)) {
  addItem(exp, '-12%');
}
const linesBlockRegex = /lines:\s*\[([\s\S]*?)\]/g;
let rcm;
while ((rcm = linesBlockRegex.exec(advContent)) !== null) {
  const block = rcm[1];
  const lines = [];
  for (const l of block.matchAll(/'([^']+)'/g)) {
    addItem(l[1], '-18%');
    lines.push(l[1]);
  }
  if (lines.length > 0) {
    addItem(lines.join(' '), '-18%');
  }
}

// 8. Mundos (goals), Diagnóstico e Instruções dos Jogos
for (const t of readTsArrayStrings(path.join(rootDir, 'src', 'content', 'worldsAndRewards.ts'), /(?:goal|spokenText):\s*'([^']+)'/g)) {
  addItem(t, '-8%');
}
for (const t of readTsArrayStrings(path.join(rootDir, 'src', 'games', 'gameCatalog.ts'), /instructions:\s*'([^']+)'/g)) {
  addItem(t, '-8%');
}

function hashFileName(text, rate) {
  const hash = crypto
    .createHash('sha1')
    .update(`francisca-v4|${rate}|${normalizeAudioKey(text)}`)
    .digest('hex')
    .slice(0, 12);
  return `a-${hash}.mp3`;
}

const entries = Array.from(itemsMap.values());
const expectedFiles = new Set(entries.map((e) => hashFileName(e.text, e.rate)));
for (const f of fs.readdirSync(outAudioDir)) {
  if (/\.mp3$/.test(f) && !expectedFiles.has(f)) {
    fs.unlinkSync(path.join(outAudioDir, f));
  }
}

console.log(`Gerando/verificando ${entries.length} áudios (pt-BR-FranciscaNeural, histórias em -18%)...`);

const manifest = {};
const CONCURRENCY = 4;
let index = 0;

async function worker() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('pt-BR-FranciscaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  while (true) {
    const current = index++;
    if (current >= entries.length) break;
    const { text, rate } = entries[current];
    const fileName = hashFileName(text, rate);
    const filePath = path.join(outAudioDir, fileName);

    if (!fs.existsSync(filePath)) {
      let ok = false;
      for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
        try {
          const { audioStream } = tts.toStream(text, { rate, pitch: '+0Hz' });
          const chunks = [];
          for await (const chunk of audioStream) {
            chunks.push(chunk);
          }
          fs.writeFileSync(filePath, Buffer.concat(chunks));
          ok = true;
        } catch (err) {
          if (attempt === 3) {
            console.error(`Falha definitiva em "${text}":`, err.message);
          } else {
            await tts.setMetadata('pt-BR-FranciscaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
          }
        }
      }
      if (!ok) continue;
    }
    manifest[normalizeAudioKey(text)] = `/audio/${fileName}`;
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

const tsOutput = `// Arquivo gerado automaticamente por scripts/generate-audio.mjs
// Mapeia textos normalizados para áudios neurais naturais em pt-BR (Francisca Neural)

export const AUDIO_MANIFEST: Record<string, string> = ${JSON.stringify(manifest, null, 2)};
`;

fs.writeFileSync(manifestPath, tsOutput, 'utf8');
console.log(`Concluído! ${Object.keys(manifest).length} áudios prontos em public/audio/.`);
