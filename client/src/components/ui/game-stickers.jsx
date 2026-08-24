import React from "react";

const STICKER_CONFIGS = {
  nimiqArena: {
    icon: "🏆",
    label: "NIMIQ ARENA",
    bg: "var(--accent-gradient)",
    color: "var(--ink)",
    border: "oklch(0.7924 0.1593 85.61 / 0.55)",
    glow: "oklch(0.7924 0.1593 85.61 / 0.45)",
    rotate: "-3deg",
  },
  hotStreak: {
    icon: "🔥",
    label: "HOT STREAK",
    bg: "linear-gradient(135deg, var(--nq-red), var(--nq-red))",
    color: "var(--ink)",
    border: "oklch(0.598 0.1886 30.3 / 0.55)",
    glow: "oklch(0.598 0.1886 30.3 / 0.4)",
    rotate: "2deg",
  },
  wordMaster: {
    icon: "💎",
    label: "WORD MASTER",
    bg: "linear-gradient(135deg, var(--nq-blue), var(--nq-blue-deep))",
    color: "var(--ink)",
    border: "oklch(0.5849 0.1438 244.29 / 0.55)",
    glow: "oklch(0.5849 0.1438 244.29 / 0.4)",
    rotate: "-2deg",
  },
  fastFingers: {
    icon: "🚀",
    label: "FAST FINGERS",
    bg: "linear-gradient(135deg, var(--nq-green), var(--nq-green-deep))",
    color: "var(--ink)",
    border: "oklch(0.6932 0.1245 178.48 / 0.55)",
    glow: "oklch(0.6932 0.1245 178.48 / 0.4)",
    rotate: "3deg",
  },
  scoreBooster: {
    icon: "⚡",
    label: "SCORE BOOSTER",
    bg: "linear-gradient(135deg, var(--nq-blue), var(--nq-blue-deep))",
    color: "var(--ink)",
    border: "oklch(0.5849 0.1438 244.29 / 0.55)",
    glow: "oklch(0.5849 0.1438 244.29 / 0.4)",
    rotate: "-1deg",
  },
};

export function GameSticker({ type = "nimiqArena", size = "medium", className = "" }) {
  const config = STICKER_CONFIGS[type] || STICKER_CONFIGS.nimiqArena;

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
        boxShadow: `0 4px 14px ${config.glow}, inset 0 1px 0 oklch(1 0 90 / 0.4)`,
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
      <GameSticker type="nimiqArena" />
      <GameSticker type="hotStreak" />
      <GameSticker type="wordMaster" />
      <GameSticker type="fastFingers" />
      <GameSticker type="scoreBooster" />
    </div>
  );
}
