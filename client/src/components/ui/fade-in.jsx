import React from "react";

/**
 * FadeIn — Wraps children with a fade-in animation on mount.
 * @param {{ children: React.ReactNode, delay?: number, duration?: number, direction?: "up"|"down"|"left"|"right"|"none", className?: string }} props
 */
export function FadeIn({ children, delay = 0, duration = 400, direction = "up", className = "" }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const translateMap = {
    up: "translateY(16px)",
    down: "translateY(-16px)",
    left: "translateX(16px)",
    right: "translateX(-16px)",
    none: "none",
  };

  return (
    <div
      className={`fade-in-wrapper ${className}`.trim()}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : translateMap[direction] || "translateY(16px)",
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
