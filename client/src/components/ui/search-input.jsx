import React from "react";

/**
 * SearchInput — Accessible search input field with clear button.
 * @param {{ value: string, onChange: (val: string) => void, placeholder?: string }} props
 */
export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="search-input-wrapper">
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
