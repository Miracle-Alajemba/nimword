import React from "react";
import { RankBadge } from "./rank-badge.jsx";
import { AvatarCircle } from "./avatar-circle.jsx";

/**
 * LeaderboardRow — Individual row inside leaderboard tables.
 * @param {{ rank: number, address: string, score: number, wins?: number, isCurrentUser?: boolean }} props
 */
export function LeaderboardRow({ rank, address, score, wins = 0, isCurrentUser = false }) {
  return (
    <div className={`leaderboard-row ${isCurrentUser ? "leaderboard-row--current" : ""}`}>
      <RankBadge rank={rank} size="sm" />
      <AvatarCircle address={address} size={32} />
      <span className="leaderboard-row-address">
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Player"}
      </span>
      <div className="leaderboard-row-stats">
        <span className="leaderboard-row-score">{score.toLocaleString()} pts</span>
        {wins > 0 && <span className="leaderboard-row-wins">{wins} 🏆</span>}
      </div>
    </div>
  );
}
