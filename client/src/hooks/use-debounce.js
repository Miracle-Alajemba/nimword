import { useEffect, useRef, useState } from "react";

/**
 * useDebounce — Debounces a value by the given delay in milliseconds.
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} [delay=300] - Debounce delay in ms.
 * @returns {T} The debounced value.
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
