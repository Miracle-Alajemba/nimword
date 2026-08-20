import React from "react";

/**
 * RangeSlider — Styled range slider with label and value output.
 * @param {{ min?: number, max?: number, step?: number, value: number, onChange: (val: number) => void, label?: string }} props
 */
export function RangeSlider({ min = 0, max = 100, step = 1, value, onChange, label }) {
  return (
    <div className="range-slider-group">
      <div className="range-slider-header">
        {label && <span className="range-slider-label">{label}</span>}
        <span className="range-slider-value">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-slider-input"
        aria-label={label || "Range slider"}
      />
    </div>
  );
}
