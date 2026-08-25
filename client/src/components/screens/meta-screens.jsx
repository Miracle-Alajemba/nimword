import { useEffect, useState } from "react";
import { MetricCard, PlayerIdentity, GameLoader, UsernameModal, AvatarCircle } from "../ui";
import { getSavedUsername } from "../../utils/username.js";

import {
  formatNimiqAddress,
  getPlayerAlias,
  isWalletAddress,
  shortenWalletAddress,
} from "../../utils/ui-helpers.js";

export function LeaderboardScreen({ room, onQuickMatch, onBack, apiBaseUrl }) {
  const [activeTab, setActiveTab] = useState("arena"); // "arena" or "daily"
  const [entries, setEntries] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
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

      setEntries(data.entries || []);
      setDailyEntries(data.dailyEntries || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load leaderboard");
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

export function ProfileScreen({ walletAddress, onConnectWallet, onBack }) {
  const connected = isWalletAddress(walletAddress);
  const [alias, setAlias] = useState(connected ? getPlayerAlias(walletAddress) : "Guest Player");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (connected) {
      setAlias(getSavedUsername(walletAddress));
    }
  }, [walletAddress, connected]);

  return (
    <main className="page-shell profile-page-shell">
      <section className="play-shell profile-container">
        <div className="play-header" style={{ marginBottom: "0.5rem" }}>
          <button type="button" className="ghost-button" onClick={onBack}>Back</button>
          <p className="eyebrow" style={{ margin: 0, fontWeight: 700 }}>Profile</p>
        </div>

        <section className="profile-shell">
          <article className="panel profile-panel profile-panel--hero">
            <div className="profile-head">
              <AvatarCircle address={walletAddress} size={54} />
              <div className="profile-head__info" style={{ flex: 1, minWidth: 0 }}>
                <div className="profile-name-row" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h1 className="profile-title">{alias}</h1>
                  {connected && (
                    <button
                      type="button"
                      className="button-secondary edit-handle-btn"
                      style={{ padding: "3px 8px", fontSize: "0.72rem", minHeight: "28px", display: "inline-flex", alignItems: "center", gap: "3px" }}
                      onClick={() => setModalOpen(true)}
                    >
                      ✏️ Edit
                    </button>
                  )}
                </div>
                <p className="profile-subtitle">
                  {connected ? formatNimiqAddress(walletAddress) || shortenWalletAddress(walletAddress) : "Connect a Nimiq wallet to personalize your profile."}
                </p>
                <span className="rank-badge">Word Artist • Level 7</span>
              </div>
            </div>
            {!connected ? (
              <button type="button" className="connect-btn" onClick={onConnectWallet} style={{ marginTop: "10px", width: "100%", minHeight: "40px", fontSize: "0.88rem" }}>
                Connect Nimiq Wallet
              </button>
            ) : null}
          </article>

          <article className="panel profile-panel profile-panel--stats">
            <h3 className="profile-section-title" style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 0.65rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--ink-2)" }}>
              Player Stats
            </h3>
            <div className="profile-stats-grid">
              <MetricCard label="Wins" value="18" hint="Lifetime arena wins" />
              <MetricCard label="Streak" value="4" hint="Current win streak" />
              <MetricCard label="Level" value="7" hint="Progression level" />
              <MetricCard label="Earnings" value="24.6 NIM" hint="Total rewards earned" />
            </div>
          </article>
        </section>
      </section>

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
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button type="button" className="ghost-button settings-header__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="settings-header__title">Game Settings</h2>
          <p className="settings-header__subtitle">
            Configure audio, haptics, gameplay, and visual preferences.
          </p>
        </div>

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
                Enhance tile borders and increase contrast for maximum outdoor visibility.
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
    </main>
  );
}
