import type { LetterItem } from '../types';

// Pronúncias fonéticas revisadas para soar 100% naturais e coerentes na voz pt-BR-FranciscaNeural
export const ALPHABET: LetterItem[] = [
  { letter: 'A', lowercase: 'a', name: 'á', phonemeHint: 'Som de á', phonemeDisplay: '/a/', isVowel: true, anchorWord: 'ABELHA', anchorEmoji: '🐝', similarLetters: ['E', 'O'], level: 1 },
  { letter: 'B', lowercase: 'b', name: 'bê', phonemeHint: 'Som da letra bê, b', phonemeDisplay: '/b/', isVowel: false, anchorWord: 'BOLA', anchorEmoji: '⚽', similarLetters: ['P', 'D'], level: 1 },
  { letter: 'C', lowercase: 'c', name: 'cê', phonemeHint: 'Som forte da letra cê, cá', phonemeDisplay: '/k/', isVowel: false, anchorWord: 'CASA', anchorEmoji: '🏠', similarLetters: ['G', 'Q', 'S'], level: 1 },
  { letter: 'D', lowercase: 'd', name: 'dê', phonemeHint: 'Som da letra dê, dá', phonemeDisplay: '/d/', isVowel: false, anchorWord: 'DADO', anchorEmoji: '🎲', similarLetters: ['B', 'T'], level: 1 },
  { letter: 'E', lowercase: 'e', name: 'é', phonemeHint: 'Som de é, ou ê', phonemeDisplay: '/e/', isVowel: true, anchorWord: 'ELEFANTE', anchorEmoji: '🐘', similarLetters: ['A', 'I'], level: 1 },
  { letter: 'F', lowercase: 'f', name: 'éfe', phonemeHint: 'Som de soprinho da letra éfe, fá', phonemeDisplay: '/f/', isVowel: false, anchorWord: 'FOCA', anchorEmoji: '🦭', similarLetters: ['V', 'T'], level: 1 },
  { letter: 'G', lowercase: 'g', name: 'gê', phonemeHint: 'Som da letra gê, gá', phonemeDisplay: '/g/', isVowel: false, anchorWord: 'GATO', anchorEmoji: '🐱', similarLetters: ['C', 'J'], level: 1 },
  { letter: 'H', lowercase: 'h', name: 'agá', phonemeHint: 'A letra agá no começo não tem som', phonemeDisplay: '/∅/', isVowel: false, anchorWord: 'HIPOPÓTAMO', anchorEmoji: '🦛', similarLetters: ['N', 'M'], level: 2 },
  { letter: 'I', lowercase: 'i', name: 'i', phonemeHint: 'Som de i', phonemeDisplay: '/i/', isVowel: true, anchorWord: 'ILHA', anchorEmoji: '🏝️', similarLetters: ['E', 'L'], level: 1 },
  { letter: 'J', lowercase: 'j', name: 'jóta', phonemeHint: 'Som da letra jóta, já', phonemeDisplay: '/ʒ/', isVowel: false, anchorWord: 'JACARÉ', anchorEmoji: '🐊', similarLetters: ['G', 'X'], level: 2 },
  { letter: 'K', lowercase: 'k', name: 'cá', phonemeHint: 'Som da letra cá, qui', phonemeDisplay: '/k/', isVowel: false, anchorWord: 'KIWI', anchorEmoji: '🥝', similarLetters: ['C', 'Q'], level: 2 },
  { letter: 'L', lowercase: 'l', name: 'éle', phonemeHint: 'Som da letra éle, lá', phonemeDisplay: '/l/', isVowel: false, anchorWord: 'LUA', anchorEmoji: '🌙', similarLetters: ['I', 'R'], level: 1 },
  { letter: 'M', lowercase: 'm', name: 'ême', phonemeHint: 'Som da letra ême, má', phonemeDisplay: '/m/', isVowel: false, anchorWord: 'MALA', anchorEmoji: '🧳', similarLetters: ['N', 'H'], level: 1 },
  { letter: 'N', lowercase: 'n', name: 'êne', phonemeHint: 'Som da letra êne, ná', phonemeDisplay: '/n/', isVowel: false, anchorWord: 'NAVIO', anchorEmoji: '🚢', similarLetters: ['M', 'H'], level: 1 },
  { letter: 'O', lowercase: 'o', name: 'ó', phonemeHint: 'Som de ó, ou ô', phonemeDisplay: '/o/', isVowel: true, anchorWord: 'OVO', anchorEmoji: '🥚', similarLetters: ['U', 'A'], level: 1 },
  { letter: 'P', lowercase: 'p', name: 'pê', phonemeHint: 'Som da letra pê, pá', phonemeDisplay: '/p/', isVowel: false, anchorWord: 'PATO', anchorEmoji: '🦆', similarLetters: ['B', 'T'], level: 1 },
  { letter: 'Q', lowercase: 'q', name: 'quê', phonemeHint: 'Som da letra quê, que', phonemeDisplay: '/k/', isVowel: false, anchorWord: 'QUEIJO', anchorEmoji: '🧀', similarLetters: ['C', 'G'], level: 2 },
  { letter: 'R', lowercase: 'r', name: 'érre', phonemeHint: 'Som forte da letra érre, rá', phonemeDisplay: '/ʁ/', isVowel: false, anchorWord: 'RATO', anchorEmoji: '🐭', similarLetters: ['L', 'B'], level: 1 },
  { letter: 'S', lowercase: 's', name: 'ésse', phonemeHint: 'Som da letra ésse, sá', phonemeDisplay: '/s/', isVowel: false, anchorWord: 'SAPO', anchorEmoji: '🐸', similarLetters: ['Z', 'C'], level: 1 },
  { letter: 'T', lowercase: 't', name: 'tê', phonemeHint: 'Som da letra tê, tá', phonemeDisplay: '/t/', isVowel: false, anchorWord: 'TATU', anchorEmoji: '🦔', similarLetters: ['D', 'P'], level: 1 },
  { letter: 'U', lowercase: 'u', name: 'u', phonemeHint: 'Som de u', phonemeDisplay: '/u/', isVowel: true, anchorWord: 'UVA', anchorEmoji: '🍇', similarLetters: ['O', 'V'], level: 1 },
  { letter: 'V', lowercase: 'v', name: 'vê', phonemeHint: 'Som da letra vê, vá', phonemeDisplay: '/v/', isVowel: false, anchorWord: 'VACA', anchorEmoji: '🐄', similarLetters: ['F', 'U'], level: 1 },
  { letter: 'W', lowercase: 'w', name: 'dáblio', phonemeHint: 'Som da letra dáblio, uá', phonemeDisplay: '/w/', isVowel: false, anchorWord: 'WAFFLE', anchorEmoji: '🧇', similarLetters: ['V', 'M'], level: 2 },
  { letter: 'X', lowercase: 'x', name: 'xis', phonemeHint: 'Som da letra xis, chá', phonemeDisplay: '/ʃ/', isVowel: false, anchorWord: 'XÍCARA', anchorEmoji: '☕', similarLetters: ['S', 'J'], level: 2 },
  { letter: 'Y', lowercase: 'y', name: 'ípsilon', phonemeHint: 'Som da letra ípsilon, i', phonemeDisplay: '/i/', isVowel: false, anchorWord: 'YAKISSOBA', anchorEmoji: '🍜', similarLetters: ['I', 'V'], level: 2 },
  { letter: 'Z', lowercase: 'z', name: 'zê', phonemeHint: 'Som da letra zê, zá', phonemeDisplay: '/z/', isVowel: false, anchorWord: 'ZEBRA', anchorEmoji: '🦓', similarLetters: ['S', 'X'], level: 2 },
];

