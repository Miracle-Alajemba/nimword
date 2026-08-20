import React from "react";

/**
 * ShimmerText — Text with an animated shimmer gradient sweep.
 * @param {{ children: React.ReactNode, className?: string }} props
 */
export function ShimmerText({ children, className = "" }) {
  return (
    <span
      className={`shimmer-text ${className}`.trim()}
      aria-label={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
