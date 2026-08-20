import React from "react";

export function ComboCounter({ combo = 1 }) {
  if (combo <= 1) return null;
  return (
    <div className="combo-counter">
      <span className="combo-counter-num">{combo}x</span>
      <span className="combo-counter-txt">COMBO!</span>
    </div>
  );
}
