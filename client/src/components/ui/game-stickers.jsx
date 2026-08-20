import React from "react";

const STICKER_CONFIGS = {
  celoArena: {
    icon: "🏆",
    label: "CELO ARENA",
    bg: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff",
    border: "rgba(251, 191, 36, 0.6)",
    glow: "rgba(245, 158, 11, 0.4)",
    rotate: "-3deg",
  },
  hotStreak: {
    icon: "🔥",
    label: "HOT STREAK",
    bg: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "rgba(248, 113, 113, 0.6)",
    glow: "rgba(239, 68, 68, 0.4)",
    rotate: "2deg",
  },
  wordMaster: {
    icon: "💎",
    label: "WORD MASTER",
    bg: "linear-gradient(135deg, #38bdf8, #2563eb)",
    color: "#fff",
    border: "rgba(56, 189, 248, 0.6)",
    glow: "rgba(56, 189, 248, 0.4)",
    rotate: "-2deg",
  },
  fastFingers: {
    icon: "🚀",
    label: "FAST FINGERS",
    bg: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "rgba(52, 211, 153, 0.6)",
    glow: "rgba(16, 185, 129, 0.4)",
    rotate: "3deg",
  },
  scoreBooster: {
    icon: "⚡",
    label: "SCORE BOOSTER",
    bg: "linear-gradient(135deg, #a855f7, #7c3aed)",
    color: "#fff",
    border: "rgba(192, 132, 252, 0.6)",
    glow: "rgba(168, 85, 247, 0.4)",
    rotate: "-1deg",
  },
};

export function GameSticker({ type = "celoArena", size = "medium", className = "" }) {
  const config = STICKER_CONFIGS[type] || STICKER_CONFIGS.celoArena;

  const isSmall = size === "small";
  const isLarge = size === "large";

  return (
    <div
      className={`game-sticker game-sticker--${type} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "4px" : "6px",
        padding: isSmall ? "4px 10px" : isLarge ? "8px 18px" : "6px 14px",
        borderRadius: "999px",
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        boxShadow: `0 4px 14px ${config.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
        color: config.color,
        fontWeight: "800",
        fontSize: isSmall ? "10px" : isLarge ? "14px" : "12px",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        transform: `rotate(${config.rotate})`,
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: isSmall ? "12px" : isLarge ? "18px" : "15px" }}>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

export function GameStickerStrip({ className = "" }) {
  return (
    <div
      className={`game-sticker-strip ${className}`}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        margin: "12px 0",
      }}
    >
      <GameSticker type="celoArena" />
      <GameSticker type="hotStreak" />
      <GameSticker type="wordMaster" />
      <GameSticker type="fastFingers" />
      <GameSticker type="scoreBooster" />
    </div>
  );
}
