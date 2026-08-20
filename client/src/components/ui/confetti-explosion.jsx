import React from "react";

/**
 * ConfettiExplosion — Lightweight CSS confetti particle burst animation.
 * Renders colored particles that animate outward on mount, then auto-cleans up.
 * @param {{ count?: number, duration?: number, colors?: string[] }} props
 */
export function ConfettiExplosion({ count = 30, duration = 1200, colors = ["#ffad33", "#63f4ca", "#ff7a18", "#567fff", "#e84cff"] }) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration + 200);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + (Math.random() * 20 - 10);
    const distance = 60 + Math.random() * 100;
    const size = 4 + Math.random() * 6;
    const color = colors[i % colors.length];
    const delay = Math.random() * 200;

    return (
      <span
        key={i}
        className="confetti-particle"
        style={{
          "--confetti-angle": `${angle}deg`,
          "--confetti-distance": `${distance}px`,
          "--confetti-size": `${size}px`,
          "--confetti-color": color,
          "--confetti-delay": `${delay}ms`,
          "--confetti-duration": `${duration}ms`,
        }}
        aria-hidden="true"
      />
    );
  });

  return (
    <span className="confetti-explosion" role="presentation" aria-label="Celebration">
      {particles}
    </span>
  );
}
