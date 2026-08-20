import React, { useState, useRef, useEffect } from "react";

/**
 * Dropdown — Accessible select dropdown component.
 * @param {{ options: Array<{ value: string, label: string }>, value: string, onChange: (val: string) => void, placeholder?: string, label?: string }} props
 */
export function Dropdown({ options = [], value, onChange, placeholder = "Select...", label = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      {label && <label className="dropdown-label">{label}</label>}
      <button
        type="button"
        className={`dropdown-trigger ${isOpen ? "dropdown-trigger--active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="dropdown-arrow" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`dropdown-option ${opt.value === value ? "dropdown-option--selected" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
