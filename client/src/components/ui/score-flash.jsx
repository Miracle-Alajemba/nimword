import React from "react";

/**
 * ScoreFlash — Momentary floating score indicator that animates upward and fades.
 * @param {{ score: number, x?: number, y?: number }} props
 */
export function ScoreFlash({ score, x = 0, y = 0 }) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const color = score >= 12 ? "#63f4ca" : score >= 8 ? "#ffad33" : "#fff";

  return (
    <span
      className="score-flash"
      style={{
        position: "absolute",
        left: x,
        top: y,
        color,
        fontWeight: 900,
        fontSize: score >= 12 ? "1.6rem" : "1.2rem",
        pointerEvents: "none",
        animation: "score-flash-rise 0.9s ease-out forwards",
      }}
      aria-live="polite"
      aria-label={`+${score} points`}
    >
      +{score}
    </span>
  );
}
