import { useEffect, useRef, useState } from "react";
import {
  ChatMessage,
  RoomPlayersStrip,
  TimerTone,
  SocialShareBar,
  GameSticker,
  TotalPayoutsBanner,
  AvatarCircle,
  FloatingTilesBg,
} from "../ui/index.js";

import {
  animateScreenIn,
  animateTileTap,
  animateWordAccepted,
  animateWordRejected,
  startTimerUrgency,
  stopTimerUrgency,
} from "../../utils/game-animations.js";

import {
  getPlayerAlias,
  shortenHash,
  shortenWalletAddress,
  shortenNimiqAddress,
  formatNimiqAddress,
  isWalletAddress,
} from "../../utils/ui-helpers.js";
import { getSavedUsername, saveCustomUsername } from "../../utils/username.js";

function getSyncStatusMeta(syncStatus) {
  if (syncStatus === "live") {
    return {
      label: "Live",
      className: "status-pill status-pill--live",
    };
  }

  if (syncStatus === "retrying") {
    return {
      label: "Reconnecting",
      className: "status-pill status-pill--warn",
    };
  }

  return {
    label: "Sync Idle",
    className: "status-pill status-pill--idle",
  };
}

function buildWordFromSelection(sourceWord, selectedIndexes) {
  const letters = String(sourceWord || "").split("");
  return selectedIndexes.map((index) => letters[index] || "").join("").toLowerCase();
}

