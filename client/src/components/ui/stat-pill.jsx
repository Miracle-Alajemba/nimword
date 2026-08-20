import React from "react";

export function StatPill({ icon, label, value, color = "#38bdf8", className = "" }) {
  return (
    <div
      className={`stat-pill ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "12px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#f8fafc",
        fontSize: "13px",
        fontWeight: "500",
      }}
    >
      {icon && <span style={{ fontSize: "14px" }}>{icon}</span>}
      <span style={{ color: "#94a3b8", fontSize: "11px", textTransform: "uppercase" }}>{label}:</span>
      <span style={{ color, fontWeight: "700" }}>{value}</span>
    </div>
  );
}
