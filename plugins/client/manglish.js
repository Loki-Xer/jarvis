"use strict";

const MALAYALAM_RANGE = /[\u0D00-\u0D7F]/u;
const MALAYALAM_RUN = /[\u0D00-\u0D7F]+/gu;
const VIRAMA = "\u0D4D";
const INVISIBLE_CHARS = /[\u200B\u200C\u200D\u2060\uFEFF]/gu;
const GOOGLE_ENDPOINT = "https://inputtools.google.com/request";
const REQUEST_TIMEOUT_MS = 10000;

const isString = (value) => typeof value === "string";

function cleanText(value) {
    if (!isString(value)) return "";
    return value.normalize("NFC").replace(/\r\n?/g, "\n");
}

function isMalayalam(text) {
    return isString(text) && MALAYALAM_RANGE.test(text);
}

function containsLatin(text) {
    return isString(text) && /[a-z]/i.test(text);
}

function isOnlyMalayalam(text) {
    if (!isString(text) || !text.trim()) return false;
    return /^[\s\u0D00-\u0D7F.,!?'"“”‘’()[\]{}\-_/]+$/u.test(text);
}

const STRONG_WORDS = new Set([
    "ente", "ninte", "ningal", "ningale", "ningalude", "njan", "njaan",
    "njangal", "njangalk", "njangalkku", "nee", "neey", "naam", "namuk", "namukku",
    "avan", "avanre", "avanude", "aval", "avalude", "avar", "avarude",
    "ivan", "ivante", "ival", "ivalude",
    "enik", "enikku", "enikk", "enikky", "ninakku", "ninnakku",
    "ninnodu", "ennodu", "avanodu", "avalodu",
    "ith", "ithu", "athu", "ath", "ivide", "avide", "ingane", "angane", "engane",
    "evide", "evideya", "evideyaa", "ivideya", "avideya",
    "entha", "enth", "enthaanu", "enthanu", "enthaa", "enthina", "enthinu", "enthokke",
    "aar", "aara", "aaranu", "aarude",
    "engott", "engottu", "evidekku", "eppol", "eppo", "ethra", "ethanu",
    "cheyy", "cheyyuka", "cheyyunnu", "cheyyum", "cheythu", "cheyth", "cheyyano", "cheyyam",
    "poyi", "poy", "pokum", "pokunnu", "pokano", "pokam", "pokan", "poyille",
    "varu", "varum", "varunnu", "vannu", "vann", "vanno", "varano", "varam",
    "sukham", "sukhama", "sukhamano", "sugham", "sughamano",
    "alle", "aano", "ano", "aanu", "aakum", "aayi", "aayirunnu", "ayirunnu",
    "illa", "illaa", "illathe", "illenkil", "undu", "und", "undallo",
    "venam", "venda", "vendaa", "mathi",
    "oru", "rendu", "randu", "moonnu", "munnu", "naalu", "nalu", "anju",
    "aaru", "ezhu", "ettu", "ombathu", "onpathu", "pathu",
    "inn", "innu", "nale", "nalle", "innale", "ippo", "ippol", "ippozhum", "pinne", "pinneyum",
    "chetta", "chechi", "ikka", "ikkaa", "mone", "mole", "aliya", "eda", "edi", "machane", "machaa",
    "adipoli", "poli", "kollam", "pwoli", "polichu", "myre", "myru", "mandan", "mandi",
    "sheri", "seri", "shari", "okke", "ellam", "ellavarum", "ellaam",
    "nanni", "sneham", "ishtam", "ishtapettu", "ariyam", "ariyilla", "ariyamo",
    "thanne", "thanney", "allelo", "allello",
]);

const MANGLISH_MARKERS = [
    [/zh/iu, 3],
    [/chh/iu, 2],
    [/tth/iu, 2],
    [/ddh/iu, 2],
    [/ndh/iu, 2],
    [/(bh|dh|kh|gh|ph)/iu, 1],
    [/(kk|tt|pp|mm|nn|ll|yy|rr|cc)[aeiou]/iu, 1],
    [/(aa|ee|ii|oo|uu|ai|au)/iu, 1],
    [/(unnu|aanu|aannu|athu|ithu|ikkum|ikku|ichu|chu|illa|aayi|yude|ilum|kkum|ppol)$/iu, 2],
    [/(um|am|aan|anu|alle|ano|aano)$/iu, 1],
    [/(njan|njaan|ente|ninte|ningal|enikku|ninakku)$/iu, 3],
];

const EMPTY_ANALYSIS = Object.freeze({
    score: 0,
    strongScore: 0,
    signalWords: 0,
    wordCount: 0,
    confidence: 0,
});

function analyzeManglish(text) {
    if (!isString(text) || !text.trim() || isMalayalam(text) || !containsLatin(text)) {
        return { ...EMPTY_ANALYSIS };
    }

    const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    if (!words.length) return { ...EMPTY_ANALYSIS };

    let score = 0;
    let strongScore = 0;
    let signalWords = 0;
    const seen = new Set();

    for (const word of words) {
        if (STRONG_WORDS.has(word)) {
            signalWords++;
            if (!seen.has(word)) {
                seen.add(word);
                strongScore += 3;
            }
            continue;
        }

        let points = 0;
        for (const [regex, weight] of MANGLISH_MARKERS) {
            if (regex.test(word)) points += weight;
        }

        if (points > 0) {
            signalWords++;
            score += Math.min(points, 4);
        }
    }

    const total = score + strongScore;

    return {
        score: total,
        strongScore,
        signalWords,
        wordCount: words.length,
        confidence: Math.min(1, total / Math.max(words.length * 2, 5)),
    };
}

function getManglishScore(text) {
    return analyzeManglish(text).score;
}

function isManglish(text) {
    const { score, strongScore, signalWords, wordCount } = analyzeManglish(text);

    if (!wordCount) return false;

    const ratio = signalWords / wordCount;

    if (wordCount <= 2) return strongScore >= 3 || score >= 5;
    if (wordCount <= 4) return strongScore >= 3 || (score >= 5 && ratio >= 0.25);
    return strongScore >= 6 || (score >= 5 && ratio >= 0.2);
}

const INDEPENDENT_VOWELS = {
    "അ": "a", "ആ": "aa", "ഇ": "i", "ഈ": "ee", "ഉ": "u", "ഊ": "oo",
    "ഋ": "ru", "എ": "e", "ഏ": "e", "ഐ": "ai", "ഒ": "o", "ഓ": "o", "ഔ": "au",
    "ഄ": "a", "ഌ": "lu", "ൠ": "ruu", "ൡ": "luu", "ൟ": "ee",
};

const VOWEL_SIGNS = {
    "ാ": "aa", "ി": "i", "ീ": "ee", "ു": "u", "ൂ": "oo", "ൃ": "ru",
    "െ": "e", "േ": "e", "ൈ": "ai", "ൊ": "o", "ോ": "o", "ൌ": "au", "ൗ": "au",
    "ൄ": "ruu", "ൢ": "lu", "ൣ": "luu",
};

const CONSONANTS = {
    "ക": "k", "ഖ": "kh", "ഗ": "g", "ഘ": "gh", "ങ": "ng",
    "ച": "ch", "ഛ": "chh", "ജ": "j", "ഝ": "jh", "ഞ": "nj",
    "ട": "t", "ഠ": "d", "ഡ": "d", "ഢ": "dh", "ണ": "n",
    "ത": "th", "ഥ": "th", "ദ": "d", "ധ": "dh", "ന": "n",
    "പ": "p", "ഫ": "ph", "ബ": "b", "ഭ": "bh", "മ": "m",
    "യ": "y", "ര": "r", "ല": "l", "വ": "v",
    "ശ": "sh", "ഷ": "sh", "സ": "s", "ഹ": "h",
    "ള": "l", "ഴ": "zh", "റ": "r", "ഩ": "n",
};

const CHILLUS = {
    "ൺ": "n", "ൻ": "n", "ർ": "r", "ൽ": "l", "ൾ": "l", "ൿ": "k",
    "ൔ": "m", "ൕ": "y", "ൖ": "zh",
};

const CHILLU_FROM_ZWJ = {
    "ണ": "ൺ", "ന": "ൻ", "ര": "ർ", "ല": "ൽ", "ള": "ൾ", "ക": "ൿ",
};

const CLUSTERS = {
    "ക്ക": "kk", "ഗ്ഗ": "gg", "ങ്ങ": "ng", "ങ്ക": "nk",
    "ച്ച": "cch", "ജ്ജ": "jj", "ഞ്ഞ": "nj", "ഞ്ച": "nch",
    "ട്ട": "tt", "ഠ്ഠ": "tth", "ഡ്ഡ": "dd", "ഡ്ഢ": "ddh",
    "ണ്ണ": "nn", "ണ്ട": "nd", "ണ്ഡ": "nd",
    "ത്ത": "thth", "ത്ഥ": "tth", "ദ്ദ": "dd", "ദ്ധ": "ddh",
    "ന്ന": "nn", "ന്ത": "nth", "ന്ധ": "ndh", "ന്ദ": "nd", "ന്റ": "nt",
    "പ്പ": "pp", "ഫ്ഫ": "ff", "ബ്ബ": "bb", "ഭ്ഭ": "bhbh",
    "മ്മ": "mm", "മ്പ": "mp",
    "യ്യ": "yy", "ര്ര": "rr", "ല്ല": "ll", "ള്ള": "ll", "വ്വ": "vv",
    "ശ്ശ": "shsh", "ഷ്ഷ": "shsh", "സ്സ": "ss",
    "ക്സ": "ks", "ക്ഷ": "ksh", "റ്റ": "tt",
    "സ്ത": "stha", "സ്ഥ": "stha", "സ്പ": "spa", "സ്മ": "sma", "സ്വ": "sva",
    "പ്ര": "pra", "പ്ല": "pla", "പ്യ": "pya",
    "ക്ര": "kra", "ക്ല": "kla", "ക്യ": "kya",
    "ഗ്ര": "gra", "ഗ്ല": "gla",
    "ത്ര": "thra", "ദ്ര": "dra", "ധ്ര": "dhra",
    "ബ്ര": "bra", "ബ്ല": "bla",
    "മ്ര": "mra", "മ്ല": "mla",
    "വ്ര": "vra", "വ്ല": "vla",
    "ശ്ര": "shra", "ശ്ല": "shla",
    "സ്ര": "sra", "സ്ല": "sla",
    "ഹ്ര": "hra", "ഹ്ല": "hla",
};

const MALAYALAM_DIGITS = "൦൧൨൩൪൫൬൭൮൯";

const NUMBER_SYMBOLS = {
    "൰": "10", "൱": "100", "൲": "1000",
    "൳": "1/4", "൴": "1/2", "൵": "3/4",
    "൶": "1/16", "൷": "1/8", "൸": "3/16",
};

const SILENT_MARKS = new Set([
    "\u0D00", "\u0D3B", "\u0D3C", "\u0D4F", "\u0D79", "ഽ",
    "\u0D58", "\u0D59", "\u0D5A", "\u0D5B", "\u0D5C", "\u0D5D", "\u0D5E",
]);

const COMMON_WORDS = {
    "ഞാൻ": "njaan", "ഞങ്ങള്": "njangal", "ഞങ്ങൾ": "njangal",
    "നീ": "nee", "നിങ്ങൾ": "ningal", "നിങ്ങളുടെ": "ningalude",
    "നമ്മൾ": "nammal", "നമുക്ക്": "namukku",

    "എന്റെ": "ente", "നിന്റെ": "ninte", "അവന്റെ": "avante",
    "അവളുടെ": "avalude", "അവരുടെ": "avarude", "ഇവന്റെ": "ivante",

    "എന്ത്": "enth", "എന്താ": "entha", "എന്താണ്": "enthaanu",
    "എന്തിനു": "enthinu", "എന്തിന്": "enthina", "എന്തൊക്കെ": "enthokke",
    "എങ്ങനെ": "engane", "എവിടെ": "evide", "എവിടെയാണ്": "evideyaanu",
    "എവിടെയാ": "evideyaa", "എപ്പോൾ": "eppol", "എപ്പോ": "eppo",
    "ആര്": "aar", "ആരാണ്": "aaranu", "ആരുടെ": "aarude",

    "ഇത്": "ithu", "ഇതെന്താ": "ithentha", "അത്": "athu",
    "ഇവിടെ": "ivide", "അവിടെ": "avide", "ഇങ്ങനെ": "ingane", "അങ്ങനെ": "angane",

    "പോകുന്നു": "pokunnu", "പോകും": "pokum", "പോയി": "poyi", "പോയോ": "poyo",
    "പോകാമോ": "pokamo", "പോകാം": "pokam",
    "വരുന്നു": "varunnu", "വരും": "varum", "വന്നു": "vannu", "വന്നോ": "vanno", "വരാം": "varam",
    "ചെയ്യുന്നു": "cheyyunnu", "ചെയ്യും": "cheyyum", "ചെയ്യാം": "cheyyam",
    "ചെയ്തു": "cheythu", "ചെയ്തോ": "cheytho",
    "കാണുന്നു": "kaanunnu", "കാണും": "kaanum", "കണ്ടു": "kandu", "കാണാം": "kaanam",
    "തരുന്നു": "tharunnu", "തരും": "tharum", "തന്നു": "thannu",
    "എടുക്കുന്നു": "edukkunnu", "എടുക്കും": "edukkum", "എടുത്തു": "eduthu",
    "വാങ്ങുന്നു": "vaangunnu", "വാങ്ങും": "vaangum", "വാങ്ങി": "vaangi",
    "തിന്നുന്നു": "thinnunnu", "തിന്നു": "thinnu",
    "കഴിക്കുന്നു": "kazhikkunnu", "കഴിച്ചു": "kazhichu",
    "പറയുന്നു": "parayunnu", "പറയും": "parayum", "പറഞ്ഞു": "paranju",
    "കേൾക്കുന്നു": "kelkkunnu", "കേട്ടു": "kettu",
    "അറിയാം": "ariyaam", "അറിയുന്നു": "ariyunnu", "അറിയില്ല": "ariyilla",

    "ഉണ്ട്": "undu", "ഉണ്ടു": "undu", "ഇല്ല": "illa", "ഇല്ലാ": "illaa",
    "വേണം": "venam", "വേണ്ട": "venda", "മതി": "mathi",

    "ആണോ": "aano", "ആണു": "aanu", "ആണ്": "aanu", "അല്ല": "alla", "അല്ലേ": "alle",

    "സുഖം": "sukham", "സുഖമാണോ": "sukhamano", "സ്നേഹം": "sneham",
    "ഇഷ്ടം": "ishtam", "ഇഷ്ടമാണ്": "ishtamaanu", "ഇഷ്ടപ്പെട്ടു": "ishtapettu",

    "ചേട്ടാ": "chetta", "ചേട്ടൻ": "chettan", "ചേച്ചി": "chechi", "ഇക്ക": "ikka",
    "മോനെ": "mone", "മോളെ": "mole", "അളിയാ": "aliya", "എടാ": "eda", "എടി": "edi",
    "ബ്രോ": "bro", "മച്ചാ": "machaa",

    "കേരളം": "keralam", "മലയാളം": "malayalam", "ഇന്ത്യ": "india",

    "ഇന്ന്": "innu", "ഇന്നലെ": "innale", "നാളെ": "nale",
    "ഇപ്പോൾ": "ippol", "ഇപ്പോള്": "ippol", "ഇപ്പോഴും": "ippozhum",
    "പിന്നെ": "pinne", "പിന്നെയും": "pinneyum",

    "ഒന്ന്": "onnu", "രണ്ട്": "randu", "മൂന്ന്": "moonnu",
    "നാല്": "naalu", "നാലു": "naalu", "അഞ്ച്": "anchu", "ആറ്": "aaru",
    "ഏഴ്": "ezhu", "എട്ട്": "ettu", "ഒമ്പത്": "ombathu", "ഒൻപത്": "onpathu", "പത്ത്": "pathu",

    "കഠിനം": "kadinam", "കഠിനമായ": "kadinamaya", "എളുപ്പം": "eluppam",
    "വലിയ": "valiya", "ചെറിയ": "cheriya", "നല്ല": "nalla", "മോശം": "mosham",
    "പുതിയ": "puthiya", "പഴയ": "pazhaya",

    "അടിപൊളി": "adipoli", "പൊളി": "poli", "കൊള്ളാം": "kollam", "നന്ദി": "nanni",
    "ശരി": "shari", "ശെരി": "sheri", "ഓക്കെ": "okke", "എല്ലാം": "ellaam",
};

function normalizeMalayalam(text) {
    return cleanText(text)
        .replace(/([ണനരലളക])\u0D4D\u200D/gu, (match, consonant) => CHILLU_FROM_ZWJ[consonant] ?? match)
        .replace(INVISIBLE_CHARS, "");
}

function readConjunct(s, start) {
    let consonant = CONSONANTS[s[start]];
    let end = start + 1;

    while (s[end] === VIRAMA && CONSONANTS[s[end + 1]] !== undefined) {
        const cluster = s.slice(start, end + 2);
        consonant = CLUSTERS[cluster] ?? consonant + CONSONANTS[s[end + 1]];
        end += 2;
    }

    return { consonant, end };
}

function convertMalayalamWord(word) {
    if (!word) return "";
    if (COMMON_WORDS[word] !== undefined) return COMMON_WORDS[word];

    const s = normalizeMalayalam(word);
    let out = "";
    let i = 0;

    while (i < s.length) {
        const ch = s[i];

        if (INDEPENDENT_VOWELS[ch] !== undefined) {
            out += INDEPENDENT_VOWELS[ch];
            i++;
            continue;
        }

        if (CHILLUS[ch] !== undefined) {
            out += CHILLUS[ch];
            i++;
            continue;
        }

        if (NUMBER_SYMBOLS[ch] !== undefined) {
            out += NUMBER_SYMBOLS[ch];
            i++;
            continue;
        }

        const digit = MALAYALAM_DIGITS.indexOf(ch);
        if (digit !== -1) {
            out += digit;
            i++;
            continue;
        }

        if (ch === "ം" || ch === "ഁ") {
            out += "m";
            i++;
            continue;
        }

        if (ch === "ഃ") {
            out += "h";
            i++;
            continue;
        }

        if (SILENT_MARKS.has(ch)) {
            i++;
            continue;
        }

        if (CONSONANTS[ch] !== undefined) {
            const { consonant, end } = readConjunct(s, i);
            const next = s[end];
            i = end;

            if (VOWEL_SIGNS[next] !== undefined) {
                out += consonant + VOWEL_SIGNS[next];
                i++;
            } else if (next === VIRAMA) {
                const atWordEnd = i + 1 >= s.length;
                out += consonant + (atWordEnd ? "u" : "");
                i++;
            } else {
                out += consonant + "a";
            }
            continue;
        }

        if (VOWEL_SIGNS[ch] !== undefined) {
            out += VOWEL_SIGNS[ch];
            i++;
            continue;
        }

        out += ch;
        i++;
    }

    return out;
}

function capitalizeSentences(text) {
    return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase());
}

