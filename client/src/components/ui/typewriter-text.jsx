import React from "react";

/**
 * TypewriterText — Animates text appearing character by character.
 * @param {{ text: string, speed?: number, className?: string, onComplete?: () => void }} props
 */
export function TypewriterText({ text, speed = 40, className = "", onComplete }) {
  const [displayed, setDisplayed] = React.useState("");
  const indexRef = React.useRef(0);

  React.useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={`typewriter-text ${className}`.trim()} aria-label={text}>
      {displayed}
      <span className="typewriter-cursor" aria-hidden="true">|</span>
    </span>
  );
}
