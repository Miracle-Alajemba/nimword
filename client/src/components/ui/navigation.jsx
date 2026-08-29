import { shortenWalletAddress } from "../../utils/ui-helpers.js";


function Icon({ name }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.8",
    viewBox: "0 0 24 24",
  };

  const paths = {
    home: (
      <>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6.5 9.5V20h11V9.5" />
      </>
    ),
    daily: (
      <>
        <path d="M7 3.8v3.4" />
        <path d="M17 3.8v3.4" />
        <path d="M5 6h14v14H5z" />
        <path d="M8 11h8" />
        <path d="M8 15h5" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M6 19c1.2-3 3.4-4.5 6-4.5s4.8 1.5 6 4.5" />
      </>
    ),
    leaderboard: (
      <>
        <path d="M6 19V10" />
        <path d="M12 19V6" />
        <path d="M18 19v-8" />
      </>
    ),
    wallet: (
      <>
        <path d="M4.5 8.5h13a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" />
        <path d="M6 8V7a2 2 0 0 1 2-2h9" />
        <circle cx="16.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return <svg aria-hidden="true" {...common}>{paths[name] || paths.home}</svg>;
}

export function AppBottomNav({ screen, onNavigate, walletAddress, onConnectWallet }) {
  const items = [
    { id: "home", label: "Home", icon: "home" },
    { id: "daily-challenge", label: "Daily", icon: "daily" },
    { id: "leaderboard", label: "Board", icon: "leaderboard" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];

  return (
    <nav className="bottom-nav" aria-label="Primary" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
      {items.map((item) => {
        const isHome = item.id === "home";
        const isLocked = !walletAddress && !isHome;
        const isActive = screen === item.id;
        const isProfile = item.id === "profile";

        const handleClick = () => {
          if (isLocked) {
            if (typeof onConnectWallet === "function") {
              onConnectWallet();
            }
            return;
          }
          onNavigate(item.id);
        };

        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`}
            onClick={handleClick}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.55rem 0.25rem",
              fontSize: "0.72rem",
              fontWeight: isActive ? 800 : 600,
              opacity: isLocked ? 0.38 : 1,
              cursor: isLocked ? "not-allowed" : "pointer",
              transition: "opacity 0.2s ease, transform 0.15s ease",
            }}
            title={isLocked ? "Connect Nimiq Wallet to unlock" : item.label}
          >
            <div style={{ position: "relative" }}>
              <Icon name={item.icon} />
              {isLocked ? (
                <span
                  style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-5px",
                    fontSize: "0.6rem",
                  }}
                  title="Locked (Sign in to unlock)"
                >
                  🔒
                </span>
              ) : isProfile && walletAddress ? (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-3px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "var(--good)",
                    border: "1.5px solid var(--surface)",
                  }}
                  title="Wallet Connected"
                />
              ) : null}
            </div>
            <span className="bottom-nav__label" style={{ marginTop: "2px" }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

