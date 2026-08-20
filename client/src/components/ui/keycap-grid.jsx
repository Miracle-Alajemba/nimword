import React from "react";
import { KeyboardKey } from "./keyboard-key.jsx";

export function KeycapGrid({ letters = [], onKeyClick }) {
  return (
    <div className="keycap-grid">
      {letters.map((char, idx) => (
        <button
          key={idx}
          type="button"
          className="keycap-btn"
          onClick={() => onKeyClick?.(char)}
        >
          <KeyboardKey kbdKey={char} size="lg" />
        </button>
      ))}
    </div>
  );
}
