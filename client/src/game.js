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

export function getWordScore(word) {
  if (word.length >= 6) return 12;
  if (word.length === 5) return 8;
  if (word.length === 4) return 5;
  return 3;
}

export function normalizeWord(value) {
  return String(value || "").trim().toLowerCase();
}

export function evaluatePracticeSubmission({
  input,
  sourceWord,
  validWords, 
  claimedWords,
}) {
  const normalized = normalizeWord(input);

  if (!normalized) {
    return {
      ok: false,
      code: "empty",
      message: "Type a word before claiming it.",
      word: normalized,
    };
  }

  if (!/^[a-z]+$/.test(normalized)) {
    return {
      ok: false,
      code: "letters_only",
      message: "Only letters are allowed in NimWord.",
      word: normalized,
    };
  }

  if (normalized.length < 3) {
    return {
      ok: false,
      code: "too_short",
      message: "Too short. Words must be at least 3 letters.",
      word: normalized,
    };
  }

  if (claimedWords.has(normalized)) {
    return {
      ok: false,
      code: "claimed",
      message: "Already claimed in this round.",
      word: normalized,
    };
  }

  if (!canBuildFromSource(normalized, sourceWord)) {
    return {
      ok: false,
      code: "outside_source",
      message: "That word uses letters outside the source word.",
      word: normalized,
    };
  }

  if (!validWords.includes(normalized)) {
    return {
      ok: false,
      code: "not_found",
      message: "Not in the practice dictionary for this round.",
      word: normalized,
    };
  }

  return {
    ok: true,
    code: "accepted",
    message: `Locked in ${normalized} for +${getWordScore(normalized)} points.`,
    word: normalized,
    score: getWordScore(normalized),
  };
}

export const FALLBACK_ROUNDS = {
  easy: [
    {
      sourceWord: "GAMING",
      validWords: ["game", "gain", "main", "magi", "agin", "gig", "gag", "nag", "man", "aim", "gin", "gem"],
    },
    {
      sourceWord: "STREAK",
      validWords: ["streak", "stare", "skate", "steak", "takes", "tears", "rates", "stark", "task", "take", "tear", "rate", "seat", "east", "star", "rest", "arts", "ear", "era", "tea", "set", "art", "rat", "eat", "tar", "ask", "sat"],
    },
    {
      sourceWord: "NIMIQ",
      validWords: ["nim", "min", "qin", "imi", "nimq"],
    },
    {
      sourceWord: "PLAYER",
      validWords: ["player", "replay", "early", "layer", "pearl", "relay", "pale", "leap", "play", "plea", "reap", "year", "lap", "pal", "pay", "ply", "per", "rap", "par", "ear", "era", "ray", "yea", "lay", "ale"],
    },
  ],
  medium: [
    {
      sourceWord: "CHAMPION",
      validWords: ["champion", "panic", "champ", "piano", "moan", "main", "coin", "icon", "camp", "chin", "chip", "chop", "pain", "macho", "chimp", "man", "pan", "can", "cap", "pin", "nip", "hop", "hip", "map", "aim", "ion"],
    },
    {
      sourceWord: "VICTORY",
      validWords: ["victory", "trivy", "riot", "tory", "trio", "city", "rivo", "try", "toy", "rot", "tor"],
    },
    {
      sourceWord: "STAKING",
      validWords: ["staking", "taking", "giant", "satin", "stink", "stain", "gain", "sink", "king", "task", "skin", "sing", "sign", "knit", "tang", "tank", "ting", "ant", "tin", "tan", "sin", "sit", "kit", "kin", "tag", "nag", "gin", "its"],
    },
    {
      sourceWord: "TREASURY",
      validWords: ["treasury", "starry", "surety", "arrest", "rust", "star", "stay", "sure", "user", "tear", "true", "year", "easy", "rays", "arts", "rate", "seat", "east", "art", "rat", "try", "say", "ray", "ear", "era", "tea", "use", "rue", "tar", "sat", "set"],
    },
    {
      sourceWord: "REWARD",
      validWords: ["reward", "drawer", "redraw", "warder", "warred", "rare", "read", "rear", "ward", "ware", "draw", "dear", "dare", "raw", "war", "ear", "era", "red", "rad", "dew", "wed"],
    },
    {
      sourceWord: "WINNER",
      validWords: ["winner", "rewin", "wire", "wren", "wine", "rein", "win", "new", "wen", "err"],
    },
  ],
  hard: [
    {
      sourceWord: "BLOCKCHAIN",
      validWords: ["blockchain", "cabin", "chain", "chalk", "cloak", "bacon", "black", "block", "blank", "chin", "chip", "coin", "icon", "lock", "bank", "back", "coal", "bail", "boil", "clan", "can", "cab", "ban", "bin", "ion", "oil", "ink", "oak", "lab", "nob"],
    },
    {
      sourceWord: "ALGORITHM",
      validWords: ["algorithm", "mortal", "tailor", "moral", "girth", "trial", "glory", "loam", "mail", "halt", "harm", "math", "roam", "gram", "girl", "goat", "moth", "toga", "tram", "trio", "riot", "aim", "air", "arm", "art", "hit", "hot", "log", "lot", "oat", "oil", "ram", "rat", "rim", "rot", "tag", "tar", "tom"],
    },
    {
      sourceWord: "SPEEDY",
      validWords: ["speedy", "speed", "seeds", "deep", "seed", "spye", "eyes", "eye", "spy", "see", "dye", "yes"],
    },
  ],
};

export function generateClientPracticeRound(difficulty = "medium") {
  const pool = FALLBACK_ROUNDS[difficulty] || FALLBACK_ROUNDS.medium;
  const index = Math.floor(Math.random() * pool.length);
  const selected = pool[index];
  return {
    id: `practice-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceWord: selected.sourceWord,
    validWords: selected.validWords,
    difficulty,
    roundSeconds: 60,
  };
}

export function generateClientDailyRound(difficulty = "medium") {
  const pool = FALLBACK_ROUNDS[difficulty] || FALLBACK_ROUNDS.medium;
  const now = new Date();
  const dayIndex = (now.getUTCFullYear() * 365 + now.getUTCMonth() * 31 + now.getUTCDate()) % pool.length;
  const selected = pool[dayIndex] || pool[0];
  const dateStr = now.toISOString().slice(0, 10);
  return {
    id: `daily-${dateStr}-${difficulty}`,
    sourceWord: selected.sourceWord,
    validWords: selected.validWords,
    difficulty,
    date: dateStr,
    roundSeconds: 60,
  };
}
