import React from "react";

/**
 * LevelBadge — User level pill display.
 * @param {{ level: number }} props
 */
export function LevelBadge({ level = 1 }) {
  return (
    <span className="level-badge" aria-label={`Level ${level}`}>
      <span className="level-badge-lbl">LVL</span>
      <span className="level-badge-val">{level}</span>
    </span>
  );
}
