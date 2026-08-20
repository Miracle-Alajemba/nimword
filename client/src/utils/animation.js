/**
 * Animation and transition utility helpers.
 */

/**
 * Generate staggered animation delay for a list of items.
 * @param {number} index - Item index.
 * @param {number} [baseDelayMs=50] - Base delay between items.
 * @param {number} [maxDelayMs=600] - Maximum delay cap.
 * @returns {string} CSS delay value like "150ms".
 */
export function staggerDelay(index, baseDelayMs = 50, maxDelayMs = 600) {
  const delay = Math.min(index * baseDelayMs, maxDelayMs);
  return `${delay}ms`;
}

/**
 * Cubic bezier easing presets.
 */
export const EASING = {
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  enter: "cubic-bezier(0, 0, 0.2, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
};

/**
 * Spring-style animation config for CSS transitions.
 * @param {number} [durationMs=300]
 * @param {string} [easing="smooth"]
 * @returns {string}
 */
export function springTransition(durationMs = 300, easing = "smooth") {
  return `all ${durationMs}ms ${EASING[easing] || EASING.smooth}`;
}

/**
 * Generate a CSS transform string for a slide animation.
 * @param {"up"|"down"|"left"|"right"} direction
 * @param {number} [distance=20]
 * @param {boolean} [active=false]
 * @returns {string}
 */
export function slideTransform(direction, distance = 20, active = false) {
  if (active) return "translate(0, 0)";
  const map = {
    up: `translate(0, ${distance}px)`,
    down: `translate(0, -${distance}px)`,
    left: `translate(${distance}px, 0)`,
    right: `translate(-${distance}px, 0)`,
  };
  return map[direction] || map.up;
}
