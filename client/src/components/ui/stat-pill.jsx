import React from "react";

export function StatPill({ icon, label, value, color = "var(--interactive)", className = "" }) {
  return (
    <div
      className={`stat-pill ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "12px",
        background: "var(--surface-sunk)",
        border: "1px solid var(--rule)",
        color: "var(--ink)",
        fontSize: "13px",
        fontWeight: "500",
      }}
    >
      {icon && <span style={{ fontSize: "14px" }}>{icon}</span>}
      <span style={{ color: "var(--ink-muted)", fontSize: "11px", textTransform: "uppercase" }}>{label}:</span>
      <span style={{ color, fontWeight: "700" }}>{value}</span>
    </div>
  );
}
