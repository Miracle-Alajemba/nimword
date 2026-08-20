




import fs from "fs";
import { fileURLToPath } from "url";
import { query } from "./db.js";

const DATAMUSE_API_URL = "https://api.datamuse.com/words";
const MIN_VALID_WORDS = 18;
const MIN_THREE_LETTER_WORDS = 6;
const MIN_FOUR_PLUS_LETTER_WORDS = 8;
const CACHE_TTL_MS = 10 * 60 * 1000;
const API_TIMEOUT_MS = 5000;
const MAX_RETRIES = 2;

const BUNDLED_DICTIONARY_PATH = fileURLToPath(
  new URL("../english-words.txt", import.meta.url),
);

const DICTIONARY_CANDIDATE_PATHS = [
  process.env.WORDPOT_DICTIONARY_PATH,
  BUNDLED_DICTIONARY_PATH,
  "/usr/share/dict/words",
  "/usr/share/dict/american-english",
].filter(Boolean);

const SOURCE_WORD_POOL = [
  "BLOCKCHAIN",
  "REMITTANCE",
  "COMMUNITY",
  "STABLECOIN",
  "EDUCATION",
  "PLATFORM",
  "MIGRATION",
  "TREASURY",
  "CREATION",
  "LANGUAGE",
  "MOTIVATION",
  "FOUNDATION",
  "GENERATION",
  "ORCHESTRA",
  "BROADCAST",
  "DISCOVERY",
  "ENGINEER",
  "FINANCIAL",
  "HARDWARE",
  "INDUSTRY",
  "JOURNAL",
  "KEYSTONE",
  "LIBRARY",
  "MONUMENT",
  "NETWORK",
  "OPENING",
  "PASSWORD",
  "QUESTION",
  "RESOURCE",
  "SOLUTION",
  "TOGETHER",
  "UNIVERSE",
  "VOLUNTEER",
  "WELCOME",
  "ACCIDENT",
  "BUILDING",
  "CUSTOMER",
  "DAUGHTER",
  "ELSEWHERE",
  "FAMILIAR",
  "GOVERNOR",
  "HERSELF",
  "IMAGINE",
  "JUSTICE",
  "KNOWLEDGE",
  "LITERARY",
  "MATERIAL",
  "NECESSARY",
  "OBSERVER",
  "PARTNER",
  "RECEIVER",
  "STRANGER",
  "TRAINING",
  "VICTORY",
  "YOURSELF",
  "ALGORITHM",
  "BEAUTIFUL",
  "COLLEGE",
  "DANGEROUS",
  "EXERCISE",
  "FREQUENT",
  "GRADUATE",
  "HORIZON",
  "INITIATE",
  "JUNCTION",
  "LANDMARK",
  "MILESTONE",
  "NOURISH",
  "OVERFLOW",
  "PHYSICAL",
  "QUARTER",
  "RESTRICT",
  "SURVIVAL",
  "THEATRE",
  "VAMPIRE",
  "WATERFALL",
  "YIELDING",
  "ZEBRA",
  "AMAZON",
  "BALLOON",
  "CANDY",
  "DINOSAUR",
  "ELEPHANT",
  "FIREPLACE",
  "GALAXY",
  "HURRICANE",
  "ISLAND",
  "JUNGLE",
  "KITCHEN",
  "LEMONADE",
  "MUSHROOM",
  "NEIGHBOR",
  "OPERA",
  "PENGUIN",
  "RAINBOW",
  "SANDWICH",
  "TEMPLE",
  "UMBRELLA",
  "VEGETABLE",
  "WHISPER",
  "XENON",
  "YOGURT",
  "ZENITH",
  "BACKPACK",
  "CHECKPOINT",
  "DECORATE",
  "EVERYONE",
  "FANTASY",
  "GATEWAY",
  "HARMONY",
  "INSOMNIA",
  "JEWELRY",
  "LIGHTNING",
];

