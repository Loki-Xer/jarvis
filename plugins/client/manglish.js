const getAxios = () => {
  try {
    return require("axios");
  } catch (e) {
    return null;
  }
};

function isMalayalam(text) {
  if (!text || typeof text !== "string") return false;
  return /[\u0D00-\u0D7F]/.test(text);
}

const STRONG_WORDS = [
  "ente", "ninte", "ningal", "ningalude", "njan", "njaan", "nee", "naam",
  "avan", "aval", "avar", "avarude", "avanude", "avalude", "ivan", "ival",
  "enik", "enikku", "ninakku", "ninnodu", "ennodu", "avanodu",
  "ithu", "athu", "ivide", "avide", "engane", "evide", "evideya",
  "entha", "enth", "enthaanu", "enthanu", "enthokke", "enthina",
  "cheyy", "cheyyunnu", "cheyyum", "poyi", "pokum", "pokunnu",
  "varu", "varum", "vannu", "varunnu", "vanno",
  "sukham", "sukhama", "sukhamano", "sughamano",
  "alle", "aano", "ano", "aakum", "aayi", "ayirunnu", "aanu",
  "illa", "illathe", "undu", "und", "venam", "venda", "mathi",
  "oru", "randu", "moonnu", "naalu", "anju", "aaru", "ezhu", "ettu",
  "ombathu", "pathu",
  "inn", "innu", "nale", "nalle", "ippo", "ippol", "ippozhum", "pinne",
  "chetta", "chechi", "ikka", "mone", "mole", "aliya", "eda", "edi",
  "adipoli", "poli", "kollam", "myre",
];

const STRONG_SET = new Set(STRONG_WORDS);

const WORD_MARKERS = [
  [/zh/, 2],
  [/(tth|ddh|cch|ndh)/, 2],
  [/(bh|dh|kh)/, 1],
  [/(kk|tt|pp|mm|nn|cch|nj)[au]/, 1],
  [/aa/, 1],
  [/(unnu|aanu|athu|ikkum|ichu|chu|illa|aayi|aalum|yude|ilum|kkum|llam|ppol)$/, 2],
  [/^.{2,}[^aeiouy]u$/, 1], // 4+ letters ending in consonant + "u"
];

const hasLatinLetterRegex = /[a-z]/i;

function analyzeManglish(text) {
  const empty = { score: 0, strongScore: 0, signalWords: 0, wordCount: 0 };
  if (!text || typeof text !== "string") return empty;

  const value = text.trim().toLowerCase();
  if (!value || isMalayalam(value) || !hasLatinLetterRegex.test(value)) return empty;

  const words = value.split(/[^a-z]+/).filter(Boolean);
  const seenStrong = new Set();
  let score = 0;
  let strongScore = 0;
  let signalWords = 0;

  for (const word of words) {
    if (STRONG_SET.has(word)) {
      signalWords++;
      if (!seenStrong.has(word)) {
        seenStrong.add(word);
        strongScore += 3;
      }
      continue;
    }

    let points = 0;
    for (const [regex, weight] of WORD_MARKERS) {
      if (regex.test(word)) points += weight;
    }
    if (points) {
      signalWords++;
      score += Math.min(points, 3); // cap per word
    }
  }

  return { score: score + strongScore, strongScore, signalWords, wordCount: words.length };
}

function getManglishScore(text) {
  return analyzeManglish(text).score;
}

function isManglish(text) {
  const { score, strongScore, signalWords, wordCount } = analyzeManglish(text);

  if (wordCount <= 3) return strongScore >= 3 || score >= 5;

  return strongScore >= 6 || (score >= 4 && signalWords / wordCount >= 0.2);
}


const VIRAMA = "\u0D4D"; // ്

const INDEPENDENT_VOWELS = {
  അ: "a", ആ: "aa", ഇ: "i", ഈ: "ee", ഉ: "u", ഊ: "oo", ഋ: "ru",
  എ: "e", ഏ: "e", ഐ: "ai", ഒ: "o", ഓ: "o", ഔ: "au",
  ഄ: "a", ഌ: "lu", ൠ: "ruu", ൡ: "luu", ൟ: "ee", // rare / archaic
};

const VOWEL_SIGNS = {
  "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ru",
  "െ": "e", "േ": "e", "ൈ": "ai", "ൊ": "o", "ോ": "o",
  "ൌ": "au", // U+0D4C vowel sign AU
  "ൗ": "au", // U+0D57 AU length mark
  "ൄ": "ruu", "ൢ": "lu", "ൣ": "luu", // rare vocalic signs
};

const CONSONANTS = {
  ക: "k", ഖ: "kh", ഗ: "g", ഘ: "gh", ങ: "ng",
  ച: "ch", ഛ: "chh", ജ: "j", ഝ: "jh", ഞ: "nj",
  ട: "t", ഠ: "tt", ഡ: "d", ഢ: "dh", ണ: "n",
  ത: "th", ഥ: "th", ദ: "d", ധ: "dh", ന: "n",
  പ: "p", ഫ: "ph", ബ: "b", ഭ: "bh", മ: "m",
  യ: "y", ര: "r", ല: "l", വ: "v", ശ: "sh", ഷ: "sh", സ: "s", ഹ: "h",
  ള: "l", ഴ: "zh", റ: "r",
  ഩ: "n", ഺ: "tt", // archaic NNNA / TTTA
};

const CHILLUS = {
  "ൺ": "n", // U+0D7A
  "ൻ": "n", // U+0D7B
  "ർ": "r", // U+0D7C
  "ൽ": "l", // U+0D7D
  "ൾ": "l", // U+0D7E
  "ൿ": "k", // U+0D7F
  "ൔ": "m", "ൕ": "y", "ൖ": "zh", // historic chillus (M, Y, LLL)
  "ൎ": "r", // dot reph (precedes the consonant it sits over)
};

