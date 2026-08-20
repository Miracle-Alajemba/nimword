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
      message: "Only letters are allowed in WordPot.",
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
