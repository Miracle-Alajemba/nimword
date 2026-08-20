import React from "react";

export function RoundPressure({ progress = 0, timeLeft = 60, totalTime = 60, className = "" }) {
  const percent = Math.min(100, Math.max(0, Math.round(progress)));

  // Dynamic color state based on pressure intensity
  let pressureColor = "#38bdf8"; // Cyan/Blue
  let glowColor = "rgba(56, 189, 248, 0.35)";
  let statusText = "Pacing Well";
  let icon = "⚡";

  if (percent >= 80) {
    pressureColor = "#ef4444"; // Urgent Red
    glowColor = "rgba(239, 68, 68, 0.5)";
    statusText = "HIGH PRESSURE";
    icon = "🔥";
  } else if (percent >= 50) {
    pressureColor = "#f59e0b"; // Warning Amber
    glowColor = "rgba(245, 158, 11, 0.4)";
    statusText = "Heat Is On";
    icon = "⏱️";
  }

  return (
    <div
      className={`round-pressure-shell ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))",
        border: `1px solid ${pressureColor}44`,
        borderRadius: "18px",
        padding: "1rem 1.25rem",
        boxShadow: `0 8px 24px ${glowColor}`,
        transition: "all 0.4s ease",
        margin: "1rem 0",
      }}
    >
      <div
        className="round-pressure-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>{icon}</span>
          <strong style={{ fontSize: "0.88rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "#f8fafc" }}>
            Round Pressure
          </strong>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: "700",
              padding: "2px 8px",
              borderRadius: "999px",
              background: `${pressureColor}22`,
              color: pressureColor,
              border: `1px solid ${pressureColor}44`,
              textTransform: "uppercase",
            }}
          >
            {statusText}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            <strong style={{ color: "#f8fafc", fontFamily: "var(--font-mono)" }}>{timeLeft}s</strong> left
          </span>
          <strong
            style={{
              fontSize: "1.1rem",
              fontFamily: "var(--font-mono)",
              color: pressureColor,
              minWidth: "42px",
              textAlign: "right",
            }}
          >
            {percent}%
          </strong>
        </div>
      </div>

      <div
        className="round-pressure-track"
        style={{
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "999px",
          height: "10px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="round-pressure-fill"
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: "999px",
            background: `linear-gradient(90deg, #38bdf8 0%, ${pressureColor} 100%)`,
            boxShadow: `0 0 12px ${pressureColor}`,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}