function malayalamToManglish(input) {
    if (!isString(input) || !input.length) return false;

    const text = normalizeMalayalam(input);

    const converted = text
        .replace(MALAYALAM_RUN, convertMalayalamWord)
        .replace(/a{3,}/gi, "aa")
        .replace(/e{3,}/gi, "ee")
        .replace(/o{3,}/gi, "oo")
        .replace(/[ \t]+/g, " ");

    return capitalizeSentences(converted);
}

async function requestGoogleSuggestions(text) {
    const params = new URLSearchParams({
        text,
        itc: "ml-t-i0-und",
        num: "10",
        cp: "0",
        cs: "1",
        ie: "utf-8",
        oe: "utf-8",
    });

    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36",
    };

    if (typeof fetch === "function") {
        const response = await fetch(`${GOOGLE_ENDPOINT}?${params}`, {
            headers,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) return null;
        return response.json();
    }

    let axios;
    try {
        axios = require("axios");
    } catch {
        return null;
    }

    const response = await axios.get(GOOGLE_ENDPOINT, {
        params: Object.fromEntries(params),
        headers,
        timeout: REQUEST_TIMEOUT_MS,
    });
    return response.data;
}

async function googleManglishToMalayalam(text) {
    try {
        const data = await requestGoogleSuggestions(text.trim());

        if (!Array.isArray(data) || data[0] !== "SUCCESS") return false;

        const suggestions = data[1]?.[0]?.[1];
        if (!Array.isArray(suggestions) || !suggestions.length) return false;

        return suggestions[0] || false;
    } catch {
        return false;
    }
}

