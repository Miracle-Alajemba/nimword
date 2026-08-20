import React from "react";

/**
 * Tooltip — Lightweight hover/focus tooltip with accessible labeling.
 * @param {{ children: React.ReactNode, text: string, position?: "top"|"bottom"|"left"|"right" }} props
 */
export function Tooltip({ children, text, position = "top" }) {
  if (!text) return children;

  return (
    <span className={`tooltip-trigger tooltip-trigger--${position}`} tabIndex={0} aria-label={text}>
      {children}
      <span className={`tooltip-bubble tooltip-bubble--${position}`} role="tooltip">
        {text}
      </span>
    </span>
  );
}
