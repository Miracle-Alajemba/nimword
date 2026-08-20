import React from "react";

/**
 * Animated Score Multiplier Tag Component (2x, 3x, 5x)
 * @param {object} props
 * @param {number} [props.multiplier=1]
 * @param {string} [props.className]
 */
export function ScoreMultiplierTag({ multiplier = 1, className = "" }) {
  if (multiplier <= 1) return null;

  const colorClass =
    multiplier >= 5
      ? "from-purple-500/30 to-indigo-500/30 border-purple-500/50 text-purple-300 shadow-purple-500/20"
      : multiplier >= 3
      ? "from-amber-500/30 to-yellow-500/30 border-amber-500/50 text-amber-300 shadow-amber-500/20"
      : "from-cyan-500/30 to-blue-500/30 border-cyan-500/50 text-cyan-300 shadow-cyan-500/20";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r border text-xs font-extrabold tracking-wide uppercase shadow-md animate-bounce ${colorClass} ${className}`}
    >
      ⚡ {multiplier}x Boost
    </span>
  );
}

export default ScoreMultiplierTag;
