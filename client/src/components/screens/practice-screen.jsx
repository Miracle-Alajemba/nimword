import { useEffect, useMemo, useState } from "react";
import {
  evaluatePracticeSubmission,
  getWordScore,
  normalizeWord,
} from "../../game.js";
import {
  playTileSound,
  playSuccessSound,
  playErrorSound,
  triggerTileHaptic,
  triggerSuccessHaptic,
  triggerErrorHaptic,
} from "../../utils/audio-haptics.js";
import { MetricCard, ScoreBadge, GameLoader, SocialShareBar, RoundPressure, GameSticker } from "../ui/index.js";

const PRACTICE_DIFFICULTIES = [
  { id: "easy", label: "Warm Up" },
  { id: "medium", label: "Standard" },
  { id: "hard", label: "Expert" },
];

const PRACTICE_DIFFICULTY_NOTES = {
  easy: "Warm Up gives broader letter pools and easier words to spot quickly.",
  medium: "Standard balances speed and challenge with a tighter but still fair word pool.",
  hard: "Expert gives tighter, trickier rounds with fewer obvious words to find.",
};
function getDifficultyLabel(difficulty) {
  return (
    PRACTICE_DIFFICULTIES.find((entry) => entry.id === difficulty)?.label ||
    difficulty
  );
}

function buildWordFromSelection(sourceWord, selectedIndexes) {
  const letters = String(sourceWord || "").split("");
  return selectedIndexes.map((index) => letters[index] || "").join("").toLowerCase();
}

function PracticeResults({
  score,
  wordsFound,
  onReplay,
  onExit,
}) {
  return (
    <div className="results-sheet">
      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <GameSticker type={score > 50 ? "wordMaster" : "fastFingers"} size="large" />
      </div>
      <p className="eyebrow" style={{ marginTop: "0.5rem" }}>Practice Complete</p>
      <h2 style={{ fontFamily: "var(--font-mono)" }}>{score} pts</h2>
      <p>
        You claimed <strong>{wordsFound.length}</strong>{" "}
        {wordsFound.length === 1 ? "word" : "words"} this round.
      </p>

      <div className="word-grid">
        {wordsFound.length ? (
          wordsFound.map((entry) => (
            <div key={entry.word} className="word-chip">
              <strong>{entry.word}</strong>
              <span style={{ fontFamily: "var(--font-mono)" }}>+{entry.score}</span>
            </div>
          ))
        ) : (
          <div className="empty-card">
            No words found this round. Try again and go for quicker submissions.
          </div>
        )}
      </div>

      <SocialShareBar score={score} wordCount={wordsFound.length} />

      <div className="hero-actions">
        <button type="button" onClick={onReplay}>
          Play Again
        </button>
        <button type="button" className="button-secondary" onClick={onExit}>
          Back Home
        </button>
      </div>
    </div>
  );
}