const EMERGENCY_SOURCE_WORDS = [
  "CREATION",
  "LANGUAGE",
  "TREASURY",
  "REMITTANCE",
  "BLOCKCHAIN",
  "COMMUNITY",
  "EDUCATION",
  "FOUNDATION",
  "HARMONY",
  "JUSTICE",
  "NETWORK",
  "SOLUTION",
  "WELCOME",
  "BALLOON",
  "GALAXY",
  "KITCHEN",
  "RAINBOW",
  "SANDWICH",
  "TEMPLE",
  "ZENITH",
];

const EASY_SOURCE_WORDS = [
  "COMMUNITY", "EDUCATION", "FOUNDATION", "GENERATION", "MIGRATION",
  "REMITTANCE", "SOLUTION", "TOGETHER", "VOLUNTEER", "YESTERDAY",
  "CELEBRATION", "UNDERSTAND", "BEAUTIFUL", "EXPERIENCE", "GOVERNMENT",
  "DIFFERENCE", "INFORMATION", "DEVELOPMENT", "ENVIRONMENT", "ASSOCIATION",
  "ORGANIZATION", "PARTICULAR", "EVERYTHING", "BACKGROUND", "TECHNOLOGY",
  "MANAGEMENT", "CONSTRUCTION", "REVOLUTION", "COMMUNICATION", "TRANSPORTATION"
];

const MEDIUM_SOURCE_WORDS = [
  "ALGORITHM", "MILESTONE", "LANDMARK", "ORCHESTRA", "BROADCAST",
  "TREASURY", "HORIZON", "FREQUENT", "JOURNAL", "KEYSTONE",
  "MONUMENT", "NETWORK", "PASSWORD", "QUESTION", "DATABASE",
  "FEEDBACK", "SECURITY", "CREATIVE", "CAMPAIGN", "DOCUMENT",
  "FRIENDLY", "STRUGGLE", "CONTRACT", "PROJECTS", "ABSOLUTE",
  "CAPACITY", "CRITICAL", "DELIVERY", "EMPHASIS", "FORECAST"
];

const HARD_SOURCE_WORDS = [
  "MAXIMIZE", "ADJUDGED", "PUZZLING", "CHUTZPAH", "MEZZANINE",
  "ACQUIRE", "ACQUITS", "ADEQUACY", "ADJUNCT", "BEQUEATH",
  "JACQUARD", "JONQUIL", "WIZARDRY", "XENOPHON", "SPHINX",
  "COGNIZANT", "BLIZZARD", "FLUMMOXED", "SKEPTIC", "CACOPHONY",
  "GARRULOUS", "EQUINOXES", "HAZARDOUS", "JEOPARDY", "JUXTAPOSE"
];

const DIFFICULTY_PROFILES = {
  easy: {
    minLength: 8,
    maxLength: 12,
    maxValidWords: 300,
    maxUniqueLetters: 10,
    requireRepeatedLetters: false,
    sampleSize: 220,
  },
  medium: {
    minLength: 8,
    maxLength: 10,
    maxValidWords: 150,
    maxUniqueLetters: 8,
    requireRepeatedLetters: false,
    sampleSize: 160,
  },
  hard: {
    minLength: 6,
    maxLength: 10,
    maxValidWords: 150,
    maxUniqueLetters: 9,
    requireRepeatedLetters: false,
    sampleSize: 120,
  },
};

const DEFAULT_DIFFICULTY = "hard";
const lastSourceWordByDifficulty = new Map();
const roundCaches = new Map();
let dictionaryWords = [];
let dictionaryWordCounts = [];
let dictionaryBitmasks = [];
const cacheRefillPromises = new Map();
const derivedWordsCache = new Map();

