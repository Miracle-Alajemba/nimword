import { useEffect, useRef, useState } from "react";
import {
  ChatMessage,
  RoomPlayersStrip,
  TimerTone,
  SocialShareBar,
  GameSticker,
  GameStickerStrip,
  TotalPayoutsBanner,
  AvatarCircle,
} from "../ui/index.js";

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

  const joinLabel = walletAddress
    ? "🎮 Stake 1 NIM & Play"
    : "⚡ Connect Nimiq Wallet";

  return (
    <main className="page-shell">
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

          <p className="lede lede--tagline" style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>
            Form words. Beat the clock. Win NIM.
          </p>

          <div className="feature-strip" style={{ marginBottom: "1rem" }}>
            <div className="feature-pill">⚡ 60s Rounds</div>
            <div className="feature-pill">🪙 1 NIM Entry</div>
            <div className="feature-pill">🏆 90% Win Pool</div>
          </div>

          <div className="hero-actions" style={{ display: "flex", flexDirection: "column", gap: "0.6rem", width: "100%" }}>
            <button type="button" onClick={onQuickMatch} style={{ padding: "0.95rem 1.4rem", fontSize: "1.05rem" }}>
              {joinLabel}
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", width: "100%" }}>
              <button type="button" className="button-secondary" onClick={onOpenDailyChallenge}>
                ⭐ Daily Challenge
              </button>
              <button type="button" className="button-secondary" onClick={onStartPractice}>
                🎯 Practice Arena
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", width: "100%" }}>
              <button type="button" className="button-secondary button-accent-blue" onClick={onOpenLeaderboard}>
                🏆 Leaderboard
              </button>
              <button type="button" className="button-secondary" onClick={() => setShowRulesModal(true)}>
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
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              background: "linear-gradient(135deg, rgba(233, 178, 19, 0.12), rgba(5, 130, 202, 0.12))",
              border: "1px solid rgba(233, 178, 19, 0.3)",
              borderRadius: "12px",
              cursor: "pointer",
              marginTop: "0.75rem",
              transition: "transform 120ms ease, border-color 120ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.4rem" }}>🎁</span>
              <div>
                <strong style={{ fontSize: "0.88rem", color: "#FFD700", display: "block" }}>
                  Free Daily Challenge Available
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#A0A5C2" }}>
                  Play 1 round today to claim 0.1 NIM
                </span>
              </div>
            </div>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#00E5FF" }}>
              Play →
            </span>
          </div>

          <TotalPayoutsBanner />
        </div>

        <div className="hero-card hero-card--interactive">
          <div className="hero-card__top">
            <div>
              <p className="hero-card__label">Interactive Sample Round</p>
              <h2 style={{ fontSize: "1.8rem", margin: 0 }}>BLOCKCHAIN</h2>
            </div>
            <div className="hero-card__score-badge">
              <span>Demo Score</span>
              <strong>{sampleScore} pts</strong>
            </div>
          </div>

          <div className="sample-rack-wrapper">
            <p className="field-hint" style={{ fontSize: "0.78rem", marginBottom: "6px" }}>
              Tap letter tiles below to build words:
            </p>
            <div className="letter-rack">
              {sampleLetters.map((letter, index) => {
                const isSelected = sampleIndexes.includes(index);
                return (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    className={`letter-tile letter-tile--interactive ${isSelected ? "letter-tile--selected" : ""}`}
                    onClick={() => handleToggleSampleTile(index)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sample-builder-box">
            <div className="sample-builder-box__display">
              <span className="sample-builder-box__placeholder">
                {sampleCandidate || "TAP TILES ABOVE"}
              </span>
            </div>
            <div className="sample-builder-box__actions">
              <button
                type="button"
                className="button-secondary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
                onClick={handleClearSample}
                disabled={sampleIndexes.length === 0}
              >
                Clear
              </button>
              <button
                type="button"
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.75rem" }}
                onClick={handleTestSampleWord}
                disabled={!sampleCandidate}
              >
                Test Word
              </button>
            </div>
          </div>

          {sampleFeedback ? (
            <div className={`notice-strip notice-strip--${sampleFeedback.type}`}>
              {sampleFeedback.text}
            </div>
          ) : null}

          {sampleWords.length > 0 ? (
            <div className="sample-found-list">
              <span className="field-hint">Words Found ({sampleWords.length}):</span>
              <div className="sample-chips-row">
                {sampleWords.map((w, idx) => (
                  <span key={idx} className="word-chip">
                    <strong>{w.word}</strong> <small>+{w.points}</small>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="hero-card__grid">
            <span>Timer: 60s</span>
            <span>Stake: 1 NIM</span>
            <span>Players: 2-5</span>
            <span>Pool: 90% shared</span>
          </div>

          <div className="hero-card__footer">
            <button type="button" className="button-secondary" onClick={onOpenProfile}>
              View Profile
            </button>
            <button type="button" className="button-secondary" onClick={onOpenSettings}>
              Settings
            </button>
          </div>

          <div className="sample-scoring-footer">
            <div className="sample-scoring-footer__header">
              <span style={{ fontSize: "0.74rem", textTransform: "uppercase", fontWeight: "700", color: "#00B4D8" }}>
                ⚡ Word Scoring Matrix
              </span>
              <span style={{ fontSize: "0.72rem", color: "#FFD700", fontWeight: "600" }}>
                ✓ Nimiq Pay Verified
              </span>
            </div>
            <div className="sample-scoring-footer__matrix">
              <div className="scoring-pill"><span>3 LTRS</span><strong>3 pts</strong></div>
              <div className="scoring-pill"><span>4 LTRS</span><strong>5 pts</strong></div>
              <div className="scoring-pill"><span>5 LTRS</span><strong>8 pts</strong></div>
              <div className="scoring-pill"><span>6+ LTRS</span><strong>12 pts</strong></div>
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
            background: "rgba(0, 0, 0, 0.75)",
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
              background: "#13131a",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.5rem", margin: 0, color: "#f5f7ff" }}>📖 How to Play NimWord</h2>
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
              <h3 style={{ fontSize: "1.1rem", color: "#00B4D8", marginBottom: "0.4rem" }}>🎮 Core Loop</h3>
              <ol style={{ paddingLeft: "1.2rem", lineHeight: "1.6", color: "#a0a5c2", fontSize: "0.95rem" }}>
                <li>Join a NIMWORD match room or practice solo</li>
                <li>Get a shared 7-letter source word</li>
                <li>Submit valid English words before the 60s timer expires</li>
                <li>Score points based on word length and speed</li>
                <li>90% NIM prize pool is shared by score rankings</li>
              </ol>
            </article>

            <article style={{ marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "#63f4ca", marginBottom: "0.4rem" }}>📜 Game Rules</h3>
              <ul style={{ paddingLeft: "1.2rem", lineHeight: "1.6", color: "#a0a5c2", fontSize: "0.95rem" }}>
                <li>Words must be at least 3 letters long</li>
                <li>Use each letter only as many times as it appears in the prompt</li>
                <li>Duplicate word submissions in the same round do not score</li>
                <li>Every valid word scores based on length: 3L = 3pts, 4L = 5pts, 5L = 8pts, 6L+ = 12pts</li>
              </ul>
            </article>

            <article style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "#FFD700", marginBottom: "0.4rem" }}>🪙 Prize Logic</h3>
              <p style={{ color: "#a0a5c2", fontSize: "0.92rem", lineHeight: "1.5" }}>
                Every match room starts with a 1 NIM entry stake. NIMWORD takes a 10% treasury fee, and the remaining 90% is shared using:
                <br />
                <code style={{ display: "block", background: "rgba(0,0,0,0.4)", padding: "0.5rem", borderRadius: "6px", margin: "0.5rem 0", color: "#ffd700", fontFamily: "var(--font-mono)" }}>
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
    <main className="page-shell">
      {room?.status === "expired" ? (
        <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
          <div className="notice-strip notice-strip--neutral" style={{ borderLeftColor: "#cc4444", marginBottom: "1.5rem" }}>
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
            Back
          </button>
          <p className="eyebrow">Quick Match Lobby</p>
          {musicToggle}
        </div>

        <div className="room-topbar">
          <div>
            <p className="play-label">NimWord Arena</p>
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
                <h3>Match Lobby</h3>
                <p>{lobbyTitle}</p>
              </div>
              <TimerTone seconds={0} />
            </div>

            {myWallet && (
              <div style={{ background: "rgba(15, 23, 42, 0.75)", border: "1px solid rgba(141, 163, 255, 0.25)", borderRadius: "14px", padding: "10px 14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase" }}>👤 Display Username:</span>
                <input
                  type="text"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                  placeholder="Type your username..."
                  maxLength={16}
                  style={{ flex: 1, minWidth: "130px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", fontSize: "0.85rem", outline: "none" }}
                />
                <button
                  type="button"
                  style={{ padding: "6px 14px", fontSize: "0.8rem", minHeight: "auto" }}
                  onClick={handleSaveLobbyUsername}
                >
                  Save Username
                </button>
                {handleNotice && <span style={{ color: "#4ade80", fontSize: "0.78rem" }}>{handleNotice}</span>}
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
              <p className="invite-link-card__label">Invite friends to join this room</p>
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
                      ? "#cc4444"
                      : "rgba(255,255,255,0.15)",
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
                <h3>Room Feed</h3>
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
                <div className="empty-card">Waiting for players...</div>
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
    <main className="page-shell">
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBackHome}>
            Back
          </button>
          <p className="eyebrow">Live Room</p>
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
            <strong>Source Word: {room?.sourceWord || "READY"}</strong>
            <span>{myPlayer ? `${getPlayerAlias(myPlayer.walletAddress)} • ${shortenWalletAddress(myPlayer.walletAddress)}` : "Connected player"}</span>
          </div>
          <div className="room-live-header__score">
            <small>Your score</small>
            <strong className="live-score">{myScore} pts</strong>
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
                <span>Source Word</span>
                <strong>{room?.sourceWord || "READY"}</strong>
              </div>
              <div className="letter-rack letter-rack--play letter-rack--compact">
                {sourceLetters.map((letter, index) => (
                  <button
                    key={`${letter}-${index}`}
                    type="button"
                    className={`letter-tile letter-tile--compact letter-tile--interactive ${selectedIndexes.includes(index) ? "letter-tile--selected" : ""}`}
                    onClick={() => handleToggleTile(index)}
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
                  <span className="submit-panel__locked-label">Your Word</span>
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

            <section className="chat-room-layout" style={{ marginBottom: "6rem" }}>
              <article className="panel panel-chat panel-chat--primary">
                <div className="room-panel__header">
                  <div>
                    <h3>Live Chat Feed</h3>
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
                    <div className="empty-card">Waiting for the first word claim...</div>
                  )}
                </div>
              </article>

              <article className="panel panel-scoreboard panel-scoreboard--live">
                <div className="room-panel__header">
                  <div>
                    <h3>Leaderboard</h3>
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
                  <h3>Game History</h3>
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
                  <h3>Game Over</h3>
                  <p>Final ranking and payout split for this arena.</p>
                </div>
              </div>

              <div className="claim-card">
                <div className="claim-card__top">
                  <div>
                    <span className="claim-card__label">Your reward</span>
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
                    onClick={onClaimReward}
                    disabled={!claimEnabled || claimBusy}
                  >
                    {claimBusy ? "Claiming..." : claimRecorded ? "Claim Recorded" : payoutAmount > 0 ? "Claim Reward" : "No Reward"}
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

              <div className="results-subtitle">Reward Distribution</div>
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
