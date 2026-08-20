import React from "react";

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "A - Z", description: "Type letters to select tiles from source word" },
    { key: "Enter", description: "Submit formed word instantly" },
    { key: "Backspace", description: "Remove last selected letter tile" },
    { key: "Escape", description: "Clear current draft selection" },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(30, 41, 59, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "16px",
          padding: "1.5rem",
          color: "#f8fafc",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "700" }}>⌨️ Keyboard Shortcuts</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.5rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        </div>

        <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Speed up your gameplay on desktop by using direct keyboard controls.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.625rem 0.875rem",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <kbd
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontFamily: "monospace",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#38bdf8",
                  boxShadow: "0 2px 0 #0f172a",
                }}
              >
                {sc.key}
              </kbd>
              <span style={{ fontSize: "0.875rem", color: "#cbd5e1", textAlign: "right" }}>{sc.description}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.75rem",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #38bdf8, #3b82f6)",
            color: "#fff",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
          }}
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
