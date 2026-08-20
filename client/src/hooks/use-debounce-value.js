import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a value by specified delay
 * @template T
 * @param {T} value
 * @param {number} [delay=300] Delay in milliseconds
 * @returns {T}
 */
export function useDebounceValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounceValue;
