import { useEffect, useState } from "react";
import { MetricCard, PlayerIdentity, GameLoader, UsernameModal } from "../ui";
import { getSavedUsername } from "../../utils/username.js";

import {
  getAvatarStyle,
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
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px", marginBottom: "16px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("arena")}
                style={{
                  background: "transparent",
                  color: activeTab === "arena" ? "var(--accent-mint)" : "rgba(255,255,255,0.6)",
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
                  color: activeTab === "daily" ? "var(--accent-mint)" : "rgba(255,255,255,0.6)",
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
    <main className="page-shell">
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBack}>Back</button>
          <p className="eyebrow">Profile</p>
        </div>

        <section className="profile-shell">
          <article className="panel profile-panel profile-panel--hero">
            <div className="profile-head">
              <span className="profile-avatar" style={getAvatarStyle(walletAddress || "guest-wallet")}>
                {(connected ? walletAddress.slice(2, 4) : "WP").toUpperCase()}
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 className="profile-title" style={{ margin: 0 }}>{alias}</h1>
                  {connected && (
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ padding: "4px 10px", fontSize: "0.75rem", minHeight: "auto", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      onClick={() => setModalOpen(true)}
                    >
                      ✏️ Edit Handle
                    </button>
                  )}
                </div>
                <p className="profile-subtitle">{connected ? shortenWalletAddress(walletAddress) : "Connect a wallet to personalise your profile."}</p>
                <span className="rank-badge">Word Artist • Level 7</span>
              </div>
            </div>
            {!connected ? <button type="button" onClick={onConnectWallet}>Connect Wallet</button> : null}
          </article>

          <article className="panel profile-panel">
            <h3>Stats</h3>
            <div className="profile-stats-grid">
              <MetricCard label="Wins" value="18" hint="Lifetime arena wins" />
              <MetricCard label="Streak" value="4" hint="Current win streak" />
              <MetricCard label="Level" value="7" hint="Progression level" />
              <MetricCard label="Earnings" value="$24.60" hint="Total rewards earned" />
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
  const [selectedTheme, setSelectedTheme] = useState("mint"); // mint, gold, purple, cyan
  const [testScore, setTestScore] = useState(12);
  const [testTileSelected, setTestTileSelected] = useState(false);

  const themeColors = {
    mint: { name: "Emerald Mint", primary: "#34d399", glow: "rgba(52, 211, 153, 0.25)" },
    gold: { name: "Cyber Gold", primary: "#fbbf24", glow: "rgba(251, 191, 36, 0.25)" },
    purple: { name: "Neon Purple", primary: "#c084fc", glow: "rgba(192, 132, 252, 0.25)" },
    cyan: { name: "Cosmic Cyan", primary: "#22d3ee", glow: "rgba(34, 211, 238, 0.25)" },
  };

  const currentTheme = themeColors[selectedTheme];

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
      <section className="play-shell">
        <div className="play-header">
          <button type="button" className="ghost-button" onClick={onBack}>Back</button>
          <p className="eyebrow">Settings & Customization Studio</p>
        </div>

        <section className="profile-shell">
          {/* Live Interactive UI Preview Stage */}
          <article className="panel profile-panel" style={{ background: "linear-gradient(180deg, rgba(22, 31, 58, 0.95), rgba(10, 17, 34, 0.98))", border: `1px solid ${currentTheme.primary}44`, boxShadow: `0 12px 30px ${currentTheme.glow}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: currentTheme.primary }}>
                🎛️ Live UI & Audio Preview Stage
              </h3>
              <span style={{ fontSize: "0.75rem", background: `${currentTheme.primary}22`, color: currentTheme.primary, padding: "2px 8px", borderRadius: "12px", border: `1px solid ${currentTheme.primary}44`, fontWeight: "600" }}>
                Interactive Demo
              </span>
            </div>

            <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: "0 0 16px 0" }}>
              Tap the letter tiles below to test your audio, contrast, and theme settings in real-time.
            </p>

            <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700" }}>
                  Sample Round Word
                </span>
                <span style={{ fontSize: settings.largeText ? "1rem" : "0.85rem", fontWeight: "700", color: currentTheme.primary, fontFamily: "monospace" }}>
                  +{testScore} PTS
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                {["W", "O", "R", "D", "P", "O", "T"].map((ltr, idx) => {
                  const active = testTileSelected && idx < 4;
                  return (
                    <button
                      key={`${ltr}-${idx}`}
                      type="button"
                      onClick={() => {
                        setTestTileSelected((prev) => !prev);
                        if (settings.sound) handleTestSound();
                        if (settings.haptics) handleTestHaptics();
                      }}
                      style={{
                        width: "38px",
                        height: "44px",
                        borderRadius: "8px",
                        background: active ? currentTheme.primary : settings.highContrast ? "#1e293b" : "rgba(255, 255, 255, 0.07)",
                        border: `2px solid ${active ? currentTheme.primary : settings.highContrast ? "#ffffff" : "rgba(255, 255, 255, 0.15)"}`,
                        color: active ? "#0f172a" : "#f8fafc",
                        fontWeight: "800",
                        fontSize: settings.largeText ? "1.2rem" : "1rem",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: active ? `0 0 12px ${currentTheme.primary}aa` : "none",
                      }}
                    >
                      {ltr}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Theme Accent Picker */}
          <article className="panel profile-panel">
            <h3>🎨 Theme Color Accent</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "10px" }}>
              {Object.entries(themeColors).map(([key, theme]) => {
                const isSelected = selectedTheme === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(key);
                      if (settings.sound) handleTestSound();
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: `2px solid ${isSelected ? theme.primary : "rgba(255, 255, 255, 0.1)"}`,
                      borderRadius: "12px",
                      padding: "10px 6px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      boxShadow: isSelected ? `0 0 14px ${theme.glow}` : "none",
                    }}
                  >
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: theme.primary, border: "2px solid #ffffff" }} />
                    <span style={{ fontSize: "0.72rem", color: isSelected ? "#ffffff" : "#94a3b8", fontWeight: isSelected ? "700" : "500" }}>
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </article>

          {/* Sound & Haptics */}
          <article className="panel profile-panel">
            <h3>🔊 Sound & Haptics</h3>
            <div className="settings-list">
              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ display: "block" }}>Sound effects</span>
                  <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Synthesized Web Audio chimes for tile taps and word scores</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {settings.sound && (
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ padding: "3px 10px", fontSize: "0.75rem", minHeight: "auto" }}
                      onClick={handleTestSound}
                    >
                      🔊 Test Chime
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggle("sound")}
                    style={{
                      width: "48px",
                      height: "26px",
                      borderRadius: "13px",
                      background: settings.sound ? currentTheme.primary : "rgba(255, 255, 255, 0.15)",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        position: "absolute",
                        top: "3px",
                        left: settings.sound ? "25px" : "3px",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ display: "block" }}>Haptic feedback</span>
                  <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Tactile vibration on tile selection and submission</small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {settings.haptics && (
                    <button
                      type="button"
                      className="button-secondary"
                      style={{ padding: "3px 10px", fontSize: "0.75rem", minHeight: "auto" }}
                      onClick={handleTestHaptics}
                    >
                      📳 Test Vibration
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggle("haptics")}
                    style={{
                      width: "48px",
                      height: "26px",
                      borderRadius: "13px",
                      background: settings.haptics ? currentTheme.primary : "rgba(255, 255, 255, 0.15)",
                      border: "none",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#ffffff",
                        position: "absolute",
                        top: "3px",
                        left: settings.haptics ? "25px" : "3px",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Display Options */}
          <article className="panel profile-panel">
            <h3>👁️ Accessibility & Display</h3>
            <div className="settings-list">
              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ display: "block" }}>High contrast mode</span>
                  <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Enhanced tile borders for outdoor visibility</small>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle("highContrast")}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    background: settings.highContrast ? currentTheme.primary : "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: settings.highContrast ? "25px" : "3px",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>

              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ display: "block" }}>Larger text</span>
                  <small style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Increase tile typography size</small>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle("largeText")}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    background: settings.largeText ? currentTheme.primary : "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: settings.largeText ? "25px" : "3px",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>
            </div>
          </article>

          {/* Privacy */}
          <article className="panel profile-panel">
            <h3>🔒 Leaderboard & Privacy</h3>
            <div className="settings-list">
              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Show earnings publicly</span>
                <button
                  type="button"
                  onClick={() => onToggle("showEarnings")}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    background: settings.showEarnings ? currentTheme.primary : "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: settings.showEarnings ? "25px" : "3px",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>

              <div className="settings-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Show rank publicly</span>
                <button
                  type="button"
                  onClick={() => onToggle("showRank")}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    background: settings.showRank ? "var(--accent-mint, #38bdf8)" : "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      position: "absolute",
                      top: "3px",
                      left: settings.showRank ? "25px" : "3px",
                      transition: "left 0.2s ease",
                    }}
                  />
                </button>
              </div>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
