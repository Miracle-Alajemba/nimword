import { useEffect } from "react";

/**
 * Custom hook to register keyboard shortcut handlers
 * @param {string} targetKey Key code (e.g., "Enter", "Escape")
 * @param {function} handler Callback function
 * @param {object} [options]
 * @param {boolean} [options.ctrlKey=false]
 * @param {boolean} [options.altKey=false]
 * @param {boolean} [options.shiftKey=false]
 */
export function useKeyboardShortcut(
  targetKey,
  handler,
  { ctrlKey = false, altKey = false, shiftKey = false } = {}
) {
  useEffect(() => {
    if (typeof window === "undefined" || !targetKey || !handler) return;

    const handleKeyDown = (event) => {
      if (
        event.key?.toLowerCase() === targetKey.toLowerCase() &&
        Boolean(event.ctrlKey) === ctrlKey &&
        Boolean(event.altKey) === altKey &&
        Boolean(event.shiftKey) === shiftKey
      ) {
        handler(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [targetKey, handler, ctrlKey, altKey, shiftKey]);
}

export default useKeyboardShortcut;
