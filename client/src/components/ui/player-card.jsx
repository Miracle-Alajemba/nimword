import React from "react";
import { LeaderboardAvatar } from "./leaderboard-avatar.jsx";

/**
 * Player Card Display Component
 * @param {object} props
 * @param {string} props.walletAddress
 * @param {string} [props.username]
 * @param {number} [props.score=0]
 * @param {number} [props.rank]
 * @param {boolean} [props.isHost=false]
 */
export function PlayerCard({ walletAddress, username, score = 0, rank, isHost = false }) {
  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Unknown Player";

  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all duration-200 shadow-md">
      <div className="flex items-center gap-3">
        <LeaderboardAvatar address={walletAddress} rank={rank} size={38} />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-100">
              {username || shortAddr}
            </span>
            {isHost && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                HOST
              </span>
            )}
          </div>
          {username && (
            <span className="text-xs text-slate-400 font-mono">{shortAddr}</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <span className="font-extrabold text-base text-emerald-400">{score}</span>
        <span className="text-[10px] text-slate-400 block uppercase font-medium">pts</span>
      </div>
    </div>
  );
}

export default PlayerCard;
