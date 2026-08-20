import React from "react";

/**
 * SkeletonLoader — Placeholder loading skeleton with shimmer animation.
 * @param {{ width?: string, height?: string, borderRadius?: string, count?: number }} props
 */
export function SkeletonLoader({ width = "100%", height = "1rem", borderRadius = "8px", count = 1 }) {
  return (
    <div role="status" aria-label="Loading" className="skeleton-loader-group">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton-loader"
          style={{ width, height, borderRadius, marginBottom: count > 1 ? "0.5rem" : 0 }}
        />
      ))}
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
