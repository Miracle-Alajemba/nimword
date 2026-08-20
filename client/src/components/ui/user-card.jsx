import React from "react";
import { AvatarCircle } from "./avatar-circle.jsx";
import { LevelBadge } from "./level-badge.jsx";

/**
 * UserCard — User profile summary card with avatar, address, and level badge.
 * @param {{ address: string, level?: number, score?: number, isCurrentUser?: boolean }} props
 */
export function UserCard({ address, level = 1, score = 0, isCurrentUser = false }) {
  return (
    <div className={`user-card ${isCurrentUser ? "user-card--current" : ""}`}>
      <AvatarCircle address={address} size={40} />
      <div className="user-card-info">
        <div className="user-card-header">
          <span className="user-card-address">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Guest"}</span>
          {isCurrentUser && <span className="user-card-you">YOU</span>}
        </div>
        <div className="user-card-meta">
          <LevelBadge level={level} />
          <span className="user-card-score">{score.toLocaleString()} pts</span>
        </div>
      </div>
    </div>
  );
}
