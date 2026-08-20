import React from "react";

export function RewardCard({ amount, label, onClaim, claimed = false }) {
  return (
    <div className="reward-card">
      <div className="reward-card-amount">{amount}</div>
      <div className="reward-card-label">{label}</div>
      <button
        type="button"
        className="reward-card-btn"
        onClick={onClaim}
        disabled={claimed}
      >
        {claimed ? "Claimed" : "Claim Reward"}
      </button>
    </div>
  );
}
