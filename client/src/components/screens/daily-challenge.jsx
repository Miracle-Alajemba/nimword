import { useEffect, useMemo, useRef, useState } from "react";
import {
  normalizeWord,
  generateClientDailyRound,
  evaluatePracticeSubmission,
  getWordScore,
} from "../../game.js";
import { GameLoader } from "../ui/index.js";
import { isWalletAddress, isNimiqAddress, formatNimiqAddress } from "../../utils/nimiq-identicon.js";

const DAILY_TARGET_SCORE = 40;
const DAILY_ROUND_SECONDS = 60;

function ScoreBadge({ label, value, className = "" }) {
  return (
    <div className={`score-badge ${className}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildWordFromSelection(sourceWord, selectedIndexes) {
  const letters = String(sourceWord || "").split("");
  return selectedIndexes.map((index) => letters[index] || "").join("").toLowerCase();
}

export function DailyChallenge({
  apiBaseUrl,
  walletAddress,
  walletReady,
  onConnectWallet,
  onBack,
  onScoreUpdate,
  dailyClaimed,
  dailyClaimAmount,
  dailyPlayed,
  dailyNextAvailableAt,
  dailyClaimBusy,
  dailyClaimTx,
  dailyClaimError,
  dailyClaimMessage,
  onRecordPlay,
  onClaimDaily,
  onRefreshStatus,
  getInjectedProvider,
  getWalletClient,
  getPublicClient,
  ensureNimiqMainnet,
}) {
  const [roundSeed, setRoundSeed] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [timeLeft, setTimeLeft] = useState(DAILY_ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [draftWord, setDraftWord] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [claimedWords, setClaimedWords] = useState([]);
  const [feedback, setFeedback] = useState("Start today's challenge when you are ready.");
  const [feedbackTone, setFeedbackTone] = useState("neutral");
  const [loadingRound, setLoadingRound] = useState(false);
  const [wordSubmitBusy, setWordSubmitBusy] = useState(false);
  const [currentPlayStarted, setCurrentPlayStarted] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [wordPop, setWordPop] = useState(false);
  const [inputShake, setInputShake] = useState(false);
  const wordSubmitBusyRef = useRef(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [treasuryWallet, setTreasuryWallet] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useEffect(() => {
    if (walletAddress) {
      fetch(`${apiBaseUrl}/daily/status?walletAddress=${encodeURIComponent(walletAddress.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.treasuryWallet) {
            setTreasuryWallet(data.treasuryWallet);
          }
        })
        .catch((err) => console.warn("Failed to load daily status details", err));
    }
  }, [apiBaseUrl, walletAddress]);

  const handleBuyRetryTicket = async () => {
    setRetryError("");
    setIsRetrying(true);
    try {
      let txHash = "";
      if (walletReady && getInjectedProvider && getWalletClient && getPublicClient && treasuryWallet) {
        const provider = getInjectedProvider();
        if (provider?.request) {
          await ensureNimiqMainnet(provider);
          const walletClient = getWalletClient();
          const publicClient = getPublicClient();
          if (walletClient && publicClient) {
            const [account] = await walletClient.getAddresses();
            txHash = await walletClient.sendTransaction({
              account,
              chain: walletClient.chain,
              to: treasuryWallet,
              value: BigInt(50000000000000000), // 0.1 NIM
            });
            await publicClient.waitForTransactionReceipt({ hash: txHash });
          }
        }
      }

      const response = await fetch(`${apiBaseUrl}/daily/retry-purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: walletAddress.trim(), txHash }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to purchase retry ticket.");
      }

      if (onRefreshStatus) {
        await onRefreshStatus();
      }
      resetChallenge();
    } catch (err) {
      setRetryError(err.message || "Failed to buy retry ticket.");
    } finally {
      setIsRetrying(false);
    }
  };
  const cooldownRef = useRef(null);

  const sourceLetters = String(roundSeed?.sourceWord || "").split("");
  const claimedSet = useMemo(
    () => new Set(claimedWords.map((entry) => entry.word)),
    [claimedWords],
  );
  const selectedWord = draftWord;
  const walletConnected = isWalletAddress(walletAddress);

  async function loadDailyRound(
    difficulty = "medium",
    nextPhase = "idle",
    nextFeedback = "Start today's challenge when you are ready.",
  ) {
    setLoadingRound(true);
    setFeedback("Loading today's challenge word...");
    setFeedbackTone("neutral");

    try {
      const response = await fetch(
        `${apiBaseUrl}/rounds/daily-challenge?walletAddress=${encodeURIComponent(walletAddress.trim())}&difficulty=${encodeURIComponent(difficulty)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load Daily Challenge.");
      }

      setRoundSeed(data.round);
      setPhase(nextPhase);
      setTimeLeft(DAILY_ROUND_SECONDS);
      setScore(0);
      onScoreUpdate(0);
      setDraftWord("");
      setSelectedIndexes([]);
      setClaimedWords([]);
      setFeedback(nextFeedback);
      setFeedbackTone("neutral");
    } catch {
      // Graceful client fallback for offline/cold start
      const fallbackRound = generateClientDailyRound(difficulty);
      setRoundSeed(fallbackRound);
      setPhase(nextPhase);
      setTimeLeft(DAILY_ROUND_SECONDS);
      setScore(0);
      onScoreUpdate(0);
      setDraftWord("");
      setSelectedIndexes([]);
      setClaimedWords([]);
      setFeedback(nextFeedback);
      setFeedbackTone("neutral");
    } finally {
      setLoadingRound(false);
    }
  }

  useEffect(() => {
    if (phase !== "playing") return undefined;

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setPhase("finished");
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "finished" && roundSeed?.id && walletAddress) {
      fetch(`${apiBaseUrl}/daily/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: roundSeed.id,
          walletAddress: walletAddress.trim(),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Daily challenge finalized:", data);
        })
        .catch((err) => console.warn("Failed to finalize daily challenge", err));
    }
  }, [phase, roundSeed?.id, walletAddress, apiBaseUrl]);

  async function startChallenge(difficulty = "medium") {
    if (loadingRound) return;

    setCurrentPlayStarted(true);
    const allowed = await onRecordPlay();
    if (!allowed) {
      setCurrentPlayStarted(false);
      setFeedback("You have already played the Daily Challenge today. Check back when your cooldown timer ends.");
      setFeedbackTone("error");
      return;
    }

    const rules = {
      easy: { target: 40, reward: "0.1 NIM" },
      medium: { target: 60, reward: "1 NIM" },
      hard: { target: 80, reward: "2 NIM" }
    };
    const target = rules[difficulty]?.target || 60;
    const reward = rules[difficulty]?.reward || "1 NIM";

    await loadDailyRound(
      difficulty,
      "playing",
      `Build valid words fast. Reach ${target} points to unlock today's ${reward} reward.`,
    );
  }

  function resetChallenge() {
    setRoundSeed(null);
    setPhase("idle");
    setTimeLeft(DAILY_ROUND_SECONDS);
    setScore(0);
    onScoreUpdate(0);
    setDraftWord("");
    setSelectedIndexes([]);
    setClaimedWords([]);
    setCurrentPlayStarted(false);
    setFeedback("Start today's challenge when you are ready.");
    setFeedbackTone("neutral");
  }

  function handleToggleTile(index) {
    if (phase !== "playing") return;

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

  async function submitSelectedWord() {
    if (phase !== "playing" || !roundSeed || wordSubmitBusyRef.current) return;

    const normalized = normalizeWord(selectedWord);
    if (!normalized) return;

    wordSubmitBusyRef.current = true;
    setWordSubmitBusy(true);
    setDraftWord("");
    setSelectedIndexes([]);

    if (claimedSet.has(normalized)) {
      setFeedback("Already claimed in this round.");
      setFeedbackTone("error");
      setInputShake(true);
      setTimeout(() => setInputShake(false), 400);
      wordSubmitBusyRef.current = false;
      setWordSubmitBusy(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/daily/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: walletAddress.trim(),
          sessionId: roundSeed.id,
          word: normalized,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to claim this word.");
      }

      setClaimedWords((current) => [
        ...current,
        { word: data.word, score: data.score },
      ]);
      setScore(data.totalScore);
      onScoreUpdate(data.totalScore);
      setFeedback(data.message || `Locked in ${data.word} for +${data.score} points.`);
      setFeedbackTone("success");

      setScorePop(true);
      setWordPop(true);
      setTimeout(() => {
        setScorePop(false);
        setWordPop(false);
      }, 350);
    } catch {
      // Local fallback evaluation
      const validation = evaluatePracticeSubmission({
        input: normalized,
        sourceWord: roundSeed.sourceWord,
        validWords: roundSeed.validWords || [],
        claimedWords: claimedSet,
      });

      if (validation.ok) {
        const wordScore = validation.score || getWordScore(normalized);
        const nextScore = score + wordScore;
        setClaimedWords((current) => [
          ...current,
          { word: normalized, score: wordScore },
        ]);
        setScore(nextScore);
        onScoreUpdate(nextScore);
        setFeedback(validation.message || `Locked in ${normalized} for +${wordScore} points.`);
        setFeedbackTone("success");
        setScorePop(true);
        setWordPop(true);
        setTimeout(() => {
          setScorePop(false);
          setWordPop(false);
        }, 350);
      } else {
        setFeedback(validation.message || "Unable to claim this word.");
        setFeedbackTone("error");
        setInputShake(true);
        setTimeout(() => setInputShake(false), 400);
      }
    } finally {
      wordSubmitBusyRef.current = false;
      setWordSubmitBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitSelectedWord();
  }

  useEffect(() => {
    if (phase !== "playing" || !roundSeed) return undefined;

    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      const isTypingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "Enter") {
        if (!selectedWord || wordSubmitBusyRef.current) return;
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
  }, [phase, roundSeed, selectedWord, selectedIndexes, claimedSet]);

  useEffect(() => {
    if (!dailyNextAvailableAt) {
      setCooldownSeconds(0);
      return undefined;
    }

    function update() {
      const diff = Math.max(
        0,
        Math.ceil((new Date(dailyNextAvailableAt).getTime() - Date.now()) / 1000),
      );
      setCooldownSeconds(diff);
    }

    update();
    const interval = window.setInterval(update, 1000);
    cooldownRef.current = interval;
    return () => window.clearInterval(interval);
  }, [dailyNextAvailableAt]);

  async function handleClaim() {
    if (!walletConnected || !walletReady) {
      await onConnectWallet();
      return;
    }
    await onClaimDaily(roundSeed?.id);
  }

  // Wallet gate — must be after all hooks
  if (!walletConnected) {
    return (
      <main className="page-shell">
        <section className="play-shell" style={{ maxWidth: "580px", margin: "0 auto" }}>
          <div className="play-header" style={{ marginBottom: "1rem" }}>
            <button type="button" className="ghost-button" onClick={onBack}>
              ← Back
            </button>
            <p className="eyebrow" style={{ color: "var(--interactive-ink)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Daily Challenge Pass
            </p>
          </div>
          <div
            className="results-sheet"
            style={{
              textAlign: "center",
              padding: "2.5rem 1.75rem",
              background: "var(--surface)",
              border: "1px solid var(--rule-strong)",
              borderRadius: "20px",
              boxShadow: "0 12px 36px -8px oklch(0.2737 0.068 276.29 / 0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            {/* Animated Trophy Icon */}
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, oklch(0.7924 0.1593 85.61 / 0.2) 0%, oklch(0.5849 0.1438 244.29 / 0.2) 100%)",
                border: "1.5px solid var(--nq-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                boxShadow: "0 8px 24px oklch(0.7924 0.1593 85.61 / 0.25)",
              }}
            >
              🏆
            </div>

            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--surface-sunk)", padding: "4px 12px", borderRadius: "20px", border: "1px solid var(--rule)", marginBottom: "0.6rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--nq-gold)", display: "inline-block" }} />
                <span style={{ fontSize: "0.74rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-2)" }}>
                  Web3 Wallet Sign-In Required
                </span>
              </div>
              <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-game)", margin: "0 0 0.4rem", color: "var(--ink)", letterSpacing: "0.03em" }}>
                Unlock Daily Rewards
              </h2>
              <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", margin: "0 auto", maxWidth: "440px", lineHeight: 1.5 }}>
                Connect your Nimiq wallet to play today's word arena round and claim real NIM rewards directly onchain.
              </p>
            </div>

            {/* 3 Perks Chips */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem", width: "100%" }}>
              <div style={{ background: "var(--surface-sunk)", padding: "0.75rem 0.5rem", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                <span style={{ fontSize: "1.2rem", display: "block", marginBottom: "2px" }}>⚡</span>
                <strong style={{ fontSize: "0.78rem", color: "var(--ink)", display: "block" }}>1 Free Play</strong>
                <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>Refreshes daily</span>
              </div>
              <div style={{ background: "var(--surface-sunk)", padding: "0.75rem 0.5rem", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                <span style={{ fontSize: "1.2rem", display: "block", marginBottom: "2px" }}>🪙</span>
                <strong style={{ fontSize: "0.78rem", color: "var(--good)", display: "block" }}>Up to 2 NIM</strong>
                <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>Instant reward</span>
              </div>
              <div style={{ background: "var(--surface-sunk)", padding: "0.75rem 0.5rem", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                <span style={{ fontSize: "1.2rem", display: "block", marginBottom: "2px" }}>✓</span>
                <strong style={{ fontSize: "0.78rem", color: "var(--interactive-ink)", display: "block" }}>Verified</strong>
                <span style={{ fontSize: "0.68rem", color: "var(--ink-muted)" }}>Nimiq Mainnet</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%", maxWidth: "340px", marginTop: "0.35rem" }}>
              <button
                type="button"
                onClick={onConnectWallet}
                style={{
                  minHeight: "48px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.96rem",
                  fontWeight: 800,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                ⚡ Connect Nimiq Wallet
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={onBack}
                style={{ minHeight: "44px", borderRadius: "12px", fontSize: "0.88rem" }}
              >
                ← Return to Home
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (dailyPlayed && !dailyClaimed && !currentPlayStarted) {
    return (
      <main className="page-shell">
        <section className="play-shell" style={{ maxWidth: "580px", margin: "0 auto" }}>
          <div className="play-header" style={{ marginBottom: "1rem" }}>
            <button type="button" className="ghost-button" onClick={onBack}>
              ← Back
            </button>
            <p className="eyebrow" style={{ color: "var(--interactive-ink)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Daily Challenge Cooldown
            </p>
          </div>
          <div
            className="results-sheet"
            style={{
              textAlign: "center",
              padding: "2.5rem 1.75rem",
              background: "var(--surface)",
              border: "1px solid var(--rule-strong)",
              borderRadius: "20px",
              boxShadow: "0 12px 36px -8px oklch(0.2737 0.068 276.29 / 0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "2.8rem", marginBottom: "0.25rem" }}>⏳</div>
            <h2 style={{ fontSize: "1.85rem", fontFamily: "var(--font-game)", margin: 0, color: "var(--ink)" }}>
              Next Play Available In
            </h2>
            <div style={{ background: "var(--surface-sunk)", padding: "0.6rem 1.4rem", borderRadius: "12px", border: "1px solid var(--rule)" }}>
              <strong style={{ fontSize: "1.5rem", fontFamily: "var(--font-mono)", color: "var(--interactive-ink)" }}>
                {cooldownSeconds > 0
                  ? `${Math.floor(cooldownSeconds / 3600)}h ${Math.floor((cooldownSeconds % 3600) / 60)}m ${cooldownSeconds % 60}s`
                  : "Less than a minute"}
              </strong>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--ink-2)", margin: 0, maxWidth: "420px", lineHeight: 1.4 }}>
              Come back when the cooldown timer expires to play again and claim your next daily reward.
            </p>

            <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1.25rem", marginTop: "0.5rem", width: "100%" }}>
              <h4 style={{ color: "var(--nq-gold-deep, var(--ink))", margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 800 }}>
                Can't wait? ⚡
              </h4>
              <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                Skip the cooldown and play again immediately with an instant retry ticket.
              </p>
              <button
                type="button"
                onClick={handleBuyRetryTicket}
                disabled={isRetrying}
                style={{
                  minHeight: "44px",
                  padding: "0.65rem 1.4rem",
                  fontSize: "0.9rem",
                  borderRadius: "10px",
                  fontWeight: 800,
                  margin: "0 auto",
                }}
              >
                {isRetrying ? "Processing..." : "Buy Retry Ticket (0.1 NIM)"}
              </button>
              {retryError ? (
                <div className="notice-strip notice-strip--error" style={{ marginTop: "10px" }}>{retryError}</div>
              ) : null}
            </div>

            <div style={{ marginTop: "0.5rem" }}>
              <button type="button" className="button-secondary" onClick={onBack} style={{ minHeight: "40px", borderRadius: "10px", fontSize: "0.86rem" }}>
                ← Back to Home
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (dailyClaimed) {
    return (
      <main className="page-shell">
        <section className="play-shell">
          <div className="play-header">
            <button type="button" className="ghost-button" onClick={onBack}>Back</button>
            <p className="eyebrow">Daily Challenge</p>
          </div>
          <div className="dc-claimed-screen">
            <div className="dc-claimed-screen__icon trophy-cup-animated">🏆</div>
            <h2 className="dc-claimed-screen__title">
              <span aria-hidden="true">🎉</span> Reward Claimed
            </h2>
            <p className="dc-claimed-screen__sub">You claimed your 0.1 NIM reward today.</p>
            <div className="dc-claimed-screen__amount">0.1 NIM</div>
            {dailyClaimTx ? (
              <a
                className="dc-result-card__tx-link"
                href={`https://nimiqwatch.com/tx/${dailyClaimTx}`}
                target="_blank"
                rel="noreferrer"
              >
                View transaction on Nimiq Explorer →
              </a>
            ) : null}
            <button
              type="button"
              className="dc-result-card__share-btn"
              onClick={() => {
                const text = `I just claimed real NIM on NIMWORD! 🏆\n\nNIMWORD Daily Challenge pays 0.1 NIM every day — completely free to play.\n\nTry it at https://nimword.vercel.app\n\n#NIMWORD #Nimiq #Web3Gaming`;
                if (navigator.share) {
                  navigator.share({ text });
                } else {
                  navigator.clipboard.writeText(text);
                  alert("Result copied to clipboard!");
                }
              }}
            >
              Share & Invite Friends
            </button>
            <div className="dc-claimed-screen__divider" />
            <p className="dc-claimed-screen__next">
              <span aria-hidden="true">🌅</span> Come back tomorrow for your next reward.
            </p>
            <button type="button" className="button-secondary" onClick={onBack}>
              Back to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBack}>
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="eyebrow">
            <span aria-hidden="true">⭐</span> Daily Challenge
          </p>
        </div>

        {!loadingRound && phase !== "idle" ? (
          <div className="play-hero">
            <div>
              <p className="play-label">
                <span aria-hidden="true">📅</span> Today's Word
              </p>
              <h1>{roundSeed?.sourceWord || "LOADING"}</h1>
              <p className="lede">
                Score {roundSeed?.targetScore || 40} points in one free round to claim today's {roundSeed?.rewardDisplay || "0.1 NIM"} reward.
              </p>
              <div className="letter-rack letter-rack--play">
                {sourceLetters.map((letter, index) => (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    className={`letter-tile letter-tile--play letter-tile--interactive ${selectedIndexes.includes(index) ? "letter-tile--selected" : ""}`}
                    onClick={() => handleToggleTile(index)}
                    disabled={phase !== "playing"}
                    aria-label={`Select letter ${letter}`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="word-preview word-preview--practice">
                {selectedWord
                  ? selectedWord.toUpperCase().split("").join(" - ")
                  : "👆 Tap letters to form a word"}
              </div>

              {phase === "playing" && (
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
                    <button type="submit" disabled={!selectedWord || wordSubmitBusy} style={{
                      padding: "0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.95rem",
                      background: "var(--accent-mint)",
                      color: "var(--surface)",
                      fontWeight: "bold"
                    }}>
                      {wordSubmitBusy ? "Claiming..." : "Claim Word"}
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
              )}
            </div>

            <div className="score-row">
              <ScoreBadge label="Target" value={`${roundSeed?.targetScore || 40} pts`} />
              <ScoreBadge label="Time left" value={`${timeLeft}s`} className={timeLeft <= 10 ? "timer-urgent" : ""} />
              <ScoreBadge label="Score" value={score} className={scorePop ? "score-badge--pop" : ""} />
              <ScoreBadge label="Words" value={claimedWords.length} className={wordPop ? "score-badge--pop" : ""} />
            </div>
          </div>
        ) : null}

        {loadingRound ? (
          <div className="results-sheet" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem" }}>
            <GameLoader label="Preparing today's challenge..." letters="DAILY" />
          </div>
        ) : phase === "idle" ? (
          <div className="results-sheet" style={{ maxWidth: "560px", margin: "0 auto", padding: "2rem 1.8rem" }}>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
              <div className="trophy-cup-animated" style={{ fontSize: "2.8rem", marginBottom: "0.5rem", display: "inline-block" }}>🏆</div>
              <p className="eyebrow" style={{ color: "var(--interactive-ink)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>
                Daily Reward Arena
              </p>
              <h2 style={{ fontSize: "1.85rem", fontFamily: "var(--font-game)", margin: "0 0 0.4rem", color: "var(--ink)" }}>
                Choose Challenge Level
              </h2>
              <p style={{ fontSize: "0.88rem", color: "var(--ink-2)", margin: 0, lineHeight: 1.4 }}>
                Hit the score target in 60s to unlock verified onchain NIM rewards. Free to play daily!
              </p>
            </div>

            <div className="difficulty-choices" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", marginBottom: "1.25rem" }}>
              {/* Easy Tier */}
              <button
                type="button"
                className="difficulty-card"
                onClick={() => startChallenge("easy")}
                disabled={loadingRound}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.9rem 1.25rem",
                  background: "var(--surface-sunk)",
                  border: "1px solid var(--rule)",
                  borderLeft: "5px solid var(--good)",
                  borderRadius: "14px",
                  textAlign: "left",
                  color: "var(--ink)",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.18s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>🎮</span>
                    <strong style={{ fontSize: "1.05rem", color: "var(--ink)", fontWeight: 800, fontFamily: "var(--font-game)" }}>
                      Warm Up (Easy)
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--good)", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Target: 40 pts • 60s Round
                  </span>
                </div>
                <div style={{ textAlign: "right", background: "var(--surface)", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.62rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 800 }}>Reward</span>
                  <strong style={{ color: "var(--good)", fontSize: "1.1rem", fontFamily: "var(--font-mono)", fontWeight: 900 }}>0.1 NIM</strong>
                </div>
              </button>

              {/* Medium Tier */}
              <button
                type="button"
                className="difficulty-card"
                onClick={() => startChallenge("medium")}
                disabled={loadingRound}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.9rem 1.25rem",
                  background: "var(--surface-sunk)",
                  border: "1px solid var(--rule)",
                  borderLeft: "5px solid var(--nq-gold)",
                  borderRadius: "14px",
                  textAlign: "left",
                  color: "var(--ink)",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.18s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>⚔️</span>
                    <strong style={{ fontSize: "1.05rem", color: "var(--ink)", fontWeight: 800, fontFamily: "var(--font-game)" }}>
                      Champion (Medium)
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--nq-gold-deep, var(--ink))", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Target: 60 pts • 60s Round
                  </span>
                </div>
                <div style={{ textAlign: "right", background: "var(--surface)", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.62rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 800 }}>Reward</span>
                  <strong style={{ color: "var(--nq-gold-deep, var(--ink))", fontSize: "1.1rem", fontFamily: "var(--font-mono)", fontWeight: 900 }}>1.0 NIM</strong>
                </div>
              </button>

              {/* Hard Tier */}
              <button
                type="button"
                className="difficulty-card"
                onClick={() => startChallenge("hard")}
                disabled={loadingRound}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.9rem 1.25rem",
                  background: "var(--surface-sunk)",
                  border: "1px solid var(--rule)",
                  borderLeft: "5px solid var(--interactive)",
                  borderRadius: "14px",
                  textAlign: "left",
                  color: "var(--ink)",
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.18s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.2rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>👑</span>
                    <strong style={{ fontSize: "1.05rem", color: "var(--ink)", fontWeight: 800, fontFamily: "var(--font-game)" }}>
                      Grandmaster (Hard)
                    </strong>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--interactive-ink)", fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Target: 80 pts • 60s Round
                  </span>
                </div>
                <div style={{ textAlign: "right", background: "var(--surface)", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.62rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 800 }}>Reward</span>
                  <strong style={{ color: "var(--interactive-ink)", fontSize: "1.1rem", fontFamily: "var(--font-mono)", fontWeight: 900 }}>2.0 NIM</strong>
                </div>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="ghost-button" onClick={onBack} style={{ padding: "0.5rem 1.2rem", fontSize: "0.88rem" }}>
                ← Return to Home
              </button>
            </div>
          </div>
        ) : phase === "finished" ? (
          <div className="dc-result-card">
            <div className="dc-result-card__header">
              <p className="dc-result-card__eyebrow">Daily Challenge Complete</p>
              <div className="dc-result-card__score-block">
                <span className="dc-result-card__score">{score}</span>
                <span className="dc-result-card__score-label">pts</span>
              </div>
              <div className="dc-result-card__stats">
                <div className="dc-result-stat">
                  <span><span aria-hidden="true">📖</span> Words Found</span>
                  <strong>{claimedWords.length}</strong>
                </div>
                <div className="dc-result-stat">
                  <span><span aria-hidden="true">🎯</span> Target</span>
                  <strong>{DAILY_TARGET_SCORE} pts</strong>
                </div>
                <div className="dc-result-stat">
                  <span><span aria-hidden="true">📊</span> Status</span>
                  <strong style={{ color: score >= DAILY_TARGET_SCORE ? "var(--nq-gold-deep)" : "var(--bad)" }}>
                    {score >= DAILY_TARGET_SCORE ? "✅ Target Reached" : "❌ Target Missed"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="dc-result-card__body">
              {score < DAILY_TARGET_SCORE ? (
                <>
                  <p className="dc-result-card__message">
                    You scored <strong>{score} pts</strong> but need <strong>{DAILY_TARGET_SCORE} pts</strong> to claim today's reward. Try again tomorrow.
                  </p>
                  <button type="button" onClick={resetChallenge} className="dc-result-card__cta">
                    <span aria-hidden="true">🔄</span> Play Again
                  </button>
                  <button
                    type="button"
                    className="dc-result-card__share-btn"
                    onClick={() => {
                      const text = `I scored ${score} pts on NimWord Daily Challenge today! Can you beat me? 🎮\n\nPlay free at https://nimword.vercel.app\n\n#NimWord #BuildOnNimiq #Nimiq`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert("Result copied to clipboard!");
                      }
                    }}
                  >
                    <span aria-hidden="true">📣</span> Share My Score
                  </button>
                </>
              ) : dailyClaimed ? (
                <>
                  <div className="dc-result-card__claimed-badge">
                    ✓ Reward Claimed
                  </div>
                  <p className="dc-result-card__message">
                    0.1 NIM has been sent to your wallet.
                  </p>
                  {dailyClaimTx ? (
                    <a
                      className="dc-result-card__tx-link"
                      href={`https://nimiqwatch.com/tx/${dailyClaimTx}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Nimiq Explorer → {dailyClaimTx.slice(0, 10)}...{dailyClaimTx.slice(-6)}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="dc-result-card__share-btn"
                    onClick={() => {
                      const text = `I just claimed 0.1 NIM on NIMWORD Daily Challenge! 🏆\n\nI scored ${score} pts from the word ${roundSeed?.sourceWord || ""}.\n\nPlay free at https://nimword.vercel.app\n\n#NIMWORD #Nimiq`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert("Result copied to clipboard!");
                      }
                    }}
                  >
                    <span aria-hidden="true">📣</span> Share Result
                  </button>
                  <button type="button" className="button-secondary dc-result-card__cta" onClick={resetChallenge}>
                    <span aria-hidden="true">🔄</span> Play Again Tomorrow
                  </button>
                </>
              ) : (
                <>
                  {dailyClaimMessage ? (
                    <div className="dc-result-card__claimed-badge">✓ {dailyClaimMessage}</div>
                  ) : null}
                  {dailyClaimError ? (
                    <div className="notice-strip notice-strip--error">{dailyClaimError}</div>
                  ) : null}
                  <p className="dc-result-card__message">
                    You hit the target. Claim your <strong>0.1 NIM</strong> reward now.
                  </p>
                  <button
                    type="button"
                    className="dc-result-card__cta btn-gold"
                    onClick={handleClaim}
                    disabled={dailyClaimBusy}
                  >
                    {dailyClaimBusy
                      ? "Sending reward..."
                      : walletConnected
                        ? "💸 Claim 0.1 NIM"
                        : "⚡ Connect Nimiq Wallet to Claim"}
                  </button>
                  <button
                    type="button"
                    className="dc-result-card__share-btn"
                    onClick={() => {
                      const text = `I scored ${score} pts on NIMWORD Daily Challenge and hit the target! 🎯\n\nPlay free and earn NIM at https://nimword.vercel.app\n\n#NIMWORD #Nimiq`;
                      if (navigator.share) {
                        navigator.share({ text });
                      } else {
                        navigator.clipboard.writeText(text);
                        alert("Result copied to clipboard!");
                      }
                    }}
                  >
                    <span aria-hidden="true">📣</span> Share My Score
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