const CHILLU_FROM_ZWJ = {
  ണ: "ൺ", ന: "ൻ", ര: "ർ", ല: "ൽ", ള: "ൾ", ക: "ൿ",
};

const CLUSTERS = {
  ക്ക: "kk", ഗ്ഗ: "gg", ങ്ങ: "ng", ങ്ക: "nk",
  ച്ച: "cch", ജ്ജ: "jj", ഞ്ഞ: "nj", ഞ്ച: "nch",
  ട്ട: "tt", ണ്ണ: "nn", ണ്ട: "nd",
  ത്ത: "tth", ദ്ദ: "dd", ദ്ധ: "ddh", ന്ന: "nn", ന്ത: "nth", ന്റ: "nt",
  ബ്ബ: "bb", പ്പ: "pp", മ്മ: "mm", മ്പ: "mp",
  യ്യ: "yy", ല്ല: "ll", ള്ള: "ll", വ്വ: "vv",
  ശ്ശ: "ssh", സ്സ: "ss", ക്സ: "ks", ക്ഷ: "ksh", റ്റ: "tt",
};

const MALAYALAM_DIGITS = "൦൧൨൩൪൫൬൭൮൯";

const NUMBER_SYMBOLS = {
  "൰": "10", "൱": "100", "൲": "1000",
  "൳": "1/4", "൴": "1/2", "൵": "3/4",
  "൶": "1/16", "൷": "1/8", "൸": "3/16",
};

const SILENT_MARKS = new Set([
  VIRAMA, "\u0D00", "\u0D3B", "\u0D3C", "\u0D4F", "\u0D79",
  "\u0D58", "\u0D59", "\u0D5A", "\u0D5B", "\u0D5C", "\u0D5D", "\u0D5E",
]);

function normalizeMalayalam(text) {
  return text
    // consonant + virama + ZWJ  ->  atomic chillu (must happen BEFORE stripping ZWJ)
    .replace(/([ണനരലളക])\u0D4D\u200D/g, (_, c) => CHILLU_FROM_ZWJ[c])
    // strip remaining zero-width characters
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
}

const malayalamToManglish = (input) => {
  if (!input || typeof input !== "string") return false;

  const s = normalizeMalayalam(input);
  let out = "";
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    // Independent vowels
    if (INDEPENDENT_VOWELS[ch] !== undefined) {
      out += INDEPENDENT_VOWELS[ch];
      i++;
      continue;
    }

    // Chillus
    if (CHILLUS[ch] !== undefined) {
      out += CHILLUS[ch];
      i++;
      continue;
    }

    // Consonant (possibly a conjunct chain: C ് C ് C ...)
    if (CONSONANTS[ch] !== undefined) {
      let prefix = "";
      let tail = CONSONANTS[ch];
      let last = ch;
      i++;

      while (s[i] === VIRAMA && CONSONANTS[s[i + 1]] !== undefined) {
        const next = s[i + 1];
        const cluster = CLUSTERS[last + VIRAMA + next];
        if (cluster !== undefined) {
          tail = cluster;
        } else {
          prefix += tail;
          tail = CONSONANTS[next];
        }
        last = next;
        i += 2;
      }

      let syllable = prefix + tail;
      const nx = s[i];

      if (nx === VIRAMA) {
        // chandrakkala / samvruthokaram: word-final or before non-consonant -> "u"
        syllable += "u";
        i++;
      } else if (VOWEL_SIGNS[nx] !== undefined) {
        syllable += VOWEL_SIGNS[nx];
        i++;
        if (s[i] === VIRAMA) i++; // e.g. ു്
      } else {
        syllable += "a"; // inherent vowel
      }

      out += syllable;
      continue;
    }

    if (ch === "ം" || ch === "ഁ") { out += "m"; i++; continue; } // anusvara / candrabindu
    if (ch === "ഽ" || SILENT_MARKS.has(ch)) { i++; continue; } // avagraha / stray marks (silent)
    if (NUMBER_SYMBOLS[ch] !== undefined) { out += NUMBER_SYMBOLS[ch]; i++; continue; }
    if (VOWEL_SIGNS[ch] !== undefined) { out += VOWEL_SIGNS[ch]; i++; continue; } // stray vowel sign
    if (ch === "ഃ") { out += "h"; i++; continue; }

    const digit = MALAYALAM_DIGITS.indexOf(ch);
    if (digit !== -1) { out += String(digit); i++; continue; }

    // Anything else (spaces, punctuation, Latin text) passes through
    out += ch;
    i++;
  }

  return out.replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (m) => m.toUpperCase());
};


const manglishToMalayalam = async (text) => {
  if (!text || typeof text !== "string") return false;

  try {
    const axios = getAxios();
    if (!axios) return false;

    const { data } = await axios.get("https://inputtools.google.com/request", {
      params: {
        text: text.trim(),
        itc: "ml-t-i0-und",
        num: 5,
        cp: 0,
        cs: 1,
        ie: "utf-8",
        oe: "utf-8",
      },
      timeout: 10000,
    });

    if (!Array.isArray(data) || data[0] !== "SUCCESS") return false;

    const suggestions = data[1]?.[0]?.[1];
    if (!Array.isArray(suggestions) || !suggestions[0]) return false;

    return suggestions[0];
  } catch (err) {
    console.log(err.message);
    return false;
  }
};

module.exports = {
  malayalamToManglish,
  manglishToMalayalam,
  isMalayalam,
  isManglish,
  getManglishScore,
};