// ✅ FIX: Fisher-Yates shuffle (unbiased)
function shuffle(items) {
  const array = items.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ✅ FIX: Validate dictionary load with error state
function loadDictionary() {
  if (dictionaryWords.length) return dictionaryWords;

  try {
    const dictionaryPath = DICTIONARY_CANDIDATE_PATHS.find((candidate) =>
      fs.existsSync(candidate),
    );

    if (!dictionaryPath) {
      throw new Error("No dictionary file found on the server.");
    }

    const raw = fs.readFileSync(dictionaryPath, "utf8");
    dictionaryWords = uniqueWords(
      raw
        .split(/\r?\n/)
        .map((word) =>
          String(word || "")
            .trim()
            .toLowerCase(),
        )
        .filter((word) => /^[a-z]+$/.test(word))
        .filter((word) => word.length >= 3 && word.length <= 12),
    ).sort();

    if (!dictionaryWords.length) {
      throw new Error("Dictionary loaded but contains no valid words.");
    }

    // Pre-calculate count maps and bitmasks for each dictionary word once for ultra-fast matching
    dictionaryWordCounts = dictionaryWords.map((word) => buildLetterCounts(word));
    dictionaryBitmasks = dictionaryWords.map((word) => {
      let mask = 0;
      for (let i = 0; i < word.length; i++) {
        const code = word.charCodeAt(i) - 97; // 'a' is 97
        if (code >= 0 && code < 26) {
          mask |= (1 << code);
        }
      }
      return mask;
    });

    console.info(
      `Dictionary loaded: ${dictionaryWords.length} words from ${dictionaryPath}`,
    );
  } catch (error) {
    console.error(`Unable to load WordPot dictionary: ${error.message}`);
    dictionaryWords = [];
    dictionaryWordCounts = [];
    dictionaryBitmasks = [];
  }

  return dictionaryWords;
}

export function buildLetterCounts(word) {
  return word.split("").reduce((counts, letter) => {
    counts[letter] = (counts[letter] || 0) + 1;
    return counts;
  }, {});
}

export function canBuildFromSource(candidate, sourceWord) {
  const candidateCounts = buildLetterCounts(candidate.toLowerCase());
  const sourceCounts = buildLetterCounts(sourceWord.toLowerCase());

  return Object.entries(candidateCounts).every(
    ([letter, count]) => (sourceCounts[letter] || 0) >= count,
  );
}

function uniqueWords(words) {
  return [...new Set(words)];
}

export function deriveValidWords(sourceWord) {
  const normalizedSource = String(sourceWord || "")
    .trim()
    .toLowerCase();

  if (!normalizedSource) {
    console.warn("deriveValidWords called with empty sourceWord");
    return [];
  }

  if (derivedWordsCache.has(normalizedSource)) {
    return derivedWordsCache.get(normalizedSource);
  }

  const dictionary = loadDictionary();
  if (!dictionary.length) {
    console.error("Cannot derive words: dictionary is empty");
    return [];
  }

  const sourceCounts = buildLetterCounts(normalizedSource);

  // Calculate source bitmask
  let sourceMask = 0;
  for (let i = 0; i < normalizedSource.length; i++) {
    const code = normalizedSource.charCodeAt(i) - 97;
    if (code >= 0 && code < 26) {
      sourceMask |= (1 << code);
    }
  }

  const sourceLen = normalizedSource.length;
  const matched = [];

  for (let i = 0; i < dictionary.length; i++) {
    const word = dictionary[i];
    if (word.length <= sourceLen) {
      const mask = dictionaryBitmasks[i];
      // Bitwise check: if the word contains letters not in the source word, skip it
      if ((mask & ~sourceMask) === 0) {
        const counts = dictionaryWordCounts[i];
        let possible = true;
        for (const letter in counts) {
          if ((sourceCounts[letter] || 0) < counts[letter]) {
            possible = false;
            break;
          }
        }
        if (possible) {
          matched.push(word);
        }
      }
    }
  }

  const validWords = uniqueWords(matched).sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length;
    return a.localeCompare(b);
  });

  derivedWordsCache.set(normalizedSource, validWords);
  return validWords;
}

function isDictionaryWord(word) {
  const normalized = String(word || "")
    .trim()
    .toLowerCase();
  if (!normalized) return false;

  const dictionary = loadDictionary();
  if (!dictionary.length) return false;

  return dictionary.includes(normalized);
}

function makeRound(sourceWord) {
  return {
    sourceWord,
    validWords: deriveValidWords(sourceWord),
  };
}

function normalizeDifficulty(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return DIFFICULTY_PROFILES[normalized] ? normalized : DEFAULT_DIFFICULTY;
}

