import { useEffect, useRef } from "react";

/**
 * usePrevious — Returns the value from the previous render cycle.
 * @template T
 * @param {T} value
 * @returns {T | undefined}
 */
export function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
