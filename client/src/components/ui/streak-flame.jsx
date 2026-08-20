import React from "react";

/**
 * Animated Streak Flame Badge Component
 * @param {object} props
 * @param {number} [props.streak=0]
 * @param {string} [props.className]
 */
export function StreakFlame({ streak = 0, className = "" }) {
  if (!streak || streak <= 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-orange-500/40 text-orange-300 font-bold text-xs shadow-sm shadow-orange-500/10 ${className}`}
    >
      <span className="animate-pulse text-sm">🔥</span>
      <span>{streak} Day Streak</span>
    </div>
  );
}

export default StreakFlame;
