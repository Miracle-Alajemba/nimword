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
        background: "rgba(6, 8, 17, 0.82)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, rgba(22, 31, 58, 0.98), rgba(10, 17, 34, 0.99))",
          border: "1px solid rgba(141, 163, 255, 0.22)",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "420px",
          width: "100%",
          color: "#f8fafc",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "#38bdf8" }}>
            ✏️ Set Display Username
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "16px", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#94a3b8" }}>
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
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />

          {error && <span style={{ color: "#f87171", fontSize: "0.8rem" }}>{error}</span>}
          {saved && <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>✓ Username saved!</span>}

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
