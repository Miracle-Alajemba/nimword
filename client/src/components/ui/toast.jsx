import React from "react";

export function Toast({ message, type = "info", onClose, className = "" }) {
  if (!message) return null;

  const bgColors = {
    info: "#0284c7",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
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
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "13px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
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
            color: "#ffffff",
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
