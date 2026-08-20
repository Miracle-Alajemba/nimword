import React from "react";

/**
 * StreakFire — Animated streak fire icon with count badge.
 * @param {{ streak: number, size?: "sm"|"md"|"lg" }} props
 */
export function StreakFire({ streak = 0, size = "md" }) {
  if (streak <= 0) return null;
  return (
    <span className={`streak-fire streak-fire--${size}`} role="status" aria-label={`${streak} day streak`}>
      <span className="streak-fire-emoji">🔥</span>
      <span className="streak-fire-count">{streak}</span>
    </span>
  );
}