export function HomeScreen({
  gameRules = [],
  onStartPractice,
  onOpenDailyChallenge,
  onQuickMatch,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenSettings,
  walletAddress,
  nimBalance = 0,
  walletStatus,
  walletReady,
  walletProviderName,
  walletConnectLabel,
  isNimiqPay,
  onConnectWallet,
  onDisconnectWallet,
  roomError,
}) {
  const [sampleIndexes, setSampleIndexes] = useState([]);
  const [sampleScore, setSampleScore] = useState(0);
  const [sampleWords, setSampleWords] = useState([]);
  const [sampleFeedback, setSampleFeedback] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const sampleLetters = "BLOCKCHAIN".split("");
  const sampleCandidate = sampleIndexes.map((i) => sampleLetters[i]).join("");

  const VALID_SAMPLE_DICTIONARY = new Set([
    "BLOCK", "CHAIN", "COIN", "LACK", "LOCK", "BACK", "BANK", "LOAN", "CHIN",
    "BACON", "CLAN", "BLACK", "CABIN", "HALO", "COLON", "ALIBI", "ACOL"
  ]);

  function handleToggleSampleTile(index) {
    setSampleIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setSampleFeedback(null);
  }

  function handleTestSampleWord() {
    if (!sampleCandidate) return;
    const upper = sampleCandidate.toUpperCase();

    if (sampleWords.some((w) => w.word === upper)) {
      setSampleFeedback({ text: "Already found!", type: "warn" });
      return;
    }

    const len = upper.length;
    let pts = 0;
    if (len >= 6) pts = 12;
    else if (len === 5) pts = 8;
    else if (len === 4) pts = 5;
    else if (len === 3) pts = 3;

    if (pts > 0 && (VALID_SAMPLE_DICTIONARY.has(upper) || upper.length >= 3)) {
      setSampleScore((prev) => prev + pts);
      setSampleWords((prev) => [{ word: upper, points: pts }, ...prev]);
      setSampleFeedback({ text: `+${pts} pts!`, type: "success" });
      setSampleIndexes([]);
    } else {
      setSampleFeedback({ text: "Need 3+ letters!", type: "error" });
    }
  }

  function handleClearSample() {
    setSampleIndexes([]);
    setSampleFeedback(null);
  }

  const [stakeAmount, setStakeAmount] = useState(1);
  const STAKE_PRESETS = [1, 5, 10, 25, 50, 100];
  const shellRef = useRef(null);

  // Entrance runs once per mount. The screen is the thing that arrives, so the
  // ref is on the shell rather than on each card.
  useEffect(() => {
    animateScreenIn(shellRef.current);
  }, []);

  const joinLabel = walletAddress
    ? `🎮 Stake ${stakeAmount} NIM & Play`
    : "⚡ Connect Nimiq Wallet";

  return (
    <main className="page-shell" ref={shellRef}>
      <FloatingTilesBg />
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-logo">
            <img
              src="/logo.png"
              alt="NimWord"
              className="hero-logo__img"
            />
            <h1 className="hero-logo__name">NimWord</h1>
          </div>

          <p className="lede lede--tagline" style={{ fontSize: "0.95rem", marginBottom: "0.4rem" }}>
            Form words. Beat the clock. Win NIM.
          </p>

          <div className="feature-strip" style={{ marginBottom: "0.55rem" }}>
            <div className="feature-pill">⚡ 60s Rounds</div>
            <div className="feature-pill">🪙 {stakeAmount} NIM Stake</div>
            <div className="feature-pill">🏆 90% Win Pool</div>
          </div>

          <div className="hero-actions" style={{ display: "flex", flexDirection: "column", gap: "0.45rem", width: "100%" }}>
            {/* Stake Selector */}
            <div style={{ background: "var(--surface-sunk)", border: "1px solid var(--rule)", borderRadius: "10px", padding: "6px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--ink-2)" }}>
                <span><span aria-hidden="true">💰</span> Choose Stake Amount:</span>
                <strong style={{ color: "var(--nq-gold-deep, var(--ink))", fontFamily: "var(--font-mono)", fontSize: "0.88rem" }}>
                  {stakeAmount} NIM
                </strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "4px" }}>
                {STAKE_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt)}
                    style={{
                      padding: "4px 2px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: stakeAmount === amt ? "var(--nq-gold)" : "var(--surface-sunk)",
                      border: stakeAmount === amt ? "1px solid oklch(0.72 0.16 85.61)" : "1px solid var(--rule)",
                      color: stakeAmount === amt ? "#1A1200" : "var(--ink-2)",
                      borderRadius: "5px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      minHeight: "26px",
                    }}
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => onQuickMatch(stakeAmount)} style={{ padding: "0.75rem 1.2rem", fontSize: "0.95rem", minHeight: "42px" }}>
              {joinLabel}
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem", width: "100%" }}>
              <button type="button" className="button-secondary" onClick={onOpenDailyChallenge} style={{ minHeight: "36px", padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}>
                ⭐ Daily Challenge
              </button>
              <button type="button" className="button-secondary" onClick={onStartPractice} style={{ minHeight: "36px", padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}>
                🎯 Practice Arena
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem", width: "100%" }}>
              <button type="button" className="button-secondary button-accent-blue" onClick={onOpenLeaderboard} style={{ minHeight: "36px", padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}>
                🏆 Leaderboard
              </button>
              <button type="button" className="button-secondary" onClick={() => setShowRulesModal(true)} style={{ minHeight: "36px", padding: "0.45rem 0.65rem", fontSize: "0.8rem" }}>
                📖 How to Play
              </button>
            </div>
          </div>

          {roomError ? (
            <div className="notice-strip notice-strip--error">
              {roomError}
            </div>
          ) : null}

          <div
            className="daily-reward-callout"
            onClick={onOpenDailyChallenge}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.6rem",
              padding: "0.55rem 0.85rem",
              background: "linear-gradient(135deg, oklch(0.7924 0.1593 85.61 / 0.14), oklch(0.5849 0.1438 244.29 / 0.12))",
              border: "1px solid var(--rule-strong)",
              borderRadius: "10px",
              cursor: "pointer",
              marginTop: "0.45rem",
              transition: "transform 120ms ease, border-color 120ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🎁</span>
              <div>
                <strong style={{ fontSize: "0.8rem", color: "var(--ink)", display: "block" }}>
                  Free Daily Challenge Available
                </strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-2)" }}>
                  Play 1 round today to claim 0.1 NIM
                </span>
              </div>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--interactive-ink)" }}>
              Play →
            </span>
          </div>

          <TotalPayoutsBanner />
        </div>

        <div className="hero-card hero-card--interactive">
          <div className="hero-card__top">
            <div>
              <p className="hero-card__label" style={{ fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                <span aria-hidden="true">🎲</span> Interactive Sample Round
              </p>
              <h2 style={{ fontSize: "1.45rem", margin: 0 }}>BLOCKCHAIN</h2>
            </div>
            <div className="hero-card__score-badge" style={{ padding: "0.35rem 0.65rem" }}>
              <span style={{ fontSize: "0.65rem" }}>Demo Score</span>
              <strong style={{ fontSize: "0.95rem" }}>{sampleScore} pts</strong>
            </div>
          </div>

          <div className="sample-rack-wrapper" style={{ marginBottom: "0.35rem" }}>
            <p className="field-hint" style={{ fontSize: "0.74rem", marginBottom: "4px" }}>
              <span aria-hidden="true">👆</span> Tap letter tiles below to build words:
            </p>
            <div className="letter-rack" style={{ gap: "0.35rem" }}>
              {sampleLetters.map((letter, index) => {
                const isSelected = sampleIndexes.includes(index);
                return (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    className={`letter-tile letter-tile--interactive ${isSelected ? "letter-tile--selected" : ""}`}
                    style={{ height: "2.4rem", width: "2.4rem", fontSize: "1.05rem" }}
                    onClick={(event) => {
                      animateTileTap(event.currentTarget);
                      handleToggleSampleTile(index);
                    }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sample-builder-box" style={{ padding: "0.35rem 0.65rem", minHeight: "36px", marginBottom: "0.45rem" }}>
            <div className="sample-builder-box__display">
              <span className="sample-builder-box__placeholder" style={{ fontSize: "0.82rem" }}>
                {sampleCandidate || "TAP TILES ABOVE"}
              </span>
            </div>
            <div className="sample-builder-box__actions">
              <button
                type="button"
                className="button-secondary"
                style={{ padding: "0.3rem 0.65rem", fontSize: "0.72rem", minHeight: "26px" }}
                onClick={handleClearSample}
                disabled={sampleIndexes.length === 0}
              >
                Clear
              </button>
              <button
                type="button"
                style={{ padding: "0.3rem 0.75rem", fontSize: "0.72rem", minHeight: "26px" }}
                onClick={handleTestSampleWord}
                disabled={!sampleCandidate}
              >
                Test Word
              </button>
            </div>
          </div>

          {sampleFeedback ? (
            <div className={`notice-strip notice-strip--${sampleFeedback.type}`} style={{ padding: "0.4rem 0.6rem", fontSize: "0.74rem", margin: "0.3rem 0" }}>
              {sampleFeedback.text}
            </div>
          ) : null}

          {sampleWords.length > 0 ? (
            <div className="sample-found-list" style={{ margin: "0.3rem 0" }}>
              <span className="field-hint" style={{ fontSize: "0.72rem" }}>Words Found ({sampleWords.length}):</span>
              <div className="sample-chips-row" style={{ gap: "0.3rem" }}>
                {sampleWords.map((w, idx) => (
                  <span key={idx} className="word-chip" style={{ padding: "0.2rem 0.45rem", fontSize: "0.72rem" }}>
                    <strong>{w.word}</strong> <small>+{w.points}</small>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="game-info-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", width: "100%", margin: "0.4rem 0" }}>
            <div className="game-info-cell" style={{ padding: "0.4rem 0.6rem", fontSize: "0.74rem", background: "var(--surface-sunk)", borderRadius: "8px", border: "1px solid var(--rule)" }}>
              <span style={{ color: "var(--ink-2)", fontWeight: 700 }}>TIMER: 60S</span>
            </div>
            <div className="game-info-cell" style={{ padding: "0.4rem 0.6rem", fontSize: "0.74rem", background: "var(--surface-sunk)", borderRadius: "8px", border: "1px solid var(--rule)" }}>
              <span style={{ color: "var(--ink-2)", fontWeight: 700 }}>STAKE: 1 NIM</span>
            </div>
            <div className="game-info-cell" style={{ padding: "0.4rem 0.6rem", fontSize: "0.74rem", background: "var(--surface-sunk)", borderRadius: "8px", border: "1px solid var(--rule)" }}>
              <span style={{ color: "var(--ink-2)", fontWeight: 700 }}>PLAYERS: 2-5</span>
            </div>
            <div className="game-info-cell" style={{ padding: "0.4rem 0.6rem", fontSize: "0.74rem", background: "var(--surface-sunk)", borderRadius: "8px", border: "1px solid var(--rule)" }}>
              <span style={{ color: "var(--ink-2)", fontWeight: 700 }}>POOL: 90% SHARED</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", width: "100%", marginBottom: "0.4rem" }}>
            <button
              type="button"
              className="button-secondary"
              style={{ minHeight: "34px", padding: "0.35rem 0.6rem", fontSize: "0.78rem" }}
              onClick={onOpenProfile}
            >
              View Profile
            </button>
            <button
              type="button"
              className="button-secondary"
              style={{ minHeight: "34px", padding: "0.35rem 0.6rem", fontSize: "0.78rem" }}
              onClick={onOpenSettings}
            >
              Settings
            </button>
          </div>

          <div
            className="score-matrix-card"
            style={{
              background: "var(--surface-sunk)",
              border: "1px solid var(--rule)",
              borderRadius: "10px",
              padding: "0.45rem 0.75rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", fontSize: "0.72rem" }}>
              <strong style={{ color: "var(--interactive-ink)", display: "flex", alignItems: "center", gap: "4px" }}>
                ⚡ WORD SCORING MATRIX
              </strong>
              <span style={{ color: "var(--good)", fontWeight: 700 }}>✓ NIMIQ PAY VERIFIED</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.3rem", textAlign: "center", fontSize: "0.7rem" }}>
              <div>
                <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.64rem" }}>3 LTRS</span>
                <strong style={{ color: "var(--ink)" }}>3 PTS</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.64rem" }}>4 LTRS</span>
                <strong style={{ color: "var(--ink)" }}>5 PTS</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.64rem" }}>5 LTRS</span>
                <strong style={{ color: "var(--ink)" }}>8 PTS</strong>
              </div>
              <div>
                <span style={{ display: "block", color: "var(--ink-2)", fontSize: "0.64rem" }}>6+ LTRS</span>
                <strong style={{ color: "var(--ink)" }}>12 PTS</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showRulesModal ? (
        <div
          className="modal-overlay"
          onClick={() => setShowRulesModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0.2737 0.068 276.29 / 0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="modal-content panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              width: "100%",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "1.75rem",
              borderRadius: "16px",
              background: "var(--surface)",
              border: "1px solid var(--rule-strong)",
              boxShadow: "0 12px 40px oklch(0.2737 0.068 276.29 / 0.16)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", margin: 0, color: "var(--ink)" }}>📖 How to Play NimWord</h2>
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowRulesModal(false)}
                style={{ padding: "0.3rem 0.7rem", fontSize: "0.85rem" }}
              >
                ✕
              </button>
            </div>

            <article style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--interactive-ink)", marginBottom: "0.4rem" }}>🎮 Core Loop</h3>
              <ol style={{ paddingLeft: "1.2rem", lineHeight: "1.6", color: "var(--ink-2)", fontSize: "0.95rem" }}>
                <li>Join a NIMWORD match room or practice solo</li>
                <li>Get a shared 7-letter source word</li>
                <li>Submit valid English words before the 60s timer expires</li>
                <li>Score points based on word length and speed</li>
                <li>90% NIM prize pool is shared by score rankings</li>
              </ol>
            </article>

            <article style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--good)", marginBottom: "0.4rem" }}>📜 Game Rules</h3>
              <ul style={{ paddingLeft: "1.2rem", lineHeight: "1.6", color: "var(--ink-2)", fontSize: "0.95rem" }}>
                <li>Words must be at least 3 letters long</li>
                <li>Use each letter only as many times as it appears in the prompt</li>
                <li>Duplicate word submissions in the same round do not score</li>
                <li>Every valid word scores based on length: 3L = 3pts, 4L = 5pts, 5L = 8pts, 6L+ = 12pts</li>
              </ul>
            </article>

            <article style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--nq-gold)", marginBottom: "0.4rem" }}>🪙 Prize Logic</h3>
              <p style={{ color: "var(--ink-2)", fontSize: "0.92rem", lineHeight: "1.5" }}>
                Every match room starts with a 1 NIM entry stake. NIMWORD takes a 10% treasury fee, and the remaining 90% is shared using:
                <br />
                <code style={{ display: "block", background: "var(--surface-sunk)", padding: "0.5rem", borderRadius: "6px", margin: "0.5rem 0", color: "var(--nq-gold)", fontFamily: "var(--font-mono)" }}>
                  (Your Score / Total Room Score) × Prize Pool
                </code>
                Payouts are transferred directly to your Nimiq address upon round completion.
              </p>
            </article>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
            >
              Got it, Let's Play!
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}


export function LobbyScreen({
  room,
  playerId,
  statusMessage,
  error,
  syncStatus,
  onRefresh,
  onStart,
  onCopyInvite,
  inviteCopied,
  onPayEntryFee,
  paymentBusy,
  onBack,
  paymentProviderLabel,
}) {
  const [roomTimeLeft, setRoomTimeLeft] = useState("");
  const myPlayer = room?.players?.find((p) => p.id === playerId);
  const myWallet = myPlayer?.walletAddress || "";
  const [handleInput, setHandleInput] = useState("");
  const [handleNotice, setHandleNotice] = useState("");
  const shellRef = useRef(null);

  useEffect(() => {
    animateScreenIn(shellRef.current);
  }, []);

  useEffect(() => {
    if (myWallet) {
      setHandleInput(getSavedUsername(myWallet));
    }
  }, [myWallet]);

  function handleSaveLobbyUsername() {
    if (!myWallet || !handleInput.trim()) return;
    const ok = saveCustomUsername(myWallet, handleInput.trim());
    if (ok) {
      setHandleNotice("✓ Username saved!");
      setTimeout(() => setHandleNotice(""), 2000);
    }
  }

  useEffect(() => {
    if (!room?.expiresAt) return;

    function tick() {
      const remaining = new Date(room.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setRoomTimeLeft("Expired");
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setRoomTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [room?.expiresAt]);

  const syncMeta = getSyncStatusMeta(syncStatus);
  const isHost = room?.hostPlayerId === playerId;
  const minPlayers = room?.minPlayers || 2;
  const paidPlayersCount = room?.onchain?.paidPlayersCount || 0;
  const totalPlayers = room?.players?.length || 0;
  const allPaid = totalPlayers > 0 && paidPlayersCount === totalPlayers;
  const enoughPlayers = totalPlayers >= minPlayers;
  const roomReadyToStart = enoughPlayers && allPaid;
  const joinMode = room?.onchain?.joinMode || "treasury_beta";
  const canStart = room?.status === "waiting" && enoughPlayers && isHost && allPaid;
  const joinPayment = room?.onchain?.joinPaymentDisplay || "1 NIM";
  const hasPaid = (room?.onchain?.joinTransactions || []).some((entry) => entry.playerId === playerId);
  const inviteLink =
    room?.id && typeof window !== "undefined"
      ? `${window.location.origin}?room=${room.id}`
      : "";
  const joinedCount = room?.players?.length || 0;
  const lobbyTitle = !hasPaid
    ? "Complete your entry to confirm your seat in this round."
    : roomReadyToStart
      ? isHost
        ? "Everyone is ready. You can start the round now."
        : "Everyone is ready. Waiting for the host to begin."
      : allPaid
        ? `Your entry is confirmed. Need ${Math.max(minPlayers - totalPlayers, 0)} more player${Math.max(minPlayers - totalPlayers, 0) === 1 ? "" : "s"} to start. The room can still fill up to ${room?.maxPlayers || 5} players.`
        : "Your entry is confirmed. Waiting for the rest of the room.";
  const readinessCount = enoughPlayers
    ? `${paidPlayersCount}/${totalPlayers || 0}`
    : `${joinedCount}/${minPlayers}`;
  const readinessCaption = roomReadyToStart
    ? "Minimum players reached and every joined player has confirmed entry."
    : enoughPlayers
      ? "Joined players who have completed entry payment."
      : `Need ${Math.max(minPlayers - joinedCount, 0)} more player${Math.max(minPlayers - joinedCount, 0) === 1 ? "" : "s"} to start. The room can still fill up to ${room?.maxPlayers || 5} players.`;

  return (
    <main className="page-shell" ref={shellRef}>
      <FloatingTilesBg />
      {room?.status === "expired" ? (
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div className="notice-strip notice-strip--neutral" style={{ borderLeftColor: "var(--bad)", marginBottom: "1.5rem" }}>
            This room expired before the game could start. Your entry fee has been noted. Go back home and create a new room.
          </div>
          <button type="button" onClick={onBack}>
            Back to Home
          </button>
        </div>
      ) : null}
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBack}>
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="eyebrow">Quick Match Lobby</p>
          {musicToggle}
        </div>

        <div className="room-topbar">
          <div>
            <p className="play-label">
              <span aria-hidden="true">🏟️</span> NimWord Arena
            </p>
            <h1>{room?.id || "LOADING"}</h1>
          </div>
          <div className="room-topbar__stats">
            <span>{room?.entryFee || "1 NIM"}</span>
            <span>{room?.rewardPool || "--"}</span>
            <span>{room?.players?.length || 0}/{room?.maxPlayers || 5} players</span>
            <span className={syncMeta.className}>{syncMeta.label}</span>
          </div>
        </div>

        {statusMessage ? (
          <div className="notice-strip notice-strip--success">{statusMessage}</div>
        ) : null}
        {error ? <div className="notice-strip notice-strip--error">{error}</div> : null}

        <section className="chat-room-layout">
          <article className="panel room-panel room-panel--feed">
            <div className="room-panel__header">
              <div>
                <h3><span aria-hidden="true">🚪</span> Match Lobby</h3>
                <p>{lobbyTitle}</p>
              </div>
              <TimerTone seconds={0} />
            </div>

            {myWallet && (
              <div style={{ background: "var(--surface-sunk)", border: "1px solid var(--rule-strong)", borderRadius: "14px", padding: "10px 14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--interactive-ink)", fontWeight: "700", textTransform: "uppercase" }}>👤 Display Username:</span>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="Type your username..."
                  maxLength={16}
                  style={{ flex: 1, minWidth: "130px", padding: "6px 12px", borderRadius: "8px", background: "var(--surface-sunk)", border: "1px solid var(--rule-strong)", color: "var(--ink)", fontSize: "0.85rem", outline: "none" }}
                />
                <button
                  type="button"
                  style={{ padding: "6px 14px", fontSize: "0.8rem", minHeight: "auto" }}
                  onClick={handleSaveLobbyUsername}
                >
                  Save Username
                </button>
                {handleNotice && <span style={{ color: "var(--good)", fontSize: "0.78rem" }}>{handleNotice}</span>}
              </div>
            )}

            <div className={`lobby-readiness-card ${roomReadyToStart ? "lobby-readiness-card--ready" : ""}`}>
              <div>
                <span className="lobby-readiness-card__label">Round status</span>
                <strong>
                  {roomReadyToStart
                    ? "Ready to start"
                    : enoughPlayers
                      ? "Waiting for player confirmations"
                      : "Waiting for more players"}
                </strong>
              </div>
              <div className="lobby-readiness-card__progress">
                <div className="lobby-readiness-card__count">{readinessCount}</div>
                <small>{readinessCaption}</small>
              </div>
            </div>

            <div className="invite-link-card">
              <p className="invite-link-card__label">
                <span aria-hidden="true">🔗</span> Invite friends to join this room
              </p>
              <div className="invite-link-card__row">
                <input
                  aria-label="Room invite link"
                  readOnly
                  value={inviteLink}
                  onClick={(e) => e.target.select()}
                />
                <button type="button" className="button-secondary" onClick={onCopyInvite}>
                  {inviteCopied ? "Copied ✓" : "Copy Link"}
                </button>
              </div>
              <SocialShareBar roomId={room?.id} />
              <p className="field-hint">
                Entry fees are non-refundable. If the room expires before the game starts your fee goes to the NimWord treasury.
              </p>
            </div>

            <div className="lobby-summary-grid">
              <div className="lobby-stat-card">
                <span>Entry Fee</span>
                <strong>{room?.entryFee || "1 NIM"}</strong>
              </div>
              <div className="lobby-stat-card">
                <span>Prize Pool</span>
                <strong>{room?.rewardPool || "--"}</strong>
              </div>
              <div className="lobby-stat-card">
                <span>Entry Payment</span>
                <strong>{joinPayment}</strong>
              </div>
              <div className="lobby-stat-card">
                <span>Confirmed</span>
                <strong>{paidPlayersCount}/{totalPlayers || room?.maxPlayers || 5}</strong>
              </div>
              <div className="lobby-stat-card">
                <span>Players in Room</span>
                <strong>{room?.players?.length || 0}/{room?.maxPlayers || 5}</strong>
              </div>
              <div className="lobby-stat-card">
                <span>Start Rule</span>
                <strong>{minPlayers} paid players minimum</strong>
              </div>
            </div>

            <div className="notice-strip notice-strip--neutral">
              {joinMode === "contract_join"
                ? `Contract room ${room?.onchain?.contractRoomId ?? "--"} is live on NimWordArena. Players join this room onchain before the match starts.`
                : "Treasury beta mode is active for this room while contract-backed joins are still being prepared."}
            </div>

            <div className="notice-strip notice-strip--neutral">
              {hasPaid
                ? `Entry confirmed. Payment reference: ${shortenHash((room?.onchain?.joinTransactions || []).find((entry) => entry.playerId === playerId)?.txHash)}`
                : `Pay ${joinPayment} to confirm your seat. The round starts once every joined player has paid.`}
            </div>

            <RoomPlayersStrip players={room?.players} scoreboard={room?.scoreboard} playerId={playerId} />

            {room?.status === "waiting" && roomTimeLeft ? (
              <div
                className="notice-strip notice-strip--neutral"
                style={{
                  marginBottom: "1.5rem",
                  borderLeftColor:
                    roomTimeLeft === "Expired" || roomTimeLeft.startsWith("0:")
                      ? "var(--bad)"
                      : "var(--rule-strong)",
                }}
              >
                {roomTimeLeft === "Expired"
                  ? "This room has expired. Go back and start a new game."
                  : `Room closes in ${roomTimeLeft} — share the invite link so your friends can join in time.`}
              </div>
            ) : null}

            <div className="lobby-actions lobby-actions--row" style={{ marginTop: "1rem" }}>
              <button type="button" onClick={onRefresh}>
                Refresh Lobby
              </button>
              <button
                type="button"
                className={hasPaid ? "button-secondary" : ""}
                onClick={onPayEntryFee}
                disabled={paymentBusy || hasPaid}
              >
                {paymentBusy ? "Processing..." : hasPaid ? "Entry Paid" : `${paymentProviderLabel || "Pay"} ${joinPayment}`}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={onStart}
                disabled={!canStart}
              >
                {isHost
                  ? roomReadyToStart
                    ? "Start Arena"
                    : enoughPlayers
                      ? "Waiting for payments"
                      : "Waiting for more players"
                  : "Waiting for host"}
              </button>
            </div>
          </article>

          <article className="panel room-panel">
            <div className="room-panel__header">
              <div>
                <h3><span aria-hidden="true">📡</span> Room Feed</h3>
                <p>Entry confirmations and room activity appear here in real time.</p>
              </div>
            </div>
            <div className="chat-feed chat-feed--lobby">
              {(room?.feed || []).length ? (
                (room.feed || []).map((entry, index) => (
                  <ChatMessage
                    key={`${entry.createdAt}-${index}`}
                    entry={entry}
                    isOwnMessage={entry.playerId === playerId}
                  />
                ))
              ) : (
                <div className="empty-card">
                  <span aria-hidden="true">⏳</span> Waiting for players...
                </div>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export function MatchRoomScreen({
  room,
  playerId,
  roomMessage,
  roomError,
  syncStatus,
  onRefresh,
  onSubmitWord,
  onClaimReward,
  claimBusy,
  onBackHome,
}) {
  const syncMeta = getSyncStatusMeta(syncStatus);
  const [draftWord, setDraftWord] = useState("");
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [pausedAutoScroll, setPausedAutoScroll] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const chatFeedRef = useRef(null);
  const submitBusyRef = useRef(false);
  const shellRef = useRef(null);
  const scoreRef = useRef(null);
  const prevScoreRef = useRef(null);
  const rejectedCountRef = useRef(null);
  const urgencyRef = useRef(null);
  const isFinished = room?.status === "finished";
  const myScore =
    room?.scoreboard?.find((entry) => entry.playerId === playerId)?.score || 0;
  const timeLeft = room?.timeLeftSeconds ?? 0;
  const feed = room?.feed || [];
  const myPlayer = room?.players?.find((entry) => entry.id === playerId);
  const myJoinTx = (room?.onchain?.joinTransactions || []).find(
    (entry) => entry.playerId === playerId,
  );
  const myClaimTx = (room?.onchain?.claimTransactions || []).find(
    (entry) => entry.playerId === playerId,
  );
  const myPayout = (room?.payouts || []).find(
    (entry) => entry.walletAddress === myPlayer?.walletAddress,
  );
  const claimRecorded = myPlayer?.claimRecorded;
  const payoutAmount = Number(myPayout?.amount || 0);
  const contractAddress = room?.onchain?.contractAddress;
  const contractRoomId = room?.onchain?.contractRoomId;
  const claimEnabled =
    isWalletAddress(contractAddress) &&
    !!contractRoomId &&
    payoutAmount > 0 &&
    !claimRecorded &&
    !claimBusy;

  const claimStatusTitle = claimRecorded
    ? "Claim recorded"
    : payoutAmount > 0
      ? "Ready to claim"
      : "No reward to claim";

  const claimStatusCopy = claimRecorded
    ? `Your latest claim reference is ${shortenHash(myClaimTx?.txHash)}.`
    : payoutAmount > 0
      ? "Scores are settled onchain. Click Claim Reward to receive your NIM."
      : "You finished the room, but there is no positive payout available for this wallet.";

  const sourceLetters = String(room?.sourceWord || "").split("");
  const selectedWord = draftWord;

  useEffect(() => {
    setDraftWord("");
    setSelectedIndexes([]);
  }, [room?.sourceWord, room?.id]);

  useEffect(() => {
    animateScreenIn(shellRef.current);
  }, []);

  // A rising score is the only signal that a word was accepted that does not
  // depend on feed ordering. The first run only records the baseline, so
  // joining a room that already has points on the board stays quiet.
  useEffect(() => {
    if (prevScoreRef.current !== null && myScore > prevScoreRef.current) {
      animateWordAccepted(scoreRef.current);
    }
    prevScoreRef.current = myScore;
  }, [myScore]);

  // Counting rather than reading the last entry, because the feed can arrive
  // newest-first or oldest-first and a count is true either way.
  useEffect(() => {
    const rejected = feed.filter(
      (entry) => entry.playerId === playerId && entry.status && entry.status !== "accepted",
    ).length;

    if (rejectedCountRef.current !== null && rejected > rejectedCountRef.current) {
      animateWordRejected(shellRef.current);
    }
    rejectedCountRef.current = rejected;
  }, [feed, playerId]);

  // The pulse repeats forever, so it is started once on entering the last ten
  // seconds and stopped once on leaving. Restarting it on every tick would
  // reset the yoyo each second and read as a stutter instead of a pulse.
  useEffect(() => {
    const shouldPulse = timeLeft <= 10 && timeLeft > 0;

    if (shouldPulse && !urgencyRef.current) {
      const el = shellRef.current?.querySelector(".timer-pill");
      if (el) urgencyRef.current = el;
      if (el) startTimerUrgency(el);
    } else if (!shouldPulse && urgencyRef.current) {
      stopTimerUrgency(urgencyRef.current);
      urgencyRef.current = null;
    }
  }, [timeLeft]);

  // Unmount could land mid-pulse — leaving the round with the clock frozen
  // large and red, and a tween still running against a detached node.
  useEffect(
    () => () => {
      if (urgencyRef.current) {
        stopTimerUrgency(urgencyRef.current);
        urgencyRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const node = chatFeedRef.current;
    if (!node || pausedAutoScroll) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [feed, pausedAutoScroll]);

  function handleFeedScroll() {
    const node = chatFeedRef.current;
    if (!node) return;
    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    setPausedAutoScroll(!nearBottom);
  }

  async function submitSelectedWord() {
    if (!selectedWord.trim() || submitBusyRef.current) return;

    const wordToSubmit = selectedWord;
    submitBusyRef.current = true;
    setSubmitBusy(true);
    setDraftWord("");
    setSelectedIndexes([]);

    try {
      await onSubmitWord(wordToSubmit);
    } finally {
      submitBusyRef.current = false;
      setSubmitBusy(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitSelectedWord();
  }

  function handleToggleTile(index) {
    setSelectedIndexes((current) => {
      const nextIndexes = current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index];
      setDraftWord(buildWordFromSelection(room?.sourceWord, nextIndexes));
      return nextIndexes;
    });
  }

  function clearSelection() {
    setDraftWord("");
    setSelectedIndexes([]);
  }

  useEffect(() => {
    if (isFinished || timeLeft === 0 || !room?.sourceWord) return undefined;

    function handleKeyDown(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target;
      const isTypingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "Enter") {
        if (!selectedWord || submitBusyRef.current) return;
        event.preventDefault();
        submitSelectedWord();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        setSelectedIndexes((current) => {
          const nextIndexes = current.slice(0, -1);
          setDraftWord(buildWordFromSelection(room.sourceWord, nextIndexes));
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
        const letters = String(room.sourceWord || "").toLowerCase().split("");

        setSelectedIndexes((current) => {
          const nextIndex = letters.findIndex(
            (letter, index) => letter === typedLetter && !current.includes(index),
          );

          if (nextIndex === -1) return current;

          event.preventDefault();
          const nextIndexes = [...current, nextIndex];
          setDraftWord(buildWordFromSelection(room.sourceWord, nextIndexes));
          return nextIndexes;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, timeLeft, room?.sourceWord, selectedWord]);

  return (
    <main className="page-shell" ref={shellRef}>
      <FloatingTilesBg />
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBackHome}>
            <span aria-hidden="true">←</span> Back
          </button>
          <p className="eyebrow">
            <span aria-hidden="true">🔴</span> Live Room
          </p>
        </div>

        <div className="room-topbar">
          <div>
            <p className="play-label">NimWord Arena</p>
            <h1>{room?.id || "LIVE"}</h1>
          </div>
          <div className="room-topbar__stats">
            <span>{room?.players?.length || 0}/{room?.maxPlayers || 5} players online</span>
            <span>{room?.rewardPool || "--"}</span>
            <span>{room?.entryFee || "1 NIM"}</span>
            <span className={syncMeta.className}>{syncMeta.label}</span>
          </div>
        </div>

        <div className="room-live-header">
          <TimerTone seconds={timeLeft} />
          <div className="room-live-header__meta">
            <strong>
              <span aria-hidden="true">🔤</span> Source Word: {room?.sourceWord || "READY"}
            </strong>
            <span>{myPlayer ? `${getPlayerAlias(myPlayer.walletAddress)} • ${shortenWalletAddress(myPlayer.walletAddress)}` : "Connected player"}</span>
          </div>
          <div className="room-live-header__score">
            <small><span aria-hidden="true">⭐</span> Your score</small>
            <strong className="live-score" ref={scoreRef}>{myScore} pts</strong>
          </div>
        </div>

        {roomMessage ? (
          <div className="notice-strip notice-strip--success">{roomMessage}</div>
        ) : null}
        {roomError ? <div className="notice-strip notice-strip--error">{roomError}</div> : null}

        {!isFinished ? (
          <>
            <div className="compact-board">
              <div className="compact-board__top">
                <span><span aria-hidden="true">🔤</span> Source Word</span>
                <strong>{room?.sourceWord || "READY"}</strong>
              </div>
              <div className="letter-rack letter-rack--play letter-rack--compact">
                {sourceLetters.map((letter, index) => (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    className={`letter-tile letter-tile--compact letter-tile--interactive ${selectedIndexes.includes(index) ? "letter-tile--selected" : ""}`}
                    onClick={(event) => {
                      animateTileTap(event.currentTarget);
                      handleToggleTile(index);
                    }}
                    aria-label={`Select letter ${letter}`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="word-preview">
                {selectedWord ? selectedWord.toUpperCase().split("").join(" - ") : "S-E-A"}
              </div>
            </div>

            <div className="mobile-sticky-bottom-wrap">
              <form className="submit-panel submit-panel--prominent" onSubmit={handleSubmit}>
                <div className="submit-panel__locked" aria-live="polite">
                  <span className="submit-panel__locked-label">
                    <span aria-hidden="true">✍️</span> Your Word
                  </span>
                  <strong>{selectedWord ? selectedWord.toUpperCase() : "Tap letters above to build"}</strong>
                </div>
                <div className="submit-panel__actions">
                  <button type="button" className="button-secondary" onClick={clearSelection}>
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="button-submit-soft"
                    disabled={timeLeft === 0 || !selectedWord || submitBusy}
                    style={{ flex: 1, padding: "0.875rem 1.5rem", fontSize: "1rem", fontWeight: "600" }}
                  >
                    {submitBusy ? "Submitting..." : "✓ Submit Word"}
                  </button>
                </div>
              </form>
            </div>

            <RoomPlayersStrip players={room?.players} scoreboard={room?.scoreboard} playerId={playerId} />

            <section className="chat-room-layout">
              <article className="panel panel-chat panel-chat--primary">
                <div className="room-panel__header">
                  <div>
                    <h3><span aria-hidden="true">💬</span> Live Chat Feed</h3>
                    <p>Every word claim lands here for the whole room to see.</p>
                  </div>
                  {selectedIndexes.length ? <span className="typing-indicator">You are forming a word...</span> : null}
                </div>
                <div
                  ref={chatFeedRef}
                  className="chat-feed chat-feed--live"
                  onScroll={handleFeedScroll}
                >
                  {feed.length ? (
                    feed.map((entry, index) => (
                      <ChatMessage
                        key={`${entry.createdAt}-${index}`}
                        entry={entry}
                        isOwnMessage={entry.playerId === playerId}
                      />
                    ))
                  ) : (
                    <div className="empty-card">
                    <span aria-hidden="true">⏳</span> Waiting for the first word claim...
                  </div>
                  )}
                </div>
              </article>

              <article className="panel panel-scoreboard panel-scoreboard--live">
                <div className="room-panel__header">
                  <div>
                    <h3><span aria-hidden="true">🏆</span> Leaderboard</h3>
                    <p>Scores shift live as valid words land.</p>
                  </div>
                </div>
                <div className="player-list player-list--leaderboard">
                  {(room?.scoreboard || []).map((entry) => (
                    <div key={entry.playerId} className={`player-row ${entry.playerId === playerId ? "player-row--self" : ""}`}>
                      <div>
                        <strong>{getPlayerAlias(entry.walletAddress)}</strong>
                        <p>{shortenWalletAddress(entry.walletAddress)}</p>
                      </div>
                      <div className="leaderboard-points">
                        <span className="live-score">{entry.score} pts</span>
                        <small>{entry.wordsFound} words</small>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        ) : null}

        <div className="hero-actions">
          <button type="button" className="button-secondary" onClick={onRefresh}>
            Refresh Room
          </button>
        </div>

        {isFinished ? (
          <section className="chat-room-layout">
            <article className="panel panel-chat panel-chat--primary">
              <div className="room-panel__header">
                <div>
                  <h3><span aria-hidden="true">📜</span> Game History</h3>
                  <p>Every word from the room stays visible after the round ends.</p>
                </div>
              </div>
              <div className="chat-feed chat-feed--live">
                {feed.map((entry, index) => (
                  <ChatMessage
                    key={`${entry.createdAt}-${index}`}
                    entry={entry}
                    isOwnMessage={entry.playerId === playerId}
                  />
                ))}
              </div>
            </article>

            <article className="panel panel-scoreboard panel-scoreboard--live">
              <div className="room-panel__header">
                <div>
                  <h3><span aria-hidden="true">🎊</span> Game Over</h3>
                  <p>Final ranking and payout split for this arena.</p>
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-card__top">
                  <div>
                    <span className="claim-card__label"><span aria-hidden="true">💰</span> Your reward</span>
                    <strong className="claim-card__amount">{payoutAmount.toFixed(4)} NIM</strong>
                  </div>
                  <span className={`claim-card__status ${claimRecorded ? "claim-card__status--success" : payoutAmount > 0 ? "claim-card__status--ready" : ""}`}>
                    {claimStatusTitle}
                  </span>
                </div>
                <p className="claim-card__copy">{claimStatusCopy}</p>
                <div className="claim-card__meta">
                  <div className="claim-meta-chip">
                    <span>Join Tx</span>
                    <strong>{myJoinTx?.txHash ? shortenHash(myJoinTx.txHash) : "Pending"}</strong>
                  </div>
                  <div className="claim-meta-chip">
                    <span>Claim Tx</span>
                    <strong>{myClaimTx?.txHash ? shortenHash(myClaimTx.txHash) : "Not claimed"}</strong>
                  </div>
                  <div className="claim-meta-chip">
                    <span>Payout Mode</span>
                    <strong>{contractRoomId ? "Contract" : "Beta"}</strong>
                  </div>
                </div>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={onClaimReward}
                    disabled={!claimEnabled || claimBusy}
                  >
                    {claimBusy
                      ? "Claiming..."
                      : claimRecorded
                        ? "✓ Claim Recorded"
                        : payoutAmount > 0
                          ? "💸 Claim Reward"
                          : "No Reward"}
                  </button>
                  <button type="button" className="button-secondary" onClick={onRefresh}>
                    Refresh Results
                  </button>
                </div>
                <SocialShareBar roomId={room?.id} score={myScore} wordCount={(room?.scoreboard?.find((entry) => entry.playerId === playerId)?.wordsFound) || 0} />
              </div>

              <div className="player-list">
                {(room?.scoreboard || []).map((entry) => (
                  <div key={entry.playerId} className={`player-row ${entry.playerId === playerId ? "player-row--self" : ""}`}>
                    <div>
                      <strong>{getPlayerAlias(entry.walletAddress)}</strong>
                      <p>{shortenWalletAddress(entry.walletAddress)} • {entry.wordsFound} words</p>
                    </div>
                    <span className="self-pill">{entry.score} pts</span>
                  </div>
                ))}
              </div>

              <div className="results-subtitle"><span aria-hidden="true">🪙</span> Reward Distribution</div>
              <div className="player-list">
                {(room?.payouts || []).map((entry) => (
                  <div key={entry.walletAddress} className="player-row">
                    <div>
                      <strong>{getPlayerAlias(entry.walletAddress)}</strong>
                      <p>{shortenWalletAddress(entry.walletAddress)}</p>
                    </div>
                    <span className="self-pill">{entry.amount} NIM</span>
                  </div>
                ))}
              </div>

              <div className="notice-strip notice-strip--neutral">
                {contractRoomId
                  ? "Contract payout mode is configured. Claim your reward above."
                  : "Beta mode: join payments are onchain now, while reward claim stays in preview until contract payout is deployed."}
              </div>

              {(room?.onchain?.joinTransactions?.length || room?.onchain?.claimTransactions?.length) ? (
                <>
                  <div className="results-subtitle">Onchain Activity</div>
                  <div className="tx-list">
                    {(room?.onchain?.joinTransactions || []).map((entry) => (
                      <div key={entry.txHash} className="tx-row">
                        <div>
                          <strong>{getPlayerAlias(entry.walletAddress)}</strong>
                          <p>Join payment • {entry.amount}</p>
                        </div>
                        <span>{shortenHash(entry.txHash)}</span>
                      </div>
                    ))}
                    {(room?.onchain?.claimTransactions || []).map((entry) => (
                      <div key={entry.txHash} className="tx-row">
                        <div>
                          <strong>{getPlayerAlias(entry.walletAddress)}</strong>
                          <p>Reward claim • {entry.amount || "tracked"}</p>
                        </div>
                        <span>{shortenHash(entry.txHash)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </article>
          </section>
        ) : null}
      </section>
    </main>
  );
}
