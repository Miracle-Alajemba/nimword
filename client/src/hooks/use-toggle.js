import { useState, useCallback } from "react";

/**
 * useToggle — Simple boolean toggle hook.
 * @param {boolean} [initial=false]
 * @returns {[boolean, () => void, (value: boolean) => void]}
 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}
