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
        background: isBonus ? "rgba(234, 179, 8, 0.15)" : "rgba(255, 255, 255, 0.06)",
        border: isBonus ? "1px solid rgba(234, 179, 8, 0.4)" : "1px solid rgba(255, 255, 255, 0.12)",
        color: isBonus ? "#facc15" : "#e2e8f0",
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
            background: isBonus ? "#ca8a04" : "rgba(255, 255, 255, 0.15)",
            color: "#ffffff",
          }}
        >
          +{points}
        </span>
      )}
    </div>
  );
}
