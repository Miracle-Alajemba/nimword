import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useLocalStorage — React hook that syncs state with localStorage.
 * @template T
 * @param {string} key - The localStorage key.
 * @param {T} initialValue - Default value if key is not found.
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage read error for "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage write error for "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
