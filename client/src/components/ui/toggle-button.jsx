import React from "react";

/**
 * ToggleButton — Pressable toggle button with active state styling.
 * @param {{ active: boolean, onClick: () => void, children: React.ReactNode }} props
 */
export function ToggleButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`toggle-button ${active ? "toggle-button--active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
