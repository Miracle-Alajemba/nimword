import React from "react";

export function FloatingAction({ icon, onClick, label }) {
  return (
    <button
      type="button"
      className="floating-action-btn"
      onClick={onClick}
      aria-label={label}
    >
      <span className="floating-action-icon">{icon}</span>
    </button>
  );
}
