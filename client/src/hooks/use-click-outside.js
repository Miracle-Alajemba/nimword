import { useEffect } from "react";

/**
 * Custom hook to trigger callback when clicking outside a specified container element
 * @param {React.RefObject<HTMLElement>} ref
 * @param {function} handler
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    if (typeof window === "undefined" || !ref || !handler) return;

    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;