function normalizeManglishInput(text) {
    return cleanText(text)
        .trim()
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[ \t]+/g, " ");
}

const LATIN_RUN = /([a-z]+(?:[ '][a-z]+)*)/i;

async function manglishToMalayalam(text) {
    if (!isString(text) || !text.trim()) return false;

    const input = normalizeManglishInput(text);
    if (!input) return false;

    if (!isMalayalam(input)) return googleManglishToMalayalam(input);
    if (!containsLatin(input)) return input;

    const parts = input.split(LATIN_RUN);

    const converted = await Promise.all(
        parts.map(async (part, index) => {
            if (index % 2 === 0) return part;
            return (await googleManglishToMalayalam(part)) || part;
        })
    );

    return converted.join("");
}

function smartDirection(text) {
    if (!isString(text) || !text.trim()) return "unknown";
    if (isMalayalam(text)) return "malayalam";
    if (isManglish(text)) return "manglish";
    return "unknown";
}

async function smartConvert(text) {
    const direction = smartDirection(text);

    if (direction === "malayalam") {
        return { direction, result: malayalamToManglish(text) };
    }

    if (direction === "manglish") {
        return { direction, result: await manglishToMalayalam(text) };
    }

    return { direction, result: text };
}

function convertIfMalayalam(text) {
    return isMalayalam(text) ? malayalamToManglish(text) : text;
}

async function convertIfManglish(text) {
    if (!isManglish(text)) return text;
    return (await manglishToMalayalam(text)) || text;
}

function analyzeMalayalam(text) {
    const stats = {
        isMalayalam: false,
        length: 0,
        characters: 0,
        latin: 0,
        digits: 0,
        spaces: 0,
        punctuation: 0,
    };

    if (!isString(text)) return stats;

    stats.length = text.length;

    for (const char of text) {
        if (MALAYALAM_RANGE.test(char)) stats.characters++;
        else if (/[a-z]/i.test(char)) stats.latin++;
        else if (/[0-9]/.test(char)) stats.digits++;
        else if (/\s/.test(char)) stats.spaces++;
        else stats.punctuation++;
    }

    stats.isMalayalam = stats.characters > 0;
    return stats;
}

module.exports = {
    malayalamToManglish,
    manglishToMalayalam,
    isMalayalam,
    isOnlyMalayalam,
    isManglish,
    getManglishScore,
    analyzeManglish,
    analyzeMalayalam,
    smartDirection,
    smartConvert,
    convertIfMalayalam,
    convertIfManglish,
};
