import React, { useState } from "react";
import { getSavedUsername, saveCustomUsername } from "../../utils/username.js";

export function UsernameModal({ walletAddress, isOpen, onClose, onSaveSuccess, className = "" }) {
  const current = getSavedUsername(walletAddress);
  const [handle, setHandle] = useState(current);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError("Username cannot be empty");
      return;
    }

    const ok = saveCustomUsername(walletAddress, handle);
    if (ok) {
      setError("");
      setSaved(true);
      if (onSaveSuccess) onSaveSuccess(handle.trim());
      setTimeout(() => {
        setSaved(false);
        if (onClose) onClose();
      }, 1200);
    } else {
      setError("3-16 letters, numbers, hyphens or spaces only");
    }
  };

  return (
    <div
      className={`modal-backdrop ${className}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--surface)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "420px",
          width: "100%",
          color: "var(--ink)",
          boxShadow: "0 16px 40px -12px oklch(0.2737 0.068 276.29 / 0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "var(--interactive-ink)" }}>
            ✏️ Set Display Username
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--ink-muted)", fontSize: "16px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "var(--ink-muted)" }}>
          Choose a custom display handle for match lobbies and leaderboards (optional).
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Enter handle (e.g. WordWizard)"
            maxLength={16}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "var(--surface-sunk)",
              border: "1px solid var(--rule-strong)",
              color: "var(--ink)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />

          {error && <span style={{ color: "var(--bad-ink)", fontSize: "0.8rem" }}>{error}</span>}
          {saved && <span style={{ color: "var(--good)", fontSize: "0.8rem" }}>✓ Username saved!</span>}

          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              className="button-secondary"
              onClick={onClose}
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: "8px 20px", fontSize: "0.85rem" }}
            >
              Save Handle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
