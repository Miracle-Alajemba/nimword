import React from "react";

export function BadgeDisplay({ badge, className = "" }) {
  if (!badge) return null;

  return (
    <div
      className={`badge-display ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "20px",
        background: "rgba(56, 189, 248, 0.12)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#38bdf8",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      <span>{badge.icon || "🏅"}</span>
      <span>{badge.name || "Badge"}</span>
    </div>
  );
}
