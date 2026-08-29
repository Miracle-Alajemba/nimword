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

  const isAlreadyClaimed = claimedWords instanceof Set
    ? claimedWords.has(normalized)
    : Array.isArray(claimedWords)
      ? claimedWords.includes(normalized)
      : false;

  if (isAlreadyClaimed) {
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

  const isValid = validWords instanceof Set
    ? validWords.has(normalized)
    : Array.isArray(validWords)
      ? validWords.includes(normalized)
      : false;

  if (!isValid) {
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
      sourceWord: "BLOCKCHAIN",
      validWords: ["blockchain", "cabin", "chain", "chalk", "cloak", "bacon", "black", "block", "blank", "chin", "chip", "coin", "icon", "lock", "bank", "back", "coal", "bail", "boil", "clan", "can", "cab", "ban", "bin", "ion", "oil", "ink", "oak", "lab", "nob"],
    },
    {
      sourceWord: "EDUCATION",
      validWords: ["education", "auction", "action", "united", "tonic", "audio", "canoe", "dance", "count", "acute", "ocean", "notice", "acted", "audit", "cite", "code", "cute", "date", "diet", "dine", "dirt", "done", "dote", "duce", "duct", "duet", "dune", "edit", "into", "node", "note", "once", "tide", "tied", "time", "toed", "tone", "tune", "unit", "acid", "aide", "cone", "coin", "coat", "cat", "cot", "cut", "den", "die", "din", "doe", "dot", "due", "dun", "eat", "end", "eon", "ice", "ion", "net", "nod", "not", "nut", "oat", "one", "out", "tan", "tea", "ten", "tie", "tin", "toe", "ton"],
    },
    {
      sourceWord: "COMMUNITY",
      validWords: ["community", "immunity", "mutiny", "county", "mount", "comic", "unity", "minty", "tonic", "icon", "mint", "city", "tiny", "unit", "coin", "into", "unto", "moon", "omit", "tout", "con", "cot", "cut", "ion", "not", "nut", "out", "tin", "tom", "ton", "too", "you"],
    },
    {
      sourceWord: "TREASURY",
      validWords: ["treasury", "starry", "surety", "arrest", "rust", "star", "stay", "sure", "user", "tear", "true", "year", "easy", "rays", "arts", "rate", "seat", "east", "art", "rat", "try", "say", "ray", "ear", "era", "tea", "use", "rue", "tar", "sat", "set"],
    },
    {
      sourceWord: "GAMING",
      validWords: ["game", "gain", "main", "magi", "agin", "gig", "gag", "nag", "man", "aim", "gin", "gem"],
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
      sourceWord: "ALGORITHM",
      validWords: ["algorithm", "mortal", "tailor", "moral", "girth", "trial", "glory", "loam", "mail", "halt", "harm", "math", "roam", "gram", "girl", "goat", "moth", "toga", "tram", "trio", "riot", "aim", "air", "arm", "art", "hit", "hot", "log", "lot", "oat", "oil", "ram", "rat", "rim", "rot", "tag", "tar", "tom"],
    },
    {
      sourceWord: "REWARD",
      validWords: ["reward", "drawer", "redraw", "warder", "warred", "rare", "read", "rear", "ward", "ware", "draw", "dear", "dare", "raw", "war", "ear", "era", "red", "rad", "dew", "wed"],
    },
    {
      sourceWord: "WINNER",
      validWords: ["winner", "rewin", "wire", "wren", "wine", "rein", "win", "new", "wen", "err"],
    },
    {
      sourceWord: "PLATFORM",
      validWords: ["platform", "formal", "format", "patrol", "portal", "mortal", "moral", "flora", "float", "flota", "polar", "tram", "trap", "tarp", "form", "fort", "from", "part", "port", "plot", "roam", "flap", "flat", "flat", "lamp", "loam", "malt", "arm", "art", "fat", "for", "lap", "lip", "lot", "map", "mat", "mop", "oat", "oft", "par", "pat", "pot", "ram", "rap", "rat", "rot", "tap", "tar", "tom", "top"],
    },
  ],
  hard: [
    {
      sourceWord: "CRYPTIC",
      validWords: ["cryptic", "crypt", "pyric", "pricy", "typic", "city", "pity", "trip", "cry", "tip", "pit", "tic", "pry"],
    },
    {
      sourceWord: "ZEPHYR",
      validWords: ["zephyr", "hype", "prey", "pyre", "rye", "her", "per", "rep", "hey", "pry", "yeh"],
    },
    {
      sourceWord: "SYNTAX",
      validWords: ["syntax", "stany", "antsy", "nasty", "stay", "tax", "any", "say", "tan", "ant", "sat"],
    },
    {
      sourceWord: "VORTEX",
      validWords: ["vortex", "vert", "tore", "vote", "over", "rove", "rote", "vet", "rot", "tor", "toe", "ore", "roe"],
    },
    {
      sourceWord: "MATRIX",
      validWords: ["matrix", "tram", "trio", "mart", "riot", "rim", "ram", "rat", "tar", "mat", "arm", "art", "tax", "max"],
    },
    {
      sourceWord: "LABYRINTH",
      validWords: ["labyrinth", "binary", "brainy", "tribal", "birth", "brain", "habit", "trail", "train", "bray", "bran", "hilt", "hint", "lain", "lair", "liar", "rail", "rain", "yarn", "air", "art", "bay", "bin", "bit", "hat", "hit", "lab", "lay", "nab", "nay", "nit", "ran", "rat", "ray", "rib", "tab", "tan", "tar", "tin", "van"],
    },
    {
      sourceWord: "OXYGEN",
      validWords: ["oxygen", "gone", "nose", "ego", "one", "eon", "yon", "gen", "oxy"],
    },
    {
      sourceWord: "POLYMER",
      validWords: ["polymer", "employ", "morley", "proper", "moper", "morel", "poley", "mole", "mope", "more", "pore", "prom", "pyre", "rely", "role", "rope", "elm", "lop", "lye", "mop", "ore", "per", "ply", "pro", "pry", "rep", "rim", "roe", "rom", "rye"],
    },
    {
      sourceWord: "ENIGMA",
      validWords: ["enigma", "gamine", "image", "magie", "amen", "gain", "game", "main", "mane", "mean", "mega", "mien", "mine", "name", "aim", "gem", "gin", "mag", "man", "men", "nag"],
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
