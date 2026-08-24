import React from "react";

export function Toast({ message, type = "info", onClose, className = "" }) {
  if (!message) return null;

  const bgColors = {
    info: "var(--interactive-ink)",
    success: "var(--good)",
    warning: "var(--nq-orange)",
    error: "var(--bad)",
  };

  return (
    <div
      className={`toast-alert ${className}`}
      style={{
        position: "fixed",
        bottom: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        borderRadius: "10px",
        background: bgColors[type] || bgColors.info,
        color: "var(--ink)",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow: "0 8px 20px -6px oklch(0.2737 0.068 276.29 / 0.14)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--ink)",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            padding: "0 0 0 8px",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
