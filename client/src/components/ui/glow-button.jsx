import React from "react";

/**
 * GlowButton — Glowing action button with pulse ring animation.
 * @param {{ children: React.ReactNode, onClick?: () => void, variant?: "gold"|"emerald"|"cyan", disabled?: boolean }} props
 */
export function GlowButton({ children, onClick, variant = "gold", disabled = false }) {
  return (
    <button
      type="button"
      className={`glow-button glow-button--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="glow-button-content">{children}</span>
    </button>
  );
}