function getDifficultyProfile(difficulty) {
  return DIFFICULTY_PROFILES[normalizeDifficulty(difficulty)];
}

function isPlayableRound(round) {
  const threeLetterWords = round.validWords.filter(
    (word) => word.length === 3,
  ).length;
  const fourPlusLetterWords = round.validWords.filter(
    (word) => word.length >= 4,
  ).length;

  return (
    round.validWords.length >= MIN_VALID_WORDS &&
    threeLetterWords >= MIN_THREE_LETTER_WORDS &&
    fourPlusLetterWords >= MIN_FOUR_PLUS_LETTER_WORDS
  );
}

function countUniqueLetters(word) {
  return new Set(String(word || "").toLowerCase()).size;
}

function hasRepeatedLetters(word) {
  return countUniqueLetters(word) < String(word || "").length;
}

function getWordScore(word) {
  if (word.length >= 6) return 12;
  if (word.length === 5) return 8;
  if (word.length === 4) return 5;
  return 3;
}

function getRoundMaxScore(round) {
  return round.validWords.reduce((sum, word) => sum + getWordScore(word), 0);
}

function isDifficultyPlayableRound(round, difficulty) {
  if (!isPlayableRound(round)) return false;

  const profile = getDifficultyProfile(difficulty);
  const sourceWordLength = round.sourceWord.length;
  const uniqueLetters = countUniqueLetters(round.sourceWord);

  const maxScore = getRoundMaxScore(round);
  let minMaxScoreRequired = 55;
  if (difficulty === "medium") minMaxScoreRequired = 85;
  else if (difficulty === "hard") minMaxScoreRequired = 200;

  if (maxScore < minMaxScoreRequired) return false;

  return (
    sourceWordLength >= profile.minLength &&
    sourceWordLength <= profile.maxLength &&
    uniqueLetters <= profile.maxUniqueLetters &&
    (!profile.requireRepeatedLetters || hasRepeatedLetters(round.sourceWord)) &&
    round.validWords.length <= profile.maxValidWords
  );
}

function getRoundDifficultyScore(round, difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const uniqueLetters = countUniqueLetters(round.sourceWord);
  const repeatedLetterBonus = round.sourceWord.length - uniqueLetters;
  const shorterWordBonus = profile.maxLength - round.sourceWord.length;
  const tighterAnswerPoolBonus = Math.max(
    0,
    profile.maxValidWords - round.validWords.length,
  );
  const uniqueLetterTensionBonus = Math.max(
    0,
    profile.maxUniqueLetters - uniqueLetters,
  );

  return (
    repeatedLetterBonus * 12 +
    shorterWordBonus * 5 +
    tighterAnswerPoolBonus +
    uniqueLetterTensionBonus * 4
  );
}

function getFallbackRounds(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const dictionary = loadDictionary();

  let basePool = SOURCE_WORD_POOL;
  if (difficulty === "easy") basePool = EASY_SOURCE_WORDS;
  else if (difficulty === "medium") basePool = MEDIUM_SOURCE_WORDS;
  else if (difficulty === "hard") basePool = HARD_SOURCE_WORDS;

  if (!dictionary.length) {
    console.warn("Dictionary empty; using source pool fallback");
    return basePool.map(makeRound).filter((round) =>
      isDifficultyPlayableRound(round, difficulty),
    );
  }

  // Filter pool words to ensure they are playable and fit the profiles
  const poolRounds = basePool
    .map(makeRound)
    .filter((round) => isDifficultyPlayableRound(round, difficulty));

  if (poolRounds.length) {
    return shuffle(poolRounds);
  }

  // Fallback to dictionary filtering if the pool didn'\''t yield matches
  const dictionaryRounds = shuffle(
    dictionary.filter(
      (word) =>
        word.length >= profile.minLength && word.length <= profile.maxLength,
    ),
  )
    .slice(0, 500)
    .map((word) => word.toUpperCase())
    .map(makeRound)
    .filter((round) => isDifficultyPlayableRound(round, difficulty))
    .sort(
      (a, b) =>
        getRoundDifficultyScore(b, difficulty) -
        getRoundDifficultyScore(a, difficulty),
    )
    .slice(0, profile.sampleSize);

  if (dictionaryRounds.length) {
    return dictionaryRounds;
  }

  return basePool.map(makeRound).filter((round) =>
    isDifficultyPlayableRound(round, difficulty),
  );
}

