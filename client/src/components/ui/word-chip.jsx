import React from "react";

export function WordChip({ word, points, isBonus = false, className = "" }) {
  if (!word) return null;

  return (
    <div
      className={`word-chip ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "8px",
        background: isBonus ? "oklch(0.7924 0.1593 85.61 / 0.16)" : "var(--surface-sunk)",
        border: isBonus ? "1px solid oklch(0.7924 0.1593 85.61 / 0.5)" : "1px solid var(--rule)",
        color: isBonus ? "var(--nq-gold)" : "var(--ink)",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.5px",
      }}
    >
      <span>{word.toUpperCase()}</span>
      {typeof points === "number" && (
        <span
          style={{
            fontSize: "10px",
            padding: "1px 5px",
            borderRadius: "4px",
            background: isBonus ? "var(--nq-gold)" : "var(--rule-strong)",
            color: "var(--ink)",
          }}
        >
          +{points}
        </span>
      )}
    </div>
  );
}
