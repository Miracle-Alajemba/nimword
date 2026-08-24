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
        background: "oklch(0.5849 0.1438 244.29 / 0.12)",
        border: "1px solid oklch(0.5849 0.1438 244.29 / 0.35)",
        color: "var(--interactive)",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      <span>{badge.icon || "🏅"}</span>
      <span>{badge.name || "Badge"}</span>
    </div>
  );
}
