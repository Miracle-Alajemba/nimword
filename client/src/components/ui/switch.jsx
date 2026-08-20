import React from "react";

/**
 * Switch — Accessible toggle switch with label.
 * @param {{ checked: boolean, onChange: (checked: boolean) => void, label?: string, disabled?: boolean, id?: string }} props
 */
export function Switch({ checked, onChange, label = "", disabled = false, id }) {
  const switchId = id || `switch-${React.useId?.() || Math.random().toString(36).slice(2)}`;

  return (
    <label className={`switch-wrapper ${disabled ? "switch-wrapper--disabled" : ""}`} htmlFor={switchId}>
      <input
        type="checkbox"
        id={switchId}
        className="switch-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        role="switch"
        aria-checked={checked}
      />
      <span className={`switch-track ${checked ? "switch-track--on" : ""}`}>
        <span className="switch-thumb" />
      </span>
      {label && <span className="switch-label">{label}</span>}
    </label>
  );
}
