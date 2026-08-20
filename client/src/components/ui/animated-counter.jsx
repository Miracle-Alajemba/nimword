import React from "react";

/**
 * AnimatedCounter — Smooth number counting animation on mount/update.
 * @param {{ value: number, duration?: number, prefix?: string, suffix?: string, className?: string }} props
 */
export function AnimatedCounter({ value, duration = 600, prefix = "", suffix = "", className = "" }) {
  const [display, setDisplay] = React.useState(0);
  const prevRef = React.useRef(0);

  React.useEffect(() => {
    const start = prevRef.current;
    const end = Number(value) || 0;
    if (start === end) return;

    const startTime = performance.now();
    let raf;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prevRef.current = end;
      }
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={`animated-counter ${className}`.trim()} aria-live="polite">
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
