import React from "react";

/**
 * RankBadge — Displays a rank position with medal styling for top 3.
 * @param {{ rank: number, size?: "sm"|"md"|"lg" }} props
 */
export function RankBadge({ rank, size = "md" }) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const colors = {
    1: "linear-gradient(135deg, #ffd700 0%, #ffb347 100%)",
    2: "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)",
    3: "linear-gradient(135deg, #cd7f32 0%, #e8a860 100%)",
  };

  const sizeMap = { sm: 24, md: 32, lg: 42 };
  const dim = sizeMap[size] || sizeMap.md;

  if (rank <= 3) {
    return (
      <span
        className="rank-badge rank-badge--medal"
        style={{ fontSize: dim * 0.7 }}
        role="img"
        aria-label={`Rank ${rank}`}
      >
        {medals[rank]}
      </span>
    );
  }

  return (
    <span
      className="rank-badge rank-badge--number"
      style={{
        width: dim,
        height: dim,
        fontSize: dim * 0.42,
        borderRadius: "50%",
        background: "var(--surface-sunk)",
        border: "1px solid var(--rule)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        color: "var(--ink-muted)",
      }}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