export function PracticeScreen({
  onExit,
  apiBaseUrl,
  roundSeconds = 60,
}) {
  const [roundSeed, setRoundSeed] = useState(null);
  const difficulty = "medium";
  const [timeLeft, setTimeLeft] = useState(roundSeconds);
  const [draftWord, setDraftWord] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("Build as many valid words as you can.");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [claimedWords, setClaimedWords] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [bestWord, setBestWord] = useState("");
  const [streak, setStreak] = useState(0);
  const [loadingRound, setLoadingRound] = useState(true);
  const [scorePop, setScorePop] = useState(false);
  const [wordPop, setWordPop] = useState(false);
  const [inputShake, setInputShake] = useState(false);
  const sourceLetters = String(roundSeed?.sourceWord || "").split("");
  const selectedWord = draftWord;

  async function loadPracticeRound(nextFeedback = "New round loaded. Go fast and go clean.") {
    setLoadingRound(true);
    setFeedback("Loading a fresh round...");
    setFeedbackTone("neutral");

    try {
      const response = await fetch(
        `${apiBaseUrl}/rounds/practice?difficulty=${encodeURIComponent(difficulty)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load a practice round.");
      }

      setRoundSeed(data.round);
      setTimeLeft(roundSeconds);
      setDraftWord("");
      setSelectedIndexes([]);
      setScore(0);
      setClaimedWords([]);
      setIsFinished(false);
      setBestWord("");
      setStreak(0);
      setFeedback(nextFeedback);
      setFeedbackTone("neutral");
    } catch (error) {
      setFeedback(error.message || "Unable to load practice round.");
      setFeedbackTone("error");
    } finally {
      setLoadingRound(false);
    }
  }

  useEffect(() => {
    loadPracticeRound("Build as many valid words as you can.");
  }, []);

  useEffect(() => {
    if (isFinished || !roundSeed) return undefined;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setIsFinished(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isFinished, roundSeed?.sourceWord]);

  const claimedSet = useMemo(
    () => new Set(claimedWords.map((entry) => entry.word)),
    [claimedWords],
  );
  const progress = ((roundSeconds - timeLeft) / roundSeconds) * 100;
  const totalValidWords = roundSeed?.validWords?.length || 0;
  const dictionaryProgress = totalValidWords
    ? Math.round((claimedWords.length / totalValidWords) * 100)
    : 0;
  const longestWord = useMemo(() => {
    return claimedWords.reduce((current, entry) => {
      if (!current) return entry.word;
      return entry.word.length > current.length ? entry.word : current;
    }, "");
  }, [claimedWords]);

  function resetRound() {
    loadPracticeRound("New round. Go fast and go clean.");
  }

  function submitSelectedWord() {
    if (isFinished || !roundSeed) {
      return;
    }

    const normalized = normalizeWord(selectedWord);
    if (!normalized) return;

    setDraftWord("");
    setSelectedIndexes([]);
    const evaluation = evaluatePracticeSubmission({
      input: normalized,
      sourceWord: roundSeed.sourceWord,
      validWords: roundSeed.validWords,
      claimedWords: claimedSet,
    });

    if (!evaluation.ok) {
      playErrorSound();
      triggerErrorHaptic();
      setFeedback(evaluation.message);
      setFeedbackTone("error");
      setStreak(0);
      setInputShake(true);
      setTimeout(() => setInputShake(false), 400);
      return;
    }

    playSuccessSound();
    triggerSuccessHaptic();
    const points = evaluation.score ?? getWordScore(evaluation.word);

    setClaimedWords((current) => [
      ...current,
      { word: evaluation.word, score: points },
    ]);
    setScore((current) => current + points);
    setFeedback(evaluation.message);
    setFeedbackTone("success");
    setStreak((current) => current + 1);

    setScorePop(true);
    setWordPop(true);
    setTimeout(() => {
      setScorePop(false);
      setWordPop(false);
    }, 350);

    if (!bestWord || evaluation.word.length > bestWord.length) {
      setBestWord(evaluation.word);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitSelectedWord();
  }

  function handleToggleTile(index) {
    playTileSound();
    triggerTileHaptic();
    setSelectedIndexes((current) => {
      const nextIndexes = current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index];
      setDraftWord(buildWordFromSelection(roundSeed?.sourceWord, nextIndexes));
      return nextIndexes;
    });
  }

  function clearSelection() {
    setDraftWord("");
    setSelectedIndexes([]);
  }

  useEffect(() => {
    if (isFinished || !roundSeed || loadingRound) return undefined;

    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      const isTypingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "Enter") {
        if (!selectedWord) return;
        event.preventDefault();
        submitSelectedWord();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setSelectedIndexes((current) => {
          const nextIndexes = current.slice(0, -1);
          setDraftWord(buildWordFromSelection(roundSeed.sourceWord, nextIndexes));
          return nextIndexes;
        });
        return;
        }

      if (event.key === "Escape") {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (/^[a-zA-Z]$/.test(event.key)) {
        const typedLetter = event.key.toLowerCase();
        const letters = String(roundSeed.sourceWord || "").toLowerCase().split("");

        setSelectedIndexes((current) => {
          const nextIndex = letters.findIndex(
            (letter, index) => letter === typedLetter && !current.includes(index),
          );

          if (nextIndex === -1) {
            setFeedback(`No unused "${typedLetter.toUpperCase()}" tile is available.`);
            setFeedbackTone("error");
            return current;
          }

          event.preventDefault();
          const nextIndexes = [...current, nextIndex];
          setDraftWord(buildWordFromSelection(roundSeed.sourceWord, nextIndexes));
          return nextIndexes;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, loadingRound, roundSeed, selectedWord, claimedSet]);

  return (
    <main className="page-shell">
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onExit}>
            Back
          </button>
          <p className="eyebrow">Practice Mode</p>
        </div>

        {/* Difficulty level selector removed */}

        <div className="play-hero">
          <div>
            <p className="play-label">Source word</p>
            <h1>{roundSeed?.sourceWord || "LOADING"}</h1>
            <p className="lede">
              Make real words from these letters before the timer runs out.
            </p>
            <div className="letter-rack letter-rack--play">
              {sourceLetters.map((letter, index) => (
                <button
                  key={`${letter}-${index}`}
                  type="button"
                  className={`letter-tile letter-tile--play letter-tile--interactive ${selectedIndexes.includes(index) ? "letter-tile--selected" : ""}`}
                  onClick={() => handleToggleTile(index)}
                  aria-label={`Select letter ${letter}`}
                >
                  {letter}
                </button>
              ))}
            </div>
            <div className="word-preview word-preview--practice">
              {selectedWord ? selectedWord.toUpperCase().split("").join(" - ") : "Tap letters to form a word"}
            </div>
          </div>

          <div className="score-row">
            <ScoreBadge label="Time left" value={`${timeLeft}s`} className={timeLeft <= 10 ? "timer-urgent" : ""} />
            <ScoreBadge label="Score" value={score} className={scorePop ? "score-badge--pop" : ""} />
            <ScoreBadge label="Claimed" value={claimedWords.length} className={wordPop ? "score-badge--pop" : ""} />
          </div>
        </div>

        <RoundPressure progress={progress} timeLeft={timeLeft} totalTime={roundSeconds} />

        {loadingRound ? (
          <div className="results-sheet" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GameLoader label="Generating new round..." letters="PRACTICE" />
          </div>
        ) : isFinished ? (
          <PracticeResults
            score={score}
            wordsFound={claimedWords}
            onReplay={resetRound}
            onExit={onExit}
          />
        ) : (
          <>
            <div className="mobile-sticky-bottom-wrap">
              <form className="submit-panel" onSubmit={handleSubmit} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                marginTop: "0",
                width: "100%"
              }}>
                <input
                  type="text"
                  value={selectedWord}
                  onChange={(event) => {
                    setDraftWord(event.target.value);
                    setSelectedIndexes([]);
                  }}
                  className={inputShake ? "input-shake" : ""}
                  placeholder="Tap letters or type your word"
                  autoComplete="off"
                  spellCheck="false"
                  style={{
                    gridColumn: "span 2",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.95rem"
                  }}
                />
                <button type="button" className="button-secondary" onClick={clearSelection} style={{
                  padding: "0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.95rem"
                }}>
                  Clear
                </button>
                <button type="submit" disabled={!selectedWord} style={{
                  padding: "0.75rem",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  background: "var(--accent-mint)",
                  color: "#121212",
                  fontWeight: "bold"
                }}>
                  Claim Word
                </button>
              </form>

              {feedback ? (
                <div className={`notice-strip notice-strip--${feedbackTone}`} style={{
                  marginTop: "0.5rem",
                  padding: "0.6rem 0.8rem",
                  fontSize: "0.88rem",
                  borderRadius: "10px"
                }}>
                  {feedback}
                </div>
              ) : null}
            </div>

            <section className="practice-grid">
              <article className="panel">
                <h3>Claimed Words</h3>
                <div className="word-grid">
                  {claimedWords.length ? (
                    claimedWords
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.word} className="word-chip">
                          <strong>{entry.word}</strong>
                          <span style={{ fontFamily: "var(--font-mono)" }}>+{entry.score}</span>
                        </div>
                      ))
                  ) : (
                    <div className="empty-card">
                      No words yet. Build a word from the tiles and claim it.
                    </div>
                  )}
                </div>
              </article>

              <article className="panel">
                <h3>Round Intel</h3>
                <div className="metrics-grid">
                  <MetricCard
                    label="Best word"
                    value={bestWord || "--"}
                    hint="Your longest accepted word so far"
                  />
                  <MetricCard
                    label="Current streak"
                    value={streak}
                    hint="Accepted words in a row"
                  />
                  <MetricCard
                    label="Round progress"
                    value={`${dictionaryProgress}%`}
                    hint={`${claimedWords.length}/${totalValidWords} words found`}
                  />
                  <MetricCard
                    label="Longest found"
                    value={longestWord || "--"}
                    hint="Best word discovered this round"
                  />
                </div>

                <div className="rules-card">
                  <h4>Scoring</h4>
                  <ul>
                    <li>3 letters = 3 points</li>
                    <li>4 letters = 5 points</li>
                    <li>5 letters = 8 points</li>
                    <li>6+ letters = 12 points</li>
                  </ul>
                </div>
              </article>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
