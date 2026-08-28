import { useEffect, useState } from "react";
import { MetricCard, PlayerIdentity, GameLoader, UsernameModal, AvatarCircle } from "../ui";
import { getSavedUsername, getPlayerStats, getLocalDailyLeaderboard } from "../../utils/username.js";

import {
  formatNimiqAddress,
  getPlayerAlias,
  isWalletAddress,
  shortenWalletAddress,
} from "../../utils/ui-helpers.js";

export function LeaderboardScreen({ room, onQuickMatch, onBack, apiBaseUrl }) {
  const [activeTab, setActiveTab] = useState("arena"); // "arena" or "daily"
  const [entries, setEntries] = useState([]);
  const [dailyEntries, setDailyEntries] = useState(() => getLocalDailyLeaderboard());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`${apiBaseUrl}/leaderboard`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load leaderboard.");
      }

      if (Array.isArray(data.entries) && data.entries.length) {
        setEntries(data.entries);
      }
      if (Array.isArray(data.dailyEntries) && data.dailyEntries.length) {
        setDailyEntries(data.dailyEntries);
      } else {
        const local = getLocalDailyLeaderboard();
        if (local.length) setDailyEntries(local);
      }
    } catch (err) {
      console.warn("Leaderboard network notice (using local):", err.message);
      const local = getLocalDailyLeaderboard();
      if (local.length) {
        setDailyEntries(local);
        setError("");
      } else {
        // Subtle informative notice rather than a broken banner
        setError("");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [apiBaseUrl]);

  const activeEntries = activeTab === "arena" ? entries : dailyEntries;

  return (
    <main className="page-shell">
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBack}>Back</button>
          <p className="eyebrow">Leaderboard Center</p>
        </div>

        <section className="profile-shell">
          <article className="panel profile-panel">
            {/* Tab Controls */}
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--rule)", paddingBottom: "12px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("arena")}
                style={{
                  background: "transparent",
                  color: activeTab === "arena" ? "var(--accent-mint)" : "var(--ink-muted)",
                  border: "none",
                  borderBottom: activeTab === "arena" ? "2px solid var(--accent-mint)" : "none",
                  padding: "6px 12px",
                  fontWeight: activeTab === "arena" ? "bold" : "normal",
                  cursor: "pointer"
                }}
              >
                Arena Matches
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("daily")}
                style={{
                  background: "transparent",
                  color: activeTab === "daily" ? "var(--accent-mint)" : "var(--ink-muted)",
                  border: "none",
                  borderBottom: activeTab === "daily" ? "2px solid var(--accent-mint)" : "none",
                  padding: "6px 12px",
                  fontWeight: activeTab === "daily" ? "bold" : "normal",
                  cursor: "pointer"
                }}
              >
                Daily Challenge
              </button>
            </div>

            <div className="room-panel__header">
              <div>
                <h3>{activeTab === "arena" ? "Arena Rankings" : "Daily Challenge Standings"}</h3>
                <p>
                  {activeTab === "arena"
                    ? "Global players ranked by the points they have achieved in live matches."
                    : "Top players ranked by their high score in the Daily Challenge."}
                </p>
              </div>
            </div>

            {error ? <div className="notice-strip notice-strip--neutral">{error}</div> : null}
            
            {loading ? (
              <GameLoader label="Loading standings..." letters="LEADER" />
            ) : activeEntries.length ? (
              <div className="leaderboard-table">
                {activeEntries.map((entry, index) => (
                  <div key={`${entry.walletAddress}-${entry.rank || index}`} className={`leaderboard-table__row ${index === 0 ? "leaderboard-table__row--top" : ""}`}>
                    <div className="leaderboard-table__rank">#{entry.rank || index + 1}</div>
                    <PlayerIdentity walletAddress={entry.walletAddress} emphasis />
                    <div className="leaderboard-table__stats" style={{ textAlign: "right" }}>
                      <strong style={{ fontFamily: "var(--font-mono)", color: "var(--accent-mint)", fontSize: "1.1rem" }}>
                        {entry.score} pts
                      </strong>
                      {activeTab === "daily" && (
                        <span style={{ fontSize: "0.8em", opacity: 0.6, display: "block" }}>
                          Total: {entry.totalScore} pts • {entry.roundsPlayed} play{entry.roundsPlayed === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-card">
                {activeTab === "arena"
                  ? "No player stats found. Finish a live match to start the leaderboard!"
                  : "No daily stats found. Play the Daily Challenge to start the leaderboard!"}
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

export function ProfileScreen({ walletAddress, onConnectWallet, onSetManualAddress, onDisconnect, onBack }) {
  const connected = isWalletAddress(walletAddress);
  const [alias, setAlias] = useState(connected ? getPlayerAlias(walletAddress) : "Guest Player");
  const [modalOpen, setModalOpen] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");
  const [showManualBox, setShowManualBox] = useState(false);
  const [stats, setStats] = useState(() => getPlayerStats(walletAddress));

  useEffect(() => {
    if (connected) {
      setAlias(getSavedUsername(walletAddress));
      setStats(getPlayerStats(walletAddress));
    }
  }, [walletAddress, connected]);

  // Compute live rank & level
  const level = Math.max(1, Math.floor((stats.totalScore || 0) / 40) + (stats.gamesWon || 0) + (stats.dailyCompleted || 0));
  const rankBadgeText =
    level >= 10
      ? `Level ${level} • Word Grandmaster`
      : level >= 6
      ? `Level ${level} • Word Champion`
      : level >= 3
      ? `Level ${level} • Word Master`
      : `Level ${level} • Word Explorer`;

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const avgScore = stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : stats.totalScore || 0;

  const handleSaveManual = (e) => {
    e.preventDefault();
    setManualError("");
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setManualError("Please enter a Nimiq address (e.g. NQ...)");
      return;
    }
    try {
      if (typeof onSetManualAddress === "function") {
        onSetManualAddress(trimmed);
        setManualInput("");
        setShowManualBox(false);
      }
    } catch (err) {
      setManualError(err.message || "Invalid Nimiq address format.");
    }
  };

  return (
    <main className="page-shell">
      <div className="profile-dashboard">
        {/* Header */}
        <div className="settings-header" style={{ marginBottom: "0.25rem" }}>
          <button type="button" className="ghost-button settings-header__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="settings-header__title">Player Profile</h2>
          <p className="settings-header__subtitle">
            Manage your onchain identity, alias, and lifetime word-play career.
          </p>
        </div>

        {/* Horizontal 2-Column Dashboard Grid */}
        <div className="profile-dashboard__grid">
          {/* Left Column: Identity & Badges */}
          <div className="profile-dashboard__column">
            {/* Profile Hero Card */}
            <section className="settings-card">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <AvatarCircle address={walletAddress} size={64} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                      {alias}
                    </h3>
                    {connected && (
                      <button
                        type="button"
                        className="button-secondary"
                        style={{ padding: "3px 8px", fontSize: "0.74rem", minHeight: "26px", borderRadius: "8px" }}
                        onClick={() => setModalOpen(true)}
                      >
                        ✏️ Edit Alias
                      </button>
                    )}
                  </div>
                  <p style={{ margin: "0.25rem 0 0.5rem", fontSize: "0.8rem", color: "var(--ink-muted)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                    {connected ? formatNimiqAddress(walletAddress) || shortenWalletAddress(walletAddress) : "Connect your Nimiq wallet to claim your stats."}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <span className="rank-badge" style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "8px" }}>
                      {rankBadgeText}
                    </span>
                    {connected && (
                      <span style={{ fontSize: "0.72rem", background: "var(--surface-sunk)", padding: "0.25rem 0.5rem", borderRadius: "6px", color: "var(--ink-2)", border: "1px solid var(--rule)" }}>
                        🟢 Mainnet Synced
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!connected ? (
                <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={onConnectWallet}
                    style={{ width: "100%", minHeight: "44px", fontSize: "0.92rem", fontWeight: 800, borderRadius: "12px" }}
                  >
                    ⚡ Connect Nimiq Wallet
                  </button>

                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setShowManualBox(!showManualBox)}
                    style={{ fontSize: "0.8rem", color: "var(--ink-2)", textAlign: "center", padding: "4px" }}
                  >
                    {showManualBox ? "▲ Hide manual paste" : "▼ Or paste Nimiq address manually"}
                  </button>

                  {showManualBox && (
                    <form onSubmit={handleSaveManual} style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
                      <input
                        type="text"
                        placeholder="NQ..."
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--rule)",
                          background: "var(--surface-sunk)",
                          color: "var(--ink)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.82rem",
                        }}
                      />
                      {manualError ? (
                        <span style={{ color: "var(--danger, #e54d2e)", fontSize: "0.76rem" }}>
                          {manualError}
                        </span>
                      ) : null}
                      <button
                        type="submit"
                        className="button-secondary"
                        style={{ width: "100%", minHeight: "36px", fontSize: "0.82rem" }}
                      >
                        Save & Connect Address
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={onDisconnect}
                    style={{ fontSize: "0.78rem", color: "var(--ink-muted)", padding: "4px 8px" }}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </section>

            {/* Milestones & Badges Card */}
            <section className="settings-card">
              <h3 className="settings-card__title">
                <span>🏆</span> Milestones & Badges
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem", background: "var(--surface-sunk)", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                  <span style={{ fontSize: "1.35rem" }}>⚡</span>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)", display: "block" }}>Rapid Solver</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{stats.dailyCompleted > 0 ? `${stats.dailyCompleted} daily solved` : "Play daily round"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem", background: "var(--surface-sunk)", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                  <span style={{ fontSize: "1.35rem" }}>🎯</span>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)", display: "block" }}>Master Solver</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{stats.bestWord && stats.bestWord !== "-" ? `${stats.bestWord}` : "Find top words"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem", background: "var(--surface-sunk)", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                  <span style={{ fontSize: "1.35rem" }}>🔥</span>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)", display: "block" }}>Streak Veteran</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{stats.winStreak > 0 ? `${stats.winStreak} win streak` : "Win matches in row"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.65rem", background: "var(--surface-sunk)", borderRadius: "12px", border: "1px solid var(--rule)" }}>
                  <span style={{ fontSize: "1.35rem" }}>🪙</span>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--ink)", display: "block" }}>NIM Champion</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{stats.totalNimWon > 0 ? `${stats.totalNimWon} NIM earned` : "Claim daily NIM"}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Career Statistics & Highlights */}
          <div className="profile-dashboard__column">
            {/* Player Lifetime Stats */}
            <section className="settings-card">
              <h3 className="settings-card__title">
                <span>📊</span> Career Statistics
              </h3>
              <div className="profile-stats-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                <div style={{ background: "var(--surface-sunk)", padding: "0.85rem", borderRadius: "12px", border: "1px solid var(--rule)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Total Wins
                  </span>
                  <strong style={{ fontSize: "1.35rem", color: "var(--ink)", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    {stats.gamesWon}
                  </strong>
                  <small style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>Lifetime arena & daily</small>
                </div>

                <div style={{ background: "var(--surface-sunk)", padding: "0.85rem", borderRadius: "12px", border: "1px solid var(--rule)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Win Streak
                  </span>
                  <strong style={{ fontSize: "1.35rem", color: "var(--interactive-ink)", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    {stats.winStreak} 🔥
                  </strong>
                  <small style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>Current run</small>
                </div>

                <div style={{ background: "var(--surface-sunk)", padding: "0.85rem", borderRadius: "12px", border: "1px solid var(--rule)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Progression Tier
                  </span>
                  <strong style={{ fontSize: "1.35rem", color: "var(--good)", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    Tier {level}
                  </strong>
                  <small style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>{stats.totalScore} total pts</small>
                </div>

                <div style={{ background: "var(--surface-sunk)", padding: "0.85rem", borderRadius: "12px", border: "1px solid var(--rule)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    Total NIM Earned
                  </span>
                  <strong style={{ fontSize: "1.35rem", color: "var(--nq-gold-deep, var(--ink))", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    {stats.totalNimWon.toFixed(1)} NIM
                  </strong>
                  <small style={{ fontSize: "0.7rem", color: "var(--ink-muted)" }}>Onchain payouts</small>
                </div>
              </div>
            </section>

            {/* Performance Analytics Card */}
            <section className="settings-card" style={{ background: "var(--surface-sunk)", border: "1px solid var(--rule)" }}>
              <h3 className="settings-card__title">
                <span>⚡</span> Performance Snapshot
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem", textAlign: "center" }}>
                <div style={{ padding: "0.6rem 0.4rem", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 700 }}>Avg Score</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{avgScore}</strong>
                </div>
                <div style={{ padding: "0.6rem 0.4rem", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 700 }}>Win Rate</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--good)", fontFamily: "var(--font-mono)" }}>{winRate}%</strong>
                </div>
                <div style={{ padding: "0.6rem 0.4rem", background: "var(--surface)", borderRadius: "10px", border: "1px solid var(--rule)" }}>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "var(--ink-muted)", textTransform: "uppercase", fontWeight: 700 }}>Best Word</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--interactive-ink)", fontFamily: "var(--font-mono)" }}>
                    {stats.bestWord && stats.bestWord !== "-" ? `${stats.bestWord} (${stats.bestWordScore}p)` : "None"}
                  </strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <UsernameModal
        walletAddress={walletAddress}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaveSuccess={(newHandle) => setAlias(newHandle)}
      />
    </main>
  );
}

export function SettingsScreen({ settings, onToggle, onBack }) {
  const handleTestSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.15, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      }
    } catch {}
  };

  const handleTestHaptics = () => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([40, 50, 40]);
    }
  };

  return (
    <main className="page-shell">
      <div className="profile-dashboard">
        {/* Header */}
        <div className="settings-header" style={{ marginBottom: "0.25rem" }}>
          <button type="button" className="ghost-button settings-header__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="settings-header__title">Game Settings</h2>
          <p className="settings-header__subtitle">
            Configure audio, haptics, gameplay, and visual preferences.
          </p>
        </div>

        {/* Horizontal 2-Column Grid */}
        <div className="profile-dashboard__grid">
          {/* Left Column: Audio & Visuals */}
          <div className="profile-dashboard__column">
            {/* Audio & Haptics */}
            <section className="settings-card">
              <h3 className="settings-card__title">
                <span>🔊</span> Audio & Feedback
              </h3>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">Sound Effects</span>
                  <span className="settings-item__desc">
                    Synthesized audio feedback for tile taps, word submissions, and timer cues.
                  </span>
                </div>
                <div className="settings-item__control">
                  {settings.sound ? (
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.74rem", minHeight: "28px" }}
                      onClick={handleTestSound}
                    >
                      Test Chime
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`ui-switch ${settings.sound ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("sound")}
                    aria-label="Toggle Sound Effects"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">Haptic Feedback</span>
                  <span className="settings-item__desc">
                    Tactile device vibrations when selecting tiles and solving words.
                  </span>
                </div>
                <div className="settings-item__control">
                  {settings.haptics ? (
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.74rem", minHeight: "28px" }}
                      onClick={handleTestHaptics}
                    >
                      Test Vibration
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className={`ui-switch ${settings.haptics ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("haptics")}
                    aria-label="Toggle Haptic Feedback"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>
            </section>

            {/* Accessibility & Visuals */}
            <section className="settings-card">
              <h3 className="settings-card__title">
                <span>👁️</span> Accessibility & Display
              </h3>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">High Contrast Mode</span>
                  <span className="settings-item__desc">
                    Enhance tile borders and contrast for outdoor visibility.
                  </span>
                </div>
                <div className="settings-item__control">
                  <button
                    type="button"
                    className={`ui-switch ${settings.highContrast ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("highContrast")}
                    aria-label="Toggle High Contrast Mode"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">Larger Tile Text</span>
                  <span className="settings-item__desc">
                    Scale up letter tile typography for easier reading.
                  </span>
                </div>
                <div className="settings-item__control">
                  <button
                    type="button"
                    className={`ui-switch ${settings.largeText ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("largeText")}
                    aria-label="Toggle Large Text"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Privacy & Network */}
          <div className="profile-dashboard__column">
            {/* Privacy & Profile */}
            <section className="settings-card">
              <h3 className="settings-card__title">
                <span>🔒</span> Privacy & Profile
              </h3>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">Show Earnings Publicly</span>
                  <span className="settings-item__desc">
                    Allow other players to view your total NIM rewards on the leaderboard.
                  </span>
                </div>
                <div className="settings-item__control">
                  <button
                    type="button"
                    className={`ui-switch ${settings.showEarnings ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("showEarnings")}
                    aria-label="Toggle Public Earnings"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>

              <div className="settings-item">
                <div className="settings-item__info">
                  <span className="settings-item__label">Show Rank Publicly</span>
                  <span className="settings-item__desc">
                    Display your competitive rank badge next to your player alias.
                  </span>
                </div>
                <div className="settings-item__control">
                  <button
                    type="button"
                    className={`ui-switch ${settings.showRank ? "ui-switch--active" : ""}`}
                    onClick={() => onToggle("showRank")}
                    aria-label="Toggle Public Rank"
                  >
                    <span className="ui-switch__thumb" />
                  </button>
                </div>
              </div>
            </section>

            {/* Network & Info */}
            <section className="settings-card" style={{ background: "var(--surface-sunk)", border: "1px solid var(--rule)" }}>
              <h3 className="settings-card__title">
                <span>⚡</span> Protocol & Network Info
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.82rem" }}>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                    Network
                  </span>
                  <strong style={{ color: "var(--ink)" }}>Nimiq Mainnet (PoS)</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                    Version
                  </span>
                  <strong style={{ color: "var(--ink)" }}>NimWord v1.0.0</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                    Settlement
                  </span>
                  <strong style={{ color: "var(--good)" }}>Verified Onchain</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ink-muted)", display: "block", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                    Wallet API
                  </span>
                  <strong style={{ color: "var(--interactive-ink)" }}>Nimiq Hub v2</strong>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
