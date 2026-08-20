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

export function AppBottomNav({ screen, onNavigate, walletAddress, onWalletAction, musicToggle }) {
  const items = [
    { id: "home", label: "Home", icon: "home" },
    { id: "daily-challenge", label: "Daily", icon: "daily" },
    { id: "leaderboard", label: "Board", icon: "leaderboard" },
    { id: "profile", label: "Profile", icon: "profile" },
  ];
  const walletLabel = walletAddress ? "Wallet" : "Wallet";
  const walletAriaLabel = walletAddress
    ? `Connected wallet ${shortenWalletAddress(walletAddress)}`
    : "Open wallet actions";

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav__item ${screen === item.id ? "bottom-nav__item--active" : ""}`}
          onClick={() => onNavigate(item.id)}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem 0.25rem",
            fontSize: "0.65rem",
            overflow: "hidden",
          }}
        >
          <Icon name={item.icon} />
          <span className="bottom-nav__label">{item.label}</span>
        </button>
      ))}

      <button
        type="button"
        className="bottom-nav__item bottom-nav__item--wallet"
        onClick={onWalletAction}
        aria-label={walletAriaLabel}
        title={walletAddress ? shortenWalletAddress(walletAddress) : "Wallet"}
        style={{
          flex: "1 1 0",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem 0.25rem",
          fontSize: "0.65rem",
          overflow: "hidden",
        }}
      >
        <Icon name="wallet" />
        <span className="bottom-nav__label">{walletLabel}</span>
      </button>

      {musicToggle ? (
        <div className="bottom-nav__music">
          {musicToggle}
        </div>
      ) : null}
    </nav>
  );
}

