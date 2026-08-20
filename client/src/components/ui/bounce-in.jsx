import React from "react";

/**
 * BounceIn — Wraps children with a bounce-in entrance animation.
 * @param {{ children: React.ReactNode, delay?: number, className?: string }} props
 */
export function BounceIn({ children, delay = 0, className = "" }) {
  return (
    <div
      className={`bounce-in-wrapper ${className}`.trim()}
      style={{
        animation: `bounce-in-keyframe 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
}
