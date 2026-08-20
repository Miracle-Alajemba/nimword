import React from "react";

/**
 * SparkleEffect — Decorative sparkle star particle overlay.
 */
export function SparkleEffect() {
  return (
    <span className="sparkle-container" aria-hidden="true">
      <span className="sparkle-particle sparkle-1">✨</span>
      <span className="sparkle-particle sparkle-2">✦</span>
      <span className="sparkle-particle sparkle-3">✨</span>
    </span>
  );
}