function pickFromRounds(rounds, difficulty, exclusions = []) {
  if (!rounds.length) {
    const emergencyRound = makeRound(
      EMERGENCY_SOURCE_WORDS[
      Math.floor(Math.random() * EMERGENCY_SOURCE_WORDS.length)
      ],
    );
    const normalizedDifficulty = normalizeDifficulty(difficulty);
    lastSourceWordByDifficulty.set(
      normalizedDifficulty,
      emergencyRound.sourceWord,
    );
    return { ...emergencyRound, difficulty: normalizedDifficulty };
  }

  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const lastSourceWord =
    lastSourceWordByDifficulty.get(normalizedDifficulty) || "";
  const candidates = rounds.filter(
    (round) =>
      round.sourceWord !== lastSourceWord &&
      !exclusions.includes(String(round.sourceWord || "").toUpperCase())
  );
  const pool = candidates.length ? candidates : rounds;
  if (!candidates.length) {
    console.info(
      `[rounds] pickFromRounds: no candidates excluding lastSourceWord/exclusions. Selecting from full pool.`,
    );
  }
  const nextRound = pool[Math.floor(Math.random() * pool.length)];
  console.info(
    `[rounds] pickFromRounds selected: ${nextRound.sourceWord} (difficulty=${normalizedDifficulty}) previous=${lastSourceWord || "none"}`,
  );
  lastSourceWordByDifficulty.set(normalizedDifficulty, nextRound.sourceWord);
  return { ...nextRound, difficulty: normalizedDifficulty };
}

// ✅ FIX: Add timeout to API calls
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchDatamuseCandidates() {
  const patterns = [9, 10, 11, 12].map((length) => "?".repeat(length));

  const responses = await Promise.all(
    patterns.map(async (pattern) => {
      const url = new URL(DATAMUSE_API_URL);
      url.searchParams.set("sp", pattern);
      url.searchParams.set("max", "40");

      const response = await fetchWithTimeout(url, API_TIMEOUT_MS);
      if (!response.ok) {
        throw new Error(
          `Datamuse returned ${response.status} for pattern ${pattern}`,
        );
      }

      return response.json();
    }),
  );

  return responses
    .flat()
    .map((entry) => String(entry?.word || "").trim())
    .filter((word) => /^[a-z]+$/i.test(word))
    .filter((word) => isDictionaryWord(word))
    .map((word) => word.toUpperCase());
}

