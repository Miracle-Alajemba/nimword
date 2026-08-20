import React from "react";

/**
 * Chip — Small rounded label chip with optional dismiss action.
 * @param {{ label: string, variant?: "default"|"success"|"warning"|"error", onDismiss?: () => void, icon?: string, className?: string }} props
 */
export function Chip({ label, variant = "default", onDismiss, icon, className = "" }) {
  return (
    <span className={`chip chip--${variant} ${className}`.trim()} role="status">
      {icon && <span className="chip-icon" aria-hidden="true">{icon}</span>}
      <span className="chip-label">{label}</span>
      {onDismiss && (
        <button
          className="chip-dismiss"
          onClick={onDismiss}
          aria-label={`Remove ${label}`}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
}
