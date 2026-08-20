import React, { useState } from "react";

/**
 * MultiSelect — Accessible multi-option select component with chips.
 * @param {{ options: Array<{ value: string, label: string }>, selected: string[], onChange: (val: string[]) => void, label?: string }} props
 */
export function MultiSelect({ options = [], selected = [], onChange, label }) {
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((item) => item !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="multi-select-container">
      {label && <label className="multi-select-label">{label}</label>}
      <div className="multi-select-chips">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              className={`multi-select-chip ${isSelected ? "multi-select-chip--active" : ""}`}
              onClick={() => toggle(opt.value)}
              aria-pressed={isSelected}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