// ✅ FIX: Prevent race conditions with promise deduplication and fetch from Datamuse API with local fallbacks
async function refillRoundCache(difficulty) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);

  if (cacheRefillPromises.has(normalizedDifficulty)) {
    return cacheRefillPromises.get(normalizedDifficulty);
  }

  const promise = (async () => {
    try {
      console.info(`Refilling round cache for ${normalizedDifficulty} using Datamuse API...`);
      const candidates = await fetchDatamuseCandidates();

      const rounds = candidates
        .map((word) => makeRound(word))
        .filter((round) => isDifficultyPlayableRound(round, normalizedDifficulty));

      if (rounds.length < 5) {
        throw new Error("Too few playable rounds returned from Datamuse.");
      }

      roundCaches.set(normalizedDifficulty, {
        rounds,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      console.info(
        `Cache refilled: ${rounds.length} ${normalizedDifficulty} rounds from Datamuse API`,
      );
    } catch (error) {
      console.warn(
        `Datamuse API cache refill failed: ${error.message}. Using fallback local rounds.`,
      );
      const fallbackRounds = getFallbackRounds(normalizedDifficulty);
      roundCaches.set(normalizedDifficulty, {
        rounds: fallbackRounds,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    } finally {
      cacheRefillPromises.delete(normalizedDifficulty);
    }
  })();

  cacheRefillPromises.set(normalizedDifficulty, promise);
  return promise;
}

export async function getDynamicRound(difficulty = DEFAULT_DIFFICULTY, exclusions = []) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const uppercaseExclusions = exclusions.map(e => String(e || "").trim().toUpperCase()).filter(Boolean);

  try {
    const res = await query(
      `SELECT source_word, valid_words FROM precalculated_rounds 
       WHERE difficulty = $1 AND NOT (source_word = ANY($2))
       ORDER BY RANDOM() LIMIT 1`,
      [normalizedDifficulty, uppercaseExclusions]
    );

    if (res && res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      console.info(`[rounds] getDynamicRound fetched from DB: ${row.source_word}`);
      return {
        sourceWord: row.source_word,
        validWords: row.valid_words,
        difficulty: normalizedDifficulty
      };
    }
  } catch (error) {
    console.warn(`[rounds] getDynamicRound DB query failed: ${error.message}. Falling back to cache.`);
  }

  const cache = roundCaches.get(normalizedDifficulty);
  const isCacheValid =
    cache?.rounds?.length > 0 && Date.now() <= cache.expiresAt;

  if (!isCacheValid) {
    await refillRoundCache(normalizedDifficulty);
  }

  const nextCache = roundCaches.get(normalizedDifficulty);
  return pickFromRounds(nextCache?.rounds || [], normalizedDifficulty, exclusions);
}

// Pick a round while excluding recent source words (case-sensitive uppercase list expected)
export async function pickNonRecentRound(
  difficulty = DEFAULT_DIFFICULTY,
  exclusions = [],
) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const uppercaseExclusions = exclusions.map(e => String(e || "").trim().toUpperCase()).filter(Boolean);

  try {
    const res = await query(
      `SELECT source_word, valid_words FROM precalculated_rounds 
       WHERE difficulty = $1 AND NOT (source_word = ANY($2))
       ORDER BY RANDOM() LIMIT 1`,
      [normalizedDifficulty, uppercaseExclusions]
    );

    if (res && res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      console.info(`[rounds] pickNonRecentRound fetched from DB: ${row.source_word}`);
      return {
        sourceWord: row.source_word,
        validWords: row.valid_words,
        difficulty: normalizedDifficulty
      };
    }
  } catch (error) {
    console.warn(`[rounds] pickNonRecentRound DB query failed: ${error.message}. Falling back to cache.`);
  }

  const cache = roundCaches.get(normalizedDifficulty);
  const isCacheValid =
    cache?.rounds?.length > 0 && Date.now() <= cache.expiresAt;

  if (!isCacheValid) {
    await refillRoundCache(normalizedDifficulty);
  }

  const nextCache = roundCaches.get(normalizedDifficulty);
  const pool = (
    nextCache?.rounds || getFallbackRounds(normalizedDifficulty)
  ).slice();

  // filter out excluded recent source words
  const filtered = pool.filter(
    (r) => !exclusions.includes(String(r.sourceWord || "").toUpperCase()),
  );
  const finalPool = filtered.length ? filtered : pool;

  if (!finalPool.length) {
    console.warn(
      `[rounds] pickNonRecentRound: finalPool empty for difficulty=${normalizedDifficulty}`,
    );
    const emergency = makeRound(
      EMERGENCY_SOURCE_WORDS[
      Math.floor(Math.random() * EMERGENCY_SOURCE_WORDS.length)
      ],
    );
    lastSourceWordByDifficulty.set(normalizedDifficulty, emergency.sourceWord);
    return { ...emergency, difficulty: normalizedDifficulty };
  }

  const nextRound = finalPool[Math.floor(Math.random() * finalPool.length)];
  console.info(
    `[rounds] pickNonRecentRound selected: ${nextRound.sourceWord} (difficulty=${normalizedDifficulty})`,
  );
  lastSourceWordByDifficulty.set(normalizedDifficulty, nextRound.sourceWord);
  return { ...nextRound, difficulty: normalizedDifficulty };
}
