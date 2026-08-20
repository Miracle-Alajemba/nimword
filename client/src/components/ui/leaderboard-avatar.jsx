import React from "react";

/**
 * Deterministic Leaderboard Avatar Component with Rank Badge Overlay
 * @param {object} props
 * @param {string} props.address
 * @param {number} [props.rank]
 * @param {number} [props.size=40]
 */
export function LeaderboardAvatar({ address = "", rank, size = 40 }) {
  const shortAddr = address ? `${address.slice(2, 6).toUpperCase()}` : "0000";
  const bgHue = (parseInt(shortAddr, 16) || 0) % 360;

  const rankBadge =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-bold text-white shadow-inner border border-white/20 select-none overflow-hidden"
        style={{
          backgroundColor: `hsl(${bgHue}, 70%, 45%)`,
          fontSize: Math.max(10, Math.floor(size * 0.35)),
        }}
      >
        {shortAddr.slice(0, 2)}
      </div>
      {rankBadge && (
        <span
          className="absolute -bottom-1 -right-1 text-sm drop-shadow-md select-none"
          title={`Rank #${rank}`}
        >
          {rankBadge}
        </span>
      )}
    </div>
  );
}

export default LeaderboardAvatar;