export const VOWELS = ALPHABET.filter((l) => l.isVowel);
export const CONSONANTS = ALPHABET.filter((l) => !l.isVowel);

export const SIMPLE_SYLLABLES: string[] = [
  'BA', 'BE', 'BI', 'BO', 'BU',
  'CA', 'CE', 'CI', 'CO', 'CU',
  'DA', 'DE', 'DI', 'DO', 'DU',
  'FA', 'FE', 'FI', 'FO', 'FU',
  'GA', 'GE', 'GI', 'GO', 'GU',
  'JA', 'JE', 'JI', 'JO', 'JU',
  'LA', 'LE', 'LI', 'LO', 'LU',
  'MA', 'ME', 'MI', 'MO', 'MU',
  'NA', 'NE', 'NI', 'NO', 'NU',
  'PA', 'PE', 'PI', 'PO', 'PU',
  'RA', 'RE', 'RI', 'RO', 'RU',
  'SA', 'SE', 'SI', 'SO', 'SU',
  'TA', 'TE', 'TI', 'TO', 'TU',
  'VA', 'VE', 'VI', 'VO', 'VU',
];

// Mapa fonético para sílabas isoladas soarem com pronúncia escolar clara (evitando leitura como sigla ou preposição átona)
const SYLLABLE_PHONETIC_MAP: Record<string, string> = {
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

export function getSpokenSyllableText(syllable: string): string {
  const upper = syllable.trim().toUpperCase();
  return SYLLABLE_PHONETIC_MAP[upper] ?? upper.toLowerCase();
}
