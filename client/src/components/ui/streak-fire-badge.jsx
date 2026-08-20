import React from "react";

/**
 * Animated Streak Fire Pill Component
 * @param {object} props
 * @param {number} [props.days=0]
 * @param {string} [props.className]
 */
export function StreakFireBadge({ days = 0, className = "" }) {
  if (!days || days <= 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/15 to-red-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold ${className}`}
    >
      <span className="text-sm">🔥</span>
      <span>{days}d</span>
    </div>
  );
}

export default StreakFireBadge;
